import asyncHandler from 'express-async-handler';
import Banner from '../models/bannerModel.js';

// @desc    Get banner
// @route   GET /api/banner
// @access  Public
export const getBanner = asyncHandler(async (req, res) => {
  const banner = await Banner.findOne();
  res.json(banner || {});
});

// @desc    Upsert banner (admin)
// @route   PUT /api/banner
// @access  Private/Admin
export const upsertBanner = asyncHandler(async (req, res) => {
  const {
    badgeText,
    title,
    highlight,
    subtitle,
    ctaText,
    ctaLink,
    promoText,
    image,
    backgroundColor,
    textColor,
    accentColor,
    badgeBgColor,
    promoBgColor,
    backgroundImage,
    animation,
    decorImages,
  } = req.body;

  const payload = {
    badgeText,
    title,
    highlight,
    subtitle,
    ctaText,
    ctaLink,
    promoText,
    image,
    backgroundColor,
    textColor,
    accentColor,
    badgeBgColor,
    promoBgColor,
    backgroundImage,
    animation,
    decorImages,
  };

  let banner = await Banner.findOne();
  if (banner) {
    banner.set(payload);
    const updated = await banner.save();
    res.json(updated);
  } else {
    banner = await Banner.create(payload);
    res.status(201).json(banner);
  }
});
