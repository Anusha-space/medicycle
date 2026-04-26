const express = require('express');
const router = express.Router();
const db = require('../db');
const { verifyToken, requireRole } = require('../middleware/auth');

// GET all open urgent requests (pharmacies can see these)
router.get('/', verifyToken, async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT ur.*, u.name AS hospital_name, u.phone AS hospital_phone
      FROM urgent_requests ur
      LEFT JOIN users u ON ur.hospital_id = u.id
      WHERE ur.status = 'open'
      ORDER BY ur.deadline ASC
    `);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error.' });
  }
});

// GET my urgent requests (hospital sees their own)
router.get('/my', verifyToken, requireRole('hospital', 'admin'), async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT * FROM urgent_requests 
      WHERE hospital_id = ?
      ORDER BY created_at DESC
    `, [req.user.id]);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
});

// POST create urgent request (hospital only)
router.post('/', verifyToken, requireRole('hospital', 'admin'), async (req, res) => {
  try {
    const { medicine_name, quantity, deadline, notes } = req.body;

    if (!medicine_name || !quantity || !deadline) {
      return res.status(400).json({ message: 'Medicine name, quantity and deadline are required.' });
    }

    const [result] = await db.query(`
      INSERT INTO urgent_requests (hospital_id, medicine_name, quantity, deadline, notes, status)
      VALUES (?, ?, ?, ?, ?, 'open')
    `, [req.user.id, medicine_name, quantity, deadline, notes || null]);

    // Log to audit
    await db.query(`
      INSERT INTO audit_log (user_id, action, table_name, record_id, details)
      VALUES (?, 'INSERT', 'urgent_requests', ?, ?)
    `, [req.user.id, result.insertId, `Urgent request for ${medicine_name}`]);

    res.status(201).json({
      message: 'Urgent request posted successfully.',
      id: result.insertId
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error.', error: err.message });
  }
});

// PUT fulfil urgent request (pharmacy only)
router.put('/:id/fulfil', verifyToken, requireRole('pharmacy', 'admin'), async (req, res) => {
  try {
    const [existing] = await db.query(
      'SELECT * FROM urgent_requests WHERE id = ? AND status = "open"',
      [req.params.id]
    );
    if (existing.length === 0) {
      return res.status(404).json({ message: 'Request not found or already fulfilled.' });
    }

    await db.query(
      'UPDATE urgent_requests SET status = "fulfilled" WHERE id = ?',
      [req.params.id]
    );

    // Log to audit
    await db.query(`
      INSERT INTO audit_log (user_id, action, table_name, record_id, details)
      VALUES (?, 'UPDATE', 'urgent_requests', ?, 'Request fulfilled')
    `, [req.user.id, req.params.id]);

    res.json({ message: 'Request marked as fulfilled.' });
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
});

// DELETE cancel urgent request (hospital only)
router.delete('/:id', verifyToken, requireRole('hospital', 'admin'), async (req, res) => {
  try {
    const [existing] = await db.query(
      'SELECT * FROM urgent_requests WHERE id = ? AND hospital_id = ?',
      [req.params.id, req.user.id]
    );
    if (existing.length === 0) {
      return res.status(404).json({ message: 'Request not found.' });
    }

    await db.query(
      'UPDATE urgent_requests SET status = "cancelled" WHERE id = ?',
      [req.params.id]
    );

    res.json({ message: 'Request cancelled.' });
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
});

module.exports = router;