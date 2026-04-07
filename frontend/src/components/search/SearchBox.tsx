import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ClassicalSearchWithFilters } from "./ClassicalSearchWithFilters";
import { SmartSearch } from "./SmartSearch";
import { SearchModeSchema, type SearchMode } from "@/lib/schemas";
import { SlidersHorizontal, Sparkle } from "lucide-react";
export function SearchBox() {
    const [searchMode, setSearchMode] = useState<SearchMode>(
        SearchModeSchema.enum.classical
    );

    return (
        <Card className="w-full max-w-4xl shadow-lg">
            <CardHeader>
                <CardTitle className="text-2xl font-semibold text-balance">
                    Your next home is just a few clicks away
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div>
                    <label className="text-sm font-medium text-muted-foreground">
                        Search mode:
                    </label>
                    <Tabs
                        value={searchMode}
                        onValueChange={(v) => setSearchMode(v as SearchMode)}
                    >
                        <TabsList className="w-fit">
                            <TabsTrigger
                                className="cursor-pointer"
                                value={SearchModeSchema.enum.classical}
                            >
                                <SlidersHorizontal className="size-4" />
                                Classical
                            </TabsTrigger>
                            <TabsTrigger
                                className="cursor-pointer"
                                value={SearchModeSchema.enum.smart}
                            >
                                <Sparkle className="size-4" />
                                Smart
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent
                            value={SearchModeSchema.enum.classical}
                            className="mt-4"
                        >
                            <ClassicalSearchWithFilters />
                        </TabsContent>

                        <TabsContent
                            value={SearchModeSchema.enum.smart}
                            className="mt-4"
                        >
                            <SmartSearch />
                        </TabsContent>
                    </Tabs>
                </div>
            </CardContent>
        </Card>
    );
}
