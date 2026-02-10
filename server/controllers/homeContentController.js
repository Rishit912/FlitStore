import asyncHandler from 'express-async-handler';
import HomeContent from '../models/homeContentModel.js';

// @desc    Get home content
// @route   GET /api/homecontent
// @access  Public
export const getHomeContent = asyncHandler(async (req, res) => {
  const content = await HomeContent.findOne({});
  if (!content) {
    res.json({ heroes: [] });
    return;
  }
  if (!content.heroes || content.heroes.length === 0) {
    const legacyHero = content.hero ? [content.hero] : [];
    res.json({ ...content.toObject(), heroes: legacyHero });
    return;
  }
  res.json(content);
});

// @desc    Update home content
// @route   PUT /api/homecontent
// @access  Private/Admin
export const updateHomeContent = asyncHandler(async (req, res) => {
  const { hero, heroes } = req.body;
  const payloadHeroes = Array.isArray(heroes)
    ? heroes
    : hero
      ? [hero]
      : [];
  const updated = await HomeContent.findOneAndUpdate(
    {},
    { heroes: payloadHeroes },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  );
  res.json(updated);
});
