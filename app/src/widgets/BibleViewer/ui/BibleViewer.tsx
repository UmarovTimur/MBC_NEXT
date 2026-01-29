import { bibleManager, Chapter } from "@/entities/bible";
import { cn } from "@/shared/lib/cn";
import { notFound } from "next/navigation";

interface BibleViewerProps {
  className?: string;
  chapter: Chapter;
}

export const BibleViewer = async ({ className, chapter }: BibleViewerProps) => {
  const content = await bibleManager.getChapterContent(chapter);

  const attachedBibleName = bibleManager.getBible(chapter.bible)?.attachmentBibleName;
  let attachedContent: string | null = null;

  if (attachedBibleName) {
    const attachedChapter = {
      bible: attachedBibleName,
      bookId: chapter.bookId,
      chapterId: chapter.chapterId,
    };

    attachedContent = await bibleManager.getChapterContent(attachedChapter);
  }

  if (!content) {
    notFound();
  }
  return (
    <div className={cn("", [className])}>
      <div className="md:flex justify-center">
        <div className="shrink-0 w-3xl mr-4 [&>p]:mb-4" dangerouslySetInnerHTML={{ __html: content }} />
        {attachedContent && (
          <div className="shrink-0 basis-1/3 " >
            <div
              dangerouslySetInnerHTML={{ __html: attachedContent }}
            />
          </div>
        )}
      </div>
    </div>
  );
};
