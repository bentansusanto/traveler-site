"use client";

import Icon from "@/components/icon";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useFindAllDestinationQuery } from "@/store/services/destination.service";
import { useFindAllLocationQuery } from "@/store/services/location.service";
import { useLocale } from "next-intl";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface SearchModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onLocationSelect?: (locationName: string) => void;
}

export const SearchModal = ({ open, onOpenChange, onLocationSelect }: SearchModalProps) => {
  const locale = useLocale();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchHistory, setSearchHistory] = useState<string[]>([]);

  // Fetch all destinations
  const { data: response, isLoading: isLoadingDestinations } = useFindAllDestinationQuery();
  const destinations = response?.data || [];

  // Fetch all locations (countries and cities)
  const { data: locationResponse, isLoading: isLoadingLocations } = useFindAllLocationQuery();
  const countries = locationResponse?.data || [];

  const isLoading = isLoadingDestinations || isLoadingLocations;

  // Flatten locations for searching
  const flattenedLocations = countries.flatMap((country: any) => {
    const countryLocation = {
      id: country.id,
      name: country.name,
      region: "Negara",
      type: "location"
    };

    const cityLocations = (country.cities || []).map((city: any) => ({
      id: city.id,
      name: city.name,
      region: `Wilayah di ${country.name}`,
      type: "location"
    }));

    return [countryLocation, ...cityLocations];
  });

  // Load search history from localStorage on mount
  useEffect(() => {
    const savedHistory = localStorage.getItem("tour_search_history");
    if (savedHistory) {
      try {
        setSearchHistory(JSON.parse(savedHistory));
      } catch (e) {
        console.error("Failed to parse search history:", e);
      }
    }
  }, []);

  // Reset search when modal closes
  useEffect(() => {
    if (!open) {
      setSearchQuery("");
    }
  }, [open]);

  // Filter destinations based on search query
  const getSearchResults = () => {
    if (!searchQuery.trim()) return [];

    const query = searchQuery.toLowerCase();
    const results: any[] = [];

    // Search in locations
    flattenedLocations.forEach((location: any) => {
      if (location.name.toLowerCase().includes(query)) {
        results.push(location);
      }
    });

    // Search in destinations
    destinations.forEach((dest: any) => {
      const translation =
        dest.translations?.find((t: any) => t.language_code === locale) || dest.translations?.[0];
      const name = translation?.name || "";
      const location = dest.location || "";

      if (name.toLowerCase().includes(query) || location.toLowerCase().includes(query)) {
        results.push({
          ...dest,
          translatedName: name,
          thumbnail: translation?.thumbnail,
          type: "destination"
        });
      }
    });

    return results;
  };

  // Save search to history
  const saveSearchHistory = (query: string) => {
    if (!query.trim()) return;

    const newHistory = [query, ...searchHistory.filter((item) => item !== query)].slice(0, 5);
    setSearchHistory(newHistory);
    localStorage.setItem("tour_search_history", JSON.stringify(newHistory));
  };

  const handleHistoryClick = (historyItem: string) => {
    setSearchQuery(historyItem);
  };

  const handleClearSearch = () => {
    setSearchQuery("");
  };

  const handleClearHistory = () => {
    setSearchHistory([]);
    localStorage.removeItem("tour_search_history");
  };

  // Get top 7 destinations to display when search is empty
  const getTopDestinations = () => {
    return destinations.slice(0, 7).map((dest: any) => {
      const translation =
        dest.translations?.find((t: any) => t.language_code === locale) || dest.translations?.[0];
      return {
        ...dest,
        translatedName: translation?.name || "Unknown",
        thumbnail: translation?.thumbnail,
        type: "destination"
      };
    });
  };

  const displayItems = searchQuery.trim() ? getSearchResults() : getTopDestinations();

  const highlightText = (text: string, query: string) => {
    if (!query.trim()) return text;

    const parts = text.split(new RegExp(`(${query})`, "gi"));
    return (
      <>
        {parts.map((part, index) =>
          part.toLowerCase() === query.toLowerCase() ? (
            <span key={index} className="font-semibold text-blue-600">
              {part}
            </span>
          ) : (
            <span key={index}>{part}</span>
          )
        )}
      </>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl overflow-hidden p-0 sm:rounded-2xl">
        <DialogTitle className="sr-only">Cari Aktivitas atau Destinasi</DialogTitle>
        <DialogHeader className="border-b border-gray-100 p-4 pt-6">
          <div className="relative mr-8 flex items-center">
            <Icon name="Search" className="absolute left-3 size-5 text-gray-400" />
            <Input
              type="text"
              placeholder="Cari aktivitas atau destinasi"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-12 w-full border-none bg-transparent pr-10 pl-10 text-base shadow-none focus-visible:ring-0"
              autoFocus
            />
            {searchQuery && (
              <button
                onClick={handleClearSearch}
                className="absolute right-0 flex size-8 items-center justify-center rounded-full hover:bg-gray-100">
                <Icon name="X" className="size-4 text-gray-400" />
              </button>
            )}
          </div>
        </DialogHeader>

        <div className="max-h-[70vh] flex-1 overflow-y-auto pb-4">
          {/* Search History Section - Only show when not searching */}
          {!searchQuery.trim() && searchHistory.length > 0 && (
            <div className="border-b border-gray-100 p-6">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-sm font-bold text-gray-900">Riwayat Pencarian</h3>
                <button
                  onClick={handleClearHistory}
                  className="text-xs font-semibold text-blue-600 hover:text-blue-700">
                  Hapus
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {searchHistory.map((historyItem, index) => (
                  <button
                    key={index}
                    onClick={() => handleHistoryClick(historyItem)}
                    className="rounded-full border border-gray-200 bg-white px-4 py-2 text-xs font-medium text-gray-700 transition-all hover:border-blue-500 hover:bg-blue-50 hover:text-blue-600 active:scale-95">
                    {historyItem}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Results List */}
          <div className="p-4">
            {isLoading ? (
              <div className="flex h-32 items-center justify-center">
                <div className="size-6 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
              </div>
            ) : displayItems.length > 0 ? (
              <div className="space-y-1">
                <h4 className="mb-3 px-3 text-[10px] font-bold tracking-wider text-gray-400 uppercase">
                  {searchQuery.trim() ? "Hasil Pencarian" : "Rekomendasi Destinasi"}
                </h4>
                {displayItems.map((item: any, index: number) => (
                  <button
                    key={item.id || index}
                    onClick={() => {
                      saveSearchHistory(item.name || item.translatedName);
                      if (item.type === "destination") {
                        router.push(
                          `/${locale}/tour-holiday-religion/${item.translations?.[0]?.slug || item.id}`
                        );
                      } else if (item.type === "location") {
                        onLocationSelect?.(item.name);
                      }
                      onOpenChange(false);
                    }}
                    className="group flex w-full items-center gap-4 rounded-xl p-3 text-left transition-all hover:bg-blue-50">
                    {item.type === "location" ? (
                      <div className="flex size-12 flex-shrink-0 items-center justify-center rounded-xl bg-gray-100 transition-colors group-hover:bg-blue-100">
                        <Icon
                          name="MapPin"
                          className="size-6 text-gray-600 group-hover:text-blue-600"
                        />
                      </div>
                    ) : (
                      <div className="relative size-12 flex-shrink-0 overflow-hidden rounded-xl">
                        <Image
                          src={item.thumbnail || "/images/placeholder.jpg"}
                          alt={item.translatedName || item.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-bold text-gray-900 group-hover:text-blue-700">
                        {item.type === "location"
                          ? highlightText(item.name, searchQuery)
                          : highlightText(item.translatedName || item.name, searchQuery)}
                      </p>
                      <p className="truncate text-xs text-gray-500">
                        {item.type === "location" ? (
                          item.region
                        ) : (
                          <>
                            {item.category || "Tempat Bermain"} • {item.location || "Indonesia"}
                          </>
                        )}
                      </p>
                    </div>
                    <Icon
                      name="ChevronRight"
                      className="size-4 -translate-x-2 text-gray-300 opacity-0 transition-all group-hover:translate-x-0 group-hover:text-blue-400 group-hover:opacity-100"
                    />
                  </button>
                ))}
              </div>
            ) : searchQuery.trim() ? (
              <div className="flex h-48 flex-col items-center justify-center text-center">
                <div className="mb-4 flex size-16 items-center justify-center rounded-full bg-gray-50">
                  <Icon name="SearchX" className="size-8 text-gray-300" />
                </div>
                <p className="text-base font-bold text-gray-900">Tidak ada hasil ditemukan</p>
                <p className="mt-1 text-sm text-gray-500">
                  Coba cari kata kunci lain untuk "{searchQuery}"
                </p>
              </div>
            ) : null}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
