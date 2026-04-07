import { z } from "zod";
import {
    listingSummaryDataSchema,
    listingFilterOptionsSchema,
    listingDetailSchema,
    listingSearchParamsSchema,
    type ListingSearchParams,
    type GenAIParseRequest,
} from "../schemas";
import { buildSearchQueryString } from "../utils";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";
const API_V1 = `${API_BASE_URL}/api/v1`;

async function validatedFetch<S extends z.ZodTypeAny>(
    url: string,
    schema: S,
    options?: RequestInit
): Promise<z.infer<S>> {
    const response = await fetch(url, {
        headers: {
            "Content-Type": "application/json",
            ...options?.headers,
        },
        ...options,
    });

    if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.detail ?? `API Error: ${response.status}`);
    }

    const data = await response.json();
    const result = schema.safeParse(data);

    if (!result.success) {
        console.error("Schema validation failed:", result.error.format());
        throw new Error("Invalid API response format");
    }

    return result.data;
}

export async function searchListings(params: Partial<ListingSearchParams>) {
    const queryString = buildSearchQueryString(params);
    return validatedFetch(
        `${API_V1}/listings/search?${queryString}`,
        listingSummaryDataSchema
    );
}

export async function getFilterOptions() {
    return validatedFetch(
        `${API_V1}/listings/filters/options`,
        listingFilterOptionsSchema
    );
}

export async function getListingDetail(listingId: string) {
    return validatedFetch(
        `${API_V1}/listings/${listingId}`,
        listingDetailSchema
    );
}

export async function parseSearchQuery(request: GenAIParseRequest) {
    return validatedFetch(
        `${API_V1}/search/genai/parse`,
        listingSearchParamsSchema,
        {
            method: "POST",
            body: JSON.stringify(request),
        }
    );
}
