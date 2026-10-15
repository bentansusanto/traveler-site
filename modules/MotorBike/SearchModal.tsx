"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ImageWithFallback } from "@/components/ui/image-with-fallback";
import { Input } from "@/components/ui/input";
import { useFindAllMotorsQuery } from "@/store/services/motor.service";
import { useFindAllLocationQuery } from "@/store/services/location.service";
import { Bike, ChevronRight, History, MapPin, Search, Sparkles, X } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface SearchModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onLocationSelect?: (locationName: string) => void;
}

export const SearchModal = ({ open, onOpenChange, onLocationSelect }: SearchModalProps) => {
  const locale = useLocale();
  const t = useTranslations("MotorBike");
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchHistory, setSearchHistory] = useState<string[]>([]);

  // Fetch all motors
  const { data: response, isLoading: isLoadingMotors } = useFindAllMotorsQuery({
    limit: 100
  });
  const motors = response?.data || response?.datas || [];

  // Fetch all locations (countries and cities)
  const { data: locationResponse, isLoading: isLoadingLocations } = useFindAllLocationQuery();
  const apiLocations = locationResponse?.data || locationResponse?.datas || [];

  const isLoading = isLoadingMotors || isLoadingLocations;

  // Flatten the hierarchy to get a list of states and cities for search
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

  // Load search history from localStorage on mount
  useEffect(() => {
    const savedHistory = localStorage.getItem("motor_search_history");
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

  // Filter motors based on search query
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

    // Search in motors
    motors.forEach((motor: any) => {
      const translation =
        motor.translations?.find((t: any) => t.language_code === locale) || motor.translations?.[0];
      const name = translation?.name_motor || "";
      const location = motor.state?.name || "";

      if (name.toLowerCase().includes(query) || location.toLowerCase().includes(query)) {
        results.push({
          ...motor,
          translatedName: name,
          thumbnail: motor.thumbnail,
          type: "motor"
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
    localStorage.setItem("motor_search_history", JSON.stringify(newHistory));
  };

  const handleHistoryClick = (historyItem: string) => {
    setSearchQuery(historyItem);
  };

  const handleClearSearch = () => {
    setSearchQuery("");
  };

  const handleClearHistory = () => {
    setSearchHistory([]);
    localStorage.removeItem("motor_search_history");
  };

  // Get top 7 motors to display when search is empty
  const getTopMotors = () => {
    return motors.slice(0, 7).map((motor: any) => {
      const translation =
        motor.translations?.find((t: any) => t.language_code === locale) || motor.translations?.[0];
      return {
        ...motor,
        translatedName: translation?.name_motor || "Motor",
        thumbnail: motor.thumbnail,
        type: "motor"
      };
    });
  };

  const displayItems = searchQuery.trim() ? getSearchResults() : getTopMotors();

  const highlightText = (text: string, query: string) => {
    if (!query.trim()) return text;

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
      <DialogContent showCloseButton={false} className="max-w-2xl overflow-hidden p-0 rounded-3xl border border-slate-200 shadow-2xl">
        <DialogTitle className="sr-only">{t("searchDrawerTitle")}</DialogTitle>
        <DialogHeader className="border-b border-slate-100 p-4 bg-white">
          <div className="relative w-full flex items-center">
            <Search className="absolute left-3.5 h-5 w-5 text-slate-400" />
            <Input
              type="text"
              placeholder={t("searchPlaceholder")}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-12 w-full border-none bg-slate-50 pr-10 pl-11 text-base font-medium rounded-2xl shadow-none focus-visible:ring-2 focus-visible:ring-blue-500 text-slate-900"
              autoFocus
            />
            {searchQuery && (
              <button
                type="button"
                onClick={handleClearSearch}
                className="absolute right-3 flex h-6 w-6 items-center justify-center rounded-full bg-slate-200 text-slate-600 hover:bg-slate-300 transition-colors">
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </DialogHeader>

        <div className="max-h-[70vh] flex-1 overflow-y-auto pb-4 bg-white">
          {/* Search History Section - Only show when not searching */}
          {!searchQuery.trim() && searchHistory.length > 0 && (
            <div className="border-b border-slate-100 p-5">
              <div className="mb-3 flex items-center justify-between">
                <h4 className="flex items-center gap-1.5 text-xs font-semibold text-slate-800">
                  <History className="h-3.5 w-3.5 text-slate-400" />
                  <span>{t("recentSearch")}</span>
                </h4>
                <button
                  onClick={handleClearHistory}
                  className="text-xs font-semibold text-blue-600 hover:text-blue-700">
                  {t("clearHistory")}
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {searchHistory.map((historyItem, index) => (
                  <button
                    key={index}
                    onClick={() => handleHistoryClick(historyItem)}
                    className="rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-1.5 text-xs font-medium text-slate-700 transition-all hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700 active:scale-95">
                    {historyItem}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Results List */}
          <div className="p-4">
            <h4 className="mb-3 px-2 text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5 text-amber-500" />
              <span>{searchQuery.trim() ? t("searchResults") : t("recommendations")}</span>
            </h4>

            {isLoading ? (
              <div className="flex h-32 items-center justify-center">
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
              </div>
            ) : displayItems.length > 0 ? (
              <div className="space-y-1">
                {displayItems.map((item: any, index: number) => (
                  <button
                    key={item.id || index}
                    onClick={() => {
                      saveSearchHistory(item.name || item.translatedName);
                      if (item.type === "motor") {
                        router.push(`/${locale}/motor-bike/${item.id}`);
                      } else if (item.type === "location") {
                        onLocationSelect?.(item.name);
                      }
                      onOpenChange(false);
                    }}
                    className="group flex w-full items-center gap-4 rounded-2xl p-3 text-left transition-all hover:bg-blue-50/70 active:bg-blue-100/50">
                    {item.type === "location" ? (
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600 transition-colors group-hover:bg-blue-100">
                        <MapPin className="h-6 w-6" />
                      </div>
                    ) : (
                      <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-xl border border-slate-100 bg-slate-100">
                        <ImageWithFallback
                          src={item.thumbnail || "/images/placeholder.jpg"}
                          alt={item.translatedName || item.name}
                          fill
                          className="object-cover"
                          fallbackSrc="/images/placeholder.jpg"
                        />
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-slate-900 group-hover:text-blue-700">
                        {item.type === "location"
                          ? highlightText(item.name, searchQuery)
                          : highlightText(item.translatedName || item.name, searchQuery)}
                      </p>
                      <p className="truncate text-xs text-slate-500 mt-0.5">
                        {item.type === "location" ? (
                          item.region
                        ) : (
                          <>
                            {item.merek?.name_merek || "Motor"} • {item.state?.name || "Turkey"}
                          </>
                        )}
                      </p>
                    </div>
                    <ChevronRight className="h-4 w-4 -translate-x-2 text-slate-300 opacity-0 transition-all group-hover:translate-x-0 group-hover:text-blue-500 group-hover:opacity-100" />
                  </button>
                ))}
              </div>
            ) : searchQuery.trim() ? (
              <div className="flex h-48 flex-col items-center justify-center text-center">
                <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-50 text-slate-300">
                  <Bike className="h-8 w-8" />
                </div>
                <p className="text-sm font-bold text-slate-900">{t("emptyTitle")}</p>
                <p className="mt-1 text-xs text-slate-500">
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

