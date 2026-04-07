import { type SortBy, type TransactionType, type ListingType, type BaseListing } from "./schemas";

/**
 * Format price with currency symbol and thousands separator
 */
export function formatPrice(price: number): string {
    return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "EUR",
        maximumFractionDigits: 0,
    }).format(price);
}

/**
 * Format surface area with unit
 */
export function formatSurface(surfaceM2: number): string {
    return `${surfaceM2} m²`;
}

/**
 * Format floor number with suffix
 */
export function formatFloor(floor: number | null | undefined): string {
    if (floor === null || floor === undefined) return "N/A";
    if (floor === 0) return "Ground floor";

    const suffix = getOrdinalSuffix(floor);
    return `${floor}${suffix} floor`;
}

/**
 * Get ordinal suffix for a number
 */
function getOrdinalSuffix(n: number): string {
    const s = ["th", "st", "nd", "rd"];
    const v = n % 100;
    return s[(v - 20) % 10] || s[v] || s[0];
}

/**
 * Format transaction type for display
 */
export function formatTransactionType(type: TransactionType): string {
    const labels: Record<TransactionType, string> = {
        buy: "Buy",
        rent: "Rent",
    };
    return labels[type];
}

/**
 * Format listing type for display
 */
export function formatListingType(type: ListingType): string {
    const labels: Record<ListingType, string> = {
        flat: "Flat",
        house: "House",
        duplex: "Duplex",
        room: "Room",
        penthouse: "Penthouse",
    };
    return labels[type];
}

/**
 * Format sort option for display
 */
export function formatSortBy(sortBy: SortBy): string {
    const labels: Record<SortBy, string> = {
        relevance: "Relevance",
        price: "Price",
        surface: "Surface",
    };
    return labels[sortBy];
}

/**
 * Format listing specs into a compact string
 */
export function formatListingSpecs(
    listing: Pick<BaseListing, "rooms" | "bathrooms" | "surface_m2" | "floor">
): string {
    const { rooms, bathrooms, surface_m2, floor } = listing;
    const parts: string[] = [`${rooms} room${rooms !== 1 ? "s" : ""}`];

    if (bathrooms !== null && bathrooms !== undefined) {
        parts.push(`${bathrooms} bathroom${bathrooms !== 1 ? "s" : ""}`);
    }

    parts.push(formatSurface(surface_m2));

    if (floor !== null && floor !== undefined) {
        parts.push(formatFloor(floor));
    }

    return parts.join(" - ");
}

/**
 * Format location string
 */
export function formatLocation(
    listing: Pick<BaseListing, "street" | "neighborhood" | "city">
): string {
    const { street, neighborhood, city } = listing;
    if (street) {
        return `${street}, ${neighborhood}, ${city}`;
    }
    return `${neighborhood}, ${city}`;
}

/**
 * Truncate text with ellipsis
 */
export function truncateText(text: string, maxLength: number): string {
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength).trim() + "...";
}
