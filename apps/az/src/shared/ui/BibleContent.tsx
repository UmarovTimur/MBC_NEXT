import { cn } from "@/shared/lib/utils";

interface BibleContentProps {
  html: string;
  formattingStyle?: string;
  className?: string;
}

const STYLE_CLASS_NAMES: Record<string, string> = {
  azb: "bible-content--azb",
};

function normalizeBibleHtml(html: string, formattingStyle?: string): string {
  switch (formattingStyle) {
    case "azb":
    default:
      return html;
  }
}

export function BibleContent({ html, formattingStyle, className }: BibleContentProps) {
  const profileClassName = formattingStyle ? STYLE_CLASS_NAMES[formattingStyle] : undefined;

  return (
    <div
      className={cn("bible-content", profileClassName, className)}
      dangerouslySetInnerHTML={{ __html: normalizeBibleHtml(html, formattingStyle) }}
    />
  );
}
