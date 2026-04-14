const express = require("express");
const router = express.Router();
const db = require("../db");

// CREATE ORDER
router.post("/", (req, res) => {
  const { medicine_id, quantity } = req.body;

  const sql = `
    INSERT INTO orders (medicine_id, quantity, status)
    VALUES (?, ?, 'Pending')
  `;

  db.query(sql, [medicine_id, quantity], (err) => {
    if (err) return res.status(500).json(err);
    res.json({ message: "Order placed" });
  });
});

// GET ORDERS
router.get("/", (req, res) => {
  const sql = `
    SELECT orders.*, medicines.name
    FROM orders
    JOIN medicines ON orders.medicine_id = medicines.id
  `;

  db.query(sql, (err, result) => {
    if (err) return res.status(500).json(err);
    res.json(result);
  });
});

module.exports = router;