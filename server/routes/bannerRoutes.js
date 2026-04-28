import express from 'express';
import { getBanner, upsertBanner } from '../controllers/bannerController.js';
import { protect, admin } from '../middleware/authmiddleware.js';

const router = express.Router();

router.route('/').get(getBanner).put(protect, admin, upsertBanner);

export default router;
