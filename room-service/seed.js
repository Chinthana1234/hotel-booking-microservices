const mongoose = require('mongoose');

// MongoDB Atlas connection for Room Service
const MONGO_URI = 'mongodb+srv://chinthana:mypassword123@cluster0.153ofer.mongodb.net/hotel_room_service';

// Room Schema (same as models/Room.js)
const roomSchema = new mongoose.Schema({
    roomNumber: { type: String, required: true, unique: true },
    type: { type: String, required: true },
    pricePerNight: { type: Number, required: true },
    isAvailable: { type: Boolean, default: true },
    description: { type: String, required: true }
}, { timestamps: true });

const Room = mongoose.model('Room', roomSchema);

// Sample rooms data
const sampleRooms = [
    {
        roomNumber: '101',
        type: 'Single',
        pricePerNight: 75,
        isAvailable: true,
        description: 'Cozy single room with a garden view and complimentary breakfast.'
    },
    {
        roomNumber: '102',
        type: 'Double',
        pricePerNight: 120,
        isAvailable: true,
        description: 'Spacious double room with king-size bed and modern amenities.'
    },
    {
        roomNumber: '201',
        type: 'Suite',
        pricePerNight: 250,
        isAvailable: true,
        description: 'Premium suite with ocean view, jacuzzi, and private balcony.'
    },
    {
        roomNumber: '202',
        type: 'Double',
        pricePerNight: 150,
        isAvailable: true,
        description: 'Elegant double room with city skyline view and mini bar.'
    },
    {
        roomNumber: '301',
        type: 'Suite',
        pricePerNight: 400,
        isAvailable: true,
        description: 'Royal penthouse suite with panoramic views and personal butler service.'
    },
    {
        roomNumber: '103',
        type: 'Single',
        pricePerNight: 85,
        isAvailable: true,
        description: 'Modern single room with high-speed WiFi and workspace desk.'
    }
];

const seedRooms = async () => {
    try {
        console.log('Connecting to MongoDB Atlas...');
        await mongoose.connect(MONGO_URI);
        console.log('Connected!');

        // Delete all existing rooms
        await Room.deleteMany({});
        console.log('Cleared old room data.');

        // Insert sample rooms
        const createdRooms = await Room.insertMany(sampleRooms);
        console.log(`Added ${createdRooms.length} sample rooms to the database!`);

        console.log('\n--- Sample Rooms Added ---');
        createdRooms.forEach(room => {
            console.log(`  Room #${room.roomNumber} | ${room.type} | $${room.pricePerNight}/night`);
        });

        mongoose.connection.close();
        console.log('\nDone! You can now start the services.');
    } catch (error) {
        console.error('Error seeding data:', error.message);
        process.exit(1);
    }
};

seedRooms();
