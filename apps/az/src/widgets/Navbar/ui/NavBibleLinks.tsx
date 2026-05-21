"use client";

import { usePathname } from "next/navigation";
import { cn } from "@/shared/lib/utils";
import { BIBLES_CONFIG } from "@/entities/bible/config/config";
import { AppLink } from "@/shared/ui/AppLink";
import { Button } from "@mbc/ui";
import { useI18n } from "@/app/providers/I18n/ui/useI18n";

const independentBibles = Object.entries(BIBLES_CONFIG)
  .filter(([, cfg]) => cfg.isIndependent)
  .sort(([, left], [, right]) => Number(Boolean(left.isCommentary)) - Number(Boolean(right.isCommentary)));

interface NavBibleLinksProps {
  className?: string;
  linkClassName?: string;
}

export function NavBibleLinks({ className, linkClassName }: NavBibleLinksProps) {
  const { t } = useI18n();

  return (
    <div className={cn("flex items-center gap-x-1 gap-y-4", className)}>
      {independentBibles.map(([bibleName, cfg]) => (
        <Button key={bibleName} asChild variant="ghost" className="rounded-full px-4 hover:bg-stone-100 dark:hover:bg-white/10">
          <AppLink
            href={`/${bibleName}`}
            className={cn("transition-colors text-base", linkClassName)}
          >
            {cfg.isCommentary ? t("homeQuickCommentary") : cfg.displayName ?? cfg.primary}
          </AppLink>
        </Button>
      ))}
    </div>
  );
}
