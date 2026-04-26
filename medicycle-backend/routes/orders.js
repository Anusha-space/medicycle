const express = require('express');
const router = express.Router();
const db = require('../db');
const { verifyToken, requireRole } = require('../middleware/auth');

// GET my orders (buyer)
router.get('/my', verifyToken, async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT o.*, m.name AS medicine_name, m.expiry_date, 
             u.name AS pharmacy_name
      FROM orders o
      LEFT JOIN medicines m ON o.medicine_id = m.id
      LEFT JOIN users u ON m.donor_id = u.id
      WHERE o.buyer_id = ?
      ORDER BY o.created_at DESC
    `, [req.user.id]);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error.' });
  }
});

// GET all orders (admin only)
router.get('/', verifyToken, requireRole('admin'), async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT o.*, m.name AS medicine_name, 
             b.name AS buyer_name, u.name AS pharmacy_name
      FROM orders o
      LEFT JOIN medicines m ON o.medicine_id = m.id
      LEFT JOIN users b ON o.buyer_id = b.id
      LEFT JOIN users u ON m.donor_id = u.id
      ORDER BY o.created_at DESC
    `);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
});

// POST place an order
router.post('/', verifyToken, async (req, res) => {
  try {
    const { medicine_id, quantity, total_price } = req.body;

    if (!medicine_id || !quantity) {
      return res.status(400).json({ message: 'Medicine and quantity are required.' });
    }

    // Check medicine exists and has enough stock
    const [med] = await db.query(
      'SELECT * FROM medicines WHERE id = ? AND status = "available"',
      [medicine_id]
    );
    if (med.length === 0) {
      return res.status(404).json({ message: 'Medicine not available.' });
    }
    if (med[0].quantity < quantity) {
      return res.status(400).json({ message: `Only ${med[0].quantity} units available.` });
    }

    // Place the order
    const [result] = await db.query(
      `INSERT INTO orders (medicine_id, quantity, status, buyer_id, total_price)
       VALUES (?, ?, 'Pending', ?, ?)`,
      [medicine_id, quantity, req.user.id, total_price]
    );

    // Reduce stock
    await db.query(
      'UPDATE medicines SET quantity = quantity - ? WHERE id = ?',
      [quantity, medicine_id]
    );

    // If stock hits 0, mark as sold
    await db.query(
      'UPDATE medicines SET status = "sold" WHERE id = ? AND quantity <= 0',
      [medicine_id]
    );

    res.status(201).json({
      message: 'Order placed successfully.',
      order_id: result.insertId
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error.', error: err.message });
  }
});

// PUT update order status (pharmacy/admin)
router.put('/:id', verifyToken, requireRole('pharmacy', 'admin'), async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ['Pending', 'Confirmed', 'Dispatched', 'Delivered', 'Cancelled'];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status.' });
    }

    await db.query('UPDATE orders SET status = ? WHERE id = ?', [status, req.params.id]);
    res.json({ message: 'Order status updated.' });
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
});

module.exports = router;