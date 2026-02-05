import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
} from "@/shared/ui/pagination";
import { ChaptersTable } from "./ChaptersTable";
interface ChaptersPaginationProps {
  next: string;
  prev: string;
}

export function ChaptersPagination({ next, prev }: ChaptersPaginationProps) {
  return (
    <Pagination>
      <PaginationContent>
        <PaginationItem>{prev}</PaginationItem>
        <PaginationItem>{/* <ChaptersTable/> */}</PaginationItem>
        <PaginationItem>
          <PaginationEllipsis />
        </PaginationItem>
        <PaginationItem>{next}</PaginationItem>
      </PaginationContent>
    </Pagination>
  );
}
