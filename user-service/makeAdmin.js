const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

const makeAdmin = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const user = await User.findOne();
        if (user) {
            user.isAdmin = true;
            await user.save();
            console.log(`Successfully promoted ${user.email} to Admin!`);
            console.log(`Please log out and log back in to get your Admin token.`);
        } else {
            console.log('No users found in database. Please register a user first.');
        }
        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}
makeAdmin();
