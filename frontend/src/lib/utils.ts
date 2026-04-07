import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import type { ListingSearchParams } from "./schemas";

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}
export function buildSearchQueryString(
    params: Partial<ListingSearchParams>
): string {
    const searchParams = new URLSearchParams();

    Object.entries(params).forEach(([key, value]) => {
        if (value !== null && value !== undefined && value !== "") {
            searchParams.append(key, String(value));
        }
    });

    return searchParams.toString();
}
