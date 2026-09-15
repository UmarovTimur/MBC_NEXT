import * as React from "react";
import { Slot } from "@radix-ui/react-slot";

import { cn } from "../lib/utils";

/** Grid of bordered cells to pick one from — chapters, books. */
function ChoiceGrid({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="choice-grid"
      className={cn("grid grid-cols-[repeat(auto-fit,minmax(5rem,1fr))]", className)}
      {...props}
    />
  );
}

type ChoiceGridItemProps = React.ComponentProps<"button"> & {
  /** The cell for what is shown/playing right now: filled instead of outlined. */
  current?: boolean;
  /** Render the child (a link, or a plain div for a non-interactive current cell) instead of a button. */
  asChild?: boolean;
};

function ChoiceGridItem({ className, current = false, asChild = false, ...props }: ChoiceGridItemProps) {
  const Comp = asChild ? Slot : "button";
  return (
    <Comp
      data-slot="choice-grid-item"
      aria-current={current ? "true" : undefined}
      className={cn(
        "flex cursor-pointer items-center justify-center border py-3 transition-colors hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none focus-visible:ring-inset",
        current && "border-0 bg-primary text-primary-foreground hover:bg-primary",
        className,
      )}
      {...props}
    />
  );
}

export { ChoiceGrid, ChoiceGridItem };
