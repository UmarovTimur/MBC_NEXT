"use client";

import Link from "next/link";
import { ContainerWidth } from "@/shared/ui/Container";
import { ThemeSwitcher } from "@/shared/ui/ThemeSwitcher/ThemeSwitcher";

const routes = [
  {
    href: "/",
    label: "Home",
  },
  {
    href: "/about",
    label: "About",
  },
];

export const Navbar = () => {
  return (
    <header className="sm:flex sm:justify-between py-3 border-b border-border outline-ring/50">
      <ContainerWidth className="relative flex h-10 items-center justify-between w-full">
        <div className="flex items-center">
          <Link href="/" className="">
            <h1 className="text-xl font-bold text-black dark:text-white/80">MBC NEXT</h1>
          </Link>
        </div>
        <div className="flex gap-6 items-center">
          <Link href="/books" className="ml-4 lg:ml-0 gap-x-2 text-black dark:text-white/80">
            Books
          </Link>
          <ThemeSwitcher />
        </div>
        {/* {routes.map((route) => (
              ))} */}
      </ContainerWidth>
    </header>
  );
};
