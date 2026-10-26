/**
 * Player settings, remembered in the browser between sessions. Storage can be unavailable
 * (private windows, blocked site data), so every read and write falls back to the defaults.
 */
export interface Settings {
  /** Blood on people when they are hit or downed. Training props never bleed. */
  blood: boolean;
  sound: boolean;
}

const KEY = 'breach.settings';
const DEFAULTS: Settings = { blood: true, sound: true };

function load(): Settings {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return { ...DEFAULTS, ...(JSON.parse(raw) as Partial<Settings>) };
  } catch {
    // Fall through to defaults.
  }
  return { ...DEFAULTS };
}

export const settings: Settings = load();

export function saveSettings(): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(settings));
  } catch {
    // Not persisted this session; the in-memory value still applies.
  }
}
