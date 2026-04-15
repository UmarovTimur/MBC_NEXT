import { ThemeSwitcher } from "@/shared/ui/ThemeSwitcher/ThemeSwitcher";
import { MobileNavbar } from "./MobileNavbar";
import { cn } from "@/shared/lib/utils";
import { BIBLES_CONFIG } from "@/entities/bible/config/config";
import { NavBibleControls } from "./NavBibleControls";
import { NavBibleLinks } from "./NavBibleLinks";
import { AppLink } from "@/shared/ui/AppLink";
import { Button } from "@/shared/ui/button";

const independentBibles = Object.entries(BIBLES_CONFIG).filter(
  ([, cfg]) => cfg.isIndependent
);

export const Navbar = () => {
  return (
    <header
      className={cn(
        "top-0 py-4 border-b",
        "border-border outline-ring/50 fixed w-full bg-white dark:bg-zinc-950 z-50",
      )}
    >
      <div className="px-4 relative flex items-center justify-between">
        <div className="flex gap-x-3 items-center">

          <AppLink href="/" className="text-xl mb-1 hover:text-green-700  text-green-700 font-bold dark:text-white/80">
            Incilaz
          </AppLink>


          <NavBibleLinks bibles={independentBibles} />
          <Button className="hidden lg:flex" asChild variant="ghost">
            <AppLink className="text-base" href="/books">Kitablar</AppLink>
          </Button>
        </div>

        <div className="gap-x-3 flex items-center">
          <MobileNavbar />
          <div className="hidden lg:flex gap-x-3">
            <NavBibleControls />
            <ThemeSwitcher />
          </div>
        </div>
      </div>
    </header>
  );
};
