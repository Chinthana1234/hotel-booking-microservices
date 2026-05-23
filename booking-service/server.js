const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const bookingRoutes = require('./routes/bookingRoutes');

// Load environment variables
dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/bookings', bookingRoutes);

// Base route for testing
app.get('/', (req, res) => {
    res.send('Booking Service is running');
});

const PORT = process.env.PORT || 5003;

app.listen(PORT, () => {
    console.log(`Booking Service running on port ${PORT}`);
});
