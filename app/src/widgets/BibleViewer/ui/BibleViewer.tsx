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

  const title = `${chapter.bookId}:${chapter.chapterId}`; 
  
  
  // ======================= attached Bible =====================================
  const attachedBibleName = bibleManager.getBible(chapter.bible).attachmentBibleName;
  let attachedContent: string | null = null;

  if (attachedBibleName) {
    const attachedChapter = {
      bible: attachedBibleName,
      bookId: chapter.bookId,
      chapterId: chapter.chapterId,
    };
    attachedContent = await bibleManager.getChapterContent(attachedChapter);
  }
  // ======================= NotFound ============================================
  if (!content) {
    notFound();
  }
  return (
    <div className={cn("", [className])}>
      <div className={cn("lg:flex justify-center gap-5 font-light [&_strong]:font-bold")}>
        <div className={cn("basis-2/3 ", attachedContent ? "lg:pr-5 lg:border-r" : "")}>
          <h1 className="text-2xl font-semibold mb-6">{title}</h1>
          <div className="[&>p]:mb-4" dangerouslySetInnerHTML={{ __html: content }} />
        </div>

        {attachedContent && (
          <div className="shrink-0 basis-1/3 text-base">
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
