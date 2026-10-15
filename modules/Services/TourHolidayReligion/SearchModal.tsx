"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ImageWithFallback } from "@/components/ui/image-with-fallback";
import { Input } from "@/components/ui/input";
import { useFindAllDestinationQuery } from "@/store/services/destination.service";
import { useFindAllLocationQuery } from "@/store/services/location.service";
import { Compass, History, MapPin, Search, Sparkles, X } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface SearchModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onLocationSelect?: (locationName: string) => void;
}

export const SearchModal = ({ open, onOpenChange, onLocationSelect }: SearchModalProps) => {
  const t = useTranslations("TourHoliday");
  const locale = useLocale();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchHistory, setSearchHistory] = useState<string[]>([]);

  // Fetch all destinations
  const { data: response, isLoading: isLoadingDestinations } = useFindAllDestinationQuery();
  const destinations = (response as any)?.data || (response as any)?.datas || [];

  // Fetch all locations (countries and cities)
  const { data: locationResponse, isLoading: isLoadingLocations } = useFindAllLocationQuery();
  const apiLocations = (locationResponse as any)?.data || (locationResponse as any)?.datas || [];

  const isLoading = isLoadingDestinations || isLoadingLocations;

  // Flatten locations for searching
  const flattenedLocations = apiLocations.flatMap((location: any) => {
    const countryLocation = {
      id: location.id,
      name: location.name,
      region: "Negara",
      type: "location"
    };

    const stateLocations = (location.states || []).flatMap((state: any) => {
      const stateLoc = {
        id: state.id,
        name: state.name,
        region: `Wilayah di ${location.name}`,
        type: "location"
      };

      const cityLocs = (state.cities || []).map((city: any) => ({
        id: city.id,
        name: city.name,
        region: `Kota di ${state.name}, ${location.name}`,
        type: "location"
      }));

      return [stateLoc, ...cityLocs];
    });

    return [countryLocation, ...stateLocations];
  });

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

  useEffect(() => {
    if (!open) {
      setSearchQuery("");
    }
  }, [open]);

  const getSearchResults = () => {
    if (!searchQuery.trim()) return [];

    const query = searchQuery.toLowerCase();
    const results: any[] = [];

    flattenedLocations.forEach((location: any) => {
      if (location.name.toLowerCase().includes(query)) {
        results.push({
          id: `loc-${location.id}`,
          name: location.name,
          region: location.region,
          type: "location"
        });
      }
    });

    destinations.forEach((item: any) => {
      const translation = item.translations?.find((tr: any) => tr.language_code === locale);
      const name = translation?.name || item.name || "";
      const location = item.location || "";
      const cityName = item.city_name || "";

      if (
        name.toLowerCase().includes(query) ||
        location.toLowerCase().includes(query) ||
        cityName.toLowerCase().includes(query)
      ) {
        results.push({
          ...item,
          translatedName: name,
          type: "destination"
        });
      }
    });

    return results;
  };

  const getRecommendations = () => {
    const seenNames = new Set<string>();
    const locRecommendations: any[] = [];

    flattenedLocations.forEach((loc: any) => {
      const lowerName = loc.name.toLowerCase();
      if (!seenNames.has(lowerName) && locRecommendations.length < 4) {
        seenNames.add(lowerName);
        locRecommendations.push({
          id: `rec-loc-${loc.id}`,
          name: loc.name,
          region: loc.region,
          type: "location"
        });
      }
    });

    const destRecommendations = destinations.slice(0, 4).map((item: any) => {
      const translation = item.translations?.find((tr: any) => tr.language_code === locale);
      return {
        ...item,
        translatedName: translation?.name || item.name,
        type: "destination"
      };
    });

    return [...locRecommendations, ...destRecommendations];
  };

  const saveSearchHistory = (term: string) => {
    if (!term.trim()) return;
    const newHistory = [term, ...searchHistory.filter((item) => item !== term)].slice(0, 5);
    setSearchHistory(newHistory);
    localStorage.setItem("tour_search_history", JSON.stringify(newHistory));
  };

  const handleClearHistory = () => {
    setSearchHistory([]);
    localStorage.removeItem("tour_search_history");
  };

  const handleClearSearch = () => {
    setSearchQuery("");
  };

  const handleHistoryClick = (item: string) => {
    setSearchQuery(item);
  };

  const searchResults = getSearchResults();
  const recommendations = getRecommendations();
  const displayItems = searchQuery.trim() ? searchResults : recommendations;

  const highlightText = (text: string, query: string) => {
    if (!query.trim() || !text) return text;

    const parts = text.split(new RegExp(`(${query})`, "gi"));
    return (
      <>
        {parts.map((part, index) =>
          part.toLowerCase() === query.toLowerCase() ? (
            <span key={index} className="font-bold text-blue-600">
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
      <DialogContent
        showCloseButton={false}
        className="max-w-2xl gap-0 p-0 overflow-hidden rounded-3xl border-slate-200">
        <DialogHeader className="border-b border-slate-100 p-4">
          <div className="relative flex items-center rounded-2xl border border-slate-200 bg-slate-50 px-4 focus-within:border-blue-600 focus-within:bg-white focus-within:ring-2 focus-within:ring-blue-600/10 transition-all">
            <Search className="h-4 w-4 text-slate-400 mr-2.5 shrink-0" />
            <Input
              type="text"
              placeholder={t("searchPlaceholder")}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-11 w-full border-none bg-transparent text-sm font-medium shadow-none focus-visible:ring-0 p-0 text-slate-900"
              autoFocus
            />
            {searchQuery && (
              <button
                type="button"
                onClick={handleClearSearch}
                className="flex h-6 w-6 items-center justify-center rounded-full text-slate-400 hover:bg-slate-200 hover:text-slate-600">
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
          <DialogTitle className="sr-only">{t("searchDrawerTitle")}</DialogTitle>
        </DialogHeader>

        <div className="max-h-[60vh] overflow-y-auto p-5 no-scrollbar">
          {/* Search History */}
          {!searchQuery.trim() && searchHistory.length > 0 && (
            <div className="mb-6">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <History className="h-4 w-4 text-slate-400" />
                  <h3 className="text-xs font-bold text-slate-700">{t("searchHistory")}</h3>
                </div>
                <button
                  type="button"
                  onClick={handleClearHistory}
                  className="text-xs font-semibold text-rose-600 hover:underline">
                  {t("clearHistory")}
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {searchHistory.map((historyItem, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => handleHistoryClick(historyItem)}
                    className="rounded-xl border border-slate-200 bg-white px-3.5 py-1.5 text-xs font-medium text-slate-700 hover:border-blue-300 hover:bg-blue-50 active:scale-95 transition-all">
                    {historyItem}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Results / Recommendations */}
          <div>
            <div className="mb-3 flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-amber-500" />
              <h3 className="text-xs font-bold text-slate-700">
                {searchQuery.trim() ? t("searchResults") : t("recommendations")}
              </h3>
            </div>

            {isLoading ? (
              <div className="flex h-32 items-center justify-center">
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
              </div>
            ) : displayItems.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {displayItems.map((item: any, index: number) => (
                  <button
                    key={item.id || index}
                    type="button"
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
                    className="flex items-center gap-3 rounded-2xl p-2.5 text-left transition-colors hover:bg-slate-50 border border-slate-100 hover:border-blue-200">
                    {item.type === "location" ? (
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                        <MapPin className="h-5 w-5" />
                      </div>
                    ) : (
                      <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-xl bg-slate-100">
                        <ImageWithFallback
                          src={item.thumbnail || "/images/hero_things_todo_mobile.png"}
                          alt={item.translatedName || item.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-xs sm:text-sm font-bold text-slate-900">
                        {item.type === "location"
                          ? highlightText(item.name, searchQuery)
                          : highlightText(item.translatedName || item.name, searchQuery)}
                      </p>
                      <p className="truncate text-[11px] text-slate-500">
                        {item.type === "location"
                          ? item.region
                          : item.category_destination_name || item.location || "Turkey"}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            ) : searchQuery.trim() ? (
              <div className="flex h-32 flex-col items-center justify-center text-center">
                <Compass className="h-8 w-8 text-slate-300 mb-2" />
                <p className="text-xs font-medium text-slate-500">
                  {t("noResults", { query: searchQuery })}
                </p>
              </div>
            ) : null}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
