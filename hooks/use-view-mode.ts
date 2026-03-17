import { useState, useEffect } from 'react';

type ViewMode = 'grid' | 'list';

const STORAGE_KEYS = {
  CATEGORIES: 'category_view_mode',
  SUBCATEGORIES: 'subcategory_view_mode',
} as const;

/**
 * Custom hook to persist view mode preference in localStorage
 * @param key - The storage key to use for this view mode
 * @param defaultMode - The default view mode if none is stored (default: 'grid')
 */
export function useViewMode(
  key: keyof typeof STORAGE_KEYS = 'CATEGORIES',
  defaultMode: ViewMode = 'grid'
): [ViewMode, (mode: ViewMode) => void] {
  const storageKey = STORAGE_KEYS[key];

  const [viewMode, setViewModeState] = useState<ViewMode>(() => {
    if (typeof window === 'undefined') return defaultMode;

    try {
      const stored = localStorage.getItem(storageKey);
      if (stored && (stored === 'grid' || stored === 'list')) {
        return stored as ViewMode;
      }
    } catch (error) {
      console.warn(`Failed to read view mode from localStorage: ${error}`);
    }

    return defaultMode;
  });

  const setViewMode = (mode: ViewMode) => {
    setViewModeState(mode);

    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(storageKey, mode);
      } catch (error) {
        console.warn(`Failed to save view mode to localStorage: ${error}`);
      }
    }
  };

  return [viewMode, setViewMode];
}
