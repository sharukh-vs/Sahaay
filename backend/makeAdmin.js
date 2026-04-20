const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const { User } = require('./models');

const createAdmin = async () => {
    try {
        await mongoose.connect(process.env.DATABASE);
        console.log('Connected to DB');

        const email = 'admin@sahaay.com';
        const existingAdmin = await User.findOne({ email });

        if (existingAdmin) {
            existingAdmin.role = 'superAdmin';
            await existingAdmin.save();
            console.log('Admin already exists. Role updated to superAdmin.');
        } else {
            await User.create({
                name: 'Super Admin',
                email: email,
                password: 'password123',
                role: 'superAdmin',
                isVerified: true,
                isActive: true
            });
            console.log('Admin account created successfully.');
        }
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

createAdmin();
