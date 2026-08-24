"use client";

import { useRouter } from "next/navigation";
import { ToggleGroup, ToggleGroupItem } from "@/shared/ui/toggle-group";
import type { Testament } from "../lib/searchVerses";

/** ToggleGroup has no "no value" item, so "all" stands in for `undefined`. */
const ALL = "all";

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
  const router = useRouter();

  const onValueChange = (next: string) => {
    // Radix clears the value when the active item is re-pressed; treat that as
    // "all" rather than navigating to an empty filter.
    const testament = next === "" || next === ALL ? undefined : next;
    const params = new URLSearchParams({ q: query });
    if (exact) params.set("exact", "1");
    if (testament) params.set("testament", testament);
    router.push(`/search?${params.toString()}`);
  };

  return (
    <ToggleGroup
      type="single"
      variant="outline"
      value={value ?? ALL}
      onValueChange={onValueChange}
      className="mb-6 justify-start"
    >
      <ToggleGroupItem value={ALL} className="px-3">
        {allLabel}
      </ToggleGroupItem>
      <ToggleGroupItem value="ot" className="px-3">
        {oldLabel}
      </ToggleGroupItem>
      <ToggleGroupItem value="nt" className="px-3">
        {newLabel}
      </ToggleGroupItem>
    </ToggleGroup>
  );
}
