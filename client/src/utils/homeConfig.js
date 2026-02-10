const DEFAULT_CONFIG = {
  featuredCategories: [],
  dealsSort: 'price-asc',
  bestSort: 'reviews-desc',
  newSort: 'created-desc',
};

const STORAGE_KEY = 'flit_home_config';

export const getHomeConfig = () => {
  if (typeof window === 'undefined') return DEFAULT_CONFIG;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_CONFIG;
    const parsed = JSON.parse(raw);
    return { ...DEFAULT_CONFIG, ...parsed };
  } catch (error) {
    return DEFAULT_CONFIG;
  }
};

export const setHomeConfig = (config) => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...DEFAULT_CONFIG, ...config }));
};

export const resetHomeConfig = () => {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(STORAGE_KEY);
};
