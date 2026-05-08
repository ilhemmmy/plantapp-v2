import { Alert } from 'react-native';

/**
 * Scale down large pot volumes using log dampening.
 * Pots under 50L are unchanged. Above that, water needs grow logarithmically
 * rather than linearly — soil doesn't need full saturation in large bacs.
 */
const VOLUME_THRESHOLD = 50000; // 50L in cm³
function volumeEffectif(volumeCm3) {
  if (volumeCm3 <= VOLUME_THRESHOLD) return volumeCm3;
  return VOLUME_THRESHOLD + VOLUME_THRESHOLD * Math.log(volumeCm3 / VOLUME_THRESHOLD);
}

/**
 * Calculate irrigation time based on pot dimensions and plant water needs.
 */
export function calculerIrrigation(pot, plante, bacsData, options = {}) {
  // options: { flowRate } where flowRate is liters per minute
  const facteurBac = bacsData[pot.type] || 1;
  const volume = pot.longueur * pot.largeur * pot.hauteur; // cm^3
  const effective = volumeEffectif(volume);
  const litresNeeded = (effective / 1000) * (plante.besoinEau || 0) * facteurBac;

  let temps;
  let usedFlowRate = null;

  if (options && options.flowRate && Number(options.flowRate) > 0) {
    usedFlowRate = Number(options.flowRate);
    // compute minutes from liters and pump flow rate (L/min)
    temps = Math.ceil(litresNeeded / usedFlowRate);
  } else {
    // fallback to previous heuristic (minutes ~= litersNeeded)
    temps = Math.round(litresNeeded);
  }

  const heure = plante.periodeFloraison;
  return { temps, heure, litres: Number(litresNeeded.toFixed(2)), flowRate: usedFlowRate };
}

/**
 * Send irrigation data to ESP32 via HTTP.
 */
export async function envoyerVersESP32(temps) {
  try {
    const response = await fetch(`http://192.168.1.50/irrigation?temps=${temps}`);
    const text = await response.text();
    console.log('ESP32:', text);
    Alert.alert('Données envoyées à l\'ESP32');
    return true;
  } catch (error) {
    console.log('Erreur connexion ESP32:', error);
    Alert.alert('Erreur de connexion à l\'ESP32');
    return false;
  }
}

/**
 * Convert a quota (total minutes per period) into a number of events and minutes per event.
 * Simple policy:
 * - If desiredEvents provided, use it; otherwise pick defaults (month -> 4, week -> 2)
 * - Ensure per-event minutes are between minPerEvent and maxPerEvent by adjusting events
 */
export function convertirQuotaEnEvenements(
  totalMinutes,
  period = 'month',
  desiredEvents = null,
  minPerEvent = 2,
  maxPerEvent = 60
) {
  if (!totalMinutes || totalMinutes <= 0) {
    return { eventsPerPeriod: 0, minutesPerEvent: 0 };
  }
  // sensible defaults
  const defaultEvents = period === 'week' ? 2 : 4; // month -> 4 by default
  let events = desiredEvents && desiredEvents > 0 ? desiredEvents : defaultEvents;

  let minutesPerEvent = Math.ceil(totalMinutes / events);

  // if under min, increase minutes by reducing events (not ideal) or increase events to keep above min
  if (minutesPerEvent < minPerEvent) {
    // try increasing events so each event is at least minPerEvent
    events = Math.ceil(totalMinutes / minPerEvent);
    minutesPerEvent = Math.ceil(totalMinutes / events);
  }

  // if above max, split into more events
  if (minutesPerEvent > maxPerEvent) {
    events = Math.ceil(totalMinutes / maxPerEvent);
    minutesPerEvent = Math.ceil(totalMinutes / events);
  }

  return { eventsPerPeriod: events, minutesPerEvent };
}

/**
 * Generate next N occurrence dates for a given period.
 * - eventsPerPeriod: number of occurrences to generate
 * - period: 'month' | 'week'
 * - start: Date (defaults to today)
 * Returns array of ISO date strings (local date part)
 */
export function genererProchainesDates(eventsPerPeriod, period = 'month', start = new Date()) {
  const maxEvents = Math.max(0, Math.min(365, eventsPerPeriod || 0));
  if (maxEvents === 0) return [];

  const dates = [];
  const startDate = new Date(start);

  if (period === 'week') {
    // distribute across the next 7 days
    // pick days with roughly equal spacing
    const interval = Math.max(1, Math.floor(7 / maxEvents));
    for (let i = 0; i < maxEvents; i++) {
      const d = new Date(startDate);
      d.setDate(startDate.getDate() + i * interval);
      dates.push(d.toISOString());
    }
  } else {
    // month: distribute across next 30 days
    const interval = Math.max(1, Math.floor(30 / maxEvents));
    for (let i = 0; i < maxEvents; i++) {
      const d = new Date(startDate);
      d.setDate(startDate.getDate() + i * interval);
      dates.push(d.toISOString());
    }
  }

  return dates;
}
