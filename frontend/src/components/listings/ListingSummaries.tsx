import { useListingsSearch } from "@/lib/api/queries";
import { useSearchParamsState } from "@/hooks/use-search-params-state";
import { ListingSummaryCard, ListingCardSkeleton } from "./ListingSummaryCard";
import { SearchSummaryCard } from "./SearchSummaryCard";
import { SortSelect } from "./SortSelect";
import { Paginator } from "./Paginator";
import {
    Empty,
    EmptyHeader,
    EmptyMedia,
    EmptyTitle,
    EmptyDescription,
} from "@/components/ui/empty";
import { formatListingType } from "@/lib/format";
import { Search, AlertCircle } from "lucide-react";
import type { SortBy, SortOrder } from "@/lib/schemas";

export function ListingSummaries() {
    const { params, setParams, setParamsWithPageReset } =
        useSearchParamsState();
    const { data, isLoading, error } = useListingsSearch(params);

    const handleSortChange = (sortBy: SortBy, sortOrder: SortOrder) => {
        setParamsWithPageReset({ sort_by: sortBy, sort_order: sortOrder });
    };

    const handlePageChange = (page: number) => {
        setParams({ page });
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const getTitleText = () => {
        const total = data?.total ?? 0;
        const listingType = params.listing_type
            ? formatListingType(params.listing_type).toLowerCase() + "s"
            : "properties";
        const transaction =
            params.transaction_type === "buy"
                ? "for sale"
                : params.transaction_type === "rent"
                  ? "for rent"
                  : "";
        const location = params.city ? `in ${params.city}` : "";

        return `${total} ${listingType} ${transaction} ${location}`.trim();
    };

    return (
        <div className="flex gap-8">
            <div className="flex-1 space-y-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <h1 className="text-2xl font-semibold">{getTitleText()}</h1>
                    <SortSelect
                        sortBy={params.sort_by ?? "relevance"}
                        sortOrder={params.sort_order ?? "desc"}
                        onSortChange={handleSortChange}
                    />
                </div>

                {isLoading ? (
                    <div className="space-y-4">
                        {Array.from({ length: 3 }).map((_, i) => (
                            <ListingCardSkeleton key={i} />
                        ))}
                    </div>
                ) : error ? (
                    <Empty>
                        <EmptyHeader>
                            <EmptyMedia variant="icon">
                                <AlertCircle />
                            </EmptyMedia>
                            <EmptyTitle>Error loading listings</EmptyTitle>
                            <EmptyDescription>
                                There was a problem loading the listings. Please
                                try again.
                            </EmptyDescription>
                        </EmptyHeader>
                    </Empty>
                ) : data?.items.length === 0 ? (
                    <Empty>
                        <EmptyHeader>
                            <EmptyMedia variant="icon">
                                <Search />
                            </EmptyMedia>
                            <EmptyTitle>No listings found</EmptyTitle>
                            <EmptyDescription>
                                Try adjusting your search filters to find more
                                properties.
                            </EmptyDescription>
                        </EmptyHeader>
                    </Empty>
                ) : (
                    <div className="space-y-4">
                        {data?.items.map((listing) => (
                            <ListingSummaryCard
                                key={listing.id}
                                listing={listing}
                            />
                        ))}
                    </div>
                )}

                {data && data.total_pages > 1 && (
                    <Paginator
                        currentPage={data.page}
                        totalPages={data.total_pages}
                        onPageChange={handlePageChange}
                    />
                )}
            </div>

            <aside className="hidden w-80 shrink-0 lg:block">
                <SearchSummaryCard params={params} />
            </aside>
        </div>
    );
}
