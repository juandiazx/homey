import { useQuery } from "@tanstack/react-query";
import {
    searchListings,
    getFilterOptions,
    getListingDetail,
} from "@/lib/api/api";
import { listingKeys } from "@/lib/query-keys";
import type { ListingSearchParams } from "@/lib/schemas";

export function useListingsSearch(params: Partial<ListingSearchParams>) {
    return useQuery({
        queryKey: listingKeys.search(params),
        queryFn: () => searchListings(params),
    });
}

export function useFilterOptions() {
    return useQuery({
        queryKey: listingKeys.filterOptions(),
        queryFn: getFilterOptions,
        staleTime: 1000 * 60 * 10,
    });
}

export function useListingDetail(listingId: string | null) {
    return useQuery({
        queryKey: listingKeys.detail(listingId ?? ""),
        queryFn: () => getListingDetail(listingId!),
        enabled: !!listingId,
    });
}
