import { AppLink } from "@/shared/ui/AppLink";
import { Button } from "@/shared/ui/button";
import { ButtonGroup } from "@/shared/ui/button-group";
import type { Testament } from "../lib/searchVerses";

interface TestamentFilterProps {
  query: string;
  exact: boolean;
  value: Testament | undefined;
  allLabel: string;
  oldLabel: string;
  newLabel: string;
}

export function TestamentFilter({
  query,
  exact,
  value,
  allLabel,
  oldLabel,
  newLabel,
}: TestamentFilterProps) {
  const hrefFor = (testament: Testament | undefined) => {
    const params = new URLSearchParams({ q: query });
    if (exact) params.set("exact", "1");
    if (testament) params.set("testament", testament);
    return `/search?${params.toString()}`;
  };

  const options: { testament: Testament | undefined; label: string }[] = [
    { testament: undefined, label: allLabel },
    { testament: "ot", label: oldLabel },
    { testament: "nt", label: newLabel },
  ];

  // Plain links rather than a client-side toggle: the filter keeps working
  // with JavaScript disabled, like the search form above it.
  return (
    <ButtonGroup className="mb-6">
      {options.map(({ testament, label }) => {
        const active = testament === value;
        return (
          <Button
            key={testament ?? "all"}
            asChild
            variant={active ? "default" : "outline"}
            // Same border width in both states so switching doesn't shift layout.
            className={active ? "border border-foreground px-3" : "px-3"}
          >
            <AppLink href={hrefFor(testament)} variant="button" aria-current={active ? "page" : undefined}>
              {label}
            </AppLink>
          </Button>
        );
      })}
    </ButtonGroup>
  );
}
