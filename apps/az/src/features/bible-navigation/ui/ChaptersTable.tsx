"use client";

import { useI18n } from "@/app/providers/I18n";
import { useBible } from "@/entities/bible";
import { cn } from "@/shared/lib/utils";
import { Button } from "@/shared/ui/button";
import { ChoiceGrid, ChoiceGridItem } from "@/shared/ui/choice-grid";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/shared/ui/dialog";
import { useParams } from "next/navigation";
import type { ReactNode } from "react";
import { useBibleUI } from "../model/BibleUIContext";
import { AppLink } from "@/shared/ui/AppLink";
import { ScrollArea } from "@/shared/ui/scroll-area";

interface ChaptersTableProps {
  className?: string;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  trigger?: ReactNode;
  hideTrigger?: boolean;
}

export function ChaptersTable({ className, open, onOpenChange, trigger, hideTrigger = false }: ChaptersTableProps) {
  const manifest = useBible();
  const { t } = useI18n();

  const { bible, bookId, chapterId } = useParams();
  const currentBible = manifest.bibles.find((b) => b.bibleName === bible);
  const currentBook = currentBible?.books?.find((b) => b.id === bookId);
  const currentChapter = currentBook?.chapters?.find((c) => c === chapterId) ?? "0";

  if (!currentBible || !currentBook) return null;

  const dialogProps =
    open === undefined
      ? {}
      : {
          open,
          onOpenChange,
        };

  return (
    <Dialog {...dialogProps}>
      {!hideTrigger && (
        <DialogTrigger asChild>
          {trigger ?? <Button className={cn("grow", className)}>{t("chapters")}</Button>}
        </DialogTrigger>
      )}
      <DialogContent className="lg:max-w-200">
        <DialogHeader>
          <DialogTitle>{t("chapters")}</DialogTitle>
          <DialogDescription>{t("Select a chapter")}</DialogDescription>
        </DialogHeader>
        {/* -mx-4/px-4: the scrollbar runs in the dialog's padding, clear of the cells. */}
        <ScrollArea className="-mx-4 max-h-[80vh]">
          <ChoiceGrid className="px-4 py-1">
            {currentBook.chapters.map((c) => {
              const content = c === "0" ? t("Intro") : c;

              if (c === currentChapter) {
                return (
                  <ChoiceGridItem key={c} current asChild>
                    <div>{content}</div>
                  </ChoiceGridItem>
                );
              }
              return (
                <DialogClose asChild key={c}>
                  <ChoiceGridItem asChild>
                    <AppLink href={`/${bible}/${bookId}/${c}`} prefetch={false}>
                      {content}
                    </AppLink>
                  </ChoiceGridItem>
                </DialogClose>
              );
            })}
          </ChoiceGrid>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
interface ChaptersTableTriggerProps {
  className?: string;
  variant?: "default" | "outline" | "secondary" | "ghost" | "link";
}
export function ChaptersTableTrigger(props: ChaptersTableTriggerProps) {
  const isBookPage = (useParams().bookId as string) ?? "";
  const { t } = useI18n();
  const { openChapters } = useBibleUI();
  const { className, variant } = props;

  if (!isBookPage) return null;

  return (
    <Button variant={variant ?? "default"} onClick={openChapters} className={cn("", className)}>
      {t("chapters")}
    </Button>
  );
}
