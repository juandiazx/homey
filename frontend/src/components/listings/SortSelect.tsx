import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    SortBySchema,
    SortOrderSchema,
    type SortBy,
    type SortOrder,
} from "@/lib/schemas";

interface SortSelectProps {
    sortBy: SortBy;
    sortOrder: SortOrder;
    onSortChange: (sortBy: SortBy, sortOrder: SortOrder) => void;
}

// Combined sort options for better UX
const SORT_OPTIONS = [
    {
        value: `${SortBySchema.enum.relevance}_${SortOrderSchema.enum.desc}`,
        label: "Relevance",
    },
    {
        value: `${SortBySchema.enum.price}_${SortOrderSchema.enum.asc}`,
        label: "Price: Low to High",
    },
    {
        value: `${SortBySchema.enum.price}_${SortOrderSchema.enum.desc}`,
        label: "Price: High to Low",
    },
    {
        value: `${SortBySchema.enum.surface}_${SortOrderSchema.enum.asc}`,
        label: "Surface: Small to Large",
    },
    {
        value: `${SortBySchema.enum.surface}_${SortOrderSchema.enum.desc}`,
        label: "Surface: Large to Small",
    },
] as const;

export function SortSelect({
    sortBy,
    sortOrder,
    onSortChange,
}: SortSelectProps) {
    const currentValue = `${sortBy}_${sortOrder}`;

    const handleChange = (value: string) => {
        const [newSortBy, newSortOrder] = value.split("_") as [
            SortBy,
            SortOrder,
        ];
        onSortChange(newSortBy, newSortOrder);
    };

    return (
        <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Sort:</span>
            <Select value={currentValue} onValueChange={handleChange}>
                <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                    {SORT_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                            {option.label}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </div>
    );
}
