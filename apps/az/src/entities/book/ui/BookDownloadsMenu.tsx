"use client";

import { ChevronDown } from "lucide-react";
import { Button } from "@/shared/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/shared/ui/dropdown-menu";
import type { Book } from "../lib/mapWpBook";

interface BookDownloadsMenuProps {
  downloads: Book["downloads"];
  className?: string;
}

export function BookDownloadsMenu({ downloads, className }: BookDownloadsMenuProps) {
  if (downloads.length === 0) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className={className}>
          Yukle
          <ChevronDown className="size-4 opacity-70" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="min-w-56">
        <DropdownMenuLabel>Format secin</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {downloads.map((download) => (
          <DropdownMenuItem key={`${download.format}-${download.url}`} asChild>
            <a href={download.url} target="_blank" rel="noreferrer" className="flex w-full items-center gap-2">
              <span>{download.format.toUpperCase()}</span>
              <span className="ml-auto text-xs text-muted-foreground">
                {download.fileSize || download.label}
              </span>
            </a>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
