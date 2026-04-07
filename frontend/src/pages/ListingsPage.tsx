import { Suspense } from "react";
import { Header } from "@/components/layout/header";
import { ListingSummaries } from "@/components/listings/ListingSummaries";
import { Skeleton } from "@/components/ui/skeleton";

function ListingsLoading() {
    return (
        <div className="flex gap-8">
            <div className="flex-1 space-y-6">
                <div className="flex items-center justify-between">
                    <Skeleton className="h-8 w-64" />
                    <Skeleton className="h-9 w-44" />
                </div>
                <div className="space-y-4">
                    {Array.from({ length: 3 }).map((_, i) => (
                        <Skeleton key={i} className="h-48 w-full" />
                    ))}
                </div>
            </div>
            <div className="hidden w-80 shrink-0 lg:block">
                <Skeleton className="h-64 w-full" />
            </div>
        </div>
    );
}

export default function ListingsPage() {
    return (
        <div className="flex min-h-screen flex-col bg-background">
            <Header />
            <main className="container mx-auto max-w-7xl flex-1 px-8 py-8">
                <Suspense fallback={<ListingsLoading />}>
                    <ListingSummaries />
                </Suspense>
            </main>
        </div>
    );
}
