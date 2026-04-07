import type { ListingSearchParams } from "./schemas";

export const listingKeys = {
    all: ["listings"] as const,
    search: (params: Partial<ListingSearchParams>) =>
        [...listingKeys.all, "search", params] as const,
    detail: (id: string) => [...listingKeys.all, "detail", id] as const,
    filterOptions: () => [...listingKeys.all, "filterOptions"] as const,
} as const;
