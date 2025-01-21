import { Button } from "@/components/ui/button";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
  PaginationLink,
} from "@/components/ui/pagination";

interface TablePaginationProps {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export function TablePagination({
  page,
  totalPages,
  onPageChange,
}: TablePaginationProps) {
  const renderPaginationItems = () => {
    const items = [];
    const maxVisiblePages = 5;
    const halfVisible = Math.floor(maxVisiblePages / 2);
    
    let startPage = Math.max(1, page - halfVisible);
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
    
    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      items.push(
        <PaginationItem key={i}>
          <Button
            variant={i === page ? "outline" : "ghost"}
            onClick={() => onPageChange(i)}
            className="cursor-pointer"
          >
            <PaginationLink isActive={i === page}>
              {i}
            </PaginationLink>
          </Button>
        </PaginationItem>
      );
    }
    
    return items;
  };

  return (
    <Pagination>
      <PaginationContent>
        <PaginationItem>
          <Button
            variant="ghost"
            onClick={() => onPageChange(page - 1)}
            disabled={page === 1}
            className="cursor-pointer"
          >
            <PaginationPrevious />
          </Button>
        </PaginationItem>
        {renderPaginationItems()}
        <PaginationItem>
          <Button
            variant="ghost"
            onClick={() => onPageChange(page + 1)}
            disabled={page === totalPages}
            className="cursor-pointer"
          >
            <PaginationNext />
          </Button>
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
}