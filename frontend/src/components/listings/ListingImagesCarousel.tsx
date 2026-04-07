import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselNext,
    CarouselPrevious,
} from "@/components/ui/carousel";
import type { ListingImage } from "@/lib/schemas";

interface ListingImagesCarouselProps {
    images: ListingImage[];
    title: string;
}

export function ListingImagesCarousel({
    images,
    title,
}: ListingImagesCarouselProps) {
    if (images.length === 0) {
        return (
            <div className="flex h-96 items-center justify-center rounded-lg border bg-muted">
                <p className="text-muted-foreground">No images available</p>
            </div>
        );
    }

    return (
        <Carousel className="w-full">
            <CarouselContent>
                {images.map((image, index) => (
                    <CarouselItem key={image.id}>
                        <div className="relative h-96 w-full overflow-hidden rounded-lg bg-muted">
                            <img
                                src={image.url}
                                alt={`${title} - Image ${index + 1}`}
                                className="absolute inset-0 h-full w-full object-cover"
                                loading={index === 0 ? "eager" : "lazy"}
                            />
                        </div>
                    </CarouselItem>
                ))}
            </CarouselContent>
            {images.length > 1 && (
                <>
                    <CarouselPrevious className="left-4" />
                    <CarouselNext className="right-4" />
                </>
            )}
        </Carousel>
    );
}
