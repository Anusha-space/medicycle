require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();

app.use(cors({ origin: ['http://localhost:5173', 'http://localhost:8080'], credentials: true }));
app.use(express.json());

app.use('/api/auth',      require('./routes/auth'));
app.use('/api/medicines', require('./routes/medicines'));
app.use('/api/orders',    require('./routes/orders'));
app.use('/api/urgent', require('./routes/urgentRequests'));
app.get('/', (req, res) => res.json({ status: 'Medicycle API running' }));

app.use((req, res) => res.status(404).json({ message: 'Route not found.' }));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));