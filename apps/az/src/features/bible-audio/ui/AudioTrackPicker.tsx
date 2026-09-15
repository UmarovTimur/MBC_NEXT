"use client";

import { useI18n } from "@/app/providers/I18n";
import { useBible } from "@/entities/bible";
import { Button } from "@/shared/ui/button";
import { ChoiceGrid, ChoiceGridItem } from "@/shared/ui/choice-grid";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/shared/ui/dialog";
import { ScrollArea } from "@/shared/ui/scroll-area";
import { ArrowLeft, X } from "lucide-react";
import { useState } from "react";
import { type AudioTrack, isOldTestament } from "../lib/track";
import { useBibleAudio } from "../model/BibleAudioContext";

interface AudioTrackPickerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/**
 * Book grid → chapter grid; picking a chapter starts playing it. Same dialog
 * shape and ChoiceGrid cells as the reader's chapter picker (ChaptersTable).
 */
export function AudioTrackPicker({ open, onOpenChange }: AudioTrackPickerProps) {
  const { track, play } = useBibleAudio();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {/* The close button lives in PickerHeader's row instead of the corner. */}
      <DialogContent className="lg:max-w-200" showCloseButton={false}>
        {/* Content unmounts while closed, so every opening starts at the playing book. */}
        {track && (
          <PickerBody
            track={track}
            onPick={(next) => {
              play(next);
              onOpenChange(false);
            }}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}

/**
 * One row: back to books (chapter step only) · title with description · close.
 * The equal 1fr side columns keep the title centred in the dialog whatever sits beside it.
 */
function PickerHeader({ title, description, onBack }: { title: string; description: string; onBack?: () => void }) {
  const { t } = useI18n();

  return (
    <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2">
      <div className="justify-self-start">
        {onBack && (
          <Button variant="ghost" className="-ml-3 gap-1.5 px-3" onClick={onBack}>
            <ArrowLeft />
            {t("books")}
          </Button>
        )}
      </div>
      <DialogHeader className="min-w-0 text-center sm:text-center">
        <DialogTitle>{title}</DialogTitle>
        <DialogDescription className="truncate">{description}</DialogDescription>
      </DialogHeader>
      <DialogClose asChild>
        <Button variant="ghost" size="icon" className="-mr-2 justify-self-end">
          <X />
          <span className="sr-only">Close</span>
        </Button>
      </DialogClose>
    </div>
  );
}

function PickerBody({ track, onPick }: { track: AudioTrack; onPick: (track: AudioTrack) => void }) {
  const { t } = useI18n();
  const manifest = useBible();
  const [bookId, setBookId] = useState<string | null>(track.bookId);

  const bible = manifest.bibles.find((b) => b.bibleName === track.bible);
  if (!bible) return null;
  const book = bookId ? bible.books.find((b) => b.id === bookId) : undefined;

  if (book) {
    return (
      <>
        <PickerHeader title={t("chapters")} description={book.name} onBack={() => setBookId(null)} />
        {/* -mx-4/px-4: the scrollbar runs in the dialog's padding, clear of the cells. */}
        <ScrollArea className="-mx-4 max-h-[65vh]">
          <ChoiceGrid className="px-4 py-1">
            {book.chapters.map((chapterId) => (
              <ChoiceGridItem
                key={chapterId}
                current={book.id === track.bookId && chapterId === track.chapterId}
                onClick={() => onPick({ bible: bible.bibleName, bookId: book.id, chapterId })}
              >
                {chapterId === "0" ? t("Intro") : chapterId}
              </ChoiceGridItem>
            ))}
          </ChoiceGrid>
        </ScrollArea>
      </>
    );
  }

  const sections = [
    { title: t("oldTestament"), books: bible.books.filter((b) => isOldTestament(b.id)) },
    { title: t("newTestament"), books: bible.books.filter((b) => !isOldTestament(b.id)) },
  ].filter((section) => section.books.length > 0);

  return (
    <>
      <PickerHeader title={t("books")} description={t("audioChoose")} />
      <ScrollArea className="-mx-4 max-h-[70vh]">
        <div className="px-4 py-1">
          {sections.map((section) => (
            <section key={section.title} className="mb-6 last:mb-0">
              <h3 className="mb-2 text-sm font-semibold text-muted-foreground">{section.title}</h3>
              <ChoiceGrid className="grid-cols-[repeat(auto-fill,minmax(10rem,1fr))]">
                {section.books.map((b) => (
                  <ChoiceGridItem
                    key={b.id}
                    current={b.id === track.bookId}
                    className="px-2 text-center text-sm"
                    onClick={() => setBookId(b.id)}
                  >
                    {b.name}
                  </ChoiceGridItem>
                ))}
              </ChoiceGrid>
            </section>
          ))}
        </div>
      </ScrollArea>
    </>
  );
}
