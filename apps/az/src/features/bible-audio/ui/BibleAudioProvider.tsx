"use client";

import { useBible } from "@/entities/bible";
import { usePathname, useRouter } from "next/navigation";
import { type ReactNode, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { restorePreferences } from "../lib/preferences";
import { adjacentTrack, type AudioTrack, isTrackPage, resolveTrack, sameTrack, trackHref } from "../lib/track";
import { BibleAudioContext, type BibleAudioContextValue } from "../model/BibleAudioContext";
import { AudioPlayerBar } from "./AudioPlayerBar";

const SKIP_SECONDS = 30;

/**
 * Lives in the root layout so playback survives client-side navigation: the
 * reader can keep listening while flipping to other chapters or pages. One
 * <audio> element is reused for every chapter — mobile browsers only unlock
 * playback per element, so auto-advancing to the next chapter keeps working.
 */
export function BibleAudioProvider({ children }: { children: ReactNode }) {
  const manifest = useBible();
  const router = useRouter();
  const pathname = usePathname();
  const pathnameRef = useRef(pathname);
  // The ref serves the callbacks; the state lets the bar render against the element.
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [audio, setAudio] = useState<HTMLAudioElement | null>(null);
  const trackRef = useRef<AudioTrack | null>(null);
  // The chapter the page on screen offers; the ref lets `close` fall back to it.
  const offeredRef = useRef<AudioTrack | null>(null);
  const [isOffered, setIsOffered] = useState(false);

  const [track, setTrack] = useState<AudioTrack | null>(null);
  // Expanded into the full player; otherwise only the listen button shows (while a chapter is offered).
  const [isOpen, setIsOpen] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasError, setHasError] = useState(false);

  const attachAudio = useCallback((element: HTMLAudioElement | null) => {
    audioRef.current = element;
    setAudio(element);
    if (element) restorePreferences(element);
  }, []);

  const load = useCallback(
    (next: AudioTrack): boolean => {
      const audio = audioRef.current;
      const resolved = resolveTrack(manifest, next);
      if (!audio || !resolved) return false;

      if (!sameTrack(trackRef.current, next)) {
        audio.src = resolved.url;
        trackRef.current = next;
        setTrack(next);
        setHasError(false);
      }
      return true;
    },
    [manifest],
  );

  useEffect(() => {
    pathnameRef.current = pathname;
  }, [pathname]);

  const play = useCallback(
    (next: AudioTrack) => {
      const previous = trackRef.current;
      if (!load(next)) return;
      setIsOpen(true);
      // Synchronous with the click: iOS only lets a user gesture start playback.
      audioRef.current?.play().catch(() => {
        // Rejected when interrupted by another load or blocked; the button stays on "play".
      });
      // Reading along with the recording: the page turns with the player (auto-advance,
      // picker, headset next/prev). Anywhere else, the reader stays where they are.
      if (previous && !sameTrack(previous, next) && isTrackPage(pathnameRef.current, previous)) {
        router.push(trackHref(next));
      }
    },
    [load, router],
  );

  const toggle = useCallback(() => {
    const audio = audioRef.current;
    const current = trackRef.current;
    if (!audio || !current) return;
    if (audio.paused) play(current);
    else audio.pause();
  }, [play]);

  const seekBy = useCallback((seconds: number) => {
    const audio = audioRef.current;
    if (!audio || !Number.isFinite(audio.duration)) return;
    audio.currentTime = Math.min(Math.max(audio.currentTime + seconds, 0), audio.duration);
  }, []);

  const playAdjacent = useCallback(
    (direction: 1 | -1) => {
      const current = trackRef.current;
      const next = current && adjacentTrack(manifest, current, direction);
      if (next) play(next);
    },
    [manifest, play],
  );

  const cue = useCallback(
    (next: AudioTrack) => {
      offeredRef.current = next;
      setIsOffered(true);
      // Never cut off what is already playing just because the reader moved on.
      if (audioRef.current && !audioRef.current.paused) return;
      load(next);
    },
    [load],
  );

  const release = useCallback(() => {
    offeredRef.current = null;
    setIsOffered(false);
    // A playing player follows the reader anywhere; a paused one folds back into the button.
    if (audioRef.current?.paused ?? true) setIsOpen(false);
  }, []);

  const close = useCallback(() => {
    audioRef.current?.pause();
    setIsOpen(false);
    // The button left behind offers the chapter on screen, which may not be the one that was playing.
    if (offeredRef.current) load(offeredRef.current);
  }, [load]);

  // Lock screen / headset / notification controls.
  useEffect(() => {
    if (!("mediaSession" in navigator) || !track) return;
    const resolved = resolveTrack(manifest, track);
    if (!resolved) return;
    navigator.mediaSession.metadata = new MediaMetadata({
      title: resolved.chapterName,
      artist: resolved.bookName,
      album: resolved.bible.primary,
    });
  }, [manifest, track]);

  useEffect(() => {
    if (!("mediaSession" in navigator)) return;
    const handlers: [MediaSessionAction, MediaSessionActionHandler][] = [
      ["play", () => trackRef.current && play(trackRef.current)],
      ["pause", () => audioRef.current?.pause()],
      ["seekbackward", () => seekBy(-SKIP_SECONDS)],
      ["seekforward", () => seekBy(SKIP_SECONDS)],
      ["previoustrack", () => playAdjacent(-1)],
      ["nexttrack", () => playAdjacent(1)],
    ];
    const setAll = (clear: boolean) => {
      for (const [action, handler] of handlers) {
        try {
          navigator.mediaSession.setActionHandler(action, clear ? null : handler);
        } catch {
          // Browsers throw for actions they do not support.
        }
      }
    };
    setAll(false);
    return () => setAll(true);
  }, [play, seekBy, playAdjacent]);

  const value = useMemo<BibleAudioContextValue>(
    () => ({ audio, track, isPlaying, hasError, isExpanded: isOpen, play, toggle, seekBy, cue, release, close }),
    [audio, track, isPlaying, hasError, isOpen, play, toggle, seekBy, cue, release, close],
  );

  return (
    <BibleAudioContext.Provider value={value}>
      {children}
      <audio
        ref={attachAudio}
        // Files run 4–19 MB; never pull the whole thing down up front.
        preload="metadata"
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onEnded={() => playAdjacent(1)}
        onError={() => {
          setHasError(true);
          setIsPlaying(false);
        }}
      />
      {(isOpen || isOffered) && track && (
        <AudioPlayerBar skipSeconds={SKIP_SECONDS} expanded={isOpen} onChapterPage={isOffered} />
      )}
    </BibleAudioContext.Provider>
  );
}
