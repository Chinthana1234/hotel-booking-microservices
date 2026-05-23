const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        // Connect to MongoDB using the URI from environment variables
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB connected for User Service');
    } catch (error) {
        console.error('MongoDB connection error:', error.message);
        // Exit process with failure
        process.exit(1);
    }
};

module.exports = connectDB;
