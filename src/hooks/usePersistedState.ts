import * as React from 'react';
import { storage } from 'wxt/utils/storage';

/**
 * State that persists to chrome.storage.local via WXT's typed storage API.
 * Mirrors the original `vs()` helper.
 */
export function usePersistedState<T>(
  defaultValue: T,
  key: string,
): [T, React.Dispatch<React.SetStateAction<T>>] {
  const [value, setValue] = React.useState<T>(defaultValue);
  const [hydrated, setHydrated] = React.useState(false);

  // Hydrate from storage once on mount.
  React.useEffect(() => {
    let active = true;
    storage
      .getItem<T>(`local:${key}`)
      .then((stored) => {
        if (!active) return;
        if (stored !== null && stored !== undefined) {
          setValue(stored as T);
        }
        setHydrated(true);
      })
      .catch(() => setHydrated(true));
    return () => {
      active = false;
    };
  }, [key]);

  // Persist on change (skip until initial hydration).
  React.useEffect(() => {
    if (!hydrated) return;
    storage.setItem(`local:${key}`, value).catch(() => undefined);
  }, [hydrated, key, value]);

  return [value, setValue];
}
