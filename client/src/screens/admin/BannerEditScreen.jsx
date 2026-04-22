import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

const BannerEditScreen = () => {
  const defaultPreset = {
    badgeText: 'New Season Drops',
    title: 'Shop Smarter.',
    highlight: 'Feel the Future.',
    subtitle: 'A unique, high‑end shopping experience with curated products, AI‑assisted deals, and lightning‑fast checkout.',
    ctaText: 'Explore Collection',
    ctaLink: '/',
    promoText: 'Free shipping on orders over ₹1000',
    image: '',
    backgroundColor: '#ffffff',
    textColor: '#1f2937',
    accentColor: '#ff7a00',
    badgeBgColor: '#f4e2ff',
    promoBgColor: '#e0f2fe',
    backgroundImage: '',
    animation: 'none',
    decorImages: [],
  };
  const [badgeText, setBadgeText] = useState('');
  const [title, setTitle] = useState('');
  const [highlight, setHighlight] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [ctaText, setCtaText] = useState('');
  const [ctaLink, setCtaLink] = useState('');
  const [promoText, setPromoText] = useState('');
  const [image, setImage] = useState('');
  const [backgroundColor, setBackgroundColor] = useState('');
  const [textColor, setTextColor] = useState('');
  const [accentColor, setAccentColor] = useState('');
  const [badgeBgColor, setBadgeBgColor] = useState('');
  const [promoBgColor, setPromoBgColor] = useState('');
  const [backgroundImage, setBackgroundImage] = useState('');
  const [animation, setAnimation] = useState('none');
  const [decorImages, setDecorImages] = useState('');
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await axios.get('/api/banner');
        setBadgeText(data.badgeText || 'New Season Drops');
        setTitle(data.title || 'Shop Smarter.');
        setHighlight(data.highlight || 'Feel the Future.');
        setSubtitle(data.subtitle || '');
        setCtaText(data.ctaText || 'Explore Collection');
        setCtaLink(data.ctaLink || '/');
        setPromoText(data.promoText || 'Free shipping on orders over ₹1000');
        setImage(data.image || '');
        setBackgroundColor(data.backgroundColor || '');
        setTextColor(data.textColor || '');
        setAccentColor(data.accentColor || '');
        setBadgeBgColor(data.badgeBgColor || '');
        setPromoBgColor(data.promoBgColor || '');
        setBackgroundImage(data.backgroundImage || '');
        setAnimation(data.animation || 'none');
        setDecorImages((data.decorImages || []).join('\n'));
      } catch (err) {
        toast.error('Failed to load banner');
      }
    };
    load();
  }, []);

  const uploadFileHandler = async (e) => {
    const file = e.target.files[0];
    const formData = new FormData();
    formData.append('image', file);
    setUploading(true);

    try {
      const config = {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      };

      const { data } = await axios.post('/api/upload', formData, config);
      setImage(data.image);
      toast.success('Image uploaded');
    } catch (err) {
      toast.error('Image upload failed');
    } finally {
      setUploading(false);
    }
  };

  const submitHandler = async (e) => {
    e.preventDefault();
    try {
      const decorList = decorImages
        .split(/[,\n]/)
        .map((item) => item.trim())
        .filter(Boolean);
      await axios.put('/api/banner', {
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
        decorImages: decorList,
      });
      toast.success('Banner updated');
    } catch (err) {
      toast.error('Failed to update banner');
    }
  };

  const applyPreset = async (preset) => {
    try {
      setBadgeText(preset.badgeText || '');
      setTitle(preset.title || '');
      setHighlight(preset.highlight || '');
      setSubtitle(preset.subtitle || '');
      setCtaText(preset.ctaText || '');
      setCtaLink(preset.ctaLink || '/');
      setPromoText(preset.promoText || '');
      setImage(preset.image || '');
      setBackgroundColor(preset.backgroundColor || '');
      setTextColor(preset.textColor || '');
      setAccentColor(preset.accentColor || '');
      setBadgeBgColor(preset.badgeBgColor || '');
      setPromoBgColor(preset.promoBgColor || '');
      setBackgroundImage(preset.backgroundImage || '');
      setAnimation(preset.animation || 'none');
      setDecorImages((preset.decorImages || []).join('\n'));

      await axios.put('/api/banner', {
        ...preset,
        decorImages: preset.decorImages || [],
      });
      toast.success('Default banner applied');
    } catch (err) {
      toast.error('Failed to apply default banner');
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="app-card p-6">
        <h1 className="text-2xl font-black text-foreground uppercase mb-6">Hero Banner</h1>

        <div className="app-card p-4 mb-6 bg-surface-2">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <div className="text-xs font-black text-muted uppercase tracking-widest">Default Preset</div>
              <div className="text-lg font-black text-foreground">Classic Clean Banner</div>
              <p className="text-sm text-muted">Apply the default hero banner instantly.</p>
            </div>
            <button
              type="button"
              className="app-btn px-6 py-3"
              onClick={() => applyPreset(defaultPreset)}
            >
              Apply Default
            </button>
          </div>
        </div>

        <form onSubmit={submitHandler} className="space-y-5">
          <div>
            <label className="block text-xs font-black text-muted uppercase mb-2">Badge Text</label>
            <input className="w-full app-input" value={badgeText} onChange={(e) => setBadgeText(e.target.value)} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-black text-muted uppercase mb-2">Title</label>
              <input className="w-full app-input" value={title} onChange={(e) => setTitle(e.target.value)} />
            </div>
            <div>
              <label className="block text-xs font-black text-muted uppercase mb-2">Highlight</label>
              <input className="w-full app-input" value={highlight} onChange={(e) => setHighlight(e.target.value)} />
            </div>
          </div>

          <div>
            <label className="block text-xs font-black text-muted uppercase mb-2">Subtitle</label>
            <textarea className="w-full app-input resize-none" rows="3" value={subtitle} onChange={(e) => setSubtitle(e.target.value)} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-black text-muted uppercase mb-2">CTA Text</label>
              <input className="w-full app-input" value={ctaText} onChange={(e) => setCtaText(e.target.value)} />
            </div>
            <div>
              <label className="block text-xs font-black text-muted uppercase mb-2">CTA Link</label>
              <input className="w-full app-input" value={ctaLink} onChange={(e) => setCtaLink(e.target.value)} />
            </div>
          </div>

          <div>
            <label className="block text-xs font-black text-muted uppercase mb-2">Promo Text</label>
            <input className="w-full app-input" value={promoText} onChange={(e) => setPromoText(e.target.value)} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-black text-muted uppercase mb-2">Background Color</label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  className="h-11 w-14 rounded-xl border border-app bg-surface"
                  value={backgroundColor || '#ffffff'}
                  onChange={(e) => setBackgroundColor(e.target.value)}
                />
                <input className="w-full app-input" value={backgroundColor} onChange={(e) => setBackgroundColor(e.target.value)} placeholder="#ffffff" />
              </div>
            </div>
            <div>
              <label className="block text-xs font-black text-muted uppercase mb-2">Text Color</label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  className="h-11 w-14 rounded-xl border border-app bg-surface"
                  value={textColor || '#1f2937'}
                  onChange={(e) => setTextColor(e.target.value)}
                />
                <input className="w-full app-input" value={textColor} onChange={(e) => setTextColor(e.target.value)} placeholder="#1f2937" />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-black text-muted uppercase mb-2">Accent Color</label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  className="h-11 w-14 rounded-xl border border-app bg-surface"
                  value={accentColor || '#ff7a00'}
                  onChange={(e) => setAccentColor(e.target.value)}
                />
                <input className="w-full app-input" value={accentColor} onChange={(e) => setAccentColor(e.target.value)} placeholder="#ff7a00" />
              </div>
            </div>
            <div>
              <label className="block text-xs font-black text-muted uppercase mb-2">Badge Background</label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  className="h-11 w-14 rounded-xl border border-app bg-surface"
                  value={badgeBgColor || '#ffd7b0'}
                  onChange={(e) => setBadgeBgColor(e.target.value)}
                />
                <input className="w-full app-input" value={badgeBgColor} onChange={(e) => setBadgeBgColor(e.target.value)} placeholder="#ffd7b0" />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-black text-muted uppercase mb-2">Promo Background</label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  className="h-11 w-14 rounded-xl border border-app bg-surface"
                  value={promoBgColor || '#ffffff'}
                  onChange={(e) => setPromoBgColor(e.target.value)}
                />
                <input className="w-full app-input" value={promoBgColor} onChange={(e) => setPromoBgColor(e.target.value)} placeholder="#ffffff" />
              </div>
            </div>
            <div>
              <label className="block text-xs font-black text-muted uppercase mb-2">Animation</label>
              <select className="w-full app-input" value={animation} onChange={(e) => setAnimation(e.target.value)}>
                <option value="none">None</option>
                <option value="sparkle">Sparkle</option>
                <option value="gradient">Gradient Shift</option>
                <option value="float">Floating Orbs</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-black text-muted uppercase mb-2">Background Image URL</label>
            <input className="w-full app-input" value={backgroundImage} onChange={(e) => setBackgroundImage(e.target.value)} />
          </div>

          <div>
            <label className="block text-xs font-black text-muted uppercase mb-2">Hero Image URL</label>
            <input className="w-full app-input" value={image} onChange={(e) => setImage(e.target.value)} />
          </div>

          <div>
            <label className="block text-xs font-black text-muted uppercase mb-2">Decor Images (comma or new line separated URLs)</label>
            <textarea className="w-full app-input resize-none" rows="3" value={decorImages} onChange={(e) => setDecorImages(e.target.value)} />
          </div>

          <div className="bg-surface-2 p-4 rounded-2xl border border-app">
            <label className="block text-xs font-black text-foreground uppercase mb-3">Upload Image</label>
            <input type="file" className="w-full text-sm text-muted file:mr-4 file:py-2 file:px-6 file:rounded-full file:border-0 file:text-xs file:font-black file:bg-[color:var(--primary)] file:text-white hover:file:bg-[color:var(--primary-600)] transition cursor-pointer" onChange={uploadFileHandler} />
            {uploading && <div className="text-xs text-primary font-bold mt-2">Uploading...</div>}
          </div>

          <button type="submit" className="app-btn w-full py-3">Save Banner</button>
        </form>
      </div>
    </div>
  );
};

export default BannerEditScreen;
