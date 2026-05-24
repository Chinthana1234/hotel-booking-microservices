if (!global.crypto) {
    global.crypto = require('crypto');
}
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const roomRoutes = require('./routes/roomRoutes');

// Load environment variables
dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/rooms', roomRoutes);

// Base route for Room Service testing
app.get('/', (req, res) => {
    res.send('Room Service is running');
});

const PORT = process.env.PORT || 5002;

app.listen(PORT, () => {
    console.log(`Room Service running on port ${PORT}`);
});
