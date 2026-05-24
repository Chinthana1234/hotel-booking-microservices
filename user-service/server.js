if (!global.crypto) {
    global.crypto = require('crypto');
}
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const userRoutes = require('./routes/userRoutes');

// Load environment variables
dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/users', userRoutes);

// Base route for User Service testing
app.get('/', (req, res) => {
    res.send('User Service is running');
});

const PORT = process.env.PORT || 5001;

app.listen(PORT, () => {
    console.log(`User Service running on port ${PORT}`);
});
