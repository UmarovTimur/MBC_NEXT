"use client";

import { cn } from "@/shared/lib/utils";
import { useBible } from "@/entities/bible";
import { AppLink } from "@/shared/ui/AppLink";
import { Button } from "@mbc/ui";
import { useI18n } from "@/app/providers/I18n/ui/useI18n";

interface NavBibleLinksProps {
  className?: string;
  linkClassName?: string;
}

export function NavBibleLinks({ className, linkClassName }: NavBibleLinksProps) {
  const { t } = useI18n();
  const manifest = useBible();

  const independentBibles = manifest.bibles
    .filter((bible) => bible.isIndependent)
    .sort((left, right) => Number(left.isCommentary) - Number(right.isCommentary));

  return (
    <div className={cn("flex items-center gap-x-1 gap-y-4", className)}>
      {independentBibles.map((bible) => (
        <Button key={bible.bibleName} asChild variant="ghost" className="rounded-full px-4 hover:bg-stone-100 dark:hover:bg-white/10">
          <AppLink
            href={`/${bible.bibleName}`}
            className={cn("transition-colors text-base", linkClassName)}
          >
            {bible.primary}
          </AppLink>
        </Button>
      ))}
    </div>
  );
}
