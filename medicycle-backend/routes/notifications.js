const express = require('express');
const router = express.Router();
const db = require('../db');
const { verifyToken } = require('../middleware/auth');

// GET notifications for logged in user (generated dynamically)
router.get('/', verifyToken, async (req, res) => {
  try {
    const notifications = [];
    const user = req.user;

    if (user.role === 'pharmacy') {
      // 1. Near expiry medicines (their own)
      const [expiringMeds] = await db.query(`
        SELECT name, batch, expiry_date, 
               DATEDIFF(expiry_date, NOW()) AS days_left,
               discount_percent
        FROM medicines 
        WHERE donor_id = ? 
          AND status = 'available'
          AND DATEDIFF(expiry_date, NOW()) <= 90
          AND DATEDIFF(expiry_date, NOW()) >= 0
        ORDER BY expiry_date ASC
      `, [user.id]);

      expiringMeds.forEach(med => {
        const isUrgent = med.days_left <= 30;
        notifications.push({
          id: `exp-${med.batch}`,
          type: 'expiry',
          priority: isUrgent ? 'high' : 'medium',
          title: isUrgent ? '🚨 Urgent Expiry Alert' : '⚠️ Expiry Warning',
          description: `${med.name} (Batch: ${med.batch || 'N/A'}) expires in ${med.days_left} days. ${med.discount_percent > 0 ? `${med.discount_percent}% discount auto-applied.` : 'Consider listing at a discount.'}`,
          time: new Date().toISOString(),
          read: false
        });
      });

      // 2. Open urgent requests from hospitals
      const [urgentReqs] = await db.query(`
        SELECT ur.*, u.name AS hospital_name
        FROM urgent_requests ur
        LEFT JOIN users u ON ur.hospital_id = u.id
        WHERE ur.status = 'open'
          AND ur.deadline >= NOW()
        ORDER BY ur.deadline ASC
        LIMIT 10
      `);

      urgentReqs.forEach(req => {
        const hoursLeft = Math.floor((new Date(req.deadline) - new Date()) / (1000 * 60 * 60));
        notifications.push({
          id: `urg-${req.id}`,
          type: 'urgent',
          priority: hoursLeft <= 6 ? 'high' : 'medium',
          title: '🏥 Hospital Urgent Request',
          description: `${req.hospital_name} urgently needs ${req.quantity} units of ${req.medicine_name}. ${hoursLeft < 24 ? `Only ${hoursLeft} hours left!` : `Deadline: ${new Date(req.deadline).toLocaleDateString()}`}`,
          time: req.created_at,
          read: false
        });
      });

      // 3. Recent orders placed for their medicines
      const [recentOrders] = await db.query(`
        SELECT o.*, m.name AS medicine_name, u.name AS buyer_name
        FROM orders o
        LEFT JOIN medicines m ON o.medicine_id = m.id
        LEFT JOIN users u ON o.buyer_id = u.id
        WHERE m.donor_id = ?
          AND o.created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
        ORDER BY o.created_at DESC
        LIMIT 5
      `, [user.id]);

      recentOrders.forEach(order => {
        notifications.push({
          id: `ord-${order.id}`,
          type: 'order',
          priority: 'low',
          title: '🛒 New Order Received',
          description: `${order.buyer_name || 'A buyer'} ordered ${order.quantity} units of ${order.medicine_name}.`,
          time: order.created_at,
          read: false
        });
      });
    }

    if (user.role === 'hospital') {
      // 1. Their urgent request status updates
      const [myRequests] = await db.query(`
        SELECT * FROM urgent_requests
        WHERE hospital_id = ?
        ORDER BY created_at DESC
        LIMIT 10
      `, [user.id]);

      myRequests.forEach(req => {
        if (req.status === 'fulfilled') {
          notifications.push({
            id: `req-${req.id}`,
            type: 'fulfilled',
            priority: 'high',
            title: '✅ Urgent Request Fulfilled!',
            description: `Your request for ${req.quantity} units of ${req.medicine_name} has been fulfilled by a pharmacy.`,
            time: req.created_at,
            read: false
          });
        } else if (req.status === 'open') {
          const hoursLeft = Math.floor((new Date(req.deadline) - new Date()) / (1000 * 60 * 60));
          if (hoursLeft <= 24 && hoursLeft > 0) {
            notifications.push({
              id: `req-deadline-${req.id}`,
              type: 'urgent',
              priority: 'high',
              title: '⏰ Request Deadline Approaching',
              description: `Your urgent request for ${req.medicine_name} expires in ${hoursLeft} hours and hasn't been fulfilled yet.`,
              time: req.created_at,
              read: false
            });
          }
        }
      });

      // 2. Order status updates
      const [myOrders] = await db.query(`
        SELECT o.*, m.name AS medicine_name
        FROM orders o
        LEFT JOIN medicines m ON o.medicine_id = m.id
        WHERE o.buyer_id = ?
          AND o.created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
        ORDER BY o.created_at DESC
        LIMIT 10
      `, [user.id]);

      myOrders.forEach(order => {
        const statusMessages = {
          Confirmed: `Your order for ${order.medicine_name} has been confirmed by the pharmacy.`,
          Dispatched: `Your order for ${order.medicine_name} has been dispatched and is on its way!`,
          Delivered: `Your order for ${order.medicine_name} has been delivered successfully.`,
          Cancelled: `Your order for ${order.medicine_name} was cancelled.`,
        };
        if (statusMessages[order.status]) {
          notifications.push({
            id: `order-${order.id}`,
            type: 'order',
            priority: order.status === 'Delivered' ? 'low' : 'medium',
            title: `📦 Order ${order.status}`,
            description: statusMessages[order.status],
            time: order.created_at,
            read: false
          });
        }
      });
    }

    if (user.role === 'patient') {
      // Order status updates
      const [myOrders] = await db.query(`
        SELECT o.*, m.name AS medicine_name
        FROM orders o
        LEFT JOIN medicines m ON o.medicine_id = m.id
        WHERE o.buyer_id = ?
        ORDER BY o.created_at DESC
        LIMIT 10
      `, [user.id]);

      myOrders.forEach(order => {
        notifications.push({
          id: `order-${order.id}`,
          type: 'order',
          priority: 'medium',
          title: `📦 Order #${order.id} - ${order.status}`,
          description: `Your order for ${order.medicine_name} is currently ${order.status.toLowerCase()}.`,
          time: order.created_at,
          read: false
        });
      });
    }

    // Sort by priority then time
    const priorityOrder= { high: 0, medium: 1, low: 2 };
    notifications.sort((a, b) => {
      if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
        return priorityOrder[a.priority] - priorityOrder[b.priority];
      }
      return new Date(b.time).getTime() - new Date(a.time).getTime();
    });

    res.json(notifications);
  } catch (err) {
    console.error('NOTIFICATIONS ERROR:', err);
    res.status(500).json({ message: 'Server error.', error: err.message });
  }
});

module.exports = router;