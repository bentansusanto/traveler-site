"use client";

import Icon from "@/components/icon";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerTitle
} from "@/components/ui/drawer";
import { ImageWithFallback } from "@/components/ui/image-with-fallback";
import { Input } from "@/components/ui/input";
import { useFindAllDestinationQuery } from "@/store/services/destination.service";
import { useFindAllLocationQuery } from "@/store/services/location.service";
import { Search } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

interface HomeSearchProps {
  isMobile?: boolean;
}

export const HomeSearch = ({ isMobile = false }: HomeSearchProps) => {
  const t = useTranslations("HomePage.Hero");
  const locale = useLocale();
  const router = useRouter();

  const [searchQuery, setSearchQuery] = useState("");
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [isFocused, setIsFocused] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Fetch all destinations
  const { data: response, isLoading: isLoadingDestinations } = useFindAllDestinationQuery();
  const destinations = response?.data || [];

  // Fetch all locations (countries and cities)
  const { data: locationResponse, isLoading: isLoadingLocations } = useFindAllLocationQuery();
  const apiLocations = locationResponse?.data || [];

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

  // Load search history from localStorage on mount
  useEffect(() => {
    const savedHistory = localStorage.getItem("home_search_history");
    if (savedHistory) {
      try {
        setSearchHistory(JSON.parse(savedHistory));
      } catch (e) {
        console.error("Failed to parse search history:", e);
      }
    }
  }, []);

  // Handle click outside to close dropdown on desktop
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsFocused(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Reset search when drawer closes
  useEffect(() => {
    if (!isDrawerOpen) {
      setSearchQuery("");
    }
  }, [isDrawerOpen]);

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
        dest.translations?.find((tr: any) => tr.language_code === locale) || dest.translations?.[0];
      const name = translation?.name || "";
      const loc = dest.location || "";
      if (name.toLowerCase().includes(query) || loc.toLowerCase().includes(query)) {
        results.push({
          id: dest.id,
          name: name,
          region: loc,
          category: dest.category_destination_name || "Tour & Travel",
          city_name: dest.city_name,
          thumbnail: dest.thumbnail || translation?.thumbnail || "/images/turkey-destination.jpg",
          type: "destination",
          slug: translation?.slug
        });
      }
    });

    return results.slice(0, 10);
  };

  // Top destinations when drawer is open and search query is empty
  const getTopDestinations = () => {
    return destinations
      .filter((dest: any) => dest.id && dest.translations && dest.translations.length > 0)
      .slice(0, 7)
      .map((dest: any) => {
        const translation =
          dest.translations?.find((tr: any) => tr.language_code === locale) || dest.translations?.[0];
        return {
          id: dest.id,
          name: translation?.name || "Destinasi Tour",
          region: dest.location || "",
          category: dest.category_destination_name || "Tour & Travel",
          city_name: dest.city_name,
          thumbnail: dest.thumbnail || translation?.thumbnail || "/images/turkey-destination.jpg",
          type: "destination",
          slug: translation?.slug
        };
      });
  };

  const saveToHistory = (query: string) => {
    if (!query.trim()) return;
    const newHistory = [query, ...searchHistory.filter((item) => item !== query)].slice(0, 5);
    setSearchHistory(newHistory);
    localStorage.setItem("home_search_history", JSON.stringify(newHistory));
  };

  const handleClearHistory = () => {
    setSearchHistory([]);
    localStorage.removeItem("home_search_history");
  };

  const handleSelect = (item: any) => {
    saveToHistory(item.name);
    setIsFocused(false);
    setIsDrawerOpen(false);

    if (item.type === "destination" && item.slug) {
      router.push(`/${locale}/tour-holiday-religion/${item.slug}`);
    } else if (item.type === "location") {
      router.push(`/${locale}/tour-holiday-religion?location=${item.name}`);
    } else {
      router.push(`/${locale}/tour-holiday-religion?search=${item.name}`);
    }
  };

  const handleSearchHistoryClick = (query: string) => {
    setSearchQuery(query);
  };

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (searchQuery.trim()) {
      saveToHistory(searchQuery.trim());
      setIsFocused(false);
      setIsDrawerOpen(false);
      router.push(`/${locale}/tour-holiday-religion?search=${searchQuery.trim()}`);
    }
  };

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

  const displayItems = searchQuery.trim() ? getSearchResults() : [];
  const drawerDisplayItems = searchQuery.trim() ? getSearchResults() : getTopDestinations();
  const showDropdown = !isMobile && isFocused && (searchHistory.length > 0 || searchQuery.trim().length > 0);

  const tHistory = t.has("searchHistory") ? t("searchHistory") : "Search History";
  const tResults = t.has("searchResults") ? t("searchResults") : "Search Results";
  const tNotFound = t.has("notFound") ? t("notFound") : "No results found";
  const tHint = t.has("searchHint") ? t("searchHint") : "Try changing your keywords.";
  const tClear = t.has("clear") ? t("clear") : "Clear";

  return (
    <div ref={containerRef} className="relative w-full">
      {/* Search Input Bar (Hero Pill) */}
      <form
        onSubmit={(e) => {
          if (isMobile) {
            e.preventDefault();
            setIsDrawerOpen(true);
          } else {
            handleSubmit(e);
          }
        }}
        onClick={() => {
          if (isMobile) {
            setIsDrawerOpen(true);
          }
        }}
        className="relative flex items-center w-full rounded-full transition-all h-14 md:h-16 bg-white p-1.5 md:p-2 shadow-2xl shadow-black/20 cursor-pointer md:cursor-text">
        <div className="absolute inset-y-0 flex items-center left-5 md:left-6 pointer-events-none">
          <Search className="size-5 md:size-6 text-slate-400" />
        </div>
        <input
          type="text"
          placeholder={isMobile ? t("mobileSearchPlaceholder") : t("searchPlaceholder")}
          value={searchQuery}
          readOnly={isMobile}
          onChange={(e) => setSearchQuery(e.target.value)}
          onFocus={() => {
            if (isMobile) {
              setIsDrawerOpen(true);
            } else {
              setIsFocused(true);
            }
          }}
          className={`h-full w-full bg-transparent outline-none font-medium pl-12 md:pl-16 pr-[100px] md:pr-[140px] text-sm md:text-base text-slate-800 placeholder:text-slate-400 ${
            isMobile ? "cursor-pointer" : ""
          }`}
        />
        <div className="absolute inset-y-1.5 md:inset-y-2 right-1.5 md:right-2">
          <button
            type="button"
            onClick={(e) => {
              if (isMobile) {
                e.stopPropagation();
                setIsDrawerOpen(true);
              } else {
                handleSubmit(e);
              }
            }}
            className="h-full rounded-full bg-blue-600 px-6 md:px-8 font-bold text-white text-sm md:text-base transition-all hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-600/40 active:scale-95">
            {t("searchBtn")}
          </button>
        </div>
      </form>

      {/* Desktop Dropdown Menu */}
      {showDropdown && (
        <div className="absolute left-0 right-0 z-50 mt-2 overflow-hidden rounded-2xl bg-white shadow-xl shadow-black/10 border border-slate-100 top-full">
          {isLoading ? (
            <div className="flex h-32 items-center justify-center">
              <div className="size-6 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
            </div>
          ) : (
            <div className="flex flex-col max-h-[300px] overflow-y-auto scrollbar-hide py-2">
              {/* Search History */}
              {!searchQuery.trim() && searchHistory.length > 0 && (
                <div className="px-4 py-3">
                  <div className="mb-3 flex items-center justify-between">
                    <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">{tHistory}</h3>
                    <button
                      type="button"
                      onClick={handleClearHistory}
                      className="text-xs font-semibold text-blue-600 transition-colors hover:text-blue-700">
                      {tClear}
                    </button>
                  </div>
                  <div className="flex flex-col">
                    {searchHistory.map((historyItem, index) => (
                      <button
                        key={index}
                        type="button"
                        onClick={() => handleSearchHistoryClick(historyItem)}
                        className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50">
                        <Icon name="History" className="size-4 text-slate-400" />
                        <span className="truncate">{historyItem}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Search Results */}
              {searchQuery.trim() && (
                <div className="px-2">
                  <h4 className="mb-2 px-3 pt-2 text-[10px] font-bold tracking-wider text-slate-400 uppercase">
                    {tResults}
                  </h4>
                  {displayItems.length > 0 ? (
                    displayItems.map((item: any, index: number) => (
                      <button
                        key={index}
                        type="button"
                        onClick={() => handleSelect(item)}
                        className="flex w-full items-start gap-3 rounded-xl p-3 text-left transition-colors hover:bg-slate-50 focus:bg-slate-50 outline-none">
                        <div className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full bg-slate-100">
                          <Icon
                            name={item.type === "location" ? "MapPin" : "Map"}
                            className="size-4 text-slate-500"
                          />
                        </div>
                        <div className="flex flex-col overflow-hidden">
                          <span className="truncate text-sm font-bold text-slate-900">
                            {item.name}
                          </span>
                          <span className="truncate text-xs font-medium text-slate-500">
                            {item.region}
                          </span>
                        </div>
                      </button>
                    ))
                  ) : (
                    <div className="flex flex-col items-center justify-center px-4 py-8 text-center">
                      <Icon name="SearchX" className="mb-2 size-8 text-slate-300" />
                      <p className="text-sm font-semibold text-slate-600">{tNotFound}</p>
                      <p className="text-xs text-slate-400">{tHint}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Mobile Modal Drawer */}
      <Drawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
        <DrawerContent className="h-[90vh] max-h-[90vh]">
          <DrawerTitle className="sr-only">Search</DrawerTitle>
          <DrawerHeader className="border-b border-slate-100 p-4">
            <div className="flex items-center gap-3">
              <DrawerClose asChild>
                <button className="flex size-8 items-center justify-center rounded-full transition-colors hover:bg-slate-100">
                  <Icon name="X" className="size-5 text-slate-600" />
                </button>
              </DrawerClose>
              <div className="relative flex flex-1 items-center rounded-full border border-slate-200 bg-white transition-colors focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500">
                <Icon name="Search" className="absolute left-4 size-4 text-slate-400" />
                <Input
                  type="text"
                  placeholder={t("searchPlaceholder")}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleSubmit();
                    }
                  }}
                  className="h-10 w-full border-none bg-transparent pr-10 pl-10 text-sm shadow-none focus-visible:ring-0"
                  autoFocus
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery("")}
                    className="absolute right-2 flex size-7 items-center justify-center rounded-full transition-colors hover:bg-slate-100">
                    <Icon name="Delete" className="size-4 text-slate-400 hover:text-red-500 transition-colors" />
                  </button>
                )}
              </div>
            </div>
          </DrawerHeader>

          <div className="flex-1 overflow-y-auto">
            {/* Search History Section - Only show when not searching */}
            {!searchQuery.trim() && searchHistory.length > 0 && (
              <div className="border-b border-slate-100 p-4">
                <div className="mb-3 flex items-center justify-between">
                  <h3 className="text-sm font-bold text-slate-900">{tHistory}</h3>
                  <button
                    type="button"
                    onClick={handleClearHistory}
                    className="text-xs font-semibold text-blue-600 hover:text-blue-700">
                    {tClear}
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {searchHistory.map((historyItem, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => handleSearchHistoryClick(historyItem)}
                      className="rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-medium text-slate-700 transition-all hover:border-blue-500 hover:bg-blue-50 hover:text-blue-600 active:scale-95">
                      {historyItem}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Results / Recommendations List */}
            <div className="p-4">
              {isLoading ? (
                <div className="flex h-32 items-center justify-center">
                  <div className="size-6 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
                </div>
              ) : drawerDisplayItems.length > 0 ? (
                <div className="space-y-1">
                  {drawerDisplayItems.map((item: any, index: number) => (
                    <button
                      key={item.id || index}
                      type="button"
                      onClick={() => handleSelect(item)}
                      className="flex w-full items-center gap-3 rounded-xl p-3 text-left transition-colors hover:bg-slate-50 active:bg-slate-100">
                      {item.type === "location" ? (
                        <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-slate-100">
                          <Icon name="MapPin" className="size-5 text-slate-600" />
                        </div>
                      ) : (
                        <div className="relative size-10 shrink-0 overflow-hidden rounded-xl bg-slate-100">
                          <ImageWithFallback
                            src={item.thumbnail || "/images/turkey-destination.jpg"}
                            alt={item.name}
                            fill
                            className="object-cover"
                            fallbackSrc="/images/turkey-destination.jpg"
                          />
                        </div>
                      )}
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-slate-900">
                          {highlightText(item.name, searchQuery)}
                        </p>
                        <p className="truncate text-xs text-slate-500">
                          {item.type === "location" ? (
                            item.region
                          ) : (
                            <>
                              {item.category || "Tour"} •{" "}
                              {item.city_name
                                ? `${item.city_name}, ${item.region?.split(", ").pop()}`
                                : item.region || "Indonesia"}
                            </>
                          )}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              ) : searchQuery.trim() ? (
                <div className="flex h-32 flex-col items-center justify-center text-center">
                  <Icon name="SearchX" className="mb-2 size-12 text-slate-300" />
                  <p className="text-sm font-medium text-slate-500">
                    {tNotFound}
                  </p>
                </div>
              ) : null}
            </div>
          </div>
        </DrawerContent>
      </Drawer>
    </div>
  );
};
