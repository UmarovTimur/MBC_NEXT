"use client";

import { useI18n } from "@/app/providers/I18n";
import { useBible } from "@/entities/bible";
import { useHideOnScroll } from "@/shared/lib/useHideOnScroll";
import { cn } from "@/shared/lib/utils";
import { Button } from "@/shared/ui/button";
import { ContainerWidth } from "@/shared/ui/Container";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/shared/ui/dropdown-menu";
import { Popover, PopoverContent, PopoverTrigger } from "@/shared/ui/popover";
import { Slider } from "@/shared/ui/slider";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@mbc/ui";
import { Headphones, ListMusic, Pause, Play, RotateCcw, RotateCw, Volume1, Volume2, VolumeX, X } from "lucide-react";
import { type RefObject, useEffect, useRef, useState } from "react";
import { PLAYBACK_RATES, setPlaybackRate, setVolume } from "../lib/preferences";
import { type ResolvedTrack, resolveTrack } from "../lib/track";
import { useBibleAudio } from "../model/BibleAudioContext";
import { AudioTrackPicker } from "./AudioTrackPicker";

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

/** Position and length of the shared element, re-read on every media event. */
function useAudioProgress(audio: HTMLAudioElement | null) {
  const [progress, setProgress] = useState({ currentTime: 0, duration: 0 });

  useEffect(() => {
    if (!audio) return;
    const sync = () =>
      setProgress({
        currentTime: audio.currentTime,
        duration: Number.isFinite(audio.duration) ? audio.duration : 0,
      });
    // `seeking` keeps the slider under the finger while dragging, before the seek lands.
    const events = ["timeupdate", "durationchange", "loadedmetadata", "seeking", "seeked", "emptied"];
    sync();
    events.forEach((e) => audio.addEventListener(e, sync));
    return () => events.forEach((e) => audio.removeEventListener(e, sync));
  }, [audio]);

  return progress;
}

/**
 * Publishes the bar's height as `--audio-bar-h` on <html> so the page can keep
 * its bottom content (footer, floating chapter nav) clear of the fixed bar.
 */
function useBarHeightVar() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const bar = ref.current;
    if (!bar) return;
    const root = document.documentElement;
    const observer = new ResizeObserver(() => root.style.setProperty("--audio-bar-h", `${bar.offsetHeight}px`));
    observer.observe(bar);
    return () => {
      observer.disconnect();
      root.style.removeProperty("--audio-bar-h");
    };
  }, []);

  return ref;
}

function SkipButton({ direction, label, onClick }: { direction: -1 | 1; label: string; onClick: () => void }) {
  const Icon = direction < 0 ? RotateCcw : RotateCw;
  return (
    <Button variant="ghost" size="icon" className="relative size-10 [&_svg]:size-7" onClick={onClick} aria-label={label}>
      <Icon strokeWidth={1.5} />
      <span aria-hidden className="absolute inset-0 flex items-center justify-center pt-px text-[9px] font-bold">
        30
      </span>
    </Button>
  );
}

function VolumeControl({ audio }: { audio: HTMLAudioElement }) {
  const { t } = useI18n();
  const [state, setState] = useState({ volume: audio.volume, muted: audio.muted });

  useEffect(() => {
    const sync = () => setState({ volume: audio.volume, muted: audio.muted });
    audio.addEventListener("volumechange", sync);
    return () => audio.removeEventListener("volumechange", sync);
  }, [audio]);

  const silent = state.muted || state.volume === 0;
  const Icon = silent ? VolumeX : state.volume < 0.5 ? Volume1 : Volume2;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="hidden md:inline-flex [&_svg]:size-5" aria-label={t("audioVolume")}>
          <Icon />
        </Button>
      </PopoverTrigger>
      {/* Slider only: the trigger right below already shows the speaker icon. Drag to 0 to mute. */}
      <PopoverContent side="top" className="w-auto px-2 py-3">
        <Slider
          orientation="vertical"
          value={[silent ? 0 : state.volume]}
          max={1}
          step={0.05}
          onValueChange={([value]) => {
            setVolume(audio, value);
            if (value > 0) audio.muted = false;
          }}
          aria-label={t("audioVolume")}
        />
      </PopoverContent>
    </Popover>
  );
}

function RateControl({ audio }: { audio: HTMLAudioElement }) {
  const { t } = useI18n();
  const [rate, setRate] = useState(() => String(audio.defaultPlaybackRate));

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="px-2 tabular-nums" aria-label={t("audioSpeed")}>
          {rate}x
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent side="top" align="end">
        <DropdownMenuRadioGroup
          value={rate}
          onValueChange={(value) => {
            setRate(value);
            setPlaybackRate(audio, value);
          }}
        >
          {PLAYBACK_RATES.map((value) => (
            <DropdownMenuRadioItem key={value} value={value} className="tabular-nums">
              {value}x
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function PlayerControls({
  audio,
  resolved,
  skipSeconds,
  playRef,
  onChapterPage,
}: {
  audio: HTMLAudioElement;
  resolved: ResolvedTrack;
  skipSeconds: number;
  playRef: RefObject<HTMLButtonElement | null>;
  onChapterPage: boolean;
}) {
  const { t } = useI18n();
  const { isPlaying, hasError, toggle, seekBy, close } = useBibleAudio();
  const { currentTime, duration } = useAudioProgress(audio);
  const [pickerOpen, setPickerOpen] = useState(false);

  return (
    <>
      {/* Sits on the top border, like a progress line, but stays draggable. */}
      <Slider
        value={[currentTime]}
        max={duration || 1}
        step={1}
        disabled={!duration}
        onValueChange={([value]) => {
          audio.currentTime = value;
        }}
        aria-label={t("audioSeek")}
        className="absolute inset-x-0 top-0 z-10 -translate-y-1/2 cursor-pointer [&_[data-slot=slider-track]]:rounded-none"
      />

      {/* Laid out at full size from the start and pinned bottom-right, so the growing card
          uncovers it instead of squeezing it. 2px: the card's border. */}
      <div className="flex h-full items-end justify-end overflow-hidden rounded-[inherit]">
        <div className="flex h-15 w-[calc(100cqw-2px)] shrink-0 items-center gap-2 px-3 pt-1 duration-300 animate-in fade-in sm:gap-4 sm:px-4">
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold">{resolved.bookName}</p>
            <p className="truncate text-xs text-muted-foreground">
              {hasError ? t("audioError") : resolved.chapterName}
            </p>
          </div>

          <div className="flex shrink-0 items-center gap-1 sm:gap-2">
            <SkipButton direction={-1} label={t("audioBack30")} onClick={() => seekBy(-skipSeconds)} />
            <Button
              ref={playRef}
              size="icon"
              className="size-10 rounded-full [&_svg]:size-5"
              onClick={toggle}
              disabled={hasError}
              aria-label={isPlaying ? t("audioPause") : t("audioPlay")}
            >
              {isPlaying ? <Pause className="fill-current" /> : <Play className="translate-x-px fill-current" />}
            </Button>
            <SkipButton direction={1} label={t("audioForward30")} onClick={() => seekBy(skipSeconds)} />
          </div>

          <div className="flex flex-1 items-center justify-end gap-0.5 sm:gap-1">
            <span className="mr-2 hidden text-xs tabular-nums text-muted-foreground md:inline">
              {formatTime(currentTime)} / {formatTime(duration)}
            </span>
            <RateControl audio={audio} />
            <VolumeControl audio={audio} />
            <Button
              variant="ghost"
              size="icon"
              className="[&_svg]:size-5"
              onClick={() => setPickerOpen(true)}
              aria-label={t("audioChoose")}
            >
              <ListMusic />
            </Button>
            {/* On a chapter page the chapter bar's 🎧 folds the player below lg; elsewhere ✕ is the only way. */}
            <Button
              variant="ghost"
              size="icon"
              className={cn("[&_svg]:size-5", onChapterPage && "max-lg:hidden")}
              onClick={close}
              aria-label={t("audioClose")}
            >
              <X />
            </Button>
          </div>
        </div>
      </div>

      <AudioTrackPicker open={pickerOpen} onOpenChange={setPickerOpen} />
    </>
  );
}

/**
 * Bottom-right "listen" button that grows into the full player across the
 * container width. Both states share one card, so the size change is animated.
 * Below lg the button is replaced by ChapterAudioToggle in the floating chapter
 * bar, and only the expanded player shows here.
 */
export function AudioPlayerBar({
  skipSeconds,
  expanded,
  onChapterPage,
}: {
  skipSeconds: number;
  expanded: boolean;
  /** A chapter page with audio is on screen, so the floating chapter bar carries the 🎧 toggle. */
  onChapterPage: boolean;
}) {
  const { t } = useI18n();
  const manifest = useBible();
  const { audio, track, play } = useBibleAudio();
  const barRef = useBarHeightVar();
  const isHidden = useHideOnScroll();

  // The control that had focus unmounts when the card switches state; hand focus to
  // its counterpart (play ⇄ listen) instead of dropping it to <body>.
  const primaryRef = useRef<HTMLButtonElement>(null);
  const expandedRef = useRef(expanded);
  useEffect(() => {
    if (expandedRef.current === expanded) return;
    expandedRef.current = expanded;
    if (!document.activeElement || document.activeElement === document.body) primaryRef.current?.focus();
  }, [expanded]);

  const resolved = track && resolveTrack(manifest, track);
  if (!audio || !track || !resolved) return null;

  return (
    // The measured wrapper includes the gap under the card, so --audio-bar-h clears both.
    // Only the card takes clicks; the gutters around it stay transparent to the page.
    <div
      ref={barRef}
      className={cn(
        "pointer-events-none fixed inset-x-0 bottom-0 z-50 transform-gpu pb-[calc(env(safe-area-inset-bottom)+0.75rem)] transition-transform duration-300 ease-in-out will-change-transform",
        // Hides on scroll down along with the header; the extra 2rem takes the shadow with it.
        isHidden ? "translate-y-[calc(100%+2rem)]" : "translate-y-0",
        // Hidden as a whole (not just the card) so --audio-bar-h drops to 0 under the chapter bar.
        !expanded && "max-lg:hidden",
      )}
    >
      {/* @container: 100cqw is the container's full content width, the expanded card's target. */}
      <ContainerWidth className="@container">
        <div
          role="region"
          aria-label={`${resolved.bookName}, ${resolved.chapterName}`}
          className={cn(
            "pointer-events-auto relative ml-auto border border-stone-200 bg-background/95 shadow-[0_0_32px_-4px_rgba(0,0,0,0.25)] backdrop-blur transition-[width,height,border-radius] duration-300 ease-out dark:border-white/10 dark:shadow-[0_0_32px_-4px_rgba(0,0,0,0.7)]",
            // Explicit sizes both ways so they can be animated: a round icon button, then
            // the player row (h-15) plus the border. The circle is rounded-3xl (half of
            // size-12) rather than rounded-full, whose infinite radius can't ease into rounded-b-lg.
            expanded ? "h-[calc(3.75rem+2px)] w-[100cqw] rounded-t-none rounded-b-lg" : "size-12 rounded-3xl",
            // Below lg there is no button to grow from: the player rises from the bottom instead.
            expanded && "max-lg:animate-in max-lg:slide-in-from-bottom-4 max-lg:fade-in",
          )}
        >
          {expanded ? (
            <PlayerControls
              audio={audio}
              resolved={resolved}
              skipSeconds={skipSeconds}
              playRef={primaryRef}
              onChapterPage={onChapterPage}
            />
          ) : (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    ref={primaryRef}
                    variant="ghost"
                    className="size-full rounded-[inherit] duration-300 animate-in fade-in [&_svg]:size-6"
                    onClick={() => play(track)}
                    aria-label={`${t("audioListen")}: ${resolved.bookName}, ${resolved.chapterName}`}
                  >
                    <Headphones />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="top">{t("audioListen")}</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
      </ContainerWidth>
    </div>
  );
}
