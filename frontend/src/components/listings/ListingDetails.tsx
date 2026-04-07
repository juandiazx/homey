import { useState, Suspense, lazy } from "react";
import { useListingDetail } from "@/lib/api/queries.ts";
import { ListingImagesCarousel } from "./ListingImagesCarousel.tsx";
import { ListingDetailsCharacteristics } from "./ListingDetailsCharacteristics.tsx";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import {
    Empty,
    EmptyHeader,
    EmptyMedia,
    EmptyTitle,
    EmptyDescription,
} from "@/components/ui/empty";
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Button } from "@/components/ui/button";
import { AlertCircle, ChevronDown, ChevronUp, Search } from "lucide-react";
import {
    formatPrice,
    formatListingSpecs,
    formatLocation,
    formatTransactionType,
} from "@/lib/format";
import { TransactionTypeSchema } from "@/lib/schemas.ts";

interface ListingDetailContentProps {
    listingId: string;
}

// Lazy-load the map to avoid SSR issues and keep bundle small
const BarcelonaMap = lazy(() => import("./Map.tsx"));

export function ListingDetailContent({ listingId }: ListingDetailContentProps) {
    const { data: listing, isLoading, error } = useListingDetail(listingId);
    const [descriptionOpen, setDescriptionOpen] = useState(false);

    if (isLoading) {
        return <ListingDetailSkeleton />;
    }

    if (error || !listing) {
        return (
            <Empty>
                <EmptyHeader>
                    <EmptyMedia variant="icon">
                        <AlertCircle />
                    </EmptyMedia>
                    <EmptyTitle>Listing not found</EmptyTitle>
                    <EmptyDescription>
                        The listing you are looking for does not exist or has
                        been removed.
                    </EmptyDescription>
                </EmptyHeader>
            </Empty>
        );
    }

    const isRent = listing.transaction_type === "rent";

    return (
        <div className="space-y-8">
            {/* Image Carousel */}
            <ListingImagesCarousel
                images={listing.images}
                title={listing.title}
            />

            {/* Badge, Price and Location */}
            <div className="space-y-2">
                <Badge
                    variant={isRent ? "secondary" : "default"}
                    className="shrink-0"
                >
                    {isRent
                        ? formatTransactionType(TransactionTypeSchema.enum.rent)
                        : formatTransactionType(TransactionTypeSchema.enum.buy)}
                </Badge>

                <div className="flex items-baseline gap-2 flex-wrap">
                    <p className="text-3xl font-bold text-primary">
                        {formatPrice(listing.price)}
                    </p>
                    {isRent && (
                        <span className="text-base text-muted-foreground">
                            / month
                        </span>
                    )}
                </div>

                <p className="text-lg font-semibold">
                    {formatLocation(listing)}
                </p>
                <div className="flex flex-row justify-between items-center gap-2">
                    <p className="text-muted-foreground">
                        {formatListingSpecs(listing)}
                    </p>
                    <Button onClick={() => {}} className="gap-2 cursor-pointer">
                        <Search className="size-4" />
                        Contact agent
                    </Button>
                </div>
            </div>

            <Separator />

            {/* Description */}
            <section className="space-y-2">
                <h2 className="text-xl font-semibold">Description</h2>
                <Collapsible
                    open={descriptionOpen}
                    onOpenChange={setDescriptionOpen}
                >
                    {!descriptionOpen && (
                        <p className="text-muted-foreground leading-relaxed whitespace-pre-line line-clamp-4">
                            {listing.description}
                        </p>
                    )}
                    <CollapsibleContent>
                        <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
                            {listing.description}
                        </p>
                    </CollapsibleContent>
                    <div className="flex justify-center mt-3">
                        <CollapsibleTrigger asChild>
                            <Button
                                variant="ghost"
                                size="sm"
                                className="gap-1 text-muted-foreground cursor-pointer"
                            >
                                {descriptionOpen ? (
                                    <>
                                        Show less{" "}
                                        <ChevronUp className="h-4 w-4" />
                                    </>
                                ) : (
                                    <>
                                        Show more{" "}
                                        <ChevronDown className="h-4 w-4" />
                                    </>
                                )}
                            </Button>
                        </CollapsibleTrigger>
                    </div>
                </Collapsible>
            </section>

            <Separator />

            {/* Characteristics */}
            <ListingDetailsCharacteristics listing={listing} />

            <Separator />

            {/* Map */}
            <section className="space-y-3">
                <h2 className="text-xl font-semibold">Location</h2>
                <p className="text-sm text-muted-foreground">
                    {listing.neighborhood}, {listing.city}
                </p>
                <Suspense
                    fallback={
                        <div className="flex items-center justify-center rounded-lg border bg-muted h-80">
                            <span className="text-sm text-muted-foreground">
                                Loading map…
                            </span>
                        </div>
                    }
                >
                    <BarcelonaMap neighborhood={listing.neighborhood} />
                </Suspense>
            </section>
        </div>
    );
}

function ListingDetailSkeleton() {
    return (
        <div className="space-y-8">
            <Skeleton className="h-96 w-full rounded-lg" />
            <div className="space-y-2">
                <Skeleton className="h-6 w-24" />
                <Skeleton className="h-7 w-3/4" />
                <Skeleton className="h-10 w-40" />
                <Skeleton className="h-6 w-64" />
                <Skeleton className="h-5 w-48" />
            </div>
            <Skeleton className="h-px w-full" />
            <div className="space-y-3">
                <Skeleton className="h-7 w-32" />
                <Skeleton className="h-24 w-full" />
            </div>
            <Skeleton className="h-px w-full" />
            <div className="space-y-3">
                <Skeleton className="h-7 w-40" />
                <div className="space-y-2">
                    {Array.from({ length: 5 }).map((_, i) => (
                        <Skeleton key={i} className="h-5 w-40" />
                    ))}
                </div>
            </div>
            <Skeleton className="h-px w-full" />
            <div className="space-y-3">
                <Skeleton className="h-7 w-24" />
                <Skeleton className="h-4 w-40" />
                <Skeleton className="h-80 w-full rounded-lg" />
            </div>
        </div>
    );
}
