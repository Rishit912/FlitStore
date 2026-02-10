const mongoose = require('mongoose');
const dotenv = require('dotenv');
const users = require('./data/users');
const products = require('./data/products');
const User = require('./models/User');
const ProductModule = require('./models/Product');
const Product = ProductModule.default || ProductModule;
const Order = require('./models/orderModel');
const connectDB = require('./config/db');

dotenv.config();
connectDB();

const importData = async () => {
    try {
        // 1. Wipe everything clean
        await Order.deleteMany();
        await Product.deleteMany();
        await User.deleteMany();

        // 2. Create Users Loop
        const createdUsers = [];
        for (const user of users) {
            // Spreading the user data and forcing verification to true
            const newUser = await User.create({
                ...user,
                isVerified: true 
            });
            createdUsers.push(newUser);
        }

        // 3. Get the Admin User's ID
        const adminUser = createdUsers[0]._id;

        // 4. Map the products to that Admin
        const sampleProducts = products.map((product) => {
            return { ...product, user: adminUser };
        });

        // 5. Insert Products
        await Product.insertMany(sampleProducts);

        console.log('✅ Data Imported Successfully (Verified & Encrypted)!');
        process.exit();
    } catch (error) {
        console.error(`❌ Error: ${error.message}`);
        process.exit(1);
    }
};

const destroyData = async () => {
    try {
        await Order.deleteMany();
        await Product.deleteMany();
        await User.deleteMany();

        console.log('🛑 Data Destroyed!');
        process.exit();
    } catch (error) {
        console.error(`❌ Error: ${error.message}`);
        process.exit(1);
    }
};

if (process.argv[2] === '-d') {
    destroyData();
} else {
    importData();
}