"use client";

import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerTitle
} from "@/components/ui/drawer";
import { ImageWithFallback } from "@/components/ui/image-with-fallback";
import { Input } from "@/components/ui/input";
import { useFindAllMotorsQuery } from "@/store/services/motor.service";
import { useFindAllLocationQuery } from "@/store/services/location.service";
import { Bike, ChevronRight, History, MapPin, Search, Sparkles, X } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface SearchDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onLocationSelect?: (locationName: string) => void;
}

export const SearchDrawer = ({ open, onOpenChange, onLocationSelect }: SearchDrawerProps) => {
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

  const isLoading = isLoadingMotors || isLoadingLocations;

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

  // Reset search when drawer closes
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
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="h-[90vh] max-h-[90vh] rounded-t-3xl border-t border-slate-200 bg-white">
        <DrawerHeader className="border-b border-slate-100 p-4">
          <div className="flex items-center gap-3">
            <DrawerClose asChild>
              <button className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-600 transition-colors hover:bg-slate-200">
                <X className="h-4 w-4" />
              </button>
            </DrawerClose>
            <div className="relative flex flex-1 items-center">
              <Search className="absolute left-3.5 h-4 w-4 text-slate-400" />
              <Input
                type="text"
                placeholder={t("searchPlaceholder")}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-11 w-full rounded-2xl border-slate-200 bg-slate-50 pr-10 pl-10 text-sm font-medium focus-visible:ring-2 focus-visible:ring-blue-500"
                autoFocus
              />
              {searchQuery && (
                <button
                  onClick={handleClearSearch}
                  className="absolute right-3 flex h-5 w-5 items-center justify-center rounded-full bg-slate-300 text-white transition-colors hover:bg-slate-400">
                  <X className="h-3 w-3" />
                </button>
              )}
            </div>
          </div>
          <DrawerTitle className="sr-only">{t("searchDrawerTitle")}</DrawerTitle>
        </DrawerHeader>

        <div className="flex-1 overflow-y-auto">
          {/* Search History Section - Only show when not searching */}
          {!searchQuery.trim() && searchHistory.length > 0 && (
            <div className="border-b border-slate-100 p-4">
              <div className="mb-2.5 flex items-center justify-between">
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
            <h4 className="mb-2.5 text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
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
                    className="flex w-full items-center gap-3 rounded-2xl p-2.5 text-left transition-colors hover:bg-slate-50 active:bg-blue-50/50">
                    {item.type === "location" ? (
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                        <MapPin className="h-5 w-5" />
                      </div>
                    ) : (
                      <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-xl border border-slate-100 bg-slate-100">
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
                      <p className="truncate text-xs sm:text-sm font-semibold text-slate-900">
                        {item.type === "location"
                          ? highlightText(item.name, searchQuery)
                          : highlightText(item.translatedName || item.name, searchQuery)}
                      </p>
                      <p className="truncate text-[11px] text-slate-500 mt-0.5">
                        {item.type === "location" ? (
                          item.region
                        ) : (
                          <>
                            {item.merek?.name_merek || "Motor"} • {item.state?.name || "Turkey"}
                          </>
                        )}
                      </p>
                    </div>
                    <ChevronRight className="h-4 w-4 text-slate-400 shrink-0" />
                  </button>
                ))}
              </div>
            ) : searchQuery.trim() ? (
              <div className="flex h-36 flex-col items-center justify-center text-center">
                <Bike className="mb-2 h-10 w-10 text-slate-300" />
                <p className="text-xs font-medium text-slate-500">
                  {t("noResults", { query: searchQuery })}
                </p>
              </div>
            ) : null}
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
};

