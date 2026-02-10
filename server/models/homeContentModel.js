import mongoose from 'mongoose';

const heroSchema = new mongoose.Schema({
  badge: { type: String, default: '' },
  title: { type: String, default: '' },
  subtitle: { type: String, default: '' },
  ctaText: { type: String, default: '' },
  ctaLink: { type: String, default: '' },
  discountText: { type: String, default: '' },
  bannerImage: { type: String, default: '' },
  backgroundImage: { type: String, default: '' },
  backgroundColor: { type: String, default: '' },
  startDate: { type: Date },
  endDate: { type: Date },
  isActive: { type: Boolean, default: true },
}, { _id: false });

const homeContentSchema = new mongoose.Schema({
  hero: heroSchema,
  heroes: [heroSchema],
}, { timestamps: true });

const HomeContent = mongoose.model('HomeContent', homeContentSchema);

export default HomeContent;
