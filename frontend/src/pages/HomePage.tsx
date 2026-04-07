import { Header } from "@/components/layout/header";
import { SearchBox } from "@/components/search/SearchBox";

export default function HomePage() {
    return (
        <div className="relative flex min-h-screen flex-col">
            <Header />

            <main className="relative flex flex-1 flex-col">
                <div
                    className="absolute inset-0 bg-cover bg-center bg-no-repeat"
                    style={{
                        backgroundImage:
                            "url('https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1920&h=1080&fit=crop')",
                    }}
                >
                    <div className="absolute inset-0 bg-gradient-to-b from-white/90 via-white/70 to-white/90" />
                </div>

                <div className="relative flex flex-1 items-center justify-center px-4 py-16">
                    <SearchBox />
                </div>
            </main>
        </div>
    );
}
