const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');
const productRoutes = require('./routes/productRoutes');
const cookieParser = require('cookie-parser');
const userRoutes = require('./routes/userRoutes');
const orderRoutes = require('./routes/orderRoutes'); 

const Razorpay = require('razorpay');
const shortid = require('shortid');
const uploadRoutes = require('./routes/uploadRoutes');
const path = require('path');

// Load environment variables and connect to the database
dotenv.config();

// Connect to the database
connectDB();

// Initialize Express app
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.get('/', (req, res) => {
  res.send('api is running....');
});

// Initialize Razorpay Instance
const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// --- MOUNT ROUTES ---
app.use('/api/products', productRoutes);
app.use('/api/users', userRoutes);
app.use('/api/orders', orderRoutes); 


const folder = path.resolve();
app.use('/uploads', express.static(path.join(folder, '/uploads')));
// server.js
app.use('/uploads', express.static(path.join(path.resolve(), '/uploads')));
app.use('/api/uploads', uploadRoutes); // Add this line to mount the upload routes

// --- CONFIG ROUTES (Send Keys to Frontend) ---

// 1. PayPal Config
app.get('/api/config/paypal', (req, res) => {
  res.send({ clientId: process.env.PAYPAL_CLIENT_ID });
});

// 👇 2. RAZORPAY CONFIG (THIS WAS MISSING!) 👇
app.get('/api/config/razorpay', (req, res) => {
  res.send({ key: process.env.RAZORPAY_KEY_ID });
});
// 👆 THIS FIXES THE 404 ERROR 👆


// --- PAYMENT ROUTES ---

// Route to create a Razorpay Order
app.post('/api/razorpay', async (req, res) => {
    const payment_capture = 1;
    const amount = req.body.amount; // Amount from frontend
    const currency = 'INR';

    const options = {
        amount: amount * 100, // Convert Rupee to Paise
        currency,
        receipt: shortid.generate(),
        payment_capture,
    };

    try {
        const response = await razorpay.orders.create(options);
        console.log("Razorpay Order Created:", response); // Log for debugging
        res.json({
            id: response.id,
            currency: response.currency,
            amount: response.amount,
        });
    } catch (error) {
        console.log(error);
        res.status(500).send('Unable to create Razorpay order');
    }
});

// Start the server
const PORT = process.env.PORT || 5000; // Changed default to 5000 to match your frontend proxy
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});