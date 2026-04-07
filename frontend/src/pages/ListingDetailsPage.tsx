import { Suspense } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Header } from "@/components/layout/header";
import { ListingDetailContent } from "@/components/listings/ListingDetails";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

function ListingDetailLoading() {
    return (
        <div className="space-y-8">
            <Skeleton className="h-96 w-full rounded-lg" />
            <div className="space-y-2">
                <Skeleton className="h-10 w-40" />
                <Skeleton className="h-6 w-64" />
                <Skeleton className="h-5 w-48" />
            </div>
            <Skeleton className="h-px w-full" />
            <div className="space-y-3">
                <Skeleton className="h-7 w-32" />
                <Skeleton className="h-24 w-full" />
            </div>
        </div>
    );
}

export default function ListingDetailsPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    return (
        <div className="flex min-h-screen flex-col bg-background">
            <Header />
            <main className="container mx-auto max-w-3xl flex-1 px-4 py-8">
                <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="mb-6 gap-2 -ml-2 cursor-pointer"
                    onClick={() => navigate(-1)}
                >
                    <ArrowLeft className="size-4" />
                    Go back
                </Button>

                <Suspense fallback={<ListingDetailLoading />}>
                    <ListingDetailContent listingId={id!} />
                </Suspense>
            </main>
        </div>
    );
}
