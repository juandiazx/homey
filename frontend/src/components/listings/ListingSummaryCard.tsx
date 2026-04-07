import { Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import type { ListingSummary } from "@/lib/schemas";
import {
    formatPrice,
    formatListingSpecs,
    formatLocation,
    truncateText,
    formatTransactionType,
} from "@/lib/format";

interface ListingCardProps {
    listing: ListingSummary;
}

export function ListingSummaryCard({ listing }: ListingCardProps) {
    const { id, title, price, cover_image, description, transaction_type } =
        listing;

    const isRent = transaction_type === "rent";

    return (
        <Link to={`/listings/${id}`} className="cursor-pointer block">
            <Card className="group flex flex-row gap-0 overflow-hidden p-0 transition-shadow hover:shadow-md cursor-pointer">
                <div className="relative h-48 w-48 shrink-0 bg-muted">
                    {cover_image?.url ? (
                        <img
                            src={cover_image.url}
                            alt={title}
                            className="absolute inset-0 h-full w-full object-cover transition-transform group-hover:scale-105"
                        />
                    ) : (
                        <div className="flex h-full w-full items-center justify-center bg-muted">
                            <span className="text-muted-foreground text-sm">
                                No image
                            </span>
                        </div>
                    )}
                </div>

                <div className="flex flex-1 flex-col justify-between p-4 min-w-0">
                    <div className="space-y-1.5">
                        <div className="flex items-center gap-2 flex-wrap">
                            <p className="text-2xl font-semibold text-primary">
                                {formatPrice(price)}
                                {isRent && (
                                    <span className="text-base font-normal text-muted-foreground ml-1">
                                        / month
                                    </span>
                                )}
                            </p>
                            <Badge
                                variant={isRent ? "secondary" : "default"}
                                className="shrink-0"
                            >
                                {isRent
                                    ? formatTransactionType(transaction_type)
                                    : formatTransactionType(transaction_type)}
                            </Badge>
                        </div>

                        <p className="font-semibold text-foreground truncate">
                            {formatLocation(listing)}
                        </p>

                        <p className="text-sm font-medium text-foreground/80 line-clamp-1">
                            {truncateText(title, 100)}
                        </p>

                        {description && (
                            <p className="text-sm text-muted-foreground line-clamp-2">
                                {truncateText(description, 200)}
                            </p>
                        )}
                    </div>

                    <p className="mt-2 text-sm text-muted-foreground">
                        {formatListingSpecs(listing)}
                    </p>
                </div>
            </Card>
        </Link>
    );
}

export function ListingCardSkeleton() {
    return (
        <Card className="flex flex-row gap-0 overflow-hidden p-0">
            <Skeleton className="h-48 w-48 shrink-0 rounded-none" />
            <div className="flex flex-1 flex-col justify-between p-4">
                <div className="space-y-2">
                    <Skeleton className="h-8 w-32" />
                    <Skeleton className="h-5 w-48" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                </div>
                <Skeleton className="h-4 w-40" />
            </div>
        </Card>
    );
}
