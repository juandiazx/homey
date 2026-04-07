import {
    Check,
    X,
    Building2,
    Sofa,
    Wind,
    Flame,
    Car,
    Home,
} from "lucide-react";
import type { ListingDetailsData } from "@/lib/schemas";

interface ListingDetailsCharacteristicsProps {
    listing: ListingDetailsData;
}

interface ListingDetailsCharacteristicItem {
    label: string;
    value: boolean | null | undefined;
    icon: React.ElementType;
}

export function ListingDetailsCharacteristics({
    listing,
}: ListingDetailsCharacteristicsProps) {
    const characteristics: ListingDetailsCharacteristicItem[] = [
        {
            label: "Furniture included",
            value: listing.has_furniture,
            icon: Sofa,
        },
        {
            label: "Terrace",
            value: listing.has_terrace,
            icon: Home,
        },
        {
            label: "Heating",
            value: listing.has_heating,
            icon: Flame,
        },
        {
            label: "Air conditioning",
            value: listing.has_air_conditioning,
            icon: Wind,
        },
        {
            label: "Garage",
            value: listing.has_garage,
            icon: Car,
        },
        {
            label: "Elevator",
            value: listing.has_elevator,
            icon: Building2,
        },
    ];

    // Filter out items with null/undefined values
    const definedCharacteristics = characteristics.filter(
        (item) => item.value !== null && item.value !== undefined
    );

    if (definedCharacteristics.length === 0) {
        return null;
    }

    return (
        <section className="space-y-3">
            <h2 className="text-xl font-semibold">Characteristics</h2>
            <ul className="space-y-2">
                {definedCharacteristics.map((item) => (
                    <li key={item.label} className="flex items-center gap-3">
                        {item.value ? (
                            <Check className="size-4 text-green-600" />
                        ) : (
                            <X className="size-4 text-red-500" />
                        )}
                        <item.icon className="size-4 text-muted-foreground" />
                        <span
                            className={
                                item.value ? "" : "text-muted-foreground"
                            }
                        >
                            {item.value
                                ? item.label
                                : `No ${item.label.toLowerCase()}`}
                        </span>
                    </li>
                ))}
            </ul>
        </section>
    );
}
