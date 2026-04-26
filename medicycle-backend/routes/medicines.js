const express = require('express');
const router = express.Router();
const db = require('../db');
const { verifyToken, requireRole } = require('../middleware/auth');

// GET all available medicines (public - anyone can browse)
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT m.*, u.name AS pharmacy_name, u.phone AS pharmacy_phone
      FROM medicines m
      LEFT JOIN users u ON m.donor_id = u.id
      WHERE m.status = 'available'
      ORDER BY m.expiry_date ASC
    `);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error.' });
  }
});

// GET near-expiry medicines using stored procedure
router.get('/expiring', async (req, res) => {
  try {
    const days = req.query.days || 90;
    const [rows] = await db.query('CALL GetExpiringMedicines(?)', [days]);
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error.' });
  }
});

// GET medicines listed by the logged-in pharmacy
router.get('/my', verifyToken, requireRole('pharmacy', 'admin'), async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT * FROM medicines WHERE donor_id = ? ORDER BY expiry_date ASC',
      [req.user.id]
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error.' });
  }
});

// GET single medicine
router.get('/:id', async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT m.*, u.name AS pharmacy_name FROM medicines m
       LEFT JOIN users u ON m.donor_id = u.id
       WHERE m.id = ?`,
      [req.params.id]
    );
    if (rows.length === 0) return res.status(404).json({ message: 'Medicine not found.' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
});

// POST add new medicine (pharmacy only)
router.post('/', verifyToken, requireRole('pharmacy', 'admin'), async (req, res) => {
  try {
    const { name, batch, expiry_date, quantity, price } = req.body;

    if (!name || !expiry_date || !quantity || !price) {
      return res.status(400).json({ message: 'Name, expiry date, quantity and price are required.' });
    }

    // Auto calculate discount based on expiry
    const daysToExpiry = Math.floor((new Date(expiry_date) - new Date()) / (1000 * 60 * 60 * 24));
    let discount_percent = 0;
    if (daysToExpiry <= 30) discount_percent = 40;
    else if (daysToExpiry <= 60) discount_percent = 25;
    else if (daysToExpiry <= 90) discount_percent = 10;

    const [result] = await db.query(
      `INSERT INTO medicines (name, batch, expiry_date, quantity, price, donor_id, discount_percent, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, 'available')`,
      [name, batch || null, expiry_date, quantity, price, req.user.id, discount_percent]
    );

    res.status(201).json({
      message: 'Medicine listed successfully.',
      id: result.insertId,
      discount_percent
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error.', error: err.message });
  }
});

// PUT update medicine (pharmacy only, must be owner)
router.put('/:id', verifyToken, requireRole('pharmacy', 'admin'), async (req, res) => {
  try {
    const { name, batch, expiry_date, quantity, price, status } = req.body;

    const [existing] = await db.query(
      'SELECT * FROM medicines WHERE id = ? AND donor_id = ?',
      [req.params.id, req.user.id]
    );
    if (existing.length === 0) {
      return res.status(403).json({ message: 'Not authorized to edit this medicine.' });
    }

    await db.query(
      `UPDATE medicines SET name=?, batch=?, expiry_date=?, quantity=?, price=?, status=? WHERE id=?`,
      [name, batch, expiry_date, quantity, price, status, req.params.id]
    );

    res.json({ message: 'Medicine updated successfully.' });
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
});

// DELETE medicine (pharmacy only, must be owner)
router.delete('/:id', verifyToken, requireRole('pharmacy', 'admin'), async (req, res) => {
  try {
    const [existing] = await db.query(
      'SELECT * FROM medicines WHERE id = ? AND donor_id = ?',
      [req.params.id, req.user.id]
    );
    if (existing.length === 0) {
      return res.status(403).json({ message: 'Not authorized to delete this medicine.' });
    }

    await db.query('DELETE FROM medicines WHERE id = ?', [req.params.id]);
    res.json({ message: 'Medicine deleted successfully.' });
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
});

module.exports = router;