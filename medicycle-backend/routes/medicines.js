const express = require("express");
const router = express.Router();
const db = require("../db");

// CREATE
router.post("/", (req, res) => {
  const { name, batch, expiry_date, quantity, price } = req.body;

  const sql = `
    INSERT INTO medicines (name, batch, expiry_date, quantity, price)
    VALUES (?, ?, ?, ?, ?)
  `;

  db.query(sql, [name, batch, expiry_date, quantity, price], (err) => {
    if (err) return res.status(500).json(err);
    res.json({ message: "Medicine added" });
  });
});

// READ
router.get("/", (req, res) => {
  db.query("SELECT * FROM medicines", (err, result) => {
    if (err) return res.status(500).json(err);
    res.json(result);
  });
});

module.exports = router;