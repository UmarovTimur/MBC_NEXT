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
        {/* <Button
          variant="ghost"
          className="h-auto w-full justify-start overflow-hidden px-2 py-2 sm:px-3 sm:py-2.5"
        > */}
        <AppLink
          href={href}
          className="min-w-0 w-full text-sm font-bold leading-9 uppercase text-foreground transition-colors hover:text-primary sm:text-base"
        >
          <span ref={textRef} className="truncate block">
            {shortName}
          </span>
        </AppLink>
        {/* </Button> */}
      </TooltipTrigger>
      {isTruncated && <TooltipContent>{fullName}</TooltipContent>}
    </Tooltip>
  );
}
