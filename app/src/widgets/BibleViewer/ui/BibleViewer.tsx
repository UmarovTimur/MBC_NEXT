import { bibleManager, Chapter } from "@/entities/bible";
import { cn } from "@/shared/lib/cn";
import { notFound } from "next/navigation";

interface BibleViewerProps {
  className?: string;
  chapter: Chapter;
}

export const BibleViewer = async ({ className, chapter }: BibleViewerProps) => {
  const bible = bibleManager.getBible(chapter.bible);
  // ======================= Bible ==============================================
  const content = await bible.getChapterContent(chapter.bookId, chapter.chapterId);
  const title = bible.getChapterTitle(chapter);
  const subTitle = bible.BibleTitle;

  // ======================= attached Bible =====================================
  const attachedBible = bibleManager.getBible(bible.attachmentBibleName);
  const attachedContent = await bibleManager.getChapterContent({
    bible: attachedBible.bibleName,
    bookId: chapter.bookId,
    chapterId: chapter.chapterId,
  });

  const attachedTitle = attachedBible.getChapterTitle(chapter);
  // ======================= NotFound ============================================
  if (!content) {
    notFound();
  }
  return (
    <div className={cn("", [className])}>
      <div className={cn("lg:flex justify-center gap-5 font-light [&_strong]:font-bold")}>
        <div className={cn("basis-2/3 pt-6", attachedContent ? "lg:pr-5 lg:border-r" : "")}>
          <h1 className="text-4xl font-extrabold mb-6">{title}</h1>
          <h3></h3>
          <div className="[&>p]:mb-4" dangerouslySetInnerHTML={{ __html: content }} />
        </div>

        {attachedContent && (
          <div className="shrink-0 pt-6 basis-1/3 text-base">
            <h2 className="text-3xl mb-6">{attachedTitle}</h2>
            <div
              className="[&_a]:text-blue-600 [&_a]:font-bold"
              dangerouslySetInnerHTML={{ __html: attachedContent }}
            />
          </div>
        )}
      </div>
    </div>
  );
};
