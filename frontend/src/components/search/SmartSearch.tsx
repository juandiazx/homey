import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "sonner";
import { useParseSearch } from "@/lib/api/mutations";
import { buildSearchQueryString } from "@/lib/utils";

const MAX_QUERY_LENGTH = 300;
const PLACEHOLDER_TEXT =
    "Luminous flat in the center of Barcelona, with 3 rooms and 2 bathrooms and elevator...";

export function SmartSearch() {
    const navigate = useNavigate();
    const [query, setQuery] = useState("");
    const { mutateAsync: parseSearch, isPending: isSearching } =
        useParseSearch();

    const handleSearch = async () => {
        if (!query.trim()) {
            toast.error("Please enter a search query");
            return;
        }

        try {
            const parsedParams = await parseSearch(query.trim());
            const params = { ...parsedParams, search_intent: query.trim() };
            const queryString = buildSearchQueryString(params);
            navigate(`/listings${queryString ? `?${queryString}` : ""}`);
        } catch (error) {
            console.error("Failed to parse search query:", error);
            toast.error("Failed to process your search. Please try again.");
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSearch();
        }
    };

    return (
        <div className="space-y-4">
            <div className="flex gap-3">
                <Textarea
                    value={query}
                    onChange={(e) =>
                        setQuery(e.target.value.slice(0, MAX_QUERY_LENGTH))
                    }
                    onKeyDown={handleKeyDown}
                    placeholder={PLACEHOLDER_TEXT}
                    className="min-h-[80px] resize-none"
                    disabled={isSearching}
                />
                <Button
                    onClick={handleSearch}
                    disabled={isSearching || !query.trim()}
                    className="h-auto min-w-[100px] gap-2 cursor-pointer px-6"
                >
                    {isSearching ? (
                        <Spinner className="size-4" />
                    ) : (
                        <Search className="size-4" />
                    )}
                    Search
                </Button>
            </div>
            <p className="text-xs text-muted-foreground text-right">
                {query.length}/{MAX_QUERY_LENGTH} characters
            </p>
        </div>
    );
}
