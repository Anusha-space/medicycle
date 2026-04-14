const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

const medicineRoutes = require("./routes/medicines");
const orderRoutes = require("./routes/orders");

// API routes
app.use("/api/medicines", medicineRoutes);
app.use("/api/orders", orderRoutes);

app.get("/", (req, res) => {
  res.send("Backend is running");
});

app.listen(5000, () => {
  console.log("Server running on port 5000");
});