import { Routes, Route } from "react-router-dom";
import HomePage from "@/pages/HomePage";
import ListingsPage from "@/pages/ListingsPage";
import ListingDetailsPage from "@/pages/ListingDetailsPage";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "sonner";
import { queryClient } from "@/lib/query-client";

export default function App() {
    return (
        <QueryClientProvider client={queryClient}>
            <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/listings" element={<ListingsPage />} />
                <Route path="/listings/:id" element={<ListingDetailsPage />} />
            </Routes>
            <Toaster position="top-right" />
        </QueryClientProvider>
    );
}
