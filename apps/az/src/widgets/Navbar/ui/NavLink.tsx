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
        isActive && "text-foreground border-foreground",
        className,
      )}
    >
      {children}
    </AppLink>
  );
}
