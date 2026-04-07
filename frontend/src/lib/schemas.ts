import { z } from "zod";

// ============================================================================
// Enum Schemas (Zod as single source of truth)
// ============================================================================

export const TransactionTypeSchema = z.enum(["buy", "rent"]);
export type TransactionType = z.infer<typeof TransactionTypeSchema>;

export const ListingTypeSchema = z.enum([
    "flat",
    "house",
    "duplex",
    "room",
    "penthouse",
]);
export type ListingType = z.infer<typeof ListingTypeSchema>;

export const SortBySchema = z.enum(["relevance", "price", "surface"]);
export type SortBy = z.infer<typeof SortBySchema>;

export const SortOrderSchema = z.enum(["asc", "desc"]);
export type SortOrder = z.infer<typeof SortOrderSchema>;

export const SearchModeSchema = z.enum(["classical", "smart"]);
export type SearchMode = z.infer<typeof SearchModeSchema>;

// ============================================================================
// Zod Schemas
// ============================================================================

// Range values schema for filter options
export const rangeValuesSchema = z.object({
    min: z.number().min(0),
    max: z.number().min(0),
});

export type RangeValues = z.infer<typeof rangeValuesSchema>;

// Filter options schema - available values for search filter dropdowns
export const listingFilterOptionsSchema = z.object({
    transaction_types: z.array(TransactionTypeSchema),
    listing_types: z.array(ListingTypeSchema),
    neighborhoods: z.array(z.string()),
    price_range: rangeValuesSchema,
    surface_range: rangeValuesSchema,
    rooms_range: rangeValuesSchema,
});

export type ListingFilterOptions = z.infer<typeof listingFilterOptionsSchema>;

// Listing search params schema - parameters for searching listings
export const listingSearchParamsSchema = z.object({
    transaction_type: TransactionTypeSchema.nullable().optional(),
    listing_type: ListingTypeSchema.nullable().optional(),
    price_min: z.number().min(0).nullable().optional(),
    price_max: z.number().min(0).nullable().optional(),
    surface_min: z.number().min(0).nullable().optional(),
    surface_max: z.number().min(0).nullable().optional(),
    rooms_min: z.number().min(0).nullable().optional(),
    rooms_max: z.number().min(0).nullable().optional(),
    city: z.string().nullable().optional(),
    neighborhood: z.string().nullable().optional(),
    search_intent: z.string().nullable().optional(),
    sort_by: SortBySchema.default("relevance"),
    sort_order: SortOrderSchema.default("desc"),
    page: z.number().min(1).default(1),
    limit: z.number().min(1).max(100).default(15),
});

export type ListingSearchParams = z.infer<typeof listingSearchParamsSchema>;

// Listing image schema
export const listingImageSchema = z.object({
    id: z.string().uuid(),
    url: z.string().url(),
    position: z.number(),
});

export type ListingImage = z.infer<typeof listingImageSchema>;

// Base listing schema - shared fields between summary and detail
export const baseListingSchema = z.object({
    id: z.string().uuid(),
    title: z.string(),
    transaction_type: TransactionTypeSchema,
    listing_type: ListingTypeSchema,
    price: z.number(),
    surface_m2: z.number(),
    rooms: z.number(),
    bathrooms: z.number().nullable().optional(),
    floor: z.number().nullable().optional(),
    city: z.string(),
    neighborhood: z.string(),
    street: z.string().nullable().optional(),
    description: z.string(),
    quality_score: z.number().nullable().optional(),
});

export type BaseListing = z.infer<typeof baseListingSchema>;

// Listing summary schema - compact representation for search results
export const listingSummarySchema = baseListingSchema.extend({
    cover_image: listingImageSchema.nullable().optional(),
});

export type ListingSummary = z.infer<typeof listingSummarySchema>;

// Listing summary data - wraps the summary with search metadata
export const listingSummaryDataSchema = z.object({
    items: z.array(listingSummarySchema),
    total: z.number(),
    page: z.number(),
    limit: z.number(),
    total_pages: z.number(),
});

export type ListingSummaryData = z.infer<typeof listingSummaryDataSchema>;

// Listing detail schema - full listing representation for detail page
export const listingDetailSchema = baseListingSchema.extend({
    has_elevator: z.boolean().nullable().optional(),
    has_terrace: z.boolean().nullable().optional(),
    has_air_conditioning: z.boolean().nullable().optional(),
    has_heating: z.boolean().nullable().optional(),
    has_garage: z.boolean().nullable().optional(),
    has_furniture: z.boolean().nullable().optional(),
    year_built: z.number().nullable().optional(),
    images: z.array(listingImageSchema).default([]),
});

export type ListingDetailsData = z.infer<typeof listingDetailSchema>;

// Parse request schema for smart search
export const genAIParseRequestSchema = z.object({
    query: z.string().max(300),
});

export type GenAIParseRequest = z.infer<typeof genAIParseRequestSchema>;

// Sort type combining sort_by and sort_order
export const sortTypeSchema = z.object({
    sort_by: SortBySchema,
    sort_order: SortOrderSchema,
});

export type SortType = z.infer<typeof sortTypeSchema>;
