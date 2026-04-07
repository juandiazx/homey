import {
    Pagination,
    PaginationContent,
    PaginationEllipsis,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from "@/components/ui/pagination";

interface PaginatorProps {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
}

export function Paginator({
    currentPage,
    totalPages,
    onPageChange,
}: PaginatorProps) {
    if (totalPages <= 1) return null;

    // Generate page numbers to display
    const getPageNumbers = (): (number | "ellipsis")[] => {
        const pages: (number | "ellipsis")[] = [];
        const delta = 1; // Pages to show on each side of current

        for (let i = 1; i <= totalPages; i++) {
            if (
                i === 1 ||
                i === totalPages ||
                (i >= currentPage - delta && i <= currentPage + delta)
            ) {
                pages.push(i);
            } else if (pages[pages.length - 1] !== "ellipsis") {
                pages.push("ellipsis");
            }
        }

        return pages;
    };

    const pageNumbers = getPageNumbers();

    return (
        <Pagination className="mt-8">
            <PaginationContent>
                <PaginationItem>
                    <PaginationPrevious
                        href="#"
                        onClick={(e) => {
                            e.preventDefault();
                            if (currentPage > 1) onPageChange(currentPage - 1);
                        }}
                        aria-disabled={currentPage === 1}
                        className={
                            currentPage === 1
                                ? "pointer-events-none opacity-50"
                                : ""
                        }
                    />
                </PaginationItem>

                {pageNumbers.map((page, index) =>
                    page === "ellipsis" ? (
                        <PaginationItem key={`ellipsis-${index}`}>
                            <PaginationEllipsis />
                        </PaginationItem>
                    ) : (
                        <PaginationItem key={page}>
                            <PaginationLink
                                href="#"
                                isActive={currentPage === page}
                                onClick={(e) => {
                                    e.preventDefault();
                                    onPageChange(page);
                                }}
                            >
                                {page}
                            </PaginationLink>
                        </PaginationItem>
                    )
                )}

                <PaginationItem>
                    <PaginationNext
                        href="#"
                        onClick={(e) => {
                            e.preventDefault();
                            if (currentPage < totalPages)
                                onPageChange(currentPage + 1);
                        }}
                        aria-disabled={currentPage === totalPages}
                        className={
                            currentPage === totalPages
                                ? "pointer-events-none opacity-50"
                                : ""
                        }
                    />
                </PaginationItem>
            </PaginationContent>
        </Pagination>
    );
}
