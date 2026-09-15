"use client";

import { createContext, useContext } from "react";
import type { AudioTrack } from "../lib/track";

export type BibleAudioContextValue = {
  /** The single <audio> element shared by the whole app; null until mounted. */
  audio: HTMLAudioElement | null;
  track: AudioTrack | null;
  isPlaying: boolean;
  hasError: boolean;
  /** Showing the full player rather than the listen button. */
  isExpanded: boolean;
  /** Load `track` (unless it is already loaded), expand the player and start playing. Call from a click handler. */
  play: (track: AudioTrack) => void;
  toggle: () => void;
  seekBy: (seconds: number) => void;
  /** A chapter page offers its recording: load it paused behind the listen button, unless something is playing. */
  cue: (track: AudioTrack) => void;
  /** The chapter page went away: drop the listen button, and fold the player unless it is playing. */
  release: () => void;
  /** Stop and fold back into the listen button (or disappear, off a chapter page). */
  close: () => void;
};

export const BibleAudioContext = createContext<BibleAudioContextValue | null>(null);

export function useBibleAudio(): BibleAudioContextValue {
  const ctx = useContext(BibleAudioContext);
  if (!ctx) {
    throw new Error("useBibleAudio must be used within BibleAudioProvider");
  }
  return ctx;
}
