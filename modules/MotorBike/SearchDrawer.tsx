"use client";

import Icon from "@/components/icon";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerTitle
} from "@/components/ui/drawer";
import { Input } from "@/components/ui/input";
import { useFindAllMotorsQuery } from "@/store/services/motor.service";
import { useFindAllLocationQuery } from "@/store/services/location.service";
import { useLocale } from "next-intl";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface SearchDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onLocationSelect?: (locationName: string) => void;
}

export const SearchDrawer = ({ open, onOpenChange, onLocationSelect }: SearchDrawerProps) => {
  const locale = useLocale();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchHistory, setSearchHistory] = useState<string[]>([]);

  // Fetch all motors
  const { data: response, isLoading: isLoadingMotors } = useFindAllMotorsQuery();
  const motors = response?.data || [];

  // Fetch all locations (countries and cities)
  const { data: locationResponse, isLoading: isLoadingLocations } = useFindAllLocationQuery();
  const countries = locationResponse?.data || [];

  const isLoading = isLoadingMotors || isLoadingLocations;

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
        translatedName: translation?.name_motor || "Unknown",
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
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="h-[90vh] max-h-[90vh]">
        <DrawerTitle></DrawerTitle>
        <DrawerHeader className="border-b border-gray-100 p-4">
          <div className="flex items-center gap-3">
            <DrawerClose asChild>
              <button className="flex size-8 items-center justify-center rounded-full transition-colors hover:bg-gray-100">
                <Icon name="X" className="size-5 text-gray-600" />
              </button>
            </DrawerClose>
            <div className="relative flex flex-1 items-center">
              <Icon name="Search" className="absolute left-3 size-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Cari motor atau lokasi"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-10 w-full rounded-xl border-gray-200 bg-gray-50 pr-10 pl-10 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                autoFocus
              />
              {searchQuery && (
                <button
                  onClick={handleClearSearch}
                  className="absolute right-3 flex size-5 items-center justify-center rounded-full bg-gray-300 transition-colors hover:bg-gray-400">
                  <Icon name="X" className="size-3 text-white" />
                </button>
              )}
            </div>
          </div>
        </DrawerHeader>

        <div className="flex-1 overflow-y-auto">
          {/* Search History Section - Only show when not searching */}
          {!searchQuery.trim() && searchHistory.length > 0 && (
            <div className="border-b border-gray-100 p-4">
              <div className="mb-3 flex items-center justify-between">
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
                    className="flex w-full items-center gap-3 rounded-lg p-3 text-left transition-colors hover:bg-gray-50">
                    {item.type === "location" ? (
                      <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-gray-100">
                        <Icon name="MapPin" className="size-5 text-gray-600" />
                      </div>
                    ) : (
                      <div className="relative size-10 shrink-0 overflow-hidden rounded-lg">
                        <Image
                          src={item.thumbnail || "/images/placeholder.jpg"}
                          alt={item.translatedName || item.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-gray-900">
                        {item.type === "location"
                          ? highlightText(item.name, searchQuery)
                          : highlightText(item.translatedName || item.name, searchQuery)}
                      </p>
                      <p className="truncate text-xs text-gray-500">
                        {item.type === "location" ? (
                          item.region
                        ) : (
                          <>
                            {item.merek?.name_merek || "Motor"} • {item.state?.name || "Indonesia"}
                          </>
                        )}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            ) : searchQuery.trim() ? (
              <div className="flex h-32 flex-col items-center justify-center text-center">
                <Icon name="SearchX" className="mb-2 size-12 text-gray-300" />
                <p className="text-sm font-medium text-gray-500">
                  Tidak ada hasil untuk "{searchQuery}"
                </p>
              </div>
            ) : null}
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
};
