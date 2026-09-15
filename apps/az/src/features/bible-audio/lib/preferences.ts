/**
 * Speed and volume live on the one shared <audio> element, so they already
 * carry over from chapter to chapter; storage only makes them survive reloads.
 */

export const PLAYBACK_RATES = ["0.75", "1", "1.25", "1.5", "2"];

const RATE_KEY = "bible-audio-rate";
const VOLUME_KEY = "bible-audio-volume";

function readStored(key: string): string | null {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null; // Storage can be disabled (private mode, blocked cookies).
  }
}

function writeStored(key: string, value: string): void {
  try {
    window.localStorage.setItem(key, value);
  } catch {
    // Still applies for this session; it just will not be remembered.
  }
}

export function setPlaybackRate(audio: HTMLAudioElement, rate: string, persist = true): void {
  // Loading a new src resets playbackRate to defaultPlaybackRate, so set both
  // or the next chapter would start back at 1x.
  audio.defaultPlaybackRate = Number(rate);
  audio.playbackRate = Number(rate);
  if (persist) writeStored(RATE_KEY, rate);
}

export function setVolume(audio: HTMLAudioElement, volume: number, persist = true): void {
  audio.volume = volume;
  if (persist) writeStored(VOLUME_KEY, String(volume));
}

export function restorePreferences(audio: HTMLAudioElement): void {
  const rate = readStored(RATE_KEY);
  if (rate && PLAYBACK_RATES.includes(rate)) setPlaybackRate(audio, rate, false);

  const volume = Number(readStored(VOLUME_KEY) ?? NaN);
  if (volume >= 0 && volume <= 1) setVolume(audio, volume, false);
}
