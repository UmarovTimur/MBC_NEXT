"use client";

import { usePathname } from "next/navigation";
import { cn } from "@/shared/lib/utils";
import type { BibleConfig } from "@/entities/bible/config/config";
import { AppLink } from "@/shared/ui/AppLink";

interface NavBibleLinksProps {
  bibles: [string, BibleConfig][];
}

export function NavBibleLinks({ bibles }: NavBibleLinksProps) {
  const pathname = usePathname();

  return (
    <nav className="hidden lg:flex gap-x-5 text-sm items-center">
      {bibles.map(([bibleName, cfg]) => {
        const isActive = pathname.startsWith(`/${bibleName}`);
        return (
          <AppLink
            key={bibleName}
            href={`/${bibleName}`}
            className={cn(
              "transition-colors hover:text-foreground",
              isActive ? "font-bold text-foreground" : "text-muted-foreground",
            )}
          >
            {cfg.displayName ?? cfg.primary}
          </AppLink>
        );
      })}
    </nav>
  );
}
