"use client";

import { usePathname } from "next/navigation";
import { cn } from "@/shared/lib/utils";
import type { BibleConfig } from "@/entities/bible/config/config";
import { AppLink } from "@/shared/ui/AppLink";
import { Button } from "@mbc/ui";

interface NavBibleLinksProps {
  bibles: [string, BibleConfig][];
}

export function NavBibleLinks({ bibles }: NavBibleLinksProps) {
  const pathname = usePathname();

  return (
    <nav className="hidden lg:flex gap-x-1 items-center">
      {bibles.map(([bibleName, cfg]) => {
        return (
          <Button key={bibleName} asChild variant="ghost">
            <AppLink
              key={bibleName}
              href={`/${bibleName}`}
              className={cn(
                "transition-colors text-base over:text-foreground",
              )}
            >
              {cfg.displayName ?? cfg.primary}
            </AppLink>
          </Button>
        );
      })}
    </nav>
  );
}
