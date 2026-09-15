"use client";

import { useI18n } from "@/app/providers/I18n";
import { Button } from "@/shared/ui/button";
import { Headphones } from "lucide-react";
import { useEffect } from "react";
import { type AudioTrack, sameTrack } from "../lib/track";
import { useBibleAudio } from "../model/BibleAudioContext";

interface ChapterListenButtonProps {
  chapter: AudioTrack;
  className?: string;
}

/**
 * Rendered on chapter pages that have a recording. Offers the chapter to the
 * bottom player (its listen button) while the page is open. The button itself
 * only shows while the player is busy with another chapter — the reader moved
 * on while listening — as the way to switch to this one.
 */
export function ChapterListenButton({ chapter, className }: ChapterListenButtonProps) {
  const { t } = useI18n();
  const { track, play, cue, release } = useBibleAudio();
  const { bible, bookId, chapterId } = chapter;

  useEffect(() => {
    cue({ bible, bookId, chapterId });
    return release;
  }, [bible, bookId, chapterId, cue, release]);

  // Nothing is loaded before the first cue, so the server render and first paint
  // leave the button out instead of flashing it until the player shows up.
  if (track === null || sameTrack(track, chapter)) return null;

  return (
    <Button variant="outline" className={className} onClick={() => play({ bible, bookId, chapterId })}>
      <Headphones />
      {t("audioListen")}
    </Button>
  );
}
