import { useState, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Spinner } from "@/components/ui/spinner";
import {
    type TransactionType,
    type ListingType,
    type ListingSearchParams,
    TransactionTypeSchema,
    ListingTypeSchema,
} from "@/lib/schemas";
import {
    formatTransactionType,
    formatListingType,
    formatPrice,
} from "@/lib/format";
import { buildSearchQueryString } from "@/lib/utils";
import { useFilterOptions } from "@/lib/api/queries";

export function ClassicalSearchWithFilters() {
    const navigate = useNavigate();
    const { data: filterOptions, isLoading } = useFilterOptions();

    const [transactionType, setTransactionType] = useState<
        TransactionType | ""
    >("buy");
    const [listingType, setListingType] = useState<ListingType | "">("flat");
    const [city] = useState<string>("Barcelona");
    const [neighborhood, setNeighborhood] = useState<string>("");
    const [priceRange, setPriceRange] = useState<[number, number]>([
        filterOptions?.price_range.min ?? 0,
        filterOptions?.price_range.max ?? 1000000,
    ]);
    const [surfaceRange, setSurfaceRange] = useState<[number, number]>([
        filterOptions?.surface_range.min ?? 0,
        filterOptions?.surface_range.max ?? 300,
    ]);
    const [roomsRange, setRoomsRange] = useState<[number, number]>([
        filterOptions?.rooms_range.min ?? 1,
        filterOptions?.rooms_range.max ?? 10,
    ]);

    useEffect(() => {
        if (!filterOptions) return;
        setPriceRange([filterOptions.price_range.min, filterOptions.price_range.max]);
        setSurfaceRange([filterOptions.surface_range.min, filterOptions.surface_range.max]);
        setRoomsRange([filterOptions.rooms_range.min, filterOptions.rooms_range.max]);
    }, [filterOptions]);

    const handleSearch = useCallback(() => {
        const params: Partial<ListingSearchParams> = {};

        if (transactionType) params.transaction_type = transactionType;
        if (listingType) params.listing_type = listingType;
        if (city) params.city = city;
        if (neighborhood) params.neighborhood = neighborhood;

        if (filterOptions) {
            if (priceRange[0] !== filterOptions.price_range.min) {
                params.price_min = priceRange[0];
            }
            if (priceRange[1] !== filterOptions.price_range.max) {
                params.price_max = priceRange[1];
            }
            if (surfaceRange[0] !== filterOptions.surface_range.min) {
                params.surface_min = surfaceRange[0];
            }
            if (surfaceRange[1] !== filterOptions.surface_range.max) {
                params.surface_max = surfaceRange[1];
            }
            if (roomsRange[0] !== filterOptions.rooms_range.min) {
                params.rooms_min = roomsRange[0];
            }
            if (roomsRange[1] !== filterOptions.rooms_range.max) {
                params.rooms_max = roomsRange[1];
            }
        }

        const queryString = buildSearchQueryString(params);
        navigate(`/listings${queryString ? `?${queryString}` : ""}`);
    }, [
        transactionType,
        listingType,
        city,
        neighborhood,
        priceRange,
        surfaceRange,
        roomsRange,
        filterOptions,
        navigate,
    ]);

    if (isLoading || !filterOptions) {
        return (
            <div className="flex items-center justify-center py-8">
                <Spinner className="size-6" />
            </div>
        );
    }

    const neighborhoods = filterOptions.neighborhoods ?? [];

    return (
        <div className="space-y-6">
            {/* Row 1: Transaction, type, city, neighborhood */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <Select
                    value={transactionType}
                    onValueChange={(v) =>
                        setTransactionType(v as TransactionType)
                    }
                >
                    <SelectTrigger className="cursor-pointer w-full">
                        <SelectValue placeholder="Buy or Rent" />
                    </SelectTrigger>
                    <SelectContent>
                        {TransactionTypeSchema.options.map(
                            (type: TransactionType) => (
                                <SelectItem
                                    key={type}
                                    value={type}
                                    className="cursor-pointer"
                                >
                                    {formatTransactionType(type)}
                                </SelectItem>
                            )
                        )}
                    </SelectContent>
                </Select>

                <Select
                    value={listingType}
                    onValueChange={(v) => setListingType(v as ListingType)}
                >
                    <SelectTrigger className="cursor-pointer w-full">
                        <SelectValue placeholder="Property type" />
                    </SelectTrigger>
                    <SelectContent>
                        {ListingTypeSchema.options.map((type: ListingType) => (
                            <SelectItem
                                key={type}
                                value={type}
                                className="cursor-pointer"
                            >
                                {formatListingType(type)}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                <Select value={city} disabled>
                    <SelectTrigger className="cursor-default bg-muted/50 w-full">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="Barcelona">
                            Barcelona, Spain
                        </SelectItem>
                    </SelectContent>
                </Select>

                <Select value={neighborhood} onValueChange={setNeighborhood}>
                    <SelectTrigger className="cursor-pointer w-full">
                        <SelectValue placeholder="Neighborhood" />
                    </SelectTrigger>
                    <SelectContent className="max-h-64 overflow-y-auto">
                        {neighborhoods.map((n) => (
                            <SelectItem
                                key={n}
                                value={n}
                                className="cursor-pointer"
                            >
                                {n}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            {/* Row 2: Sliders + Search button */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-4 items-end">
                <div className="space-y-3">
                    <label className="text-sm font-medium">Price (€)</label>
                    <Slider
                        min={filterOptions.price_range.min}
                        max={filterOptions.price_range.max}
                        step={10000}
                        value={priceRange}
                        onValueChange={(v) =>
                            setPriceRange(v as [number, number])
                        }
                    />
                    <div className="flex justify-between text-xs text-muted-foreground">
                        <span>{formatPrice(priceRange[0])}</span>
                        <span>{formatPrice(priceRange[1])}</span>
                    </div>
                </div>

                <div className="space-y-3">
                    <label className="text-sm font-medium">Surface (m²)</label>
                    <Slider
                        min={filterOptions.surface_range.min}
                        max={filterOptions.surface_range.max}
                        step={5}
                        value={surfaceRange}
                        onValueChange={(v) =>
                            setSurfaceRange(v as [number, number])
                        }
                    />
                    <div className="flex justify-between text-xs text-muted-foreground">
                        <span>{surfaceRange[0]} m²</span>
                        <span>{surfaceRange[1]} m²</span>
                    </div>
                </div>

                <div className="space-y-3">
                    <label className="text-sm font-medium">Rooms</label>
                    <Slider
                        min={filterOptions.rooms_range.min}
                        max={filterOptions.rooms_range.max}
                        step={1}
                        value={roomsRange}
                        onValueChange={(v) =>
                            setRoomsRange(v as [number, number])
                        }
                    />
                    <div className="flex justify-between text-xs text-muted-foreground">
                        <span>{roomsRange[0]}</span>
                        <span>{roomsRange[1]}</span>
                    </div>
                </div>

                <Button
                    onClick={handleSearch}
                    className="gap-2 h-10 cursor-pointer"
                >
                    <Search className="size-4" />
                    Search
                </Button>
            </div>
        </div>
    );
}
