const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const axios = require('axios');

// Load environment variables
dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Base Route
app.get('/', (req, res) => {
    res.json({ message: 'API Gateway is running. Use /api/users to access User Service.' });
});

// Route all requests starting with /api/users to the User Service
app.use('/api/users', async (req, res) => {
    try {
        // Forward the request to the User Service
        const response = await axios({
            method: req.method,
            url: `${process.env.USER_SERVICE_URL}/api/users${req.url}`,
            data: req.body,
            headers: {
                ...req.headers,
                host: undefined // Prevent host header conflicts
            }
        });
        
        // Send back the response from the User Service
        res.status(response.status).json(response.data);
    } catch (error) {
        if (error.response) {
            // Service responded with an error status
            res.status(error.response.status).json(error.response.data);
        } else {
            // Service is completely down
            res.status(500).json({ message: 'User Service is currently unavailable.' });
        }
    }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`API Gateway is running on port ${PORT}`);
});
