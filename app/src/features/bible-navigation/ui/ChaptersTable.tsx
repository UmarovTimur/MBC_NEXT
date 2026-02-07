"use client";

import { useI18n } from "@/app/providers/I18n";
import { useBible } from "@/entities/bible";
import { cn } from "@/shared/lib/utils";
import { Button } from "@/shared/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/shared/ui/dialog";
import Link from "next/link";
import { useParams } from "next/navigation";
import type { ReactNode } from "react";
import { useBibleUI } from "../model/BibleUIContext";

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
      <DialogContent aria-describedby="Select a chapter" className="lg:max-w-200">
        <DialogHeader>
          <DialogTitle>{t("chapters")}</DialogTitle>
          <DialogDescription>{t("Select a chapter")}</DialogDescription>
        </DialogHeader>
        <div className="no-scrollbar -mx-4 max-h-[80vh] overflow-y-auto px-4 py-1">
          <div className="grid grid-cols-[repeat(auto-fit,minmax(5rem,1fr))]">
            {currentBook.chapters.map((c) => {
              const href = `/${bible}/${bookId}/${c}`;
              const content = c === "0" ? t("Intro") : c;
              const isCurrent = c == currentChapter;

              if (!isCurrent) {
                return (
                  <DialogClose asChild key={c}>
                    <Link
                      href={href}
                      prefetch={false}
                      className={cn("border flex py-3 justify-center items-center hover:bg-accent")}
                    >
                      {content}
                    </Link>
                  </DialogClose>
                );
              }
              return (
                <div
                  key={c}
                  className="flex py-3 justify-center items-center bg-primary text-primary-foreground border-0"
                >
                  {content}
                </div>
              );
            })}
          </div>
        </div>
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
