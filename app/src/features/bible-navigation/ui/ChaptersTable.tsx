"use client";

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

interface ChaptersTableProps {
  label: string;
  discription: string;
  intro: string;
}

export function ChaptersTable({ label, discription, intro }: ChaptersTableProps) {
  const manifest = useBible();
  const { bible, bookId, chapterId } = useParams();

  const currentBible = manifest.bibles.find((b) => b.bibleName === bible);
  const currentBook = currentBible?.books?.find((b) => b.id === bookId);
  const currentChapter = currentBook?.chapters?.find((c) => c === chapterId) ?? "0";

  if (!currentBible || !currentBook) return null;

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>{label}</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{label}</DialogTitle>
          <DialogDescription>{discription}</DialogDescription>
        </DialogHeader>
        <div className="no-scrollbar -mx-6 max-h-[80vh] overflow-y-auto px-4">
          <div className="grid grid-cols-[repeat(auto-fit,minmax(5rem,1fr))]">
            {currentBook.chapters.map((c) =>
              c != currentChapter ? (
                <DialogClose asChild key={c}>
                  <Link
                    href={`/${bible}/${bookId}/${c}`}
                    className={cn("border flex py-3 justify-center items-center hover:bg-accent")}
                  >
                    {c === "0" ? intro : c}
                  </Link>
                </DialogClose>
              ) : (
                <div
                  key={c}
                  className="flex py-3 justify-center items-center bg-primary text-primary-foreground border-0"
                >
                  {c === "0" ? intro : c}
                </div>
              ),
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
