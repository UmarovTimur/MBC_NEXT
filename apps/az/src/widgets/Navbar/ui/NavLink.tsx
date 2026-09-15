"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { cn } from "@/shared/lib/utils";
import { AppLink } from "@/shared/ui/AppLink";

interface NavLinkProps {
  href: string;
  className?: string;
  children: ReactNode;
  onClick?: () => void;
}

export function NavLink({ href, className, children, onClick }: NavLinkProps) {
  const pathname = usePathname();
  const isActive = pathname === href || pathname.startsWith(`${href}/`);

  return (
    <AppLink
      variant="button"
      href={href}
      onClick={onClick}
      className={cn(
        "flex items-center self-stretch border-b-2 border-transparent text-sm text-zinc-700 transition-colors hover:text-foreground hover:border-foreground dark:text-zinc-200 dark:hover:text-foreground",
        isActive && "text-foreground border-foreground font-bold",
        className,
      )}
    >
      {/* An invisible bold copy reserves the bold width, so switching pages doesn't nudge the other links. */}
      <span className="grid justify-items-center">
        <span className="col-start-1 row-start-1">{children}</span>
        <span aria-hidden className="invisible col-start-1 row-start-1 font-bold">
          {children}
        </span>
      </span>
    </AppLink>
  );
}
