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
import { useGetUserQuery } from "@/store/services/auth.service";
import { useGetAllTourQuery } from "@/store/services/book-tour.service";
import { setCurrency } from "@/store/slices/currencySlice";
import { setHasNewBooking } from "@/store/slices/uiSlice";
import Cookies from "js-cookie";
import { ChevronDown, ChevronLeft, ChevronRight, Menu, Ticket } from "lucide-react";
import { useLocale } from "next-intl";
import Image from "next/image";
import Link from "next/link";
import * as React from "react";
import { useDispatch, useSelector } from "react-redux";

export const Navbar = () => {
  const isMobile = useIsMobile();
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const dispatch = useDispatch();
  const isLoggedIn = useSelector((state: any) => state.auth?.isLoggedIn || false);
  const userName = useSelector((state: any) => state.auth?.userName || "User");
  const currentCurrency = useSelector((state: any) => state.currency || { code: "IDR" });
  const hasNewBooking = useSelector((state: any) => state.ui?.hasNewBooking || false);

  // Debug log
  React.useEffect(() => {
    if (typeof window !== "undefined") {
      console.log("Navbar Redux Auth Check:", { isLoggedIn, userName });
    }
  }, [isLoggedIn, userName]);
  const { handleLogout, isLoading: isLoggingOut } = useLogout();

  // Fetch user data
  const { data: userData } = useGetUserQuery(undefined, {
    skip: !isLoggedIn
  });

  // Fetch book tours to drive notification dot
  const { data: bookingsData } = useGetAllTourQuery(undefined, {
    skip: !isLoggedIn
  });

  React.useEffect(() => {
    if (bookingsData?.data?.length > 0) {
      dispatch(setHasNewBooking(true));
    }
  }, [bookingsData, dispatch]);

  const displayUserName = userData?.data?.name || userName || "User";

  const [mounted, setMounted] = React.useState(false);
  const [isScrolled, setIsScrolled] = React.useState(false);
  const [showLanguageSelection, setShowLanguageSelection] = React.useState(false);
  const [showCurrencySelection, setShowCurrencySelection] = React.useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = React.useState(false);

  React.useEffect(() => {
    const token = Cookies.get("travel_token");
    if (!token) {
      // If no token, we might want to ensure Redux state is updated if relevant
      // but for now we just follow the existing local check logic
    }
  }, []);

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

  // if (!mounted) {
  //   return <div className="h-16 w-full border-b bg-white md:h-20" />;
  // }

  return (
    <nav
    // className={cn(
    //   "fixed top-0 right-0 left-0 z-[100] transition-all duration-300",
    //   isScrolled || !isMobile
    //     ? "bg-white"
    //     : "bg-transparent"
    // )}
    >
      {isMobile ? (
        <div
          className={cn(
            `fixed top-0 right-0 left-0 z-[100] flex items-center justify-between p-4 px-5 transition-all duration-300`,
            isScrolled ? "bg-white" : "bg-transparent"
          )}>
          <Link href="/">
            <Image
              src={
                isScrolled
                  ? "/images/logo-pacific-travelindo.svg"
                  : "/images/logo-pacific-travelindo.svg"
              }
              width={60}
              height={60}
              alt="Logo"
              className="cursor-pointer"
            />
          </Link>
          <div className="flex items-center gap-3">
            <button
              className={cn(
                "flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-colors",
                isScrolled ? "bg-gray-100 text-gray-600" : "bg-white/20 text-white backdrop-blur-md"
              )}>
              <div className="relative">
                <Ticket className="size-3.5" />
                {hasNewBooking && (
                  <span className="absolute -top-1 -right-1 flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75"></span>
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-red-500"></span>
                  </span>
                )}
              </div>
              Promo
            </button>
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
                        Pilihan Bahasa
                      </DrawerTitle>
                    </DrawerHeader>
                    <div className="flex flex-col">
                      {[
                        { code: "id", label: "Bahasa Indonesia", flag: "🇮🇩" },
                        { code: "en", label: "English", flag: "🇺🇸" }
                      ].map((lang) => (
                        <button
                          key={lang.code}
                          onClick={() => {
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
                        Pilihan Mata Uang
                      </DrawerTitle>
                    </DrawerHeader>
                    <div className="flex flex-col">
                      {[
                        { code: "IDR", label: "Rupiah Indonesia", symbol: "Rp" },
                        { code: "USD", label: "US Dollar", symbol: "US$" }
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
                      <DrawerTitle className="text-lg font-bold">Menu</DrawerTitle>
                    </DrawerHeader>
                    <div className="flex flex-col">
                      {MobileNav.map((item, index) => {
                        const isLanguageItem = item.label === "Bahasa";
                        const isCurrencyItem = item.label === "Mata Uang";

                        if (isLanguageItem) {
                          const currentLanguageLabel =
                            locale === "en" ? "English" : "Bahasa Indonesia";
                          return (
                            <button
                              key={index}
                              onClick={() => setShowLanguageSelection(true)}
                              className="flex w-full items-center justify-between border-b border-gray-50 px-6 py-3 text-left transition-colors active:bg-gray-50">
                              <div className="flex flex-col">
                                <span className="text-sm font-medium text-gray-700">
                                  {item.label}
                                </span>
                                <span className="text-[10px] text-gray-400">
                                  {currentLanguageLabel}
                                </span>
                              </div>
                              <ChevronRight className="size-4 text-gray-400" />
                            </button>
                          );
                        }

                        if (isCurrencyItem) {
                          return (
                            <button
                              key={index}
                              onClick={() => setShowCurrencySelection(true)}
                              className="flex w-full items-center justify-between border-b border-gray-50 px-6 py-3 text-left transition-colors active:bg-gray-50">
                              <div className="flex flex-col">
                                <span className="text-sm font-medium text-gray-700">
                                  {item.label}
                                </span>
                                <span className="text-[10px] text-gray-400">
                                  {currentCurrency.code}
                                </span>
                              </div>
                              <ChevronRight className="size-4 text-gray-400" />
                            </button>
                          );
                        }

                        const isOrders = item.label === "Your Orders";

                        return (
                          <Link
                            key={index}
                            href={item.href}
                            onClick={() => {
                              if (isOrders) {
                                dispatch(setHasNewBooking(false));
                              }
                            }}
                            className="flex items-center justify-between border-b border-gray-50 px-6 py-3 transition-colors active:bg-gray-50">
                            <div className="flex flex-col">
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-medium text-gray-700">
                                  {item.label}
                                </span>
                                {isOrders && hasNewBooking && (
                                  <span className="flex h-2 w-2">
                                    <span className="absolute inline-flex h-2 w-2 animate-ping rounded-full bg-red-400 opacity-75"></span>
                                    <span className="relative inline-flex h-2 w-2 rounded-full bg-red-500"></span>
                                  </span>
                                )}
                              </div>
                              <span className="hidden text-sm font-semibold text-gray-700 lg:block">
                                {displayUserName}
                              </span>
                              {item.value && (
                                <span className="text-[10px] text-gray-400">{item.value}</span>
                              )}
                            </div>
                            <ChevronRight className="size-4 text-gray-400" />
                          </Link>
                        );
                      })}
                    </div>
                    <div className="flex gap-3 p-4">
                      <Button
                        size="lg"
                        className="flex-1 bg-blue-50 text-blue-600 hover:bg-blue-100 active:bg-blue-200">
                        Login
                      </Button>
                      <Button
                        size="lg"
                        className="flex-1 bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800">
                        Register
                      </Button>
                    </div>
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
            <Link href="/">
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
                  href={item.href}
                  className="text-sm font-medium transition-colors hover:text-blue-600">
                  {item.page}
                </Link>
              ))}
              {moreItems.length > 0 && (
                <DropdownMenu>
                  <DropdownMenuTrigger className="flex cursor-pointer items-center gap-1 text-sm font-medium outline-hidden transition-colors hover:text-blue-600">
                    Lainnya <ChevronDown className="size-4" />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="min-w-[200px]">
                    {moreItems.map((item, index) => (
                      <DropdownMenuItem key={index} asChild>
                        <Link href={item.href} className="w-full cursor-pointer">
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
            {!isLoggedIn ? (
              // Not logged in - Show Login & Sign Up buttons
              <>
                <DropdownMenu>
                  <DropdownMenuTrigger className="flex cursor-pointer items-center gap-1 text-sm font-medium outline-hidden transition-colors hover:text-blue-600">
                    {locale === "en" ? "EN" : "ID"} <ChevronDown className="size-4" />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="min-w-[150px]">
                    <DropdownMenuItem
                      onClick={() => router.push(pathname, { locale: "en" })}
                      className="cursor-pointer">
                      English
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => router.push(pathname, { locale: "id" })}
                      className="cursor-pointer">
                      Bahasa Indonesia
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                <Link href="/login">
                  <Button className="bg-gray-100 text-black hover:bg-gray-200">Login</Button>
                </Link>
                <Link href="/register">
                  <Button className="bg-blue-600 hover:bg-blue-700">Sign Up</Button>
                </Link>
              </>
            ) : (
              // Logged in - Show language, notifications, and avatar
              <>
                <DropdownMenu>
                  <DropdownMenuTrigger className="flex cursor-pointer items-center gap-1 text-sm font-medium outline-hidden transition-colors hover:text-blue-600">
                    {locale === "en" ? "EN" : "ID"} <ChevronDown className="size-4" />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="min-w-[150px]">
                    <DropdownMenuItem
                      onClick={() => router.push(pathname, { locale: "en" })}
                      className="cursor-pointer">
                      English
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => router.push(pathname, { locale: "id" })}
                      className="cursor-pointer">
                      Bahasa Indonesia
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                {/* Currency Selector */}
                <DropdownMenu>
                  <DropdownMenuTrigger className="flex cursor-pointer items-center gap-1 text-sm font-medium outline-hidden transition-colors hover:text-blue-600">
                    {currentCurrency.code} <ChevronDown className="size-4" />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="min-w-[150px]">
                    {[
                      { code: "IDR", label: "Indonesian Rupiah" },
                      { code: "USD", label: "US Dollar" }
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

                {/* My Bookings - Ticket Icon */}
                <Link
                  href="/my-bookings"
                  className="relative"
                  onClick={() => dispatch(setHasNewBooking(false))}>
                  <button className="flex h-9 w-9 items-center justify-center rounded-full transition-colors hover:bg-gray-100">
                    <div className="relative">
                      <Ticket className="h-5 w-5 text-gray-700" />
                      {hasNewBooking && (
                        <span className="absolute -top-1 -right-1 flex h-2 w-2">
                          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75"></span>
                          <span className="relative inline-flex h-2 w-2 rounded-full bg-red-500"></span>
                        </span>
                      )}
                    </div>
                  </button>
                </Link>

                {/* User Avatar Dropdown */}
                <DropdownMenu>
                  <DropdownMenuTrigger className="flex cursor-pointer items-center gap-2 outline-hidden">
                    <div className="relative h-8 w-8 overflow-hidden rounded-full">
                      <Image
                        src={`/images/avatars/${Math.abs(displayUserName.charCodeAt(0) % 12) + 1}.png`}
                        alt={displayUserName}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <ChevronDown className="size-4" />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="min-w-[200px]">
                    <DropdownMenuItem asChild>
                      <Link href="/profile" className="w-full cursor-pointer">
                        Profile
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/orders" className="w-full cursor-pointer">
                        My Orders
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/settings" className="w-full cursor-pointer">
                        Settings
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={handleLogout}
                      disabled={isLoggingOut}
                      className="cursor-pointer text-red-600">
                      {isLoggingOut ? "Logging out..." : "Logout"}
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
