if (!global.crypto) {
    global.crypto = require('crypto');
}
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const paymentRoutes = require('./routes/paymentRoutes');

// Load environment variables
dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/payments', paymentRoutes);

// Base route for testing
app.get('/', (req, res) => {
    res.send('Payment Service is running');
});

const PORT = process.env.PORT || 5004;

app.listen(PORT, () => {
    console.log(`Payment Service running on port ${PORT}`);
});
