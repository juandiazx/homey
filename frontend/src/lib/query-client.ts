import { keepPreviousData, QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            staleTime: 1000 * 60,
            gcTime: 1000 * 60 * 5,
            refetchOnWindowFocus: true,
            refetchOnReconnect: true,
            retry: false,
            refetchOnMount: true,
            placeholderData: keepPreviousData,
        },
    },
});
