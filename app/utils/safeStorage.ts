export const safeStorage = {
  getItem(key: string): string | null {
    if (typeof window === 'undefined') return null;
    try {
      return window.localStorage.getItem(key);
    } catch (e) {
      console.warn(`[safeStorage] Access denied to localStorage.getItem('${key}')`);
      return null;
    }
  },
  setItem(key: string, value: string): void {
    if (typeof window === 'undefined') return;
    try {
      window.localStorage.setItem(key, value);
    } catch (e) {
      console.warn(`[safeStorage] Access denied to localStorage.setItem('${key}')`);
    }
  },
  removeItem(key: string): void {
    if (typeof window === 'undefined') return;
    try {
      window.localStorage.removeItem(key);
    } catch (e) {
      console.warn(`[safeStorage] Access denied to localStorage.removeItem('${key}')`);
    }
  },
  clear(): void {
    if (typeof window === 'undefined') return;
    try {
      window.localStorage.clear();
    } catch (e) {
      console.warn(`[safeStorage] Access denied to localStorage.clear()`);
    }
  }
};
