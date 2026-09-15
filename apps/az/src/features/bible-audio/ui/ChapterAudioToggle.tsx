"use client";

import { useI18n } from "@/app/providers/I18n";
import { Button } from "@/shared/ui/button";
import { Headphones } from "lucide-react";
import { type AudioTrack, sameTrack } from "../lib/track";
import { useBibleAudio } from "../model/BibleAudioContext";

interface ChapterAudioToggleProps {
  chapter: AudioTrack;
  className?: string;
}

/**
 * The listen button's mobile stand-in, living in the floating chapter bar (the
 * bottom-right button is hidden there, so the bar stays the only thing at the
 * bottom). Opens the player on this chapter; pressed again, folds it away.
 */
export function ChapterAudioToggle({ chapter, className }: ChapterAudioToggleProps) {
  const { t } = useI18n();
  const { track, isExpanded, play, close } = useBibleAudio();
  // While another chapter plays, a press switches to this one instead of closing.
  const active = isExpanded && sameTrack(track, chapter);

  return (
    <Button
      variant={active ? "default" : "outline"}
      size="icon"
      className={className}
      aria-pressed={active}
      aria-label={t("audioListen")}
      onClick={() => (active ? close() : play(chapter))}
    >
      <Headphones />
    </Button>
  );
}
