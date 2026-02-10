import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import Razorpay from 'razorpay';
import shortid from 'shortid';
import connectDB from './config/db.js';

// Route Imports
import productRoutes from './routes/productRoutes.js';
import userRoutes from './routes/userRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import razorpayRoutes from './routes/razorpayRoutes.js';
import uploadRoutes from './routes/uploadRoutes.js'; 
import couponRoutes from './routes/couponRoutes.js';
import homeContentRoutes from './routes/homeContentRoutes.js';

// Import Error Middleware (Only once!)
import { notFound, errorHandler } from './middleware/errorMiddleware.js';

dotenv.config();
connectDB();

const app = express();

// --- 1. MIDDLEWARE SETUP ---
// CORS must be configured for cookies/credentials
app.use(cors({
  origin: 'http://localhost:5173', 
  credentials: true,               
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// --- 2. MOUNT ROUTES ---
app.use('/api/products', productRoutes);
app.use('/api/users', userRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/razorpay', razorpayRoutes);
app.use('/api/coupons', couponRoutes); // 🟢 This fixes the "Not Found" error
app.use('/api/homecontent', homeContentRoutes);

// --- 3. EXTERNAL SERVICES & CONFIG ---
app.get('/api/config/paypal', (req, res) => {
  res.send({ clientId: process.env.PAYPAL_CLIENT_ID });
});

app.get('/api/config/razorpay', (req, res) => {
  res.send({ key: process.env.RAZORPAY_KEY_ID });
});

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

app.post('/api/razorpay', async (req, res) => {
  const amount = Number(req.body.amount);
  if (!amount || Number.isNaN(amount)) {
    return res.status(400).send('Invalid amount');
  }

  const options = {
    amount: Math.round(amount * 100), 
    currency: 'INR',
    receipt: shortid.generate(),
    payment_capture: 1,
  };

  try {
    const response = await razorpay.orders.create(options);
    res.json({
      id: response.id,
      currency: response.currency,
      amount: response.amount,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send('Unable to create Razorpay order');
  }
});
const __dirname = path.resolve();
// '../uploads' tells Node to go up one folder, then look for 'uploads'
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));
app.get('/', (req, res) => {
  res.send('API is running....');
});

// --- 5. ERROR HANDLING (MUST BE LAST) ---

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});