"use client";

import { useRef, useState, useEffect } from "react";
import { AppLink } from "@/shared/ui/AppLink";
import { Button, Tooltip, TooltipContent, TooltipTrigger } from "@mbc/ui";

interface BookButtonProps {
  shortName: string;
  fullName: string;
  href: string;
}

export function BookButton({ shortName, fullName, href }: BookButtonProps) {
  const textRef = useRef<HTMLSpanElement>(null);
  const [isTruncated, setIsTruncated] = useState(false);

  useEffect(() => {
    const el = textRef.current;
    if (el) setIsTruncated(el.scrollWidth > el.offsetWidth);
  }, []);

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button variant="ghost" className="w-full justify-start overflow-hidden">
          <AppLink
            href={href}
            className="text-base uppercase font-bold text-foreground hover:text-primary transition-colors min-w-0"
          >
            <span ref={textRef} className="truncate block">
              {shortName}
            </span>
          </AppLink>
        </Button>
      </TooltipTrigger>
      {isTruncated && <TooltipContent>{fullName}</TooltipContent>}
    </Tooltip>
  );
}
