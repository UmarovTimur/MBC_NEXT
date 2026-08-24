"use client";

import { cn } from "@/shared/lib/utils";
import { useBible } from "@/entities/bible";
import { AppLink } from "@/shared/ui/AppLink";
import { Button } from "@mbc/ui";
import { NavLink } from "./NavLink";

interface NavBibleLinksProps {
  className?: string;
  linkClassName?: string;
  /** Desktop header renders plain underlined text; the mobile sheet keeps full-row buttons. */
  variant?: "link" | "button";
  /** Called after a link is followed, so a containing mobile sheet can close itself. */
  onNavigate?: () => void;
}

export function NavBibleLinks({ className, linkClassName, variant = "link", onNavigate }: NavBibleLinksProps) {
  const manifest = useBible();

  const independentBibles = manifest.bibles
    .filter((bible) => bible.isIndependent)
    .sort((left, right) => Number(left.isCommentary) - Number(right.isCommentary));

  if (variant === "button") {
    return (
      <div className={cn("flex items-center gap-x-1 gap-y-4", className)}>
        {independentBibles.map((bible) => (
          <Button key={bible.bibleName} asChild variant="ghost" className="px-4 hover:bg-stone-100 dark:hover:bg-white/10">
            <AppLink
              href={`/${bible.bibleName}`}
              className={cn("transition-colors text-base", linkClassName)}
              onClick={onNavigate}
            >
              {bible.primary}
            </AppLink>
          </Button>
        ))}
      </div>
    );
  }

  return (
    <div className={cn("flex items-center gap-x-4", className)}>
      {independentBibles.map((bible) => (
        <NavLink
          key={bible.bibleName}
          href={`/${bible.bibleName}`}
          onClick={onNavigate}
          className={linkClassName}
        >
          {bible.primary}
        </NavLink>
      ))}
    </div>
  );
}
