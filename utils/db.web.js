import { getItem, setItem } from './storage';

const KEYS = {
  history: '@PlantApp:db:history',
  plantModes: '@PlantApp:db:plantModes',
  plantSmart: '@PlantApp:db:plantSmartSettings',
  kv: '@PlantApp:db:kv',
};

const load = async (key, fallback) => {
  const raw = await getItem(key);
  if (!raw) return fallback;
  try { return JSON.parse(raw); } catch { return fallback; }
};

const save = async (key, value) => setItem(key, JSON.stringify(value));

export async function initDb() {
  if (!(await load(KEYS.kv, null))) {
    await save(KEYS.kv, {});
    await save(KEYS.history, []);
    await save(KEYS.plantModes, {});
    await save(KEYS.plantSmart, {});
  }
}

export async function getHistory() { return load(KEYS.history, []); }

export async function insertHistory(item) {
  const h = await load(KEYS.history, []);
  const next = [item, ...h.filter((r) => r.id !== item.id)].sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
  await save(KEYS.history, next);
}

export async function deleteHistory(id) {
  const h = await load(KEYS.history, []);
  await save(KEYS.history, h.filter((r) => r.id !== id));
}

export async function clearHistory() { await save(KEYS.history, []); }

export async function getPlantModes() { return load(KEYS.plantModes, {}); }

export async function upsertPlantMode(plantKey, mode) {
  const modes = await load(KEYS.plantModes, {});
  modes[plantKey] = mode;
  await save(KEYS.plantModes, modes);
}

export async function getPlantSmartSettings() { return load(KEYS.plantSmart, {}); }

export async function upsertPlantSmartSettings(plantKey, settings) {
  const all = await load(KEYS.plantSmart, {});
  all[plantKey] = { ...settings };
  await save(KEYS.plantSmart, all);
}

export async function getKey(key) {
  const kv = await load(KEYS.kv, {});
  return Object.prototype.hasOwnProperty.call(kv, key) ? kv[key] : null;
}

export async function setKey(key, value) {
  const kv = await load(KEYS.kv, {});
  kv[key] = value;
  await save(KEYS.kv, kv);
}
