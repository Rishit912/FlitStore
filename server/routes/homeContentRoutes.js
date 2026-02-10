import express from 'express';
import { getHomeContent, updateHomeContent } from '../controllers/homeContentController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/').get(getHomeContent).put(protect, admin, updateHomeContent);

export default router;
