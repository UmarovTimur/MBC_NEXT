"use client";

import { usePathname } from "next/navigation";
import { cn } from "@/shared/lib/utils";
import { BIBLES_CONFIG, type BibleConfig } from "@/entities/bible/config/config";
import { AppLink } from "@/shared/ui/AppLink";
import { Button } from "@mbc/ui";

const independentBibles = Object.entries(BIBLES_CONFIG).filter(
  ([, cfg]) => cfg.isIndependent
);

interface NavBibleLinksProps {
  className?: string;
  linkClassName?: string;
}

export function NavBibleLinks({ className, linkClassName }: NavBibleLinksProps) {
  return (
    <div className={cn("flex gap-x-1 gap-y-4 tems-center", className)}>
      {independentBibles.map(([bibleName, cfg]) => (
        <Button key={bibleName} asChild variant="ghost">
          <AppLink
            href={`/${bibleName}`}
            className={cn("transition-colors text-base", linkClassName)}
          >
            {cfg.displayName ?? cfg.primary}
          </AppLink>
        </Button>
      ))}
    </div>
  );
}
