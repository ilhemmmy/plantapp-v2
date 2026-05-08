import { getItem, setItem } from './storage';

let sqliteAvailable = false;
let db = null;

try {
  // Use require to avoid static bundling issues on web
  // eslint-disable-next-line global-require
  const mod = require('expo-sqlite');
  const SQLite = mod && (mod.default || mod);
  if (SQLite && typeof SQLite.openDatabase === 'function') {
    db = SQLite.openDatabase('plantapp.db');
    sqliteAvailable = true;
  }
} catch (e) {
  sqliteAvailable = false;
}

const STORAGE_KEYS = {
  history: '@PlantApp:db:history',
  plantModes: '@PlantApp:db:plantModes',
  plantSmart: '@PlantApp:db:plantSmartSettings',
  kv: '@PlantApp:db:kv',
};

const loadJson = async (key, fallback) => {
  const raw = await getItem(key);
  if (!raw) return fallback;
  try {
    return JSON.parse(raw);
  } catch (e) {
    return fallback;
  }
};

const saveJson = async (key, value) => {
  await setItem(key, JSON.stringify(value));
};

const execSql = (sql, params = []) => new Promise((resolve, reject) => {
  if (!sqliteAvailable || !db) {
    reject(new Error('SQLite not available'));
    return;
  }
  db.transaction((tx) => {
    tx.executeSql(
      sql,
      params,
      (_, result) => resolve(result),
      (_, error) => {
        reject(error);
        return false;
      }
    );
  });
});

export async function initDb() {
  if (!sqliteAvailable) {
    const existing = await loadJson(STORAGE_KEYS.kv, null);
    if (!existing) {
      await saveJson(STORAGE_KEYS.kv, {});
      await saveJson(STORAGE_KEYS.history, []);
      await saveJson(STORAGE_KEYS.plantModes, {});
      await saveJson(STORAGE_KEYS.plantSmart, {});
    }
    return;
  }
  await execSql(
    `CREATE TABLE IF NOT EXISTS history (
      id TEXT PRIMARY KEY,
      createdAt INTEGER,
      date TEXT,
      pot TEXT,
      plantKey TEXT,
      plantLabel TEXT,
      smartMode TEXT,
      smartHumiditeMin TEXT,
      smartHumiditeMax TEXT,
      smartOyasMin TEXT,
      smartOyasMax TEXT,
      mode TEXT,
      temps REAL,
      heure TEXT,
      litres REAL,
      flowRate REAL,
      totalMinutes INTEGER,
      eventsPerPeriod INTEGER,
      litresPerEvent REAL
    );`
  );

  await execSql(
    `CREATE TABLE IF NOT EXISTS plant_modes (
      plantKey TEXT PRIMARY KEY,
      mode TEXT
    );`
  );

  await execSql(
    `CREATE TABLE IF NOT EXISTS plant_smart_settings (
      plantKey TEXT PRIMARY KEY,
      mode TEXT,
      humiditeMin TEXT,
      humiditeMax TEXT,
      oyasNiveauMin TEXT,
      oyasNiveauMax TEXT
    );`
  );

  await execSql(
    `CREATE TABLE IF NOT EXISTS kv (
      key TEXT PRIMARY KEY,
      value TEXT
    );`
  );
}

export async function getHistory() {
  if (!sqliteAvailable) {
    return await loadJson(STORAGE_KEYS.history, []);
  }
  const res = await execSql('SELECT * FROM history ORDER BY createdAt DESC;');
  return res.rows?._array || [];
}

export async function insertHistory(item) {
  if (!sqliteAvailable) {
    const history = await loadJson(STORAGE_KEYS.history, []);
    const next = [item, ...history.filter((row) => row.id !== item.id)];
    next.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
    await saveJson(STORAGE_KEYS.history, next);
    return;
  }
  const {
    id,
    createdAt,
    date,
    pot,
    plantKey,
    plantLabel,
    smartMode,
    smartHumiditeMin,
    smartHumiditeMax,
    smartOyasMin,
    smartOyasMax,
    mode,
    temps,
    heure,
    litres,
    flowRate,
    totalMinutes,
    eventsPerPeriod,
    litresPerEvent,
  } = item;

  await execSql(
    `INSERT OR REPLACE INTO history (
      id, createdAt, date, pot, plantKey, plantLabel,
      smartMode, smartHumiditeMin, smartHumiditeMax, smartOyasMin, smartOyasMax,
      mode, temps, heure, litres, flowRate, totalMinutes, eventsPerPeriod, litresPerEvent
    ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?);`,
    [
      id,
      createdAt,
      date,
      pot,
      plantKey,
      plantLabel,
      smartMode,
      smartHumiditeMin,
      smartHumiditeMax,
      smartOyasMin,
      smartOyasMax,
      mode,
      temps,
      heure,
      litres,
      flowRate,
      totalMinutes,
      eventsPerPeriod,
      litresPerEvent,
    ]
  );
}

export async function deleteHistory(id) {
  if (!sqliteAvailable) {
    const history = await loadJson(STORAGE_KEYS.history, []);
    const next = history.filter((row) => row.id !== id);
    await saveJson(STORAGE_KEYS.history, next);
    return;
  }
  await execSql('DELETE FROM history WHERE id = ?;', [id]);
}

export async function clearHistory() {
  if (!sqliteAvailable) {
    await saveJson(STORAGE_KEYS.history, []);
    return;
  }
  await execSql('DELETE FROM history;');
}

export async function getPlantModes() {
  if (!sqliteAvailable) {
    return await loadJson(STORAGE_KEYS.plantModes, {});
  }
  const res = await execSql('SELECT plantKey, mode FROM plant_modes;');
  const rows = res.rows?._array || [];
  return rows.reduce((acc, row) => {
    acc[row.plantKey] = row.mode;
    return acc;
  }, {});
}

export async function upsertPlantMode(plantKey, mode) {
  if (!sqliteAvailable) {
    const modes = await loadJson(STORAGE_KEYS.plantModes, {});
    modes[plantKey] = mode;
    await saveJson(STORAGE_KEYS.plantModes, modes);
    return;
  }
  await execSql('INSERT OR REPLACE INTO plant_modes (plantKey, mode) VALUES (?, ?);', [plantKey, mode]);
}

export async function getPlantSmartSettings() {
  if (!sqliteAvailable) {
    return await loadJson(STORAGE_KEYS.plantSmart, {});
  }
  const res = await execSql('SELECT * FROM plant_smart_settings;');
  const rows = res.rows?._array || [];
  return rows.reduce((acc, row) => {
    acc[row.plantKey] = {
      mode: row.mode,
      humiditeMin: row.humiditeMin,
      humiditeMax: row.humiditeMax,
      oyasNiveauMin: row.oyasNiveauMin,
      oyasNiveauMax: row.oyasNiveauMax,
    };
    return acc;
  }, {});
}

export async function upsertPlantSmartSettings(plantKey, settings) {
  if (!sqliteAvailable) {
    const all = await loadJson(STORAGE_KEYS.plantSmart, {});
    all[plantKey] = { ...settings };
    await saveJson(STORAGE_KEYS.plantSmart, all);
    return;
  }
  const { mode, humiditeMin, humiditeMax, oyasNiveauMin, oyasNiveauMax } = settings;
  await execSql(
    `INSERT OR REPLACE INTO plant_smart_settings
      (plantKey, mode, humiditeMin, humiditeMax, oyasNiveauMin, oyasNiveauMax)
      VALUES (?, ?, ?, ?, ?, ?);`,
    [plantKey, mode, humiditeMin, humiditeMax, oyasNiveauMin, oyasNiveauMax]
  );
}

export async function getKey(key) {
  if (!sqliteAvailable) {
    const kv = await loadJson(STORAGE_KEYS.kv, {});
    return Object.prototype.hasOwnProperty.call(kv, key) ? kv[key] : null;
  }
  const res = await execSql('SELECT value FROM kv WHERE key = ?;', [key]);
  const row = res.rows?._array?.[0];
  return row ? row.value : null;
}

export async function setKey(key, value) {
  if (!sqliteAvailable) {
    const kv = await loadJson(STORAGE_KEYS.kv, {});
    kv[key] = value;
    await saveJson(STORAGE_KEYS.kv, kv);
    return;
  }
  await execSql('INSERT OR REPLACE INTO kv (key, value) VALUES (?, ?);', [key, value]);
}
