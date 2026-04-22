import mongoose from 'mongoose';

const bannerSchema = new mongoose.Schema(
  {
    badgeText: { type: String, default: 'New Season Drops' },
    title: { type: String, default: 'Shop Smarter.' },
    highlight: { type: String, default: 'Feel the Future.' },
    subtitle: {
      type: String,
      default:
        'A unique, high‑end shopping experience with curated products, AI‑assisted deals, and lightning‑fast checkout.',
    },
    ctaText: { type: String, default: 'Explore Collection' },
    ctaLink: { type: String, default: '/' },
    promoText: { type: String, default: 'Free shipping on orders over ₹1000' },
    image: { type: String, default: '' },
    backgroundColor: { type: String, default: '' },
    textColor: { type: String, default: '' },
    accentColor: { type: String, default: '' },
    badgeBgColor: { type: String, default: '' },
    promoBgColor: { type: String, default: '' },
    backgroundImage: { type: String, default: '' },
    animation: { type: String, default: 'none' },
    decorImages: { type: [String], default: [] },
  },
  { timestamps: true }
);

const Banner = mongoose.model('Banner', bannerSchema);

export default Banner;
