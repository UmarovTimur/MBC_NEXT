"use client";

import Link from "next/link";
import "./Navbar.module.scss";
import { ContainerWidth } from "@/shared/ui/Container";

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
            <h1 className="text-xl font-bold">MBC NEXT</h1>
          </Link>
        </div>
        <Link href="/books" className="ml-4 lg:ml-0 gap-x-2">
          Books
        </Link>
        {/* {routes.map((route) => (
              ))} */}
      </ContainerWidth>
    </header>
  );
};
