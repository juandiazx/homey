import { useMutation } from "@tanstack/react-query";
import { parseSearchQuery } from "@/lib/api/api";

export function useParseSearch() {
    return useMutation({
        mutationFn: (query: string) => parseSearchQuery({ query }),
    });
}
