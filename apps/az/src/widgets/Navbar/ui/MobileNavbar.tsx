"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu } from "lucide-react";
import { Button } from "@/shared/ui/button";
import { AppLink } from "@/shared/ui/AppLink";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/shared/ui/sheet";
import { ThemeSwitcher } from "@/shared/ui/ThemeSwitcher/ThemeSwitcher";
import { NavBibleLinks } from "./NavBibleLinks";

export const MobileNavbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="lg:hidden">
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>
          <Button className="h-6 w-6" asChild variant="ghost" size="icon" aria-label="Open menu">
            <Menu />
          </Button>
        </SheetTrigger>
        <SheetContent aria-describedby="Mobile menu" side="top" className="px-0 pb-6 ">
          <SheetHeader className="px-4">
            <SheetTitle>
              <Link href="/">
                <span className="text-xl font-bold text-black dark:text-white/80">
                  <span className="text-green-700">Incilaz</span>
                </span>
              </Link>
            </SheetTitle>
          </SheetHeader>
          <div className="mt-4 flex flex-col gap-y-3">
            <NavBibleLinks className="flex-col gap-y-3 items-start" linkClassName="text-2xl px-4 py-2" />
            <Button asChild variant="ghost" className="justify-start">
              <AppLink className="text-2xl px-4 py-2" href="/books">Kitablar</AppLink>
            </Button>
          </div>
          <div className="mt-6 flex items-center justify-between px-4">
            <ThemeSwitcher />
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
};
