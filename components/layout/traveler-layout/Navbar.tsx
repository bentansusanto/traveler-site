"use client";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger
} from "@/components/ui/drawer";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { useIsMobile } from "@/hooks/use-mobile";
import { useLogout } from "@/hooks/useLogout";
import { usePathname, useRouter } from "@/lib/languages/routing";
import { MobileNav, NavMenu } from "@/lib/menus/mobile-nav";
import { cn } from "@/lib/utils";
import { useGetUserQuery } from "@/store/services/customer.service";
import { setCurrency } from "@/store/slices/currencySlice";
import { setHasNewBooking } from "@/store/slices/uiSlice";
import Cookies from "js-cookie";
import { ChevronDown, ChevronLeft, ChevronRight, ListChecks, Menu } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import Image from "next/image";
import Link from "next/link";
import * as React from "react";
import { useDispatch, useSelector } from "react-redux";

export const Navbar = () => {
  const isMobile = useIsMobile();
  const locale = useLocale();
  const t = useTranslations("Navbar");
  const router = useRouter();
  const pathname = usePathname();
  const dispatch = useDispatch();
  const isLoggedIn = useSelector((state: any) => state.auth?.isLoggedIn || false);
  const userName = useSelector((state: any) => state.auth?.userName || "User");
  const currentCurrency = useSelector((state: any) => state.currency || { code: "IDR" });
  const hasNewBooking = useSelector((state: any) => state.ui?.hasNewBooking || false);

  const { handleLogout, isLoading: isLoggingOut } = useLogout();

  // Fetch user data
  const { data: userData } = useGetUserQuery(undefined, {
    skip: !isLoggedIn
  });

  const displayUserName = userData?.data?.name || userName || "User";

  const [mounted, setMounted] = React.useState(false);
  const [isScrolled, setIsScrolled] = React.useState(false);
  const [showLanguageSelection, setShowLanguageSelection] = React.useState(false);
  const [showCurrencySelection, setShowCurrencySelection] = React.useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = React.useState(false);

  const normalizedPathname = pathname.endsWith('/') ? pathname.slice(0, -1) : pathname;
  const isServicePage = NavMenu.some((item) => normalizedPathname.endsWith(item.href));
  const isItinerariesPage = normalizedPathname.endsWith('/itineraries');
  const isHeroPage = normalizedPathname === '' || normalizedPathname === '/' || normalizedPathname === `/${locale}` || isServicePage || isItinerariesPage;
  const effectiveIsScrolled = isScrolled || !isHeroPage;

  // Sync currency with locale initially or when locale changes
  React.useEffect(() => {
    if (locale === "id" && currentCurrency.code !== "IDR") {
      dispatch(setCurrency("IDR"));
    } else if (locale === "en" && currentCurrency.code !== "USD") {
      dispatch(setCurrency("USD"));
    } else if (locale === "tr" && currentCurrency.code !== "TRY") {
      dispatch(setCurrency("TRY"));
    }
  }, [locale, dispatch]);

  React.useEffect(() => {
    setMounted(true);
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const visibleItems = NavMenu.slice(0, 4);
  const moreItems = NavMenu.slice(4);

  // Use mounted state to prevent hydration mismatch for auth-dependent UI
  const displayLoggedIn = mounted ? isLoggedIn : false;

  const currentLanguageLabel =
    locale === "en" ? t("languages.en") : locale === "tr" ? t("languages.tr") : t("languages.id");

  return (
    <nav
      className={cn(
        "fixed top-0 right-0 left-0 z-[100] transition-all duration-300",
        effectiveIsScrolled
          ? "bg-white/90 backdrop-blur-md shadow-sm border-b border-gray-100"
          : "bg-white/0 border-b border-transparent"
      )}
    >
      {isMobile ? (
        <div className="flex items-center justify-between p-4 px-5">
          <Link href={`/${locale}`}>
            <Image
              src={effectiveIsScrolled ? "/images/logo-pacific-travelindo.svg" : "/images/logo-pacific-travelindo.svg"}
              width={30}
              height={30}
              alt="Logo"
              className="w-14 h-14 md:w-24 md:h-24 cursor-pointer"
            />
          </Link>
          <div className="flex items-center gap-3">
            <Drawer
              open={isDrawerOpen}
              onOpenChange={(open) => {
                setIsDrawerOpen(open);
                if (!open) {
                  setShowLanguageSelection(false);
                  setShowCurrencySelection(false);
                }
              }}
              autoFocus>
              <DrawerTrigger asChild>
                <button
                  className={cn(
                    "rounded-full p-2 transition-colors",
                    isScrolled
                      ? "bg-gray-100 text-gray-600"
                      : "bg-white/20 text-white backdrop-blur-md"
                  )}>
                  <Menu className="size-5" />
                </button>
              </DrawerTrigger>
              <DrawerContent className="rounded-t-[24px] border-none p-0 pb-5">
                {showLanguageSelection ? (
                  <>
                    <DrawerHeader className="relative flex items-center border-b p-4">
                      <button
                        onClick={() => setShowLanguageSelection(false)}
                        className="absolute left-4 p-1">
                        <ChevronLeft className="size-5" />
                      </button>
                      <DrawerTitle className="w-full text-center text-lg font-bold">
                        {t("languageTitle")}
                      </DrawerTitle>
                    </DrawerHeader>
                    <div className="flex flex-col">
                      {[
                        { code: "id", label: t("languages.id"), flag: "🇮🇩" },
                        { code: "en", label: t("languages.en"), flag: "🇺🇸" },
                        { code: "tr", label: t("languages.tr"), flag: "🇹🇷" }
                      ].map((lang) => (
                        <button
                          key={lang.code}
                          onClick={() => {
                            const curr = lang.code === "id" ? "IDR" : lang.code === "tr" ? "TRY" : "USD";
                            dispatch(setCurrency(curr));
                            router.replace(pathname, { locale: lang.code });
                            setIsDrawerOpen(false);
                          }}
                          className="flex items-center gap-3 px-6 py-3 transition-colors active:bg-gray-50">
                          <div
                            className={cn(
                              "flex size-5 items-center justify-center rounded-full border-2",
                              locale === lang.code
                                ? "border-blue-600 bg-blue-600"
                                : "border-gray-300"
                            )}>
                            {locale === lang.code && (
                              <div className="size-2 rounded-full bg-white" />
                            )}
                          </div>
                          <span className="text-lg">{lang.flag}</span>
                          <span
                            className={cn(
                              "text-sm font-medium",
                              locale === lang.code ? "text-blue-600" : "text-gray-700"
                            )}>
                            {lang.label}
                          </span>
                        </button>
                      ))}
                    </div>
                  </>
                ) : showCurrencySelection ? (
                  <>
                    <DrawerHeader className="relative flex items-center border-b p-4">
                      <button
                        onClick={() => setShowCurrencySelection(false)}
                        className="absolute left-4 p-1">
                        <ChevronLeft className="size-5" />
                      </button>
                      <DrawerTitle className="w-full text-center text-lg font-bold">
                        {t("currencyTitle")}
                      </DrawerTitle>
                    </DrawerHeader>
                    <div className="flex flex-col">
                      {[
                        { code: "IDR", label: t("currencies.idr"), symbol: "Rp" },
                        { code: "USD", label: t("currencies.usd"), symbol: "US$" },
                        { code: "TRY", label: t("currencies.try"), symbol: "₺" }
                      ].map((curr) => (
                        <button
                          key={curr.code}
                          onClick={() => {
                            dispatch(setCurrency(curr.code));
                            setIsDrawerOpen(false);
                            setShowCurrencySelection(false);
                          }}
                          className="flex items-center gap-3 px-6 py-3 transition-colors active:bg-gray-50">
                          <div
                            className={cn(
                              "flex size-5 items-center justify-center rounded-full border-2",
                              currentCurrency.code === curr.code
                                ? "border-blue-600 bg-blue-600"
                                : "border-gray-300"
                            )}>
                            {currentCurrency.code === curr.code && (
                              <div className="size-2 rounded-full bg-white" />
                            )}
                          </div>
                          <span className="w-8 text-sm font-bold text-gray-500">{curr.symbol}</span>
                          <span
                            className={cn(
                              "text-sm font-medium",
                              currentCurrency.code === curr.code ? "text-blue-600" : "text-gray-700"
                            )}>
                            {curr.label} ({curr.code})
                          </span>
                        </button>
                      ))}
                    </div>
                  </>
                ) : (
                  <>
                    <DrawerHeader className="border-b p-4 text-left">
                      <DrawerTitle className="text-lg font-bold">{t("menuTitle")}</DrawerTitle>
                    </DrawerHeader>
                    <div className="flex flex-col">
                      {/* Your Booking */}
                      <Link
                        href={`/${locale}/my-bookings`}
                        onClick={() => dispatch(setHasNewBooking(false))}
                        className="flex items-center justify-between border-b border-gray-50 px-6 py-3 transition-colors active:bg-gray-50">
                        <div className="flex flex-col">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-gray-700">
                              {t("yourBooking")}
                            </span>
                            {hasNewBooking && (
                              <span className="flex h-2 w-2">
                                <span className="absolute inline-flex h-2 w-2 animate-ping rounded-full bg-red-400 opacity-75"></span>
                                <span className="relative inline-flex h-2 w-2 rounded-full bg-red-500"></span>
                              </span>
                            )}
                          </div>
                          {displayLoggedIn && (
                            <span className="text-sm font-semibold text-gray-700">
                              {displayUserName}
                            </span>
                          )}
                        </div>
                        <ChevronRight className="size-4 text-gray-400" />
                      </Link>

                      {/* Mata Uang */}
                      <button
                        onClick={() => setShowCurrencySelection(true)}
                        className="flex w-full items-center justify-between border-b border-gray-50 px-6 py-3 text-left transition-colors active:bg-gray-50">
                        <div className="flex flex-col">
                          <span className="text-sm font-medium text-gray-700">
                            {t("currency")}
                          </span>
                          <span className="text-[10px] text-gray-400">
                            {currentCurrency.code}
                          </span>
                        </div>
                        <ChevronRight className="size-4 text-gray-400" />
                      </button>

                      {/* Bahasa */}
                      <button
                        onClick={() => setShowLanguageSelection(true)}
                        className="flex w-full items-center justify-between border-b border-gray-50 px-6 py-3 text-left transition-colors active:bg-gray-50">
                        <div className="flex flex-col">
                          <span className="text-sm font-medium text-gray-700">
                            {t("language")}
                          </span>
                          <span className="text-[10px] text-gray-400">
                            {currentLanguageLabel}
                          </span>
                        </div>
                        <ChevronRight className="size-4 text-gray-400" />
                      </button>
                    </div>

                    {!displayLoggedIn && (
                      <div className="flex gap-3 p-4">
                        <Link href={`/${locale}/login`} className="flex-1">
                          <Button
                            size="lg"
                            className="w-full bg-blue-50 text-blue-600 hover:bg-blue-100 active:bg-blue-200">
                            {t("login")}
                          </Button>
                        </Link>
                        <Link href={`/${locale}/register`} className="flex-1">
                          <Button
                            size="lg"
                            className="w-full bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800">
                            {t("register")}
                          </Button>
                        </Link>
                      </div>
                    )}
                  </>
                )}
              </DrawerContent>
            </Drawer>
          </div>
        </div>
      ) : (
        <div className="mx-auto flex max-w-[1400px] items-center justify-between p-5">
          {/* Logo with navbar */}
          <div className="flex items-center gap-6">
            <Link href={`/${locale}`}>
              <Image
                src={"/images/logo-pacific-travelindo.svg"}
                width={80}
                height={80}
                alt="Logo"
                className="cursor-pointer"
              />
            </Link>
            <div className="flex items-center gap-6">
              {visibleItems.map((item, index) => (
                <Link
                  key={index}
                  href={`/${locale}${item.href}`}
                  className={cn(
                    "text-sm font-medium transition-colors hover:text-blue-500",
                    effectiveIsScrolled ? "text-slate-700" : "text-white/90"
                  )}>
                  {item.page}
                </Link>
              ))}
              {moreItems.length > 0 && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <div className={cn(
                      "flex cursor-pointer items-center gap-1 text-sm font-medium transition-colors outline-none hover:text-blue-500",
                      effectiveIsScrolled ? "text-slate-700" : "text-white/90"
                    )}>
                      {t("more")} <ChevronDown className="size-4" />
                    </div>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="min-w-[200px]">
                    {moreItems.map((item, index) => (
                      <DropdownMenuItem key={index} asChild>
                        <Link href={`/${locale}${item.href}`} className="w-full cursor-pointer">
                          {item.page}
                        </Link>
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          </div>
          {/* Search, button login and register OR user menu */}
          <div className="flex items-center gap-3">
            {/* Check if user is logged in */}
            {!displayLoggedIn ? (
              // Not logged in - Show Login & Sign Up buttons
              <>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className={cn(
                      "flex cursor-pointer items-center gap-1 text-sm font-medium transition-colors outline-none hover:text-blue-500",
                      effectiveIsScrolled ? "text-slate-700" : "text-white/90"
                    )}>
                      {locale === "en" ? "EN" : locale === "tr" ? "TR" : "ID"} <ChevronDown className="size-4" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="min-w-[150px]">
                    <DropdownMenuItem
                      onClick={() => {
                        dispatch(setCurrency("USD"));
                        router.push(pathname, { locale: "en" });
                      }}
                      className="cursor-pointer">
                      English
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => {
                        dispatch(setCurrency("IDR"));
                        router.push(pathname, { locale: "id" });
                      }}
                      className="cursor-pointer">
                      Bahasa Indonesia
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => {
                        dispatch(setCurrency("TRY"));
                        router.push(pathname, { locale: "tr" });
                      }}
                      className="cursor-pointer">
                      Türkçe
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                <Link href={`/${locale}/login`}>
                  <Button className={cn(
                    "hover:bg-blue-50 hover:text-blue-600 transition-colors",
                    effectiveIsScrolled ? "bg-slate-100 text-slate-800" : "bg-white/20 text-white backdrop-blur-md"
                  )}>{t("login")}</Button>
                </Link>
                <Link href={`/${locale}/register`}>
                  <Button className="bg-blue-600 hover:bg-blue-700 text-white">{t("register")}</Button>
                </Link>
              </>
            ) : (
              // Logged in - Show language, notifications, and avatar
              <>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className={cn(
                      "flex cursor-pointer items-center gap-1 text-sm font-medium transition-colors outline-none hover:text-blue-500",
                      effectiveIsScrolled ? "text-slate-700" : "text-white/90"
                    )}>
                      {locale === "en" ? "EN" : locale === "tr" ? "TR" : "ID"} <ChevronDown className="size-4" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="min-w-[150px]">
                    <DropdownMenuItem
                      onClick={() => {
                        dispatch(setCurrency("USD"));
                        router.push(pathname, { locale: "en" });
                      }}
                      className="cursor-pointer">
                      English
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => {
                        dispatch(setCurrency("IDR"));
                        router.push(pathname, { locale: "id" });
                      }}
                      className="cursor-pointer">
                      Bahasa Indonesia
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => {
                        dispatch(setCurrency("TRY"));
                        router.push(pathname, { locale: "tr" });
                      }}
                      className="cursor-pointer">
                      Türkçe
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                {/* Currency Selector */}
                <DropdownMenu>
                  <DropdownMenuTrigger className={cn(
                    "flex cursor-pointer items-center gap-1 text-sm font-medium transition-colors outline-none hover:text-blue-500",
                    effectiveIsScrolled ? "text-slate-700" : "text-white/90"
                  )}>
                    {currentCurrency.code} <ChevronDown className="size-4" />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="min-w-[150px]">
                    {[
                      { code: "IDR", label: t("currencies.idr") },
                      { code: "USD", label: t("currencies.usd") },
                      { code: "TRY", label: t("currencies.try") }
                    ].map((curr) => (
                      <DropdownMenuItem
                        key={curr.code}
                        onClick={() => dispatch(setCurrency(curr.code))}
                        className="cursor-pointer">
                        {curr.label} ({curr.code})
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>

                {/* My Itinerary - Labeled Button */}
                <Link href={`/${locale}/itineraries`} className="relative">
                  <button className={cn(
                    "flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition-colors border",
                    effectiveIsScrolled
                      ? "border-slate-200 bg-slate-50 text-slate-700 hover:bg-blue-50 hover:border-blue-200 hover:text-blue-600"
                      : "border-white/30 bg-white/15 text-white backdrop-blur-md hover:bg-white/25"
                  )}>
                    <div className="relative">
                      <ListChecks className="h-4 w-4" />
                      {hasNewBooking && (
                        <span className="absolute -top-1 -right-1 flex h-2 w-2">
                          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75"></span>
                          <span className="relative inline-flex h-2 w-2 rounded-full bg-red-500"></span>
                        </span>
                      )}
                    </div>
                    {t("itinerary")}
                  </button>
                </Link>

                {/* User Avatar Dropdown */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <div className={cn(
                      "flex cursor-pointer items-center gap-2 outline-none",
                      effectiveIsScrolled ? "text-slate-700" : "text-white"
                    )}>
                      <div className="relative h-8 w-8 overflow-hidden rounded-full border border-white/50 shadow-sm">
                        <Image
                          src={`/images/avatars/${Math.abs(displayUserName.charCodeAt(0) % 12) + 1}.png`}
                          alt={displayUserName}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <ChevronDown className="size-4" />
                    </div>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="min-w-[200px]">
                    <DropdownMenuItem asChild>
                      <Link href={`/${locale}/profile`} className="w-full cursor-pointer">
                        {t("profile")}
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href={`/${locale}/profile?tab=orders`} className="w-full cursor-pointer">
                        {t("yourBooking")}
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={handleLogout}
                      disabled={isLoggingOut}
                      className="cursor-pointer text-red-600">
                      {isLoggingOut ? "..." : t("logout")}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};
