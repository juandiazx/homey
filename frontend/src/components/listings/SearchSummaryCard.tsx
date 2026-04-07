import { RotateCcw } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import type { ListingSearchParams } from "@/lib/schemas";
import {
    formatPrice,
    formatSurface,
    formatTransactionType,
    formatListingType,
} from "@/lib/format";

interface SearchSummaryCardProps {
    params: Partial<ListingSearchParams>;
}

export function SearchSummaryCard({ params }: SearchSummaryCardProps) {
    const {
        transaction_type,
        listing_type,
        city,
        neighborhood,
        price_min,
        price_max,
        surface_min,
        surface_max,
        rooms_min,
        rooms_max,
    } = params;

    const summaryItems: { label: string; value: string }[] = [];

    if (transaction_type) {
        summaryItems.push({
            label: "Transaction",
            value: formatTransactionType(transaction_type),
        });
    }

    if (listing_type) {
        summaryItems.push({
            label: "Listing type",
            value: formatListingType(listing_type),
        });
    }

    if (city || neighborhood) {
        summaryItems.push({
            label: "Location",
            value: [neighborhood, city].filter(Boolean).join(", "),
        });
    }

    if (price_min != null || price_max != null) {
        const min = price_min != null ? formatPrice(price_min) : "0";
        const max = price_max != null ? formatPrice(price_max) : "Any";
        summaryItems.push({
            label: "Price",
            value: `${min} to ${max}`,
        });
    }

    if (surface_min != null || surface_max != null) {
        const min = surface_min != null ? formatSurface(surface_min) : "0";
        const max = surface_max != null ? formatSurface(surface_max) : "Any";
        summaryItems.push({
            label: "Surface",
            value: `${min} to ${max}`,
        });
    }

    if (rooms_min !== undefined || rooms_max !== undefined) {
        const min = rooms_min !== undefined ? String(rooms_min) : "1";
        const max = rooms_max !== undefined ? String(rooms_max) : "Any";
        summaryItems.push({
            label: "Rooms",
            value: `${min} to ${max}`,
        });
    }

    return (
        <Card className="sticky top-20 w-full">
            <CardHeader className="pb-2">
                <CardTitle className="text-lg">Search summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
                {summaryItems.length > 0 ? (
                    <ul className="space-y-1.5 text-sm">
                        {summaryItems.map((item) => (
                            <li
                                key={item.label}
                                className="flex items-start gap-2"
                            >
                                <span className="text-muted-foreground">•</span>
                                <span>
                                    <span className="font-medium">
                                        {item.label}:
                                    </span>{" "}
                                    {item.value}
                                </span>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p className="text-sm text-muted-foreground">
                        No filters applied
                    </p>
                )}

                <Separator />

                <Button variant="outline" className="w-full gap-2" asChild>
                    <Link to="/">
                        <RotateCcw className="size-4" />
                        Change your search
                    </Link>
                </Button>
            </CardContent>
        </Card>
    );
}
