import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

const formatDateInput = (value) => {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const emptyHero = {
  badge: '',
  title: '',
  subtitle: '',
  ctaText: '',
  ctaLink: '',
  discountText: '',
  bannerImage: '',
  backgroundImage: '',
  backgroundColor: '',
  startDate: '',
  endDate: '',
  isActive: true,
};

const normalizeHero = (hero) => ({
  ...emptyHero,
  ...hero,
  startDate: formatDateInput(hero?.startDate),
  endDate: formatDateInput(hero?.endDate),
});

const HomeContentScreen = () => {
  const [isSaving, setIsSaving] = useState(false);
  const [heroes, setHeroes] = useState([emptyHero]);
  const [activeIndex, setActiveIndex] = useState(0);

  const activeHero = heroes[activeIndex] || emptyHero;

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const { data } = await axios.get('/api/homecontent');
        const heroList = data?.heroes?.length
          ? data.heroes
          : data?.hero
            ? [data.hero]
            : [];
        const normalized = heroList.length ? heroList.map(normalizeHero) : [emptyHero];
        setHeroes(normalized);
        setActiveIndex(0);
      } catch (error) {
        toast.error('Failed to load home content');
      }
    };

    fetchContent();
  }, []);

  const uploadImage = async (file, field) => {
    const formData = new FormData();
    formData.append('image', file);
    try {
      const { data } = await axios.post('/api/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setHeroes((prev) => prev.map((item, index) => (
        index === activeIndex ? { ...item, [field]: data.image } : item
      )));
      toast.success('Image uploaded');
    } catch (error) {
      toast.error('Image upload failed');
    }
  };

  const updateActiveHero = (field, value) => {
    setHeroes((prev) => prev.map((item, index) => (
      index === activeIndex ? { ...item, [field]: value } : item
    )));
  };

  const addSlide = () => {
    setHeroes((prev) => {
      const next = [...prev, { ...emptyHero }];
      setActiveIndex(next.length - 1);
      return next;
    });
  };

  const removeSlide = () => {
    if (heroes.length <= 1) {
      toast.info('At least one slide is required');
      return;
    }
    setHeroes((prev) => {
      const next = prev.filter((_, index) => index !== activeIndex);
      const nextIndex = Math.max(0, activeIndex - 1);
      setActiveIndex(nextIndex);
      return next;
    });
  };

  const onSave = async () => {
    try {
      setIsSaving(true);
      const payload = heroes.map((item) => ({
        ...item,
        startDate: item.startDate || null,
        endDate: item.endDate || null,
      }));
      await axios.put('/api/homecontent', { heroes: payload });
      window.dispatchEvent(new Event('flitHomeConfigUpdated'));
      window.dispatchEvent(new Event('flitHeroUpdated'));
      toast.success('Homepage hero updated');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Update failed');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fs-container fs-section">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-8">
        <div>
          <p className="fs-pill w-fit">Homepage</p>
          <h1 className="text-3xl font-black text-slate-900 mt-3">Hero and banner content</h1>
          <p className="text-slate-500">Update festival offers, discounts, and seasonal messaging.</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={addSlide}
            className="fs-button-ghost px-5 py-2 text-sm text-slate-700"
          >
            Add slide
          </button>
          <button
            onClick={removeSlide}
            className="fs-button-ghost px-5 py-2 text-sm text-slate-700"
          >
            Remove slide
          </button>
          <button
            onClick={onSave}
            disabled={isSaving}
            className="fs-button-primary px-6 py-2 text-sm"
          >
            {isSaving ? 'Saving...' : 'Save changes'}
          </button>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-8">
        {heroes.map((hero, index) => (
          <button
            key={`${hero.title}-${index}`}
            onClick={() => setActiveIndex(index)}
            className={`px-4 py-2 rounded-full text-xs font-semibold uppercase tracking-[0.2em] ${
              index === activeIndex ? 'bg-sky-600 text-white' : 'bg-white/80 text-slate-600 border border-white/80'
            }`}
          >
            Slide {index + 1}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="fs-card p-6 space-y-5">
          <div>
            <label className="block text-xs uppercase tracking-[0.2em] text-slate-400 font-semibold mb-2">Badge</label>
            <input
              className="fs-input"
              value={activeHero.badge}
              onChange={(e) => updateActiveHero('badge', e.target.value)}
              placeholder="Festival Special"
            />
          </div>

          <div>
            <label className="block text-xs uppercase tracking-[0.2em] text-slate-400 font-semibold mb-2">Title</label>
            <input
              className="fs-input"
              value={activeHero.title}
              onChange={(e) => updateActiveHero('title', e.target.value)}
              placeholder="Curated essentials for the way you live today."
            />
          </div>

          <div>
            <label className="block text-xs uppercase tracking-[0.2em] text-slate-400 font-semibold mb-2">Subtitle</label>
            <textarea
              className="fs-input resize-none"
              rows={3}
              value={activeHero.subtitle}
              onChange={(e) => updateActiveHero('subtitle', e.target.value)}
              placeholder="Short supporting copy for the hero."
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs uppercase tracking-[0.2em] text-slate-400 font-semibold mb-2">CTA Text</label>
              <input
                className="fs-input"
                value={activeHero.ctaText}
                onChange={(e) => updateActiveHero('ctaText', e.target.value)}
                placeholder="Shop the drop"
              />
            </div>
            <div>
              <label className="block text-xs uppercase tracking-[0.2em] text-slate-400 font-semibold mb-2">CTA Link</label>
              <input
                className="fs-input"
                value={activeHero.ctaLink}
                onChange={(e) => updateActiveHero('ctaLink', e.target.value)}
                placeholder="/search/sale"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs uppercase tracking-[0.2em] text-slate-400 font-semibold mb-2">Discount Text</label>
            <input
              className="fs-input"
              value={activeHero.discountText}
              onChange={(e) => updateActiveHero('discountText', e.target.value)}
              placeholder="Up to 40% off"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs uppercase tracking-[0.2em] text-slate-400 font-semibold mb-2">Start Date</label>
              <input
                type="date"
                className="fs-input"
                value={activeHero.startDate}
                onChange={(e) => updateActiveHero('startDate', e.target.value)}
              />
            </div>
            <div>
              <label className="block text-xs uppercase tracking-[0.2em] text-slate-400 font-semibold mb-2">End Date</label>
              <input
                type="date"
                className="fs-input"
                value={activeHero.endDate}
                onChange={(e) => updateActiveHero('endDate', e.target.value)}
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={activeHero.isActive}
              onChange={(e) => updateActiveHero('isActive', e.target.checked)}
              className="h-4 w-4 text-sky-600"
            />
            <span className="text-sm text-slate-600">Hero active</span>
          </div>
        </div>

        <div className="fs-card p-6 space-y-6">
          <div>
            <label className="block text-xs uppercase tracking-[0.2em] text-slate-400 font-semibold mb-2">Banner Image</label>
            <input
              type="file"
              className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-6 file:rounded-full file:border-0 file:text-xs file:font-black file:bg-sky-600 file:text-white hover:file:bg-sky-700 transition cursor-pointer"
              onChange={(e) => e.target.files && uploadImage(e.target.files[0], 'bannerImage')}
            />
            <input
              className="fs-input mt-3"
              value={activeHero.bannerImage}
              onChange={(e) => updateActiveHero('bannerImage', e.target.value)}
              placeholder="/uploads/banner.png"
            />
          </div>

          <div>
            <label className="block text-xs uppercase tracking-[0.2em] text-slate-400 font-semibold mb-2">Background Image</label>
            <input
              type="file"
              className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-6 file:rounded-full file:border-0 file:text-xs file:font-black file:bg-slate-900 file:text-white hover:file:bg-black transition cursor-pointer"
              onChange={(e) => e.target.files && uploadImage(e.target.files[0], 'backgroundImage')}
            />
            <input
              className="fs-input mt-3"
              value={activeHero.backgroundImage}
              onChange={(e) => updateActiveHero('backgroundImage', e.target.value)}
              placeholder="/uploads/background.png"
            />
          </div>

          <div>
            <label className="block text-xs uppercase tracking-[0.2em] text-slate-400 font-semibold mb-2">Background Color</label>
            <div className="flex items-center gap-4">
              <input
                type="color"
                value={activeHero.backgroundColor || '#f8fafc'}
                onChange={(e) => updateActiveHero('backgroundColor', e.target.value)}
                className="h-10 w-16 rounded-lg border border-white/70 bg-white"
              />
              <input
                className="fs-input"
                value={activeHero.backgroundColor}
                onChange={(e) => updateActiveHero('backgroundColor', e.target.value)}
                placeholder="#f8fafc"
              />
            </div>
          </div>

          <div className="rounded-2xl border border-white/70 bg-white/80 p-4">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-400 font-semibold mb-2">Preview</p>
            <div
              className="rounded-2xl p-4 bg-white/90 border border-white/80"
              style={{
                backgroundColor: activeHero.backgroundColor || undefined,
                backgroundImage: activeHero.backgroundImage ? `url(${activeHero.backgroundImage})` : undefined,
                backgroundSize: activeHero.backgroundImage ? 'cover' : undefined,
                backgroundPosition: activeHero.backgroundImage ? 'center' : undefined,
              }}
            >
              <div className="flex flex-col md:flex-row gap-4 items-center">
                <div className="flex-1 space-y-2">
                  <span className="fs-pill w-fit">{activeHero.badge || 'Festival Special'}</span>
                  <h3 className="text-lg font-black text-slate-900">
                    {activeHero.title || 'Your hero title goes here'}
                  </h3>
                  <p className="text-sm text-slate-600">
                    {activeHero.subtitle || 'Add supporting copy for the hero slide.'}
                  </p>
                  {activeHero.discountText && (
                    <div className="inline-flex items-center gap-2 rounded-full bg-amber-100 text-amber-700 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em]">
                      {activeHero.discountText}
                    </div>
                  )}
                </div>
                <img
                  src={activeHero.bannerImage || '/hero-showcase.svg'}
                  alt="Hero preview"
                  className="w-full md:w-40 rounded-xl shadow"
                />
              </div>
            </div>
            <p className="text-xs text-slate-500 mt-3">
              The hero appears when active and within the selected date range.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomeContentScreen;
