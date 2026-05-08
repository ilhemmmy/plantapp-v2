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

const memoryStore = new Map();

export async function getItem(key) {
  if (AsyncStorage) {
    try {
      const value = await AsyncStorage.getItem(key);
      return value;
    } catch (error) {
      console.log('Storage getItem error', error);
      return null;
    }
  }

  // fallback
  return memoryStore.has(key) ? memoryStore.get(key) : null;
}

export async function setItem(key, value) {
  if (AsyncStorage) {
    try {
      await AsyncStorage.setItem(key, value);
      return true;
    } catch (error) {
      console.log('Storage setItem error', error);
      return false;
    }
  }

  memoryStore.set(key, value);
  return true;
}

export async function removeItem(key) {
  if (AsyncStorage) {
    try {
      await AsyncStorage.removeItem(key);
      return true;
    } catch (error) {
      console.log('Storage removeItem error', error);
      return false;
    }
  }

  return memoryStore.delete(key);
}
