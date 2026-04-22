import express from 'express';
import { getBanner, upsertBanner } from '../controllers/bannerController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/').get(getBanner).put(protect, admin, upsertBanner);

export default router;
