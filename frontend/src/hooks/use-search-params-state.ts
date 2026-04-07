import { useSearchParams, useNavigate, useLocation } from "react-router-dom";
import { useCallback, useMemo } from "react";
import type {
    ListingSearchParams,
    ListingType,
    SortBy,
    SortOrder,
    TransactionType,
} from "@/lib/schemas";
import { SortBySchema, SortOrderSchema } from "@/lib/schemas";

export function useSearchParamsState() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const location = useLocation();

    const params = useMemo((): Partial<ListingSearchParams> => {
        const getNumber = (key: string): number | undefined => {
            const value = searchParams.get(key);
            return value ? parseInt(value, 10) : undefined;
        };

        const getString = (key: string): string | undefined => {
            const value = searchParams.get(key);
            return value || undefined;
        };

        return {
            transaction_type: getString("transaction_type") as TransactionType,
            listing_type: getString("listing_type") as ListingType,
            price_min: getNumber("price_min"),
            price_max: getNumber("price_max"),
            surface_min: getNumber("surface_min"),
            surface_max: getNumber("surface_max"),
            rooms_min: getNumber("rooms_min"),
            rooms_max: getNumber("rooms_max"),
            city: getString("city"),
            neighborhood: getString("neighborhood"),
            search_intent: getString("search_intent"),
            sort_by:
                (getString("sort_by") as SortBy) ?? SortBySchema.enum.relevance,
            sort_order:
                (getString("sort_order") as SortOrder) ??
                SortOrderSchema.enum.desc,
            page: getNumber("page") ?? 1,
            limit: getNumber("limit") ?? 15,
        };
    }, [searchParams]);

    const setParams = useCallback(
        (newParams: Partial<ListingSearchParams>, replace = false) => {
            const urlParams = new URLSearchParams();

            Object.entries({ ...params, ...newParams }).forEach(
                ([key, value]) => {
                    if (value !== null && value !== undefined && value !== "") {
                        urlParams.set(key, String(value));
                    }
                }
            );

            const url = `${location.pathname}?${urlParams.toString()}`;

            if (replace) {
                navigate(url, { replace: true });
            } else {
                navigate(url);
            }
        },
        [params, location.pathname, navigate]
    );

    const navigateToListings = useCallback(
        (newParams: Partial<ListingSearchParams>) => {
            const urlParams = new URLSearchParams();

            Object.entries(newParams).forEach(([key, value]) => {
                if (value !== null && value !== undefined && value !== "") {
                    urlParams.set(key, String(value));
                }
            });

            navigate(`/listings?${urlParams.toString()}`);
        },
        [navigate]
    );

    const setParam = useCallback(
        <K extends keyof ListingSearchParams>(
            key: K,
            value: ListingSearchParams[K] | undefined
        ) => {
            setParams({ [key]: value } as Partial<ListingSearchParams>);
        },
        [setParams]
    );

    const setParamsWithPageReset = useCallback(
        (newParams: Partial<ListingSearchParams>) => {
            setParams({ ...newParams, page: 1 });
        },
        [setParams]
    );

    return {
        params,
        setParams,
        setParam,
        setParamsWithPageReset,
        navigateToListings,
    };
}
