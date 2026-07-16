"use client";

import { useEffect, useRef, useState } from "react";
import { Pause, Play } from "lucide-react";
import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
  Slider,
  cn,
} from "@mbc/ui";

const PLAYBACK_RATES = ["0.75", "1", "1.25", "1.5", "2"];

/**
 * Navigating to another chapter unmounts the player, so the chosen speed has to
 * live outside React or it would reset on every chapter — tedious for anyone
 * listening straight through a book.
 */
const RATE_STORAGE_KEY = "bible-audio-rate";

function readStoredRate(): string | null {
  try {
    return window.localStorage.getItem(RATE_STORAGE_KEY);
  } catch {
    return null; // Storage can be disabled (private mode, blocked cookies).
  }
}

function storeRate(rate: string): void {
  try {
    window.localStorage.setItem(RATE_STORAGE_KEY, rate);
  } catch {
    // Speed still applies for this chapter; it just will not be remembered.
  }
}

function formatTime(seconds: number): string {
  if (!Number.isFinite(seconds)) return "0:00";
  const total = Math.floor(seconds);
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  return h > 0
    ? `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`
    : `${m}:${String(s).padStart(2, "0")}`;
}

interface ChapterAudioPlayerProps {
  src: string;
  className?: string;
}

export const ChapterAudioPlayer = ({ src, className }: ChapterAudioPlayerProps) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [rate, setRate] = useState("1");
  const [failed, setFailed] = useState(false);

  // Restored after mount rather than during render: the server has no
  // localStorage, so seeding the initial state would hydrate a mismatched label.
  useEffect(() => {
    const saved = readStoredRate();
    if (saved && PLAYBACK_RATES.includes(saved)) setRate(saved);
  }, []);

  // The element is server-rendered and starts fetching before hydration, so
  // `loadedmetadata` can fire before React attaches onLoadedMetadata. Read the
  // duration back here instead of waiting for an event that already happened.
  // The resets cover the case where React reuses the element across a src swap;
  // a route change unmounts the player outright, which resets state anyway.
  useEffect(() => {
    setIsPlaying(false);
    setCurrentTime(0);
    setFailed(false);

    const audio = audioRef.current;
    setDuration(audio && audio.readyState >= HTMLMediaElement.HAVE_METADATA ? audio.duration : 0);
  }, [src]);

  // playbackRate lives on the element and resets whenever a new source loads.
  useEffect(() => {
    if (audioRef.current) audioRef.current.playbackRate = Number(rate);
  }, [rate, src]);

  if (failed) return null;

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (audio.paused) {
      void audio.play();
      setIsPlaying(true);
    } else {
      audio.pause();
      setIsPlaying(false);
    }
  };

  const changeRate = (value: string) => {
    setRate(value);
    storeRate(value);
  };

  const seek = ([value]: number[]) => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.currentTime = value;
    setCurrentTime(value);
  };

  return (
    <div
      className={cn(
        "flex items-center gap-3 rounded-lg border bg-card px-3 py-2 text-card-foreground",
        className,
      )}
    >
      <audio
        ref={audioRef}
        src={src}
        // Files run 4–19 MB; never pull the whole thing down up front.
        preload="metadata"
        onLoadedMetadata={(e) => {
          const audio = e.currentTarget;
          setDuration(audio.duration);
          audio.playbackRate = Number(rate);
        }}
        onTimeUpdate={(e) => setCurrentTime(e.currentTarget.currentTime)}
        onEnded={() => setIsPlaying(false)}
        onError={() => setFailed(true)}
      />

      <Button
        variant="ghost"
        size="icon"
        className="shrink-0"
        onClick={togglePlay}
        aria-label={isPlaying ? "Pauza" : "Səsləndir"}
      >
        {isPlaying ? <Pause /> : <Play />}
      </Button>

      <Slider
        className="grow"
        value={[currentTime]}
        max={duration || 1}
        step={1}
        onValueChange={seek}
        aria-label="Audio mövqeyi"
      />

      <span className="shrink-0 text-xs tabular-nums text-muted-foreground">
        {formatTime(currentTime)} / {formatTime(duration)}
      </span>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" className="shrink-0 tabular-nums">
            {rate}x
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuRadioGroup value={rate} onValueChange={changeRate}>
            {PLAYBACK_RATES.map((value) => (
              <DropdownMenuRadioItem key={value} value={value} className="tabular-nums">
                {value}x
              </DropdownMenuRadioItem>
            ))}
          </DropdownMenuRadioGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};
