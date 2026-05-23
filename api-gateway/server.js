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
    res.json({ message: 'API Gateway is running. All services are connected.' });
});

// A reusable proxy function to forward requests to the correct microservice
const createProxy = (serviceUrl, basePath) => {
    return async (req, res) => {
        try {
            // Forward the request using Axios
            const response = await axios({
                method: req.method,
                url: `${serviceUrl}${basePath}${req.url}`,
                data: req.body,
                headers: {
                    ...req.headers,
                    host: undefined // Prevent host header conflicts
                }
            });
            
            // Send back the response from the microservice
            res.status(response.status).json(response.data);
        } catch (error) {
            if (error.response) {
                // The microservice responded with an error (e.g., 400 Bad Request)
                res.status(error.response.status).json(error.response.data);
            } else {
                // The microservice is completely down or unreachable
                res.status(500).json({ message: 'Service is currently unavailable.' });
            }
        }
    };
};

// Route all incoming requests to the correct backend microservice
app.use('/api/users', createProxy(process.env.USER_SERVICE_URL, '/api/users'));
app.use('/api/rooms', createProxy(process.env.ROOM_SERVICE_URL, '/api/rooms'));
app.use('/api/bookings', createProxy(process.env.BOOKING_SERVICE_URL, '/api/bookings'));
app.use('/api/payments', createProxy(process.env.PAYMENT_SERVICE_URL, '/api/payments'));
app.use('/api/reviews', createProxy(process.env.REVIEW_SERVICE_URL, '/api/reviews'));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`API Gateway is running on port ${PORT}`);
});
