// Try to load AsyncStorage; if it's not available (e.g. not installed yet or running on web
// without the package), fall back to an in-memory shim so the app continues to work.
let AsyncStorage = null;
try {
  // use require so this doesn't break bundlers that can't statically resolve the package
  // eslint-disable-next-line global-require
  const mod = require('@react-native-async-storage/async-storage');
  AsyncStorage = mod && (mod.default || mod);
} catch (e) {
  // package not available — will use in-memory fallback
}

const isWeb = typeof window !== 'undefined' && typeof localStorage !== 'undefined';
const memoryStore = new Map();

export async function getItem(key) {
  if (AsyncStorage) {
    try {
      return await AsyncStorage.getItem(key);
    } catch (error) {
      return null;
    }
  }
  if (isWeb) return localStorage.getItem(key);
  return memoryStore.has(key) ? memoryStore.get(key) : null;
}

export async function setItem(key, value) {
  if (AsyncStorage) {
    try {
      await AsyncStorage.setItem(key, value);
      return true;
    } catch (error) {
      return false;
    }
  }
  if (isWeb) { localStorage.setItem(key, value); return true; }
  memoryStore.set(key, value);
  return true;
}

export async function removeItem(key) {
  if (AsyncStorage) {
    try {
      await AsyncStorage.removeItem(key);
      return true;
    } catch (error) {
      return false;
    }
  }
  if (isWeb) { localStorage.removeItem(key); return true; }
  return memoryStore.delete(key);
}
