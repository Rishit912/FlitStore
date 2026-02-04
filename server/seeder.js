const mongoose = require('mongoose');
const dotenv = require('dotenv');
const users = require('./data/users');
const products = require('./data/products');
const User = require('./models/User');
const Product = require('./models/Product');
const Order = require('./models/Order');
const connectDB = require('./config/db');

dotenv.config();
connectDB();

const importData = async () => {
    try {
        // 1. Wipe everything clean
        await Order.deleteMany();
        await Product.deleteMany();
        await User.deleteMany();

        // 2. Create Users Loop (CORRECT WAY)
        // We use a loop and User.create() so the encryption hook fires for each one
        const createdUsers = [];
        for (const user of users) {
            const newUser = await User.create(user);
            createdUsers.push(newUser);
        }

        // 3. Get the Admin User's ID
        // The first user in your users.js file is the Admin
        const adminUser = createdUsers[0]._id;

        // 4. Map the products to that Admin
        const sampleProducts = products.map((product) => {
            return { ...product, user: adminUser };
        });

        // 5. Insert Products
        await Product.insertMany(sampleProducts);

        console.log('✅ Data Imported Successfully (With Encryption)!');
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