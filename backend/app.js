const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const userRoutes = require('./routes/userRoutes');
const adminRoutes = require('./routes/adminRoutes');
const errorHandler = require('./middleware/errorHandler');

const app = express();
app.use(express.json());
app.use(cors());

app.get('/', (req, res) => res.send("Hello from backend"));
app.use('/admin', adminRoutes);
app.use('/user', userRoutes);
app.use(errorHandler);

module.exports = app;