"use client";

import { useRef, useState, useEffect } from "react";
import { cn } from "../lib/utils";
import { AppLink } from "./AppLink";
import { Tooltip, TooltipContent, TooltipTrigger } from "./tooltip";

interface BookButtonProps {
  shortName: string;
  fullName: string;
  href: string;
  uppercase?: boolean;
}

export function BookButton({ shortName, fullName, href, uppercase = true }: BookButtonProps) {
  const textRef = useRef<HTMLSpanElement>(null);
  const [isTruncated, setIsTruncated] = useState(false);

  useEffect(() => {
    const el = textRef.current;
    if (el) setIsTruncated(el.scrollWidth > el.offsetWidth);
  }, []);

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <AppLink
          href={href}
          // "button" variant adds no colours of its own, so text-foreground
          // also applies in dark mode (default variant forces dark:text-gray-500).
          variant="button"
          className={cn(
            "min-w-0 w-full text-sm font-bold leading-9 text-foreground transition-colors hover:underline hover:text-primary sm:text-base",
            uppercase && "uppercase",
          )}
        >
          <span ref={textRef} className="truncate block">
            {shortName}
          </span>
        </AppLink>
      </TooltipTrigger>
      {isTruncated && <TooltipContent>{fullName}</TooltipContent>}
    </Tooltip>
  );
}
