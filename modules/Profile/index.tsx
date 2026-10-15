"use client";
import Icon from "@/components/icon";
import { MobileBottomNavbar } from "@/components/layout/traveler-layout/MobileBottomNavbar";
import { TravelerLayout } from "@/components/layout/traveler-layout/TravelerLayout";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ImageWithFallback } from "@/components/ui/image-with-fallback";
import { MotorItemRow, useMotorSummary } from "@/components/ui/motor-item-row";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useIsMobile } from "@/hooks/use-mobile";
import { useLogout } from "@/hooks/useLogout";
import { cn } from "@/lib/utils";
import { useGetUserQuery } from "@/store/services/customer.service";
import {
  useFindTourByIdQuery,
  useGetAllTourQuery,
  useUpdateStatusTourMutation
} from "@/store/services/book-tour.service";
import { useGetItineraryByIdQuery } from "@/store/services/itinerary.service";
import { useUpdateStatusMotorMutation, useFindBookMotorByIdQuery, useFindAllBookMotorsQuery } from "@/store/services/book-motor.service";
import { useFindDestinationIdQuery } from "@/store/services/destination.service";
import { useCancelPaymentMutation, useFindAllPaymentQuery } from "@/store/services/payment.service";
import {
  useFindBookEntertainmentAttractionByIdQuery,
  useFindAllBookEntertainmentAttractionsQuery,
  useCancelBookingMutation
} from "@/store/services/book-entertainment-attraction.service";
import {
  useFindAllBookDocumentVisasQuery,
  useFindBookDocumentVisaByIdQuery,
  useCancelBookDocumentVisaMutation
} from "@/store/services/book-document-visa.service";
import { useFindAllBookersQuery } from "@/store/services/booker.service";
import {
  useCreateProfileMutation,
  useGetProfileQuery,
  useUpdateProfileMutation
} from "@/store/services/profile.service";
import {
  useCreateTouristMutation,
  useDeleteTouristMutation,
  useFindAllTouristQuery,
  useUpdateManyTouristMutation
} from "@/store/services/tourist.service";
import { useFormik } from "formik";
import Cookies from "js-cookie";
import {
  ArrowRight,
  Bike,
  Calendar,
  ChevronDown,
  ChevronRight,
  CreditCard,
  Eye,
  FileText,
  Gift,
  Globe,
  Headphones,
  Heart,
  Info,
  Loader2,
  LogOut,
  MapPin,
  Receipt,
  Settings,
  Sparkles,
  Ticket,
  Trash2,
  User,
  Users,
  Wallet,
  XCircle
} from "lucide-react";
import { usePathname, useRouter } from "@/lib/languages/routing";
import { useSearchParams } from "next/navigation";
import { setCurrency } from "@/store/slices/currencySlice";
import { useLocale, useTranslations } from "next-intl";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "sonner";
import { orderTourSchema } from "../Booking/BookingTour/schema";
import { ProfileFormValues, profileSchema } from "./schema";
import { BookTourDetail } from "../Booking/BookingTour/BookTourDetail";

import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle
} from "@/components/ui/drawer";

export const ProfilePage = () => {
  const isMobile = useIsMobile();
  const searchParams = useSearchParams();
  const tabParam = searchParams.get("tab");
  const [activeTab, setActiveTab] = useState(
    tabParam && ["account", "my-booking", "orders", "tickets", "settings"].includes(tabParam)
      ? tabParam
      : "account"
  );

  useEffect(() => {
    const tab = searchParams.get("tab");
    if (tab && ["account", "my-booking", "orders", "tickets", "settings"].includes(tab)) {
      setActiveTab(tab);
    }
  }, [searchParams]);

  // Check if user is logged in from cookie
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Fetch user data from API
  const {
    data: userData,
    isLoading: isLoadingUser,
    error: userError
  } = useGetUserQuery(undefined, {
    skip: !isLoggedIn // Only fetch if logged in
  });

  // Extract user info from API response
  const userName = userData?.data?.name || "User";
  const userEmail = userData?.data?.email || "";

  useEffect(() => {
    const token = Cookies.get("customer_token");
    setIsLoggedIn(!!token);
  }, []);

  if (isMobile) {
    return (
      <MobileProfileView
        isLoggedIn={isLoggedIn}
        userName={userName}
        userEmail={userEmail}
        isLoading={isLoadingUser}
      />
    );
  }

  return (
    <TravelerLayout hideLayoutOnMobile={true}>
      <DesktopProfileView
        isLoggedIn={isLoggedIn}
        userName={userName}
        userEmail={userEmail}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />
    </TravelerLayout>
  );
};

// Mobile View Component
const MobileProfileView = ({
  isLoggedIn,
  userName,
  userEmail,
  isLoading
}: {
  isLoggedIn: boolean;
  userName: string;
  userEmail: string;
  isLoading?: boolean;
}) => {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const dispatch = useDispatch();
  const currentCurrency = useSelector((state: any) => state.currency || { code: "IDR" });

  const [isLanguageDrawerOpen, setIsLanguageDrawerOpen] = useState(false);
  const [isCurrencyDrawerOpen, setIsCurrencyDrawerOpen] = useState(false);

  const currentLanguageLabel =
    locale === "en" ? "English" : locale === "tr" ? "Türkçe" : "Bahasa Indonesia";

  const { handleLogout, isLoading: isLoggingOut } = useLogout();
  const [isAccountSettingsOpen, setIsAccountSettingsOpen] = useState(false);

  // Fetch profile data
  const {
    data: profileData,
    isLoading: isLoadingProfile,
    error: profileError,
    refetch: refetchProfile
  } = useGetProfileQuery();

  // Handle "Profile not found" as valid empty state
  const isProfileNotFound =
    profileError &&
    "data" in profileError &&
    typeof profileError.data === "object" &&
    profileError.data !== null &&
    "message" in profileError.data &&
    (profileError.data as any).message === "Profile not found";

  const profile = isProfileNotFound ? null : profileData?.data;

  // Fetch user data for userId
  const { data: userData } = useGetUserQuery();
  const userId = userData?.data?.id;

  // Mutations
  const [createProfile, { isLoading: isCreating }] = useCreateProfileMutation();
  const [updateProfile, { isLoading: isUpdating }] = useUpdateProfileMutation();
  const [isEditing, setIsEditing] = useState(false);

  // Formik setup for mobile
  const formik = useFormik<ProfileFormValues>({
    initialValues: {
      phone_number: profile?.phone_number || "",
      address: profile?.address || "",
      state: profile?.state || "",
      country: profile?.country || ""
    },
    enableReinitialize: true,
    validate: (values) => {
      const result = profileSchema.safeParse(values);
      if (!result.success) {
        const errors: any = {};
        result.error.issues.forEach((issue) => {
          const path = issue.path[0];
          if (path) {
            errors[path] = issue.message;
          }
        });
        return errors;
      }
      return {};
    },
    onSubmit: async (values) => {
      try {
        if (!userId) {
          toast.error("User ID not found");
          return;
        }

        if (profile?.id) {
          await updateProfile({
            id: profile.id,
            user_id: userId,
            ...values
          }).unwrap();
          toast.success("Profile updated successfully!");
        } else {
          await createProfile({
            user_id: userId,
            ...values
          }).unwrap();
          toast.success("Profile created successfully!");
        }

        await refetchProfile();
        setIsEditing(false);
        setIsAccountSettingsOpen(false);
      } catch (error: any) {
        toast.error(error?.data?.message || "Failed to save profile");
      }
    }
  });

  const handleCancelMobile = () => {
    formik.resetForm({
      values: {
        phone_number: profile?.phone_number || "",
        address: profile?.address || "",
        state: profile?.state || "",
        country: profile?.country || ""
      }
    });
    setIsEditing(false);
  };

  const isSubmitting = isCreating || isUpdating;

  // If not logged in, show different layout
  if (!isLoggedIn) {
    return (
      <div className="flex h-dvh flex-col overflow-hidden bg-gray-50 pb-16">
        {/* Fixed Top Section: Greeting & Benefit Cards */}
        <div className="shrink-0">
          <div className="relative bg-linear-to-br from-blue-500 to-blue-600 px-5 pt-8 pb-14">
            <h1 className="text-2xl font-bold text-white">Welcome to Pacific Travelindo</h1>
          </div>

          <div className="relative -mt-10 space-y-3 px-4">
            {/* Login/Register Card */}
            <div className="rounded-2xl bg-white p-4 shadow-sm">
              <div className="mb-3 flex items-start gap-3">
                <div className="text-3xl">🎁</div>
                <div>
                  <h3 className="mb-0.5 text-sm font-semibold text-gray-900">Ada banyak diskon buatmu!</h3>
                  <p className="text-xs text-gray-600">
                    Log in atau daftar untuk menikmati diskon dan penawaran khusus.
                  </p>
                </div>
              </div>
              <Link href="/login" className="block">
                <Button className="w-full bg-blue-600 text-white hover:bg-blue-700 h-9 text-sm">
                  Log in atau daftar
                </Button>
              </Link>
            </div>

            {/* Rewards Card */}
            <div className="rounded-2xl bg-linear-to-r from-teal-400 to-blue-400 p-4 shadow-sm text-white">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="mb-0.5 text-sm font-semibold">Lihat benefit buatmu di sini</h3>
                  <p className="text-xs text-white/90">
                    Cek penawaran dari Pacific Travelindo Rewards!
                  </p>
                </div>
                <div className="text-2xl">💰</div>
              </div>
            </div>
          </div>
        </div>

        {/* Scrollable Menus Section */}
        <div className="flex-1 overflow-y-auto px-4 pt-3 pb-6 space-y-3">
          {/* Favorit / Wishlist Section */}
          <div className="rounded-2xl bg-white p-4 shadow-sm">
            <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-500">Aktivitas & Favorit</h2>
            <div className="space-y-1">
              <Link
                href="/login"
                className="flex items-center justify-between rounded-lg p-2.5 transition-colors hover:bg-gray-50">
                <div className="flex items-center gap-3">
                  <div className="rounded-full bg-red-50 p-2 text-red-500">
                    <Heart className="h-4 w-4 fill-red-500/20" />
                  </div>
                  <div>
                    <p className="font-medium text-sm text-gray-900">Wishlist Destinasi</p>
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 text-gray-400" />
              </Link>
            </div>
          </div>

          {/* Customer Care 24/7 */}
          <div className="rounded-2xl bg-white p-4 shadow-sm">
            <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-500">Customer Care</h2>
            <div className="space-y-1">
              <button className="flex w-full items-center justify-between rounded-lg p-2.5 transition-colors hover:bg-gray-50">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-100">
                    <Headphones className="h-4 w-4 text-gray-600" />
                  </div>
                  <div className="text-left">
                    <p className="font-medium text-sm text-gray-900">Pusat Bantuan</p>
                    <span className="inline-block rounded bg-red-600 px-1.5 py-0.2 text-[9px] font-bold text-white">
                      Baru
                    </span>
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 text-gray-400" />
              </button>
            </div>
          </div>

          {/* Pengaturan */}
          <div className="rounded-2xl bg-white p-4 shadow-sm">
            <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-500">Pengaturan</h2>
            <div className="space-y-1">
              <button
                onClick={() => setIsLanguageDrawerOpen(true)}
                className="flex w-full items-center justify-between rounded-lg p-2.5 transition-colors hover:bg-gray-50">
                <div className="flex items-center gap-3">
                  <Globe className="h-4 w-4 text-gray-600" />
                  <p className="font-medium text-sm text-gray-900">Bahasa</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-500">{currentLanguageLabel}</span>
                  <ChevronRight className="h-4 w-4 text-gray-400" />
                </div>
              </button>
              <button
                onClick={() => setIsCurrencyDrawerOpen(true)}
                className="flex w-full items-center justify-between rounded-lg p-2.5 transition-colors hover:bg-gray-50">
                <div className="flex items-center gap-3">
                  <Wallet className="h-4 w-4 text-gray-600" />
                  <p className="font-medium text-sm text-gray-900">Mata Uang</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-500">{currentCurrency.code}</span>
                  <ChevronRight className="h-4 w-4 text-gray-400" />
                </div>
              </button>
            </div>
          </div>

          {/* Lainnya */}
          <div className="rounded-2xl bg-white p-4 shadow-sm">
            <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-500">Lainnya</h2>
            <button className="flex w-full items-center justify-between rounded-lg p-2.5 transition-colors hover:bg-gray-50">
              <div className="flex items-center gap-3">
                <Info className="h-4 w-4 text-gray-600" />
                <p className="font-medium text-sm text-gray-900">Tentang Pacific Travelindo</p>
              </div>
              <ChevronRight className="h-4 w-4 text-gray-400" />
            </button>
          </div>
        </div>

        {/* Language Selection Drawer */}
        <Drawer open={isLanguageDrawerOpen} onOpenChange={setIsLanguageDrawerOpen}>
          <DrawerContent className="rounded-t-[24px] border-none p-0 pb-6">
            <DrawerHeader className="relative flex items-center justify-center border-b p-4">
              <DrawerTitle className="text-center text-base font-bold text-gray-900">
                Pilihan Bahasa
              </DrawerTitle>
            </DrawerHeader>
            <div className="flex flex-col py-2">
              {[
                { code: "id", label: "Bahasa Indonesia", flag: "🇮🇩" },
                { code: "en", label: "English", flag: "🇺🇸" },
                { code: "tr", label: "Türkçe", flag: "🇹🇷" }
              ].map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => {
                    const curr = lang.code === "id" ? "IDR" : lang.code === "tr" ? "TRY" : "USD";
                    dispatch(setCurrency(curr));
                    router.replace(pathname, { locale: lang.code });
                    setIsLanguageDrawerOpen(false);
                  }}
                  className="flex items-center justify-between px-6 py-3.5 transition-colors active:bg-gray-50">
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{lang.flag}</span>
                    <span
                      className={cn(
                        "text-sm font-medium",
                        locale === lang.code ? "text-blue-600 font-semibold" : "text-gray-700"
                      )}>
                      {lang.label}
                    </span>
                  </div>
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
                </button>
              ))}
            </div>
          </DrawerContent>
        </Drawer>

        {/* Currency Selection Drawer */}
        <Drawer open={isCurrencyDrawerOpen} onOpenChange={setIsCurrencyDrawerOpen}>
          <DrawerContent className="rounded-t-[24px] border-none p-0 pb-6">
            <DrawerHeader className="relative flex items-center justify-center border-b p-4">
              <DrawerTitle className="text-center text-base font-bold text-gray-900">
                Pilihan Mata Uang
              </DrawerTitle>
            </DrawerHeader>
            <div className="flex flex-col py-2">
              {[
                { code: "IDR", label: "Rupiah Indonesia", symbol: "Rp" },
                { code: "USD", label: "US Dollar", symbol: "US$" },
                { code: "TRY", label: "Turkish Lira", symbol: "₺" }
              ].map((curr) => (
                <button
                  key={curr.code}
                  onClick={() => {
                    dispatch(setCurrency(curr.code));
                    setIsCurrencyDrawerOpen(false);
                  }}
                  className="flex items-center justify-between px-6 py-3.5 transition-colors active:bg-gray-50">
                  <div className="flex items-center gap-3">
                    <span className="flex size-7 items-center justify-center rounded-full bg-gray-100 text-xs font-bold text-gray-600">
                      {curr.symbol}
                    </span>
                    <span
                      className={cn(
                        "text-sm font-medium",
                        currentCurrency.code === curr.code ? "text-blue-600 font-semibold" : "text-gray-700"
                      )}>
                      {curr.label} ({curr.code})
                    </span>
                  </div>
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
                </button>
              ))}
            </div>
          </DrawerContent>
        </Drawer>

        {/* Mobile Bottom Navbar */}
        <MobileBottomNavbar />
      </div>
    );
  }

  // If logged in, show layout with fixed header & benefits card, scrollable menu list
  return (
    <div className="flex h-dvh flex-col overflow-hidden bg-[#f8f9fa] pb-16">
      {/* Non-scrolling Top Section (Greeting, User Profile Card, Benefits Card) */}
      <div className="shrink-0">
        {/* Blue Gradient Header */}
        <div className="relative bg-linear-to-br from-blue-500 to-blue-600 px-5 pt-7 pb-14">
          <h1 className="text-2xl font-bold text-white">Hi, {userName}</h1>
        </div>

        <div className="relative -mt-10 space-y-3 px-4">
          {/* User Info Card */}
          <div className="rounded-2xl bg-white p-4 shadow-sm">
            {isLoading ? (
              // Loading skeleton
              <div className="flex animate-pulse items-center gap-4">
                <div className="h-14 w-14 shrink-0 rounded-full bg-gray-200"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-32 rounded bg-gray-200"></div>
                  <div className="h-3 w-48 rounded bg-gray-200"></div>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3.5">
                <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-full">
                  <Image
                    src={`/images/avatars/${Math.abs(userName.charCodeAt(0) % 12) + 1}.png`}
                    alt={userName}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 truncate">{userName}</h3>
                  <p className="text-xs text-gray-500 truncate">{userEmail}</p>
                </div>
              </div>
            )}
          </div>

          {/* Benefits Card */}
          <div className="rounded-2xl bg-linear-to-r from-teal-400 to-blue-400 p-4 text-white shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="mb-0.5 text-sm font-semibold">Lihat benefit buatmu di sini</h3>
                <p className="text-xs opacity-90">Cek penawaran dari Pacific Tiket Rewards!</p>
              </div>
              <Gift className="h-9 w-9 opacity-80 shrink-0" />
            </div>
          </div>
        </div>
      </div>

      {/* Scrollable Menus Section */}
      <div className="flex-1 overflow-y-auto px-4 pt-3 pb-6 space-y-3">
        {/* Favorit / Wishlist Section */}
        <div className="rounded-2xl bg-white p-4 shadow-sm">
          <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-500">Aktivitas & Favorit</h3>
          <div className="space-y-1">
            <Link
              href="/wishlist"
              className="flex items-center justify-between rounded-lg p-2.5 transition-colors hover:bg-gray-50">
              <div className="flex items-center gap-3">
                <div className="rounded-full bg-red-50 p-2 text-red-500">
                  <Heart className="h-4 w-4 fill-red-500/20" />
                </div>
                <div>
                  <p className="font-medium text-sm text-gray-900">Wishlist Destinasi</p>
                </div>
              </div>
              <ChevronRight className="h-4 w-4 text-gray-400" />
            </Link>
          </div>
        </div>

        {/* Customer Care Section */}
        <div className="rounded-2xl bg-white p-4 shadow-sm">
          <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-500">Customer Care</h3>
          <div className="space-y-1">
            <Link
              href="#"
              className="flex items-center justify-between rounded-lg p-2.5 transition-colors hover:bg-gray-50">
              <div className="flex items-center gap-3">
                <div className="rounded-full bg-gray-100 p-2">
                  <Headphones className="h-4 w-4 text-gray-600" />
                </div>
                <p className="font-medium text-sm text-gray-900">Pusat Bantuan</p>
              </div>
              <ChevronRight className="h-4 w-4 text-gray-400" />
            </Link>
            {/* Settings Account */}
            <button
              onClick={() => setIsAccountSettingsOpen(true)}
              className="flex w-full items-center justify-between rounded-lg p-2.5 transition-colors hover:bg-gray-50">
              <div className="flex items-center gap-3">
                <div className="rounded-full bg-gray-100 p-2">
                  <Settings className="h-4 w-4 text-gray-600" />
                </div>
                <p className="font-medium text-sm text-gray-900">Pengaturan Akun</p>
              </div>
              <ChevronRight className="h-4 w-4 text-gray-400" />
            </button>
          </div>
        </div>

        {/* Settings Section */}
        <div className="rounded-2xl bg-white p-4 shadow-sm">
          <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-500">Pengaturan</h3>
          <div className="space-y-1">
            <button
              onClick={() => setIsLanguageDrawerOpen(true)}
              className="flex w-full items-center justify-between rounded-lg p-2.5 transition-colors hover:bg-gray-50">
              <div className="flex items-center gap-3">
                <Globe className="h-4 w-4 text-gray-600" />
                <p className="font-medium text-sm text-gray-900">Bahasa</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500">{currentLanguageLabel}</span>
                <ChevronRight className="h-4 w-4 text-gray-400" />
              </div>
            </button>
            <button
              onClick={() => setIsCurrencyDrawerOpen(true)}
              className="flex w-full items-center justify-between rounded-lg p-2.5 transition-colors hover:bg-gray-50">
              <div className="flex items-center gap-3">
                <Wallet className="h-4 w-4 text-gray-600" />
                <p className="font-medium text-sm text-gray-900">Mata Uang</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500">{currentCurrency.code}</span>
                <ChevronRight className="h-4 w-4 text-gray-400" />
              </div>
            </button>
          </div>
        </div>

        {/* Logout Section - Only show when logged in */}
        {isLoggedIn && (
          <div className="rounded-2xl bg-white p-4 shadow-sm">
            <button
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="flex w-full items-center justify-between rounded-lg p-2.5 text-red-600 transition-colors hover:bg-red-50 disabled:opacity-50">
              <div className="flex items-center gap-3">
                <LogOut className="h-4 w-4 text-red-600" />
                <p className="font-medium text-sm">{isLoggingOut ? "Logging out..." : "Keluar Akun"}</p>
              </div>
              <ChevronRight className="h-4 w-4 text-red-600" />
            </button>
          </div>
        )}
      </div>

      {/* Account Settings Drawer */}
      <Drawer open={isAccountSettingsOpen} onOpenChange={setIsAccountSettingsOpen}>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>Informasi Akun</DrawerTitle>
            <DrawerDescription>
              {isEditing ? "Edit informasi profil Anda" : "Lihat informasi profil Anda"}
            </DrawerDescription>
          </DrawerHeader>

          <form onSubmit={formik.handleSubmit} className="px-4 pb-4">
            <div className="space-y-4">
              {/* Full Name - Read Only */}
              <div>
                <Label htmlFor="mobile-fullName" className="text-sm font-medium text-gray-700">
                  Nama Lengkap
                </Label>
                <Input
                  id="mobile-fullName"
                  value={userName || ""}
                  disabled
                  className="mt-1 bg-gray-50"
                />
              </div>

              {/* Email - Read Only */}
              <div>
                <Label htmlFor="mobile-email" className="text-sm font-medium text-gray-700">
                  Email
                </Label>
                <Input
                  id="mobile-email"
                  type="email"
                  value={userEmail || ""}
                  disabled
                  className="mt-1 bg-gray-50"
                />
              </div>

              {/* Address */}
              <div>
                <Label htmlFor="mobile-address" className="text-sm font-medium text-gray-700">
                  Address
                </Label>
                <Textarea
                  id="mobile-address"
                  name="address"
                  value={formik.values.address}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  disabled={!isEditing}
                  className={`mt-1 text-sm ${!isEditing ? "bg-gray-50" : ""}`}
                />
                {formik.touched.address && formik.errors.address && (
                  <p className="mt-1 text-sm text-red-600">{formik.errors.address}</p>
                )}
              </div>

              {/* Phone Number */}
              <div>
                <Label
                  htmlFor="mobile-phone_number"
                  className="text-sm font-medium text-gray-700">
                  No. Handphone
                </Label>
                <Input
                  id="mobile-phone_number"
                  name="phone_number"
                  value={formik.values.phone_number}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  disabled={!isEditing}
                  className={`mt-1 ${!isEditing ? "bg-gray-50" : ""}`}
                />
                {formik.touched.phone_number && formik.errors.phone_number && (
                  <p className="mt-1 text-sm text-red-600">{formik.errors.phone_number}</p>
                )}
              </div>

              {/* State */}
              <div>
                <Label htmlFor="mobile-state" className="text-sm font-medium text-gray-700">
                  State
                </Label>
                <Input
                  id="mobile-state"
                  name="state"
                  value={formik.values.state}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  disabled={!isEditing}
                  className={`mt-1 ${!isEditing ? "bg-gray-50" : ""}`}
                />
                {formik.touched.state && formik.errors.state && (
                  <p className="mt-1 text-sm text-red-600">{formik.errors.state}</p>
                )}
              </div>

              {/* Country */}
              <div>
                <Label htmlFor="mobile-country" className="text-sm font-medium text-gray-700">
                  Country
                </Label>
                <Input
                  id="mobile-country"
                  name="country"
                  value={formik.values.country}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  disabled={!isEditing}
                  className={`mt-1 ${!isEditing ? "bg-gray-50" : ""}`}
                />
                {formik.touched.country && formik.errors.country && (
                  <p className="mt-1 text-sm text-red-600">{formik.errors.country}</p>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-6 flex gap-3">
              {!isEditing ? (
                <>
                  <Button
                    type="button"
                    onClick={() => setIsAccountSettingsOpen(false)}
                    variant="outline"
                    className="flex-1">
                    Tutup
                  </Button>
                  <Button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setIsEditing(true);
                    }}
                    className="flex-1 bg-blue-600 hover:bg-blue-700">
                    Edit Profil
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleCancelMobile}
                    disabled={isSubmitting}
                    className="flex-1">
                    Batal
                  </Button>
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 bg-blue-600 hover:bg-blue-700">
                    {isSubmitting ? "Menyimpan..." : "Simpan"}
                  </Button>
                </>
              )}
            </div>
          </form>
        </DrawerContent>
      </Drawer>

      {/* Language Selection Drawer */}
      <Drawer open={isLanguageDrawerOpen} onOpenChange={setIsLanguageDrawerOpen}>
        <DrawerContent className="rounded-t-[24px] border-none p-0 pb-6">
          <DrawerHeader className="relative flex items-center justify-center border-b p-4">
            <DrawerTitle className="text-center text-base font-bold text-gray-900">
              Pilihan Bahasa
            </DrawerTitle>
          </DrawerHeader>
          <div className="flex flex-col py-2">
            {[
              { code: "id", label: "Bahasa Indonesia", flag: "🇮🇩" },
              { code: "en", label: "English", flag: "🇺🇸" },
              { code: "tr", label: "Türkçe", flag: "🇹🇷" }
            ].map((lang) => (
              <button
                key={lang.code}
                onClick={() => {
                  const curr = lang.code === "id" ? "IDR" : lang.code === "tr" ? "TRY" : "USD";
                  dispatch(setCurrency(curr));
                  router.replace(pathname, { locale: lang.code });
                  setIsLanguageDrawerOpen(false);
                }}
                className="flex items-center justify-between px-6 py-3.5 transition-colors active:bg-gray-50">
                <div className="flex items-center gap-3">
                  <span className="text-xl">{lang.flag}</span>
                  <span
                    className={cn(
                      "text-sm font-medium",
                      locale === lang.code ? "text-blue-600 font-semibold" : "text-gray-700"
                    )}>
                    {lang.label}
                  </span>
                </div>
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
              </button>
            ))}
          </div>
        </DrawerContent>
      </Drawer>

      {/* Currency Selection Drawer */}
      <Drawer open={isCurrencyDrawerOpen} onOpenChange={setIsCurrencyDrawerOpen}>
        <DrawerContent className="rounded-t-[24px] border-none p-0 pb-6">
          <DrawerHeader className="relative flex items-center justify-center border-b p-4">
            <DrawerTitle className="text-center text-base font-bold text-gray-900">
              Pilihan Mata Uang
            </DrawerTitle>
          </DrawerHeader>
          <div className="flex flex-col py-2">
            {[
              { code: "IDR", label: "Rupiah Indonesia", symbol: "Rp" },
              { code: "USD", label: "US Dollar", symbol: "US$" },
              { code: "TRY", label: "Turkish Lira", symbol: "₺" }
            ].map((curr) => (
              <button
                key={curr.code}
                onClick={() => {
                  dispatch(setCurrency(curr.code));
                  setIsCurrencyDrawerOpen(false);
                }}
                className="flex items-center justify-between px-6 py-3.5 transition-colors active:bg-gray-50">
                <div className="flex items-center gap-3">
                  <span className="flex size-7 items-center justify-center rounded-full bg-gray-100 text-xs font-bold text-gray-600">
                    {curr.symbol}
                  </span>
                  <span
                    className={cn(
                      "text-sm font-medium",
                      currentCurrency.code === curr.code ? "text-blue-600 font-semibold" : "text-gray-700"
                    )}>
                    {curr.label} ({curr.code})
                  </span>
                </div>
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
              </button>
            ))}
          </div>
        </DrawerContent>
      </Drawer>

      {/* Mobile Bottom Navbar */}
      <MobileBottomNavbar />
    </div>
  );
};

// Tour Item Detail Component - Itinerary style with accordion
const TourItemDetail = ({
  item,
  index,
  locale,
  dayNumber,
  dayRange
}: {
  item: any;
  index: number;
  locale: string;
  dayNumber: number;
  dayRange?: string;
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const { data: destinationData, isLoading } = useFindDestinationIdQuery(item.destination_id, {
    skip: !!item?.destination || !item.destination_id
  });

  if (isLoading) {
    return (
      <div className="border-l-2 border-blue-200 pl-4">
        <div className="animate-pulse">
          <div className="mb-2 h-5 w-3/4 rounded bg-gray-200"></div>
          <div className="h-4 w-1/2 rounded bg-gray-200"></div>
        </div>
      </div>
    );
  }

  const destination = item?.destination || destinationData?.data;
  const translation =
    destination?.translations?.find((tr: any) => tr.language_code === locale) ||
    destination?.translations?.[0];

  return (
    <div className="relative border-l-2 border-blue-300 pl-6">
      {/* Timeline dot */}
      <div className="absolute top-0 -left-[9px] h-4 w-4 rounded-full border-2 border-blue-500 bg-white"></div>

      {/* Itinerary item */}
      <div className="pb-6">
        {/* Header - Interactive for Accordion */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="-ml-3 w-full rounded-lg p-3 text-left transition-colors hover:bg-gray-50">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1">
              {/* Day number */}
              <div className="mb-1 text-[11px] font-bold tracking-wider text-blue-500 uppercase">
                Day {dayRange || dayNumber}
              </div>

              {/* Destination name */}
              <h4 className="mb-1 text-lg font-bold text-gray-900">
                {translation?.name || "Destination"}
              </h4>

              {/* Icon Row for Details - Always visible summary */}
              {/* {translation?.detail_tour && translation.detail_tour.length > 0 && (
                <div className="mb-3 flex flex-wrap gap-2">
                  {translation.detail_tour.slice(0, 5).map((detail: string, idx: number) => (
                    <div
                      key={idx}
                      className="flex items-center gap-1 rounded-full border border-blue-100/50 bg-blue-50/50 px-2 py-0.5 text-[10px] font-medium text-blue-600">
                      <Icon name={detail} className="h-2.5 w-2.5" />
                      <span className="capitalize">{detail}</span>
                    </div>
                  ))}
                </div>
              )} */}

              <div className="flex flex-wrap gap-x-6 gap-y-1">
                {destination?.location && (
                  <p className="flex items-center text-sm text-gray-500">
                    <Icon name="MapPin" className="mr-1.5 h-4 w-4 text-gray-400" />
                    {destination.location}
                  </p>
                )}
                <p className="flex items-center text-sm text-gray-400">
                  <Icon name="Calendar" className="mr-1.5 h-4 w-4" />
                  {new Date(item.visit_date).toLocaleDateString("id-ID", {
                    day: "numeric",
                    month: "long",
                    year: "numeric"
                  })}
                </p>
              </div>
            </div>

            {/* Chevron icon */}
            <Icon
              name="ChevronDown"
              className={`mt-1 h-5 w-5 shrink-0 text-gray-400 transition-transform ${
                isExpanded ? "rotate-180" : ""
              }`}
            />
          </div>
        </button>

        {/* Expandable Detail Tour Content */}
        {isExpanded && translation?.detail_tour && translation.detail_tour.length > 0 && (
          <div className="mt-3 rounded-xl border border-blue-100/50 bg-blue-50/50 p-5">
            <p className="mb-4 text-sm font-bold text-blue-800">Detail Rencana Perjalanan:</p>
            <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {translation.detail_tour.map((detail: string, idx: number) => (
                <li key={idx} className="flex items-start gap-3 text-sm text-gray-700">
                  <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                    <Icon name={detail} className="h-3 w-3" />
                  </div>
                  <span className="leading-relaxed capitalize">{detail}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

// Traveler Edit Modal Component
const TravelerEditModal = ({
  open,
  onOpenChange,
  booking,
  touristsData,
  onSuccess
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  booking: any;
  touristsData: any;
  onSuccess: () => void;
}) => {
  const [createTourist, { isLoading: isCreating }] = useCreateTouristMutation();
  const [updateManyTourist, { isLoading: isUpdating }] = useUpdateManyTouristMutation();
  const [deleteTourist] = useDeleteTouristMutation();
  const [isDeletingId, setIsDeletingId] = useState<string | number | null>(null);
  const [touristToDelete, setTouristToDelete] = useState<number | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const initialTourists = useMemo(() => {
    const data = touristsData?.data || touristsData?.datas;
    const touristList = Array.isArray(data?.tourists)
      ? data.tourists
      : Array.isArray(data)
        ? data
        : [];
    const matching = touristList.filter((t: any) => t.book_tour_id === booking?.id);

    if (matching.length > 0) {
      return matching.map((t: any) => ({
        id: t.id,
        gender: t.gender || "",
        name: t.name || "",
        phoneNumber: t.phone_number || "",
        nationality: t.nationality || "",
        passportNumber: t.passport_number || ""
      }));
    }

    return [
      {
        id: undefined,
        gender: "",
        name: "",
        phoneNumber: "",
        nationality: "",
        passportNumber: ""
      }
    ];
  }, [touristsData, booking]);

  const formik = useFormik<any>({
    initialValues: {
      tourists: initialTourists
    },
    enableReinitialize: true,
    validate: (values) => {
      const result = orderTourSchema.safeParse(values);
      if (!result.success) {
        const errors: any = {};
        result.error.issues.forEach((issue) => {
          const path = issue.path;
          if (path.length > 0) {
            let current = errors;
            for (let i = 0; i < path.length - 1; i++) {
              const p = path[i];
              if (!current[p]) current[p] = typeof p === "number" ? [] : {};
              current = current[p];
            }
            current[path[path.length - 1]] = issue.message;
          }
        });
        return errors;
      }
      return {};
    },
    onSubmit: async (values) => {
      try {
        const existingTourists = values.tourists.filter((t: any) => t.id);
        const newTourists = values.tourists.filter((t: any) => !t.id);

        // Update existing tourists in bulk
        if (existingTourists.length > 0) {
          const payload = {
            tourists: existingTourists.map((t: any) => ({
              id: t.id,
              name: t.name,
              phone_number: t.phoneNumber,
              gender: t.gender,
              nationality: t.nationality,
              passport_number: t.passportNumber
            }))
          };
          await updateManyTourist(payload).unwrap();
        }

        // Create new tourists if any
        if (newTourists.length > 0) {
          const payload = {
            book_tour_id: booking.id,
            tourists: newTourists.map((t: any) => ({
              name: t.name,
              phone_number: t.phoneNumber,
              gender: t.gender,
              nationality: t.nationality,
              passport_number: t.passportNumber
            }))
          };
          await createTourist(payload).unwrap();
        }

        toast.success("Berhasil memperbarui data traveler!");
        onSuccess();
        onOpenChange(false);
      } catch (error: any) {
        toast.error(error?.data?.message || "Gagal memperbarui data traveler");
      }
    }
  });

  const addTourist = () => {
    formik.setFieldValue("tourists", [
      ...formik.values.tourists,
      {
        id: undefined,
        gender: "",
        name: "",
        phoneNumber: "",
        nationality: "",
        passportNumber: ""
      }
    ]);
  };

  const handleRemoveTourist = async (index: number) => {
    const tourist = formik.values.tourists[index];
    if (tourist.id) {
      setTouristToDelete(index);
      setIsDeleteDialogOpen(true);
      return;
    }
    const newTourists = [...formik.values.tourists];
    newTourists.splice(index, 1);
    formik.setFieldValue("tourists", newTourists);
  };

  const confirmDeleteTourist = async () => {
    if (touristToDelete === null) return;

    const tourist = formik.values.tourists[touristToDelete];
    if (tourist.id) {
      try {
        setIsDeletingId(tourist.id);
        await deleteTourist(tourist.id).unwrap();
        toast.success("Berhasil menghapus data traveler!");
        onSuccess();

        const newTourists = [...formik.values.tourists];
        newTourists.splice(touristToDelete, 1);
        formik.setFieldValue("tourists", newTourists);
      } catch (error: any) {
        toast.error(error?.data?.message || "Gagal menghapus data traveler");
      } finally {
        setIsDeletingId(null);
        setTouristToDelete(null);
        setIsDeleteDialogOpen(false);
      }
    }
  };

  const isSubmitting = isCreating || isUpdating;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex h-[90vh] max-w-2xl flex-col overflow-hidden p-0">
        <DialogHeader className="shrink-0 border-b p-6">
          <DialogTitle className="text-xl font-bold">Traveler</DialogTitle>
        </DialogHeader>

        <div className="flex-1 space-y-6 overflow-y-auto p-6">
          <div className="space-y-6">
            {formik.values.tourists.map((tourist: any, index: number) => (
              <div
                key={index}
                className="relative rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="font-semibold text-gray-900">Traveler {index + 1}</h3>
                  <div className="flex items-center gap-2">
                    {(index > 0 || tourist.id) && (
                      <Button
                        variant="ghost"
                        size="sm"
                        type="button"
                        onClick={() => handleRemoveTourist(index)}
                        disabled={isDeletingId === tourist.id}
                        className="h-8 px-2 text-red-500 hover:text-red-600">
                        {isDeletingId === tourist.id ? "Menghapus..." : "Hapus"}
                      </Button>
                    )}
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label htmlFor={`tourists.${index}.gender`}>
                      Titel<span className="text-red-500">*</span>
                    </Label>
                    <Select
                      value={tourist.gender}
                      onValueChange={(val) =>
                        formik.setFieldValue(`tourists.${index}.gender`, val)
                      }>
                      <SelectTrigger className="mt-1 h-10">
                        <SelectValue placeholder="Pilih Titel" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Mr">Mr</SelectItem>
                        <SelectItem value="Mrs">Mrs</SelectItem>
                        <SelectItem value="Ms">Ms</SelectItem>
                      </SelectContent>
                    </Select>
                    {Array.isArray(formik.errors.tourists) &&
                      (formik.errors.tourists as any[])[index]?.gender && (
                        <p className="mt-1 text-xs text-red-500">
                          {(formik.errors.tourists as any[])[index].gender}
                        </p>
                      )}
                  </div>

                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div>
                      <Label htmlFor={`tourists.${index}.name`}>
                        Nama Lengkap<span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id={`tourists.${index}.name`}
                        name={`tourists.${index}.name`}
                        placeholder="Sesuai KTP/Paspor"
                        className="mt-1 h-10"
                        value={tourist.name}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                      />
                      {Array.isArray(formik.errors.tourists) &&
                        (formik.errors.tourists as any[])[index]?.name && (
                          <p className="mt-1 text-xs text-red-500">
                            {(formik.errors.tourists as any[])[index].name}
                          </p>
                        )}
                    </div>
                    <div>
                      <Label htmlFor={`tourists.${index}.phoneNumber`}>
                        Nomor Telepon<span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id={`tourists.${index}.phoneNumber`}
                        name={`tourists.${index}.phoneNumber`}
                        placeholder="Contoh: 08123456789"
                        className="mt-1 h-10"
                        value={tourist.phoneNumber}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                      />
                      {Array.isArray(formik.errors.tourists) &&
                        (formik.errors.tourists as any[])[index]?.phoneNumber && (
                          <p className="mt-1 text-xs text-red-500">
                            {(formik.errors.tourists as any[])[index].phoneNumber}
                          </p>
                        )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div>
                      <Label htmlFor={`tourists.${index}.nationality`}>
                        Kewarganegaraan<span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id={`tourists.${index}.nationality`}
                        name={`tourists.${index}.nationality`}
                        placeholder="Contoh: Indonesia"
                        className="mt-1 h-10"
                        value={tourist.nationality}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                      />
                      {Array.isArray(formik.errors.tourists) &&
                        (formik.errors.tourists as any[])[index]?.nationality && (
                          <p className="mt-1 text-xs text-red-500">
                            {(formik.errors.tourists as any[])[index].nationality}
                          </p>
                        )}
                    </div>
                    <div>
                      <Label htmlFor={`tourists.${index}.passportNumber`}>
                        Nomor Paspor<span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id={`tourists.${index}.passportNumber`}
                        name={`tourists.${index}.passportNumber`}
                        placeholder="Contoh: A1234567"
                        className="mt-1 h-10"
                        value={tourist.passportNumber}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                      />
                      {Array.isArray(formik.errors.tourists) &&
                        (formik.errors.tourists as any[])[index]?.passportNumber && (
                          <p className="mt-1 text-xs text-red-500">
                            {(formik.errors.tourists as any[])[index].passportNumber}
                          </p>
                        )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <Button
            type="button"
            variant="outline"
            onClick={addTourist}
            className="w-full border-2 border-dashed border-blue-200 py-6 font-medium text-blue-600 hover:bg-blue-50">
            + Tambah Traveler
          </Button>
        </div>

        <div className="shrink-0 border-t bg-white p-6 shadow-[0_-4px_10px_rgba(0,0,0,0.03)]">
          <Button
            className="w-full bg-blue-600 py-6 text-base font-semibold text-white hover:bg-blue-700"
            onClick={() => formik.handleSubmit()}
            disabled={isSubmitting}>
            {isSubmitting ? "Menyimpan..." : "Simpan"}
          </Button>
        </div>

        <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Apakah Anda yakin?</AlertDialogTitle>
              <AlertDialogDescription>
                Data traveler ini akan dihapus secara permanen. Tindakan ini tidak dapat dibatalkan.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setTouristToDelete(null)}>Batal</AlertDialogCancel>
              <AlertDialogAction
                onClick={confirmDeleteTourist}
                className="bg-red-500 hover:bg-red-600">
                Hapus
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </DialogContent>
    </Dialog>
  );
};

const ProfileBookingCard = ({
  booking,
  locale,
  t,
  touristsData,
  selectedCurrency,
  idrToUsdRate,
  handleViewDetails,
  handleOpenEditModal,
  handleCancelTour,
  isUpdatingStatus,
  isUpdatingMotorStatus,
  isCancellingEntertainment,
  isCancellingVisa
}: any) => {
  const isMotor = booking.type === "motor";
  const isEntertainment = booking.type === "entertainment";
  // Detect visa robustly: by type field OR by visa-specific fields (document_visa_id present, no motor/entertainment items)
  const isVisa = booking.type === "visa" || (!!booking.document_visa_id && !booking.book_motor_items?.length && !booking.book_entertainment_attraction_items?.length && !booking.itinerary_id);
  const isTour = !isMotor && !isEntertainment && !isVisa;

  /** Extract locale-aware string from potentially multilingual object { en, id, tr } */
  const getStr = (val: any, fallback = ""): string => {
    if (!val) return fallback;
    if (typeof val === "string") return val;
    if (typeof val === "object" && !Array.isArray(val)) {
      return val[locale] || val["en"] || val["id"] || (Object.values(val).find((v) => typeof v === "string") as string) || fallback;
    }
    return String(val) || fallback;
  };

  const itinerary = booking.itinerary;
  const items = itinerary?.itinerary_items || booking.book_tour_items || [];
  const firstTourItem = items[0];
  const firstMotorItem = booking.book_motor_items?.[0];
  const firstEntertainmentItem = booking.book_entertainment_attraction_items?.[0];

  const destination = firstTourItem?.destination;
  const tourTranslation =
    destination?.translations?.find((tr: any) => tr.language_code === locale) ||
    destination?.translations?.[0];

  const effectiveMotorId =
    firstMotorItem?.motor_id ||
    firstMotorItem?.motor?.id ||
    booking.motor_id ||
    "";

  const {
    motorName: fetchedMotorName,
    motorThumbnail: fetchedMotorThumbnail,
    engineCc: fetchedEngineCc
  } = useMotorSummary(isMotor ? effectiveMotorId : undefined);

  const motorTrans =
    firstMotorItem?.motor?.translations?.find((tr: any) => tr.language_code === locale) ||
    firstMotorItem?.motor?.translations?.[0];
  const motorName =
    fetchedMotorName ||
    motorTrans?.name_motor ||
    firstMotorItem?.motor?.name_motor ||
    firstMotorItem?.motor?.name ||
    firstMotorItem?.motor_name ||
    booking.motor_name;

  const titleName = useMemo(() => {
    if (isMotor) {
      return getStr(motorName) || getStr(firstMotorItem?.motor_name) || t("motorRental") || "Rental Motor";
    }
    if (isEntertainment) {
      return (
        getStr(firstEntertainmentItem?.entertainment_attraction_name) ||
        getStr(booking.entertainment_attraction?.name) ||
        getStr(booking.entertainment_attraction_name) ||
        getStr(booking.title) ||
        (locale === "en" ? "Attraction Ticket" : "Tiket Atraksi")
      );
    }
    if (isVisa) {
      return (
        getStr(booking.document_visa_title) ||
        getStr(booking.document_visa?.title) ||
        getStr(booking.package_name) ||
        (locale === "en" ? "Documents & Visa" : "Dokumen & Visa")
      );
    }
    return (
      getStr(itinerary?.name) ||
      getStr(itinerary?.title) ||
      getStr(tourTranslation?.name) ||
      (itinerary?.country?.name
        ? `Trip ke ${getStr(itinerary.country.name)}`
        : booking.country?.name
        ? `Trip ke ${getStr(booking.country.name)}`
        : t("tourPackage") || "Paket Tour")
    );
  }, [isMotor, isEntertainment, isVisa, motorName, firstMotorItem, t, firstEntertainmentItem, booking, locale, itinerary, tourTranslation, getStr]);

  const subtitle = useMemo(() => {
    if (isMotor) {
      return fetchedEngineCc ? `${fetchedEngineCc} CC` : getStr(booking.country?.name) || "";
    }
    if (isEntertainment) {
      const loc = getStr(booking.entertainment_attraction?.location) || getStr(booking.location);
      if (loc) return loc;
      const count = booking.book_entertainment_attraction_items?.length || 0;
      if (count > 0) return `${count} ${locale === "en" ? "package(s)" : "paket tiket"}`;
      return "";
    }
    if (isVisa) {
      const country = getStr(booking.country_name) || getStr(booking.document_visa?.country?.name) || "";
      const pkg = getStr(booking.package_name) || "";
      if (country && pkg) return `${country} · ${pkg}`;
      return country || pkg || "";
    }
    return getStr(itinerary?.country?.name) || getStr(booking.country?.name) || getStr(destination?.location) || "";
  }, [isMotor, isEntertainment, isVisa, fetchedEngineCc, booking, locale, itinerary, destination, getStr]);

  const displayDate = isMotor
    ? booking.start_date
    : isEntertainment
    ? (firstEntertainmentItem?.visit_date || booking.booking_date || booking.created_at)
    : isVisa
    ? (booking.target_travel_date || booking.created_at)
    : (firstTourItem?.visit_date || itinerary?.createdAt || booking.created_at);

  const serviceBadge = useMemo(() => {
    if (isMotor) {
      return {
        label: t("motorFilter") || "Rental Motor",
        icon: Bike
      };
    }
    if (isEntertainment) {
      return {
        label: t("entertainmentFilter") || (locale === "en" ? "Attraction Tickets" : "Tiket Atraksi"),
        icon: Ticket
      };
    }
    if (isVisa) {
      return {
        label: t("visaFilter") || "Documents & Visa",
        icon: FileText
      };
    }
    return {
      label: t("tourFilter") || "Paket Tour",
      icon: MapPin
    };
  }, [isMotor, isEntertainment, isVisa, t, locale]);

  // Format subtotal as currency
  const formatSubtotal = (amount: string | number) => {
    const numAmount = typeof amount === "string" ? parseFloat(amount) : amount;
    const effectiveRate = idrToUsdRate > 1 ? idrToUsdRate : (idrToUsdRate > 0 ? 1 / idrToUsdRate : 16761);
    const displayAmount = selectedCurrency !== "USD" ? numAmount * effectiveRate : numAmount;
    return new Intl.NumberFormat(selectedCurrency === "USD" ? "en-US" : "id-ID", {
      style: "currency",
      currency: selectedCurrency,
      minimumFractionDigits: selectedCurrency === "USD" ? 2 : 0,
      maximumFractionDigits: selectedCurrency === "USD" ? 2 : 0
    }).format(displayAmount || 0);
  };

  const getStatusBadge = (status: string) => {
    const s = (status || "draft").toLowerCase();
    switch (s) {
      case "pending":
        return { label: "Pending", bg: "bg-amber-50 text-amber-700 border-amber-200/80", dot: "bg-amber-500" };
      case "confirmed":
      case "ongoing":
        return { label: "Ongoing", bg: "bg-blue-50 text-blue-700 border-blue-200/80", dot: "bg-blue-500" };
      case "paid":
        return { label: "Paid", bg: "bg-emerald-50 text-emerald-700 border-emerald-200/80", dot: "bg-emerald-500" };
      case "documents_submitted":
        return { label: "Documents Submitted", bg: "bg-blue-50 text-blue-700 border-blue-200/80", dot: "bg-blue-500" };
      case "under_review":
        return { label: "Under Review", bg: "bg-amber-50 text-amber-700 border-amber-200/80", dot: "bg-amber-500" };
      case "revision_required":
        return { label: "Revision Required", bg: "bg-orange-50 text-orange-700 border-orange-200/80", dot: "bg-orange-500" };
      case "submitted_to_embassy":
        return { label: "Embassy", bg: "bg-indigo-50 text-indigo-700 border-indigo-200/80", dot: "bg-indigo-500" };
      case "appointment_scheduled":
        return { label: "Appointment", bg: "bg-purple-50 text-purple-700 border-purple-200/80", dot: "bg-purple-500" };
      case "approved":
        return { label: "Approved", bg: "bg-emerald-50 text-emerald-700 border-emerald-200/80", dot: "bg-emerald-500" };
      case "rejected":
        return { label: "Rejected", bg: "bg-rose-50 text-rose-700 border-rose-200/80", dot: "bg-rose-500" };
      case "completed":
        return { label: "Completed", bg: "bg-emerald-50 text-emerald-700 border-emerald-200/80", dot: "bg-emerald-500" };
      case "cancelled":
        return { label: "Cancelled", bg: "bg-red-50 text-red-700 border-red-200/80", dot: "bg-red-500" };
      case "expired":
        return { label: t("expiredStatus") || "Expired", bg: "bg-rose-50 text-rose-700 border-rose-200/80", dot: "bg-rose-500" };
      case "draft":
      default:
        return { label: "Draft", bg: "bg-slate-50 text-slate-700 border-slate-200/80", dot: "bg-slate-400" };
    }
  };

  const statusBadge = getStatusBadge(booking.status);

  const data = touristsData?.data || touristsData?.datas;
  const touristList = Array.isArray(data?.tourists)
    ? data.tourists
    : Array.isArray(data)
      ? data
      : [];

  const bookingTourists = isVisa
    ? (booking.applicants || []).map((a: any) => ({
        id: a.id,
        name: a.full_name || a.name,
        gender: a.gender === "male" ? "Mr" : a.gender === "female" ? "Ms" : a.gender,
        passport_number: a.passport_number,
        nationality: a.nationality
      }))
    : isMotor || isEntertainment
    ? (booking.tourists || [])
    : (booking.tourists && booking.tourists.length > 0
        ? booking.tourists
        : touristList.filter((t: any) => t.book_tour_id === booking.id));

  const touristCount = isVisa
    ? (booking.applicant_count || bookingTourists.length || 0)
    : bookingTourists.length;

  const subtotalValue =
    typeof booking.subtotal === "string" ? parseFloat(booking.subtotal) : (booking.subtotal || 0);
  const totalPrice = Number(
    booking.total_price ||
    booking.total ||
    (isEntertainment || isVisa
      ? subtotalValue || booking.total_price || (booking.unit_price ? booking.unit_price * touristCount : 0)
      : touristCount > 0 ? subtotalValue * touristCount : subtotalValue)
  );

  const statusLower = (booking.status || "draft").toLowerCase();
  const isPendingOrDraft = ["pending", "draft"].includes(statusLower);

  const proceedAction = useMemo(() => {
    if (!isPendingOrDraft) return null;

    if (isMotor) {
      if (bookingTourists.length === 0 || statusLower === "draft") {
        return {
          href: `/${locale}/orders/rent-motor?book_motor_id=${booking.id}&motor_id=${effectiveMotorId}`,
          label: t("continueBooking") || "Lanjutkan Pemesanan"
        };
      }
      return {
        href: `/${locale}/payments?order_id=${booking.id}&type=motor`,
        label: t("checkout") || "Bayar Sekarang"
      };
    }

    if (isEntertainment) {
      if (bookingTourists.length === 0 || statusLower === "draft") {
        return {
          href: `/${locale}/book-entertainment-attraction?book_entertainment_attraction_id=${booking.id}`,
          label: t("continueBooking") || "Lanjutkan Pemesanan"
        };
      }
      return {
        href: `/${locale}/payments?order_id=${booking.id}&type=entertainment`,
        label: t("checkout") || "Bayar Sekarang"
      };
    }

    if (isVisa) {
      const hasApplicants = Array.isArray(booking.applicants) && booking.applicants.length > 0;
      if (!hasApplicants || statusLower === "draft") {
        return {
          href: `/${locale}/orders/document-visa?book_document_visa_id=${booking.id}&document_visa_id=${booking.document_visa_id || ""}`,
          label: t("continueBooking") || "Lanjutkan Pemesanan"
        };
      }
      return {
        href: `/${locale}/payments?order_id=${booking.id}&type=document-visa`,
        label: t("checkout") || "Bayar Sekarang"
      };
    }

    return {
      href: `/${locale}/payments?order_id=${booking.id}`,
      label: t("checkout") || "Bayar Sekarang"
    };
  }, [isPendingOrDraft, isMotor, isEntertainment, isVisa, bookingTourists.length, booking.applicants, statusLower, locale, booking.id, booking.document_visa_id, effectiveMotorId, t]);

  return (
    <div
      key={`${booking.type}-${booking.id}`}
      className="group relative flex flex-col justify-between rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs transition-all duration-200 hover:border-slate-300 hover:shadow-md overflow-hidden">
      <div>
        {/* Top Header: Service Tag & Status Badge */}
        <div className="flex items-center justify-between gap-2">
          <div className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-semibold bg-slate-100/80 text-slate-700 border border-slate-200/90">
            <serviceBadge.icon className="h-3.5 w-3.5 shrink-0 text-slate-500" />
            <span>{serviceBadge.label}</span>
          </div>

          <span className={cn("inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold border", statusBadge.bg)}>
            <span className={cn("h-1.5 w-1.5 rounded-full", statusBadge.dot)} />
            <span>{statusBadge.label}</span>
          </span>
        </div>

        {/* Title and Subtitle */}
        <div className="mt-3.5 min-h-[3rem]">
          <h3 className="text-base font-bold text-slate-900 leading-snug line-clamp-2 group-hover:text-blue-600 transition-colors">
            {titleName}
          </h3>
          {subtitle && (
            <p className="flex items-center gap-1.5 text-xs text-slate-500 mt-1 line-clamp-1">
              <MapPin className="h-3 w-3 text-red-500 shrink-0" />
              <span>{subtitle}</span>
            </p>
          )}
        </div>

        {/* Display Date */}
        {displayDate && (
          <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-2">
            <Calendar className="h-3.5 w-3.5 text-slate-400 shrink-0" />
            <span>
              {new Date(displayDate).toLocaleDateString(locale === "en" ? "en-US" : "id-ID", {
                day: "numeric",
                month: "long",
                year: "numeric"
              })}
            </span>
          </div>
        )}

        {/* Price Block */}
        <div className="mt-4 pt-3.5 border-t border-slate-100 flex items-baseline justify-between gap-2">
          <div>
            <span className="block text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              {t("totalPrice")}
            </span>
            <p className="text-lg sm:text-xl font-extrabold text-blue-600 tracking-tight mt-0.5">
              {formatSubtotal(totalPrice)}
            </p>
          </div>
          {!isMotor && !isEntertainment && touristCount > 0 && subtotalValue > 0 && (
            <span className="text-[11px] font-medium text-slate-400 text-right">
              {formatSubtotal(subtotalValue)} × {touristCount}
            </span>
          )}
        </div>

        {/* Travelers Section */}
        <div className="mt-3.5 rounded-xl bg-slate-50/80 border border-slate-100 p-3 min-h-[5.5rem] flex flex-col justify-start">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <Users className="h-3.5 w-3.5 text-slate-400" />
              {isVisa
                ? (locale === "en" ? "Applicant" : "Pemohon")
                : "Traveler"}{touristCount > 0 ? ` (${touristCount})` : ""}
            </span>
            {isTour && booking.status.toLowerCase() === "draft" && (
              <button
                onClick={() => handleOpenEditModal(booking)}
                className="text-slate-400 hover:text-blue-600 transition-colors p-0.5"
                title="Edit traveler">
                <Icon name="Pencil" className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
          {touristCount > 0 ? (
            <div className="space-y-1.5 max-h-24 overflow-y-auto pr-1">
              {bookingTourists.slice(0, 3).map((tItem: any, idx: number) => (
                <div key={tItem.id || idx} className="flex items-center gap-2 text-xs text-slate-700">
                  <div className="flex h-4.5 w-4.5 shrink-0 items-center justify-center rounded-full bg-blue-50 text-[10px] font-bold text-blue-600 border border-blue-100">
                    {idx + 1}
                  </div>
                  <span className="truncate font-medium">
                    {tItem.gender ? `${tItem.gender}. ` : ""}{tItem.name}
                  </span>
                </div>
              ))}
              {touristCount > 3 && (
                <p className="text-[11px] text-slate-400 pl-6">
                  +{touristCount - 3} {isVisa ? (locale === "en" ? "more applicants" : "pemohon lainnya") : "traveler lainnya"}
                </p>
              )}
            </div>
          ) : (
            <p className="text-xs text-slate-400 italic my-auto">
              {isVisa
                ? (locale === "en" ? "No applicants yet" : "Belum ada data pemohon")
                : t("noTraveler")}
            </p>
          )}
        </div>
      </div>

      {/* Card Footer Actions */}
      <div className="mt-4 pt-3.5 border-t border-slate-100">
        {isPendingOrDraft && proceedAction ? (
          <div className="space-y-2">
            {/* Primary Action Button (Continue Booking / Checkout) */}
            <Link href={proceedAction.href} className="block w-full">
              <Button
                size="sm"
                className="w-full rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs h-9 shadow-xs transition-colors">
                {proceedAction.label}
              </Button>
            </Link>

            {/* Secondary Action Row: View Details & Cancel */}
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleViewDetails(booking)}
                className="flex-1 rounded-xl border-slate-200 text-slate-700 hover:bg-slate-50 hover:text-slate-900 font-semibold text-xs h-8.5 transition-colors">
                <Eye className="mr-1.5 h-3.5 w-3.5 text-slate-500" />
                {t("viewDetails")}
              </Button>

              <Button
                variant="outline"
                size="sm"
                className="rounded-xl border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 font-semibold text-xs h-8.5 px-3 shrink-0 transition-colors"
                onClick={() => handleCancelTour(booking.id, booking.type)}
                disabled={
                  isUpdatingStatus ||
                  isUpdatingMotorStatus ||
                  isCancellingEntertainment ||
                  isCancellingVisa ||
                  (booking.status.toLowerCase() === "pending" && booking.type === "tour")
                }>
                {isUpdatingStatus || isUpdatingMotorStatus || isCancellingEntertainment || isCancellingVisa ? "..." : t("cancel")}
              </Button>
            </div>
          </div>
        ) : (
          /* Default State: Clean full-width View Details button */
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleViewDetails(booking)}
            className="w-full rounded-xl border-slate-200 text-slate-700 hover:bg-slate-50 hover:text-slate-900 font-semibold text-xs h-9 transition-colors">
            <Eye className="mr-1.5 h-3.5 w-3.5 text-slate-500" />
            {t("viewDetails")}
          </Button>
        )}
      </div>
    </div>
  );
};

// My Booking Content Component
const MyBookingContent = ({ userName }: { userName: string }) => {
  const locale = useLocale();
  const t = useTranslations("MyBooking");

  // Get currency from Redux store
  const currentCurrency = useSelector(
    (state: any) => state.currency || { code: "IDR", idrToUsdRate: 1 / 16000 }
  );
  const selectedCurrency = currentCurrency.code as "IDR" | "USD";
  const idrToUsdRate = currentCurrency.idrToUsdRate || 1 / 16000;

  const {
    data: bookingsData,
    isLoading: isLoadingBookings,
    refetch: refetchTours
  } = useGetAllTourQuery(undefined);
  const {
    data: motorBookingsData,
    isLoading: isLoadingMotorBookings,
    refetch: refetchMotor
  } = useFindAllBookMotorsQuery(undefined);
  const {
    data: entertainmentBookingsData,
    isLoading: isLoadingEntertainment,
    refetch: refetchEntertainment
  } = useFindAllBookEntertainmentAttractionsQuery(undefined);
  const {
    data: visaBookingsData,
    isLoading: isLoadingVisaBookings,
    refetch: refetchVisa
  } = useFindAllBookDocumentVisasQuery(undefined);
  const {
    data: touristsData,
    isLoading: isLoadingTourists,
    refetch: refetchTourists
  } = useFindAllTouristQuery();

  const isLoading = isLoadingBookings || isLoadingTourists || isLoadingMotorBookings || isLoadingEntertainment || isLoadingVisaBookings;

  const normalizedTourBookings = useMemo(() => {
    return (bookingsData?.data || bookingsData?.datas || []).map((b: any) => ({
      ...b,
      type: "tour"
    }));
  }, [bookingsData]);

  const normalizedMotorBookings = useMemo(() => {
    return (motorBookingsData?.data || motorBookingsData?.datas || []).map((b: any) => ({
      ...b,
      type: "motor"
    }));
  }, [motorBookingsData]);

  const normalizedEntertainmentBookings = useMemo(() => {
    const rawData = (entertainmentBookingsData as any)?.data || (entertainmentBookingsData as any)?.datas || [];
    const list = Array.isArray(rawData) ? rawData : rawData ? [rawData] : [];
    return list.map((b: any) => ({
      ...b,
      type: "entertainment"
    }));
  }, [entertainmentBookingsData]);

  const normalizedVisaBookings = useMemo(() => {
    // Try datas first (array), then data (could also be array from some backends)
    const rawDatas = (visaBookingsData as any)?.datas;
    const rawData = (visaBookingsData as any)?.data;
    const list = Array.isArray(rawDatas) ? rawDatas
      : Array.isArray(rawData) ? rawData
      : rawDatas ? [rawDatas]
      : rawData ? [rawData]
      : [];
    // Spread first, then set type: "visa" LAST to guarantee it's not overwritten
    return list.filter((b: any) => b && typeof b === "object" && b.id).map((b: any) => {
      const item = { ...b };
      item.type = "visa"; // Always override to ensure correct type
      return item;
    });
  }, [visaBookingsData]);


  const allBookings = useMemo(() => {
    return [...normalizedTourBookings, ...normalizedMotorBookings, ...normalizedEntertainmentBookings, ...normalizedVisaBookings].sort(
      (a: any, b: any) => {
        const timeA = new Date(a.created_at || a.booking_date || 0).getTime();
        const timeB = new Date(b.created_at || b.booking_date || 0).getTime();
        return timeB - timeA;
      }
    );
  }, [normalizedTourBookings, normalizedMotorBookings, normalizedEntertainmentBookings, normalizedVisaBookings]);

  // Service filter state
  const [selectedService, setSelectedService] = useState<"all" | "tour" | "motor" | "entertainment" | "visa">("all");

  const serviceFilterTabs = useMemo(() => [
    {
      id: "all",
      label: t("allFilter") || "Semua",
      count: allBookings.length,
      icon: Ticket
    },
    {
      id: "tour",
      label: t("tourFilter") || "Paket Tour",
      count: allBookings.filter((b: any) => b.type === "tour").length,
      icon: MapPin
    },
    {
      id: "motor",
      label: t("motorFilter") || "Rental Motor",
      count: allBookings.filter((b: any) => b.type === "motor").length,
      icon: Bike
    },
    {
      id: "entertainment",
      label: t("entertainmentFilter") || (locale === "en" ? "Attraction Tickets" : "Tiket Atraksi"),
      count: allBookings.filter((b: any) => b.type === "entertainment").length,
      icon: Sparkles
    },
    {
      id: "visa",
      label: t("visaFilter") || "Documents & Visa",
      count: allBookings.filter((b: any) => b.type === "visa").length,
      icon: FileText
    }
  ], [allBookings, t, locale]);

  const filteredBookings = useMemo(() => {
    if (selectedService === "all") return allBookings;
    return allBookings.filter((b: any) => b.type === selectedService);
  }, [allBookings, selectedService]);

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<any>(null);
  const [editingBooking, setEditingBooking] = useState<any>(null);

  const handleViewDetails = (booking: any) => {
    setSelectedBooking(booking);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (booking: any) => {
    setEditingBooking(booking);
    setIsEditModalOpen(true);
  };

  // Cancel logic
  const [updateStatusTour, { isLoading: isUpdatingStatus }] = useUpdateStatusTourMutation();
  const [updateStatusMotor, { isLoading: isUpdatingMotorStatus }] = useUpdateStatusMotorMutation();
  const [cancelEntertainmentBooking, { isLoading: isCancellingEntertainment }] = useCancelBookingMutation();
  const [cancelVisaBooking, { isLoading: isCancellingVisa }] = useCancelBookDocumentVisaMutation();

  const [isCancelAlertOpen, setIsCancelAlertOpen] = useState(false);
  const [bookingToCancelId, setBookingToCancelId] = useState<string | null>(null);
  const [bookingToCancelType, setBookingToCancelType] = useState<string | null>(null);

  const handleCancelTour = (bookingId: string, type: string) => {
    setBookingToCancelId(bookingId);
    setBookingToCancelType(type);
    setIsCancelAlertOpen(true);
  };

  const onConfirmCancel = async () => {
    if (!bookingToCancelId || !bookingToCancelType) return;

    try {
      if (bookingToCancelType === "motor") {
        await updateStatusMotor({
          id: bookingToCancelId,
          status: "cancelled"
        }).unwrap();
      } else if (bookingToCancelType === "entertainment") {
        await cancelEntertainmentBooking(bookingToCancelId).unwrap();
      } else if (bookingToCancelType === "visa") {
        await cancelVisaBooking(bookingToCancelId).unwrap();
        refetchVisa();
      } else {
        await updateStatusTour({
          id: bookingToCancelId,
          status: "cancelled"
        }).unwrap();
      }
      toast.success(t("cancelSuccess"));
      refetchTours();
      refetchMotor();
      refetchEntertainment();
    } catch (error) {
      console.error("Failed to cancel booking:", error);
      toast.error(t("cancelFailed"));
    } finally {
      setIsCancelAlertOpen(false);
      setBookingToCancelId(null);
      setBookingToCancelType(null);
    }
  };

  if (isLoading) {
    return (
      <div>
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">{t("title")}</h2>
          <p className="text-sm text-slate-500 mt-1">{t("subtitle")}</p>
        </div>
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse rounded-2xl border border-slate-200 bg-white p-5 space-y-4">
              <div className="flex justify-between items-center">
                <div className="h-6 w-24 rounded-lg bg-slate-100" />
                <div className="h-6 w-16 rounded-full bg-slate-100" />
              </div>
              <div className="h-5 w-3/4 rounded bg-slate-100" />
              <div className="h-4 w-1/2 rounded bg-slate-100" />
              <div className="h-14 rounded-xl bg-slate-100" />
              <div className="h-16 rounded-xl bg-slate-100" />
              <div className="h-9 rounded-xl bg-slate-100" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Title and Subtitle */}
      <div>
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">{t("title")}</h2>
        <p className="text-sm text-slate-500 mt-1">{t("subtitle")}</p>
      </div>

      {/* Service Filter Tabs */}
      <div className="mt-6 flex flex-wrap items-center gap-2 border-b border-slate-200/80 pb-4">
        {serviceFilterTabs.map((tab) => {
          const isActive = selectedService === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setSelectedService(tab.id as any)}
              className={cn(
                "inline-flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs sm:text-sm font-semibold transition-all duration-200 cursor-pointer",
                isActive
                  ? "bg-blue-600 text-white shadow-sm shadow-blue-600/20"
                  : "bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-900 border border-slate-200"
              )}>
              <tab.icon className={cn("h-4 w-4 shrink-0", isActive ? "text-white" : "text-slate-400")} />
              <span>{tab.label}</span>
              <span
                className={cn(
                  "rounded-full px-2 py-0.5 text-[11px] font-bold",
                  isActive ? "bg-white/25 text-white" : "bg-slate-100 text-slate-600"
                )}>
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Content / List or Empty State */}
      {allBookings.length === 0 ? (
        <div className="mt-8 flex flex-col items-center justify-center py-16 text-center rounded-2xl border border-dashed border-slate-200 bg-slate-50/50 p-8">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 mb-4">
            <Ticket className="h-8 w-8" />
          </div>
          <h3 className="text-base font-bold text-slate-900">{t("emptyTitle")}</h3>
          <p className="text-sm text-slate-500 mt-1 max-w-sm">{t("emptyDesc")}</p>
        </div>
      ) : filteredBookings.length === 0 ? (
        <div className="mt-8 flex flex-col items-center justify-center py-14 text-center rounded-2xl border border-dashed border-slate-200 bg-slate-50/50 p-8">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-500 mb-3.5">
            <Ticket className="h-7 w-7" />
          </div>
          <h3 className="text-base font-bold text-slate-900">
            {locale === "en" ? "No bookings in this service" : "Tidak ada pesanan untuk layanan ini"}
          </h3>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-sm">
            {locale === "en"
              ? "You don't have any bookings in this selected category yet."
              : "Anda belum memiliki riwayat pesanan untuk kategori layanan yang dipilih."}
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setSelectedService("all")}
            className="mt-4 rounded-xl border-slate-200 text-slate-700 hover:bg-slate-100 text-xs font-semibold">
            {locale === "en" ? "Show all bookings" : "Lihat semua pesanan"}
          </Button>
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
          {filteredBookings.map((booking: any) => (
            <ProfileBookingCard
              key={`${booking.type}-${booking.id}`}
              booking={booking}
              locale={locale}
              t={t}
              touristsData={touristsData}
              selectedCurrency={selectedCurrency}
              idrToUsdRate={idrToUsdRate}
              handleViewDetails={handleViewDetails}
              handleOpenEditModal={handleOpenEditModal}
              handleCancelTour={handleCancelTour}
              isUpdatingStatus={isUpdatingStatus}
              isUpdatingMotorStatus={isUpdatingMotorStatus}
              isCancellingEntertainment={isCancellingEntertainment}
              isCancellingVisa={isCancellingVisa}
            />
          ))}
        </div>
      )}

      <TravelerEditModal
        open={isEditModalOpen}
        onOpenChange={setIsEditModalOpen}
        booking={editingBooking}
        touristsData={touristsData}
        onSuccess={() => {
          refetchTourists();
        }}
      />

      {/* Cancel Confirmation Alert */}
      <AlertDialog open={isCancelAlertOpen} onOpenChange={setIsCancelAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("cancelConfirmTitle")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("cancelConfirmDesc")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setBookingToCancelId(null)}>{t("cancel")}</AlertDialogCancel>
            <AlertDialogAction
              onClick={onConfirmCancel}
              className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
              disabled={isUpdatingStatus || isUpdatingMotorStatus || isCancellingEntertainment || isCancellingVisa}>
              {isUpdatingStatus || isUpdatingMotorStatus || isCancellingEntertainment || isCancellingVisa
                ? t("cancelling")
                : t("cancelConfirmBtn")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Booking Detail Modal */}
      <BookTourDetail
        open={isModalOpen}
        setOpen={setIsModalOpen}
        data={selectedBooking}
        onCancelled={() => {
          refetchTours();
          refetchMotor();
          refetchEntertainment();
          refetchVisa();
        }}
      />
    </div>
  );
};


// Itinerary Destination Item Component for Desktop Modal
const DesktopTourItemDetail = ({
  item,
  dayNumber,
  startDate,
  locale
}: {
  item: any;
  dayNumber: number;
  startDate?: string;
  locale: string;
}) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const translation =
    item?.destination?.translations?.find((tr: any) => tr.language_code === locale) ||
    item?.destination?.translations?.[0];
  const destName = translation?.name || item?.destination?.name || item?.name || "Destinasi Wisata";
  const destLocation = item?.destination?.location || item?.location || "";
  const destImage =
    item?.destination?.thumbnail ||
    translation?.thumbnail ||
    item?.thumbnail ||
    "/images/turkey-destination.jpg";

  // Calculate visit date
  const visitDate = useMemo(() => {
    if (item?.visit_date) {
      return new Date(item.visit_date);
    }
    if (startDate) {
      const base = new Date(startDate);
      if (!isNaN(base.getTime())) {
        base.setDate(base.getDate() + (dayNumber - 1));
        return base;
      }
    }
    return null;
  }, [item?.visit_date, startDate, dayNumber]);

  const formattedDate = visitDate
    ? visitDate.toLocaleDateString(locale === "en" ? "en-US" : locale === "tr" ? "tr-TR" : "id-ID", {
        weekday: "short",
        day: "numeric",
        month: "short",
        year: "numeric"
      })
    : null;

  return (
    <div className="relative border-l-2 border-blue-200 pl-4 sm:pl-5 pb-5 last:pb-1">
      {/* Node Dot */}
      <div className="absolute -left-[9px] top-1.5 h-4 w-4 rounded-full border-2 border-blue-500 bg-white shadow-xs" />

      <div className="rounded-xl border border-slate-200/80 bg-white p-3.5 shadow-xs">
        {/* Header with Sequence and Date */}
        <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-2 mb-2.5">
          <div className="flex items-center gap-1.5">
            <span className="rounded-md bg-blue-50 border border-blue-100 px-2 py-0.5 text-[11px] font-semibold text-blue-700">
              {locale === "en" ? `Day ${dayNumber}` : `Hari ke-${dayNumber}`}
            </span>
            <span className="text-[11px] text-slate-400 font-medium">#{dayNumber}</span>
          </div>

          {formattedDate && (
            <span className="flex items-center gap-1 text-[11px] font-medium text-slate-500">
              <Calendar className="h-3 w-3 text-slate-400" />
              <span>{formattedDate}</span>
            </span>
          )}
        </div>

        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full text-left transition-colors flex items-start justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="relative h-14 w-14 rounded-lg overflow-hidden shrink-0 border border-slate-200 bg-slate-100">
              <ImageWithFallback
                src={destImage}
                alt={destName}
                fill
                className="object-cover"
                fallbackSrc="/images/turkey-destination.jpg"
              />
            </div>

            <div className="min-w-0 flex-1">
              <h4 className="text-xs sm:text-sm font-semibold text-slate-900 truncate">
                {destName}
              </h4>
              {destLocation && (
                <p className="flex items-center gap-1 text-[11px] text-slate-500 mt-0.5 truncate">
                  <MapPin className="h-3 w-3 text-red-500 shrink-0" />
                  <span>{destLocation}</span>
                </p>
              )}
            </div>
          </div>

          <ChevronDown
            className={cn(
              "h-4 w-4 shrink-0 text-slate-400 transition-transform mt-1",
              isExpanded && "rotate-180 text-blue-600"
            )}
          />
        </button>

        {/* Expandable Activity Details */}
        {isExpanded && translation?.detail_tour && translation.detail_tour.length > 0 && (
          <div className="mt-3 rounded-lg border border-blue-100 bg-blue-50/40 p-3 text-xs space-y-1.5">
            <p className="text-[11px] font-semibold text-blue-900 flex items-center gap-1">
              <Sparkles className="h-3 w-3 text-amber-500" />
              <span>{locale === "en" ? "Destination Activities:" : "Aktivitas Destinasi:"}</span>
            </p>
            <ul className="space-y-1 pt-1">
              {translation.detail_tour.map((detail: string, idx: number) => (
                <li key={idx} className="flex items-start gap-2 text-[11px] text-slate-700">
                  <span className="h-1.5 w-1.5 rounded-full bg-blue-500 mt-1.5 shrink-0" />
                  <span className="capitalize leading-relaxed">{detail}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

// Safe date formatting helper for various formats (DD-MM-YYYY, YYYY-MM-DD, ISO, etc.)
const formatDateSafe = (rawDate?: string | Date | null, locale = "en") => {
  if (!rawDate) return null;
  if (rawDate instanceof Date) {
    if (!isNaN(rawDate.getTime())) {
      return rawDate.toLocaleDateString(locale === "en" ? "en-US" : locale === "tr" ? "tr-TR" : "id-ID", {
        day: "numeric",
        month: "long",
        year: "numeric"
      });
    }
    return null;
  }
  const str = String(rawDate).trim();
  const ddmmyyyy = /^(\d{1,2})-(\d{1,2})-(\d{4})$/.exec(str);
  if (ddmmyyyy) {
    const [, d, m, y] = ddmmyyyy;
    const dateObj = new Date(Number(y), Number(m) - 1, Number(d));
    if (!isNaN(dateObj.getTime())) {
      return dateObj.toLocaleDateString(locale === "en" ? "en-US" : locale === "tr" ? "tr-TR" : "id-ID", {
        day: "numeric",
        month: "long",
        year: "numeric"
      });
    }
  }
  const dateObj = new Date(str);
  if (!isNaN(dateObj.getTime())) {
    return dateObj.toLocaleDateString(locale === "en" ? "en-US" : locale === "tr" ? "tr-TR" : "id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric"
    });
  }
  return str;
};

// Order Detail Modal Component for Desktop
const OrderDetailModal = ({
  open,
  onOpenChange,
  payment
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  payment: any;
}) => {
  const locale = useLocale();
  const t = useTranslations("Orders");
  const isDocumentVisa = payment?.service_type === "document_visa" || Boolean(payment?.book_document_visa_id);
  const isMotor = (payment?.service_type === "rent_motor" || Boolean(payment?.book_motor_id)) && !isDocumentVisa;
  const isEntertainment = (payment?.service_type === "entertainment" || Boolean(payment?.book_entertainment_attraction_id)) && !isDocumentVisa;
  const isTour = (payment?.service_type === "tour" || Boolean(payment?.book_tour_id)) && !isDocumentVisa && !isMotor && !isEntertainment;

  const { data: tourResponse, isLoading: isLoadingTour } = useFindTourByIdQuery(
    payment?.book_tour_id,
    { skip: !open || !payment?.book_tour_id }
  );
  const { data: motorResponse, isLoading: isLoadingMotor } = useFindBookMotorByIdQuery(
    payment?.book_motor_id,
    { skip: !open || !payment?.book_motor_id }
  );
  const { data: entertainmentResponse, isLoading: isLoadingEntertainment } =
    useFindBookEntertainmentAttractionByIdQuery(
      payment?.book_entertainment_attraction_id,
      { skip: !open || !payment?.book_entertainment_attraction_id }
    );
  const { data: documentVisaResponse, isLoading: isLoadingDocumentVisa } =
    useFindBookDocumentVisaByIdQuery(
      payment?.book_document_visa_id,
      { skip: !open || !payment?.book_document_visa_id }
    );

  const tourData = tourResponse?.data || tourResponse;
  const motorData = motorResponse?.data || motorResponse;
  const entertainmentData: any = entertainmentResponse?.data || entertainmentResponse;
  const documentVisaData: any =
    documentVisaResponse?.data || documentVisaResponse || payment?.book_document_visa;

  const attractionTitle = useMemo(() => {
    return (
      entertainmentData?.book_entertainment_attraction_items?.[0]?.entertainment_attraction_name ||
      entertainmentData?.entertainment_attraction?.name ||
      entertainmentData?.entertainment_attraction_name ||
      entertainmentData?.title ||
      ""
    );
  }, [entertainmentData]);

  const visitDateFormatted = useMemo(() => {
    return formatDateSafe(entertainmentData?.booking_date || entertainmentData?.visit_date, locale);
  }, [entertainmentData?.booking_date, entertainmentData?.visit_date, locale]);

  const itineraryId = tourData?.itinerary_id || tourData?.itinerary?.id;
  const { data: itineraryResponse, isLoading: isLoadingItinerary } = useGetItineraryByIdQuery(
    itineraryId!,
    { skip: !itineraryId || !open }
  );
  const itinerary = itineraryResponse?.data || itineraryResponse || tourData?.itinerary;

  const itineraryItems = useMemo(() => {
    if (itinerary?.itinerary_items && Array.isArray(itinerary.itinerary_items) && itinerary.itinerary_items.length > 0) {
      return itinerary.itinerary_items;
    }
    if (tourData?.book_tour_items && Array.isArray(tourData.book_tour_items) && tourData.book_tour_items.length > 0) {
      return tourData.book_tour_items;
    }
    return [];
  }, [itinerary, tourData]);

  const [cancelPayment, { isLoading: isCancelling }] = useCancelPaymentMutation();
  const [showCancelAlert, setShowCancelAlert] = useState(false);

  const { data: bookersData } = useFindAllBookersQuery(undefined, { skip: !open });

  const booker = useMemo(() => {
    if (documentVisaData?.booker && (documentVisaData.booker.name || documentVisaData.booker.email)) {
      return documentVisaData.booker;
    }
    if (documentVisaData?.booker_name || documentVisaData?.booker_email) {
      return {
        name: documentVisaData.booker_name,
        email: documentVisaData.booker_email,
        phone_number: documentVisaData.booker_phone || documentVisaData.booker_phone_number
      };
    }
    if (entertainmentData?.booker && (entertainmentData.booker.name || entertainmentData.booker.email)) {
      return entertainmentData.booker;
    }
    if (entertainmentData?.pemesan && (entertainmentData.pemesan.name || entertainmentData.pemesan.email)) {
      return entertainmentData.pemesan;
    }
    if (tourData?.booker && (tourData.booker.name || tourData.booker.email)) {
      return tourData.booker;
    }
    if (tourData?.pemesan && (tourData.pemesan.name || tourData.pemesan.email)) {
      return tourData.pemesan;
    }
    if (motorData?.booker && (motorData.booker.name || motorData.booker.email)) {
      return motorData.booker;
    }
    if (motorData?.pemesan && (motorData.pemesan.name || motorData.pemesan.email)) {
      return motorData.pemesan;
    }

    const bookerId =
      documentVisaData?.booker_id ||
      entertainmentData?.booker_id ||
      entertainmentData?.pemesan_id ||
      tourData?.booker_id ||
      tourData?.pemesan_id ||
      motorData?.booker_id ||
      motorData?.pemesan_id ||
      payment?.booker_id;

    if (bookerId && bookersData) {
      const allBookers = bookersData?.data || bookersData?.datas || [];
      const found = allBookers.find((b: any) => b.id === bookerId);
      if (found) return found;
    }

    if (payment?.booker) return payment.booker;
    if (payment?.customer) {
      return {
        name: payment.customer.name || payment.customer.full_name,
        email: payment.customer.email,
        phone_number: payment.customer.profile?.phone_number || payment.customer.phone_number
      };
    }

    return null;
  }, [documentVisaData, entertainmentData, tourData, motorData, bookersData, payment]);

  const tourists: any[] = useMemo(() => {
    if (isDocumentVisa && documentVisaData?.applicants && documentVisaData.applicants.length > 0) {
      return documentVisaData.applicants;
    }
    if (isEntertainment && entertainmentData?.tourists && entertainmentData.tourists.length > 0) {
      return entertainmentData.tourists;
    }
    if (isTour && tourData?.tourists && tourData.tourists.length > 0) {
      return tourData.tourists;
    }
    if (isMotor && motorData?.tourists && motorData.tourists.length > 0) {
      return motorData.tourists;
    }
    if (payment?.tourists && payment.tourists.length > 0) {
      return payment.tourists;
    }
    return [];
  }, [isDocumentVisa, isEntertainment, isTour, isMotor, documentVisaData, entertainmentData, tourData, motorData, payment]);

  const currentCurrency = useSelector(
    (state: any) => state.currency || { code: "IDR", symbol: "Rp", idrToUsdRate: 16000 }
  );

  const formatPrice = (rawPrice: number) => {
    let displayPrice = Number(rawPrice || 0);
    if (currentCurrency.code !== "USD") {
      displayPrice = displayPrice * (currentCurrency.idrToUsdRate || 1);
    }
    return new Intl.NumberFormat(
      currentCurrency.code === "IDR"
        ? "id-ID"
        : currentCurrency.code === "TRY"
        ? "tr-TR"
        : "en-US",
      {
        style: "currency",
        currency: currentCurrency.code,
        maximumFractionDigits: currentCurrency.code === "IDR" ? 0 : 2
      }
    )
      .format(displayPrice)
      .replace("$", "US$ ");
  };

  const getStatusBadge = (status: string) => {
    const s = (status || "").toLowerCase();
    if (s === "success" || s === "succes" || s === "completed" || s === "paid") {
      return { label: "Success", bg: "bg-emerald-50 text-emerald-700 border-emerald-200" };
    }
    if (s === "pending") {
      return { label: "Pending", bg: "bg-amber-50 text-amber-700 border-amber-200" };
    }
    if (s === "cancelled" || s === "failed") {
      return { label: s === "cancelled" ? "Cancelled" : "Failed", bg: "bg-red-50 text-red-700 border-red-200" };
    }
    return { label: status || "Draft", bg: "bg-slate-50 text-slate-700 border-slate-200" };
  };

  const handleCancelPayment = async () => {
    try {
      await cancelPayment(payment.id).unwrap();
      toast.success("Payment cancelled successfully");
      setShowCancelAlert(false);
      onOpenChange(false);
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to cancel payment");
    }
  };

  const canCancel =
    payment?.status?.toLowerCase() === "pending" || payment?.status?.toLowerCase() === "failed";

  if (!payment) return null;
  const statusBadge = getStatusBadge(payment.status);
  const startDate = tourData?.visit_date || tourData?.start_date || tourData?.created_at || payment?.created_at;

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent showCloseButton={false} className="flex max-h-[90vh] flex-col p-0 sm:max-w-2xl rounded-2xl overflow-hidden">
          {/* Header */}
          <DialogHeader className="shrink-0 border-b border-slate-100 px-6 py-4 bg-white text-left">
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-3 text-left">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600 shrink-0">
                  <Receipt className="h-5 w-5" />
                </div>
                <div className="min-w-0 text-left">
                  <DialogTitle className="text-base font-bold text-slate-900 truncate text-left">
                    {t("modalTitle")}
                  </DialogTitle>
                  <p className="text-xs text-slate-500 mt-0.5 text-left">
                    {t("invoiceCode")}:{" "}
                    <span className="font-mono font-semibold text-slate-700">
                      {payment.invoice_code}
                    </span>
                  </p>
                </div>
              </div>

              <div>
                <span
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold shrink-0",
                    statusBadge.bg
                  )}>
                  <span className="h-1.5 w-1.5 rounded-full bg-current" />
                  {statusBadge.label}
                </span>
              </div>
            </div>
          </DialogHeader>

          {/* Scrollable Content */}
          <div className="flex-1 space-y-4 overflow-y-auto p-6 bg-slate-50/60">
            {/* Payment Summary Box */}
            <div className="rounded-2xl border border-slate-200/90 bg-white p-4 shadow-xs space-y-3">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-700 border-b border-slate-100 pb-2.5">
                {t("paymentInfo")}
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                <div>
                  <span className="text-slate-400 text-[11px] block mb-0.5">{t("paymentMethod")}</span>
                  <p className="font-medium text-slate-800 capitalize flex items-center gap-1.5">
                    <CreditCard className="h-3.5 w-3.5 text-blue-600" />
                    <span>{payment.payment_method || "Online Payment"}</span>
                  </p>
                </div>
                <div>
                  <span className="text-slate-400 text-[11px] block mb-0.5">{t("paymentDate")}</span>
                  <p className="font-medium text-slate-800">
                    {payment.created_at
                      ? new Date(payment.created_at).toLocaleDateString(locale === "en" ? "en-US" : "id-ID", {
                          day: "numeric",
                          month: "short",
                          year: "numeric"
                        })
                      : "—"}
                  </p>
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <span className="text-slate-400 text-[11px] block mb-0.5">{t("totalPaid")}</span>
                  <p className="text-sm font-bold text-blue-600">
                    {formatPrice(payment.amount)}
                  </p>
                </div>
              </div>
            </div>

            {/* Tour Itinerary Details */}
            {isTour && (
              <div className="rounded-2xl border border-slate-200/90 bg-white p-4 shadow-xs space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div>
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-700">
                      {t("itineraryPlan", { count: itineraryItems.length })}
                    </h4>
                    <p className="text-xs text-slate-500 mt-0.5 font-medium">
                      {itinerary?.name || itinerary?.title || tourData?.itinerary?.name || "Tour Package"}
                    </p>
                  </div>
                  <span className="rounded-md bg-blue-50 px-2 py-0.5 text-[11px] font-semibold text-blue-700 border border-blue-100">
                    {tourData?.status || "Confirmed"}
                  </span>
                </div>

                {/* Timeline Items */}
                {isLoadingTour || isLoadingItinerary ? (
                  <div className="flex items-center justify-center p-6 text-slate-400">
                    <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
                  </div>
                ) : itineraryItems.length === 0 ? (
                  <div className="py-4 text-center text-xs text-slate-400">
                    {locale === "en" ? "No itinerary schedule available" : "Rencana perjalanan tidak tersedia"}
                  </div>
                ) : (
                  <div className="pt-1 space-y-1">
                    {itineraryItems.map((item: any, idx: number) => (
                      <DesktopTourItemDetail
                        key={item.id || idx}
                        item={item}
                        dayNumber={idx + 1}
                        startDate={startDate}
                        locale={locale}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Motor Rental Details if applicable */}
            {(payment?.service_type === "rent_motor" || Boolean(payment?.book_motor_id)) && motorData && (
              <div className="rounded-2xl border border-slate-200/90 bg-white p-4 shadow-xs space-y-3">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                  <div className="flex items-center gap-2">
                    <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                      <Bike className="h-4 w-4" />
                    </div>
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-700">
                      {locale === "en" ? "Motor Rental Service" : "Layanan Sewa Motor"}
                    </h4>
                  </div>
                  <span className="rounded-md bg-blue-50 px-2 py-0.5 text-[11px] font-semibold text-blue-700 border border-blue-100 capitalize">
                    {motorData?.status || "Ongoing"}
                  </span>
                </div>
                <div className="space-y-2.5">
                  {motorData.book_motor_items?.map((item: any, idx: number) => (
                    <MotorItemRow
                      key={item.id || idx}
                      motorId={item.motor_id || item.motor?.id}
                      qty={item.qty}
                      price={item.price}
                      subtotal={item.subtotal}
                      formatPrice={formatPrice}
                      variant="drawer"
                    />
                  ))}
                </div>
                  {motorData.start_date && motorData.end_date && (
                    <div className="rounded-lg bg-blue-50/70 p-2.5 text-xs text-blue-800 font-medium flex items-center justify-between">
                      <span>{locale === "en" ? "Rental Period:" : "Periode Sewa:"}</span>
                      <span>
                        {new Date(motorData.start_date).toLocaleDateString(locale === "en" ? "en-US" : "id-ID", {
                          day: "numeric",
                          month: "short",
                          year: "numeric"
                        })}{" "}
                        -{" "}
                        {new Date(motorData.end_date).toLocaleDateString(locale === "en" ? "en-US" : "id-ID", {
                          day: "numeric",
                          month: "short",
                          year: "numeric"
                        })}
                      </span>
                    </div>
                  )}

                  {motorData.booking_add_ons && motorData.booking_add_ons.length > 0 && (
                    <div className="space-y-1 pt-1">
                      <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                        {locale === "en" ? "Add-ons" : "Layanan Tambahan"} ({motorData.booking_add_ons.length})
                      </p>
                      {motorData.booking_add_ons.map((addon: any) => (
                        <div key={addon.id} className="flex items-center justify-between text-xs text-slate-600 pl-1">
                          <span className="truncate">{addon.name}</span>
                          <span className="font-semibold text-slate-800">{formatPrice(addon.price)}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

            {/* Entertainment Attraction Details */}
            {isEntertainment && (
              <div className="rounded-2xl border border-slate-200/90 bg-white p-4 shadow-xs space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2.5 min-w-0 flex-1">
                    <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-50 text-blue-600 shrink-0">
                      <Ticket className="h-4 w-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-700">
                        {locale === "en" ? "Attraction Tickets" : "Tiket Atraksi"}
                      </h4>
                      {attractionTitle ? (
                        <p className="text-xs font-bold text-slate-900 mt-0.5 truncate">
                          {attractionTitle}
                        </p>
                      ) : null}
                      <p className="text-[11px] text-slate-500 mt-0.5 font-medium">
                        {(entertainmentData?.book_entertainment_attraction_items || []).length}{" "}
                        {locale === "en" ? "ticket package(s)" : "paket tiket"}
                      </p>
                    </div>
                  </div>
                  <span className="rounded-md bg-blue-50 px-2 py-0.5 text-[11px] font-semibold text-blue-700 border border-blue-100 capitalize shrink-0">
                    {entertainmentData?.status || "Confirmed"}
                  </span>
                </div>

                {isLoadingEntertainment ? (
                  <div className="flex items-center justify-center p-6 text-slate-400">
                    <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
                  </div>
                ) : (entertainmentData?.book_entertainment_attraction_items || []).length === 0 ? (
                  <div className="py-4 text-center text-xs text-slate-400">
                    {locale === "en" ? "No ticket details available" : "Rincian tiket tidak tersedia"}
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {entertainmentData.book_entertainment_attraction_items.map((item: any, idx: number) => {
                      const itemAttraction = item.entertainment_attraction_name || attractionTitle;
                      return (
                        <div
                          key={item.id || idx}
                          className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50/60 p-3 text-xs gap-3">
                          <div className="min-w-0 flex-1">
                            {itemAttraction && (
                              <p className="text-[11px] font-semibold text-blue-600 truncate mb-0.5 flex items-center gap-1">
                                <Sparkles className="h-3 w-3 text-blue-500 shrink-0" />
                                <span>{itemAttraction}</span>
                              </p>
                            )}
                            <p className="font-bold text-xs text-slate-800 truncate">
                              {item.ticket_name || `Ticket ${idx + 1}`}
                            </p>
                            <p className="text-[11px] text-slate-500 mt-0.5">
                              {locale === "en" ? "Qty" : "Jumlah"}: {item.qty}
                            </p>
                          </div>
                          <p className="font-bold text-slate-900 shrink-0">
                            {formatPrice(item.subtotal || item.unit_price * item.qty || 0)}
                          </p>
                        </div>
                      );
                    })}

                    {/* Visit date if available */}
                    {visitDateFormatted && (
                      <div className="rounded-xl border border-blue-100 bg-blue-50/60 p-3 text-xs text-blue-900 flex items-center gap-2">
                        <Calendar className="h-3.5 w-3.5 text-blue-600 shrink-0" />
                        <span className="font-semibold">
                          {locale === "en" ? "Visit Date:" : "Tanggal Kunjungan:"}
                        </span>
                        <span className="font-medium">{visitDateFormatted}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Document Visa Details */}
            {isDocumentVisa && (
              <div className="rounded-2xl border border-slate-200/90 bg-white p-4 shadow-xs space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2.5 min-w-0 flex-1">
                    <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-50 text-blue-600 shrink-0">
                      <FileText className="h-4 w-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-700">
                        {locale === "en" ? "Document & Visa Details" : "Layanan Dokumen & Visa"}
                      </h4>
                      <p className="text-xs font-bold text-slate-900 mt-0.5 truncate">
                        {documentVisaData?.document_visa_title ||
                          (documentVisaData?.country_name
                            ? `Visa ${documentVisaData.country_name}`
                            : "Document & Visa Application")}
                      </p>
                      {documentVisaData?.country_name && (
                        <p className="flex items-center gap-1 text-[11px] text-slate-500 mt-0.5 truncate">
                          <MapPin className="h-3 w-3 text-red-500 shrink-0" />
                          <span>{documentVisaData.country_name}</span>
                        </p>
                      )}
                    </div>
                  </div>
                  <span className="rounded-md bg-blue-50 px-2 py-0.5 text-[11px] font-semibold text-blue-700 border border-blue-100 capitalize shrink-0">
                    {documentVisaData?.status
                      ? String(documentVisaData.status).replace(/_/g, " ")
                      : "Confirmed"}
                  </span>
                </div>

                {isLoadingDocumentVisa ? (
                  <div className="flex items-center justify-center p-6 text-slate-400">
                    <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
                  </div>
                ) : (
                  <div className="space-y-3">
                    {/* Items / Packages List */}
                    {documentVisaData?.items && documentVisaData.items.length > 0 ? (
                      documentVisaData.items.map((item: any, idx: number) => (
                        <div
                          key={item.id || idx}
                          className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50/60 p-3 text-xs gap-3">
                          <div className="min-w-0 flex-1">
                            <p className="font-bold text-xs text-slate-800 truncate">
                              {item.package_name || documentVisaData?.package_name || `Visa Package`}
                            </p>
                            <p className="text-[11px] text-slate-500 mt-0.5">
                              {locale === "en" ? "Qty" : "Jumlah"}: {item.qty} {locale === "en" ? "applicant(s)" : "pemohon"} × {formatPrice(item.unit_price)}
                            </p>
                          </div>
                          <p className="font-bold text-slate-900 shrink-0">
                            {formatPrice(item.subtotal || item.unit_price * item.qty || 0)}
                          </p>
                        </div>
                      ))
                    ) : (
                      <div className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50/60 p-3 text-xs gap-3">
                        <div className="min-w-0 flex-1">
                          <p className="font-bold text-xs text-slate-800 truncate">
                            {documentVisaData?.package_name || "Visa Package"}
                          </p>
                          <p className="text-[11px] text-slate-500 mt-0.5">
                            {locale === "en" ? "Applicant(s)" : "Jumlah Pemohon"}: {documentVisaData?.applicant_count || 1}
                          </p>
                        </div>
                        <p className="font-bold text-slate-900 shrink-0">
                          {formatPrice(documentVisaData?.total_price || payment.amount)}
                        </p>
                      </div>
                    )}

                    {/* Target Travel Date Banner */}
                    {documentVisaData?.target_travel_date && (
                      <div className="rounded-xl border border-blue-100 bg-blue-50/60 p-3 text-xs text-blue-900 flex items-center gap-2">
                        <Calendar className="h-3.5 w-3.5 text-blue-600 shrink-0" />
                        <span className="font-semibold">
                          {locale === "en" ? "Target Travel Date:" : "Target Keberangkatan:"}
                        </span>
                        <span className="font-medium">
                          {formatDateSafe(documentVisaData.target_travel_date, locale)}
                        </span>
                      </div>
                    )}

                    {/* Processing Time */}
                    {documentVisaData?.processing_time_days ? (
                      <div className="flex items-center justify-between rounded-lg border border-slate-100 bg-white p-2.5 text-xs text-slate-700">
                        <span className="text-slate-500">
                          {locale === "en" ? "Estimated Processing:" : "Estimasi Proses:"}
                        </span>
                        <span className="font-semibold">
                          {documentVisaData.processing_time_days} {locale === "en" ? "working days" : "hari kerja"}
                        </span>
                      </div>
                    ) : null}

                    {/* Notes / Special Request */}
                    {documentVisaData?.note ? (
                      <div className="rounded-xl border border-slate-100 bg-slate-50/60 p-3 text-xs space-y-1">
                        <span className="font-semibold text-slate-600 block text-[11px]">
                          {locale === "en" ? "Notes / Special Requests:" : "Catatan Khusus:"}
                        </span>
                        <p className="text-slate-700 leading-relaxed italic">{documentVisaData.note}</p>
                      </div>
                    ) : null}
                  </div>
                )}
              </div>
            )}

            {/* Booker Information */}
            {booker && (booker.name || booker.email || booker.phone_number || booker.phone) && (
              <div className="rounded-2xl border border-slate-200/90 bg-white p-4 shadow-xs space-y-3">
                <div className="flex items-center gap-2 border-b border-slate-100 pb-2.5">
                  <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                    <User className="h-3.5 w-3.5" />
                  </div>
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-700">
                    {locale === "en" ? "Booker Information" : "Data Pemesan"}
                  </h4>
                </div>
                <div className="space-y-2 text-xs">
                  {booker.name && (
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400 text-[11px]">{locale === "en" ? "Name" : "Nama"}</span>
                      <span className="font-semibold text-slate-800">{booker.name}</span>
                    </div>
                  )}
                  {booker.email && (
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400 text-[11px]">{locale === "en" ? "Email" : "Email"}</span>
                      <span className="font-semibold text-slate-800 break-all">{booker.email}</span>
                    </div>
                  )}
                  {(booker.phone_number || booker.phone) && (
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400 text-[11px]">{locale === "en" ? "Phone" : "No. Telepon"}</span>
                      <span className="font-semibold text-slate-800">{booker.phone_number || booker.phone}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Tourist / Visitor Details */}
            {tourists && tourists.length > 0 && (
              <div className="rounded-2xl border border-slate-200/90 bg-white p-4 shadow-xs space-y-3">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                  <div className="flex items-center gap-2">
                    <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                      <Users className="h-3.5 w-3.5" />
                    </div>
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-700">
                      {isEntertainment
                        ? locale === "en"
                          ? "Visitor Details"
                          : "Data Pengunjung"
                        : isDocumentVisa
                        ? locale === "en"
                          ? "Applicant Details"
                          : "Data Pemohon Visa"
                        : locale === "en"
                        ? "Traveler Details"
                        : "Data Wisatawan"}
                    </h4>
                  </div>
                  <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-600">
                    {tourists.length}{" "}
                    {locale === "en"
                      ? isDocumentVisa
                        ? tourists.length === 1
                          ? "applicant"
                          : "applicants"
                        : tourists.length === 1
                        ? "person"
                        : "people"
                      : "orang"}
                  </span>
                </div>

                <div className="space-y-2.5">
                  {tourists.map((tItem: any, tIdx: number) => {
                    const tBirthDate = tItem.birth_date
                      ? formatDateSafe(tItem.birth_date, locale)
                      : null;
                    return (
                      <div
                        key={tItem.id || tIdx}
                        className="rounded-xl border border-slate-100 bg-slate-50/60 p-3 text-xs space-y-2">
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-600 text-[10px] font-bold text-white shrink-0">
                              {tIdx + 1}
                            </span>
                            <span className="font-bold text-slate-800">
                              {tItem.gender ? `${tItem.gender}. ` : ""}{tItem.name || tItem.full_name}
                            </span>
                          </div>
                          {tIdx === 0 ? (
                            <span className="rounded-md bg-blue-50 border border-blue-100 px-2 py-0.5 text-[10px] font-semibold text-blue-700">
                              {locale === "en" ? "Primary" : "Utama"}
                            </span>
                          ) : tItem.status ? (
                            <span className="rounded-md bg-slate-100 border border-slate-200 px-2 py-0.5 text-[10px] font-semibold text-slate-600 capitalize">
                              {tItem.status.replace(/_/g, " ")}
                            </span>
                          ) : null}
                        </div>

                        <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-200/50 text-[11px]">
                          {(tItem.passport_number || tItem.passportNumber) && (
                            <div>
                              <span className="text-slate-400 block text-[10px]">
                                {locale === "en" ? "ID / Passport" : "No. Identitas / Paspor"}
                              </span>
                              <span className="font-mono font-medium text-slate-700">
                                {tItem.passport_number || tItem.passportNumber}
                              </span>
                            </div>
                          )}
                          {tItem.nationality && (
                            <div>
                              <span className="text-slate-400 block text-[10px]">
                                {locale === "en" ? "Nationality" : "Kewarganegaraan"}
                              </span>
                              <span className="font-medium text-slate-700">{tItem.nationality}</span>
                            </div>
                          )}
                          {(tItem.phone_number || tItem.phoneNumber) && (
                            <div>
                              <span className="text-slate-400 block text-[10px]">
                                {locale === "en" ? "Phone" : "No. Telepon"}
                              </span>
                              <span className="font-medium text-slate-700">
                                {tItem.phone_number || tItem.phoneNumber}
                              </span>
                            </div>
                          )}
                          {tBirthDate && (
                            <div>
                              <span className="text-slate-400 block text-[10px]">
                                {locale === "en" ? "Date of Birth" : "Tanggal Lahir"}
                              </span>
                              <span className="font-medium text-slate-700">{tBirthDate}</span>
                            </div>
                          )}
                          {tItem.occupation && (
                            <div>
                              <span className="text-slate-400 block text-[10px]">
                                {locale === "en" ? "Occupation" : "Pekerjaan"}
                              </span>
                              <span className="font-medium text-slate-700 capitalize">{tItem.occupation}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div className="shrink-0 border-t border-slate-100 bg-white px-6 py-4 flex items-center justify-between gap-3">
            {canCancel ? (
              <Button
                type="button"
                variant="ghost"
                onClick={() => setShowCancelAlert(true)}
                disabled={isCancelling}
                className="rounded-xl text-xs font-semibold text-red-500 hover:text-red-700 hover:bg-red-50 px-3 h-10 flex items-center gap-1.5">
                <Trash2 className="h-3.5 w-3.5" />
                <span>{t("cancelPayment")}</span>
              </Button>
            ) : (
              <div />
            )}

            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="rounded-xl border-slate-200 text-xs font-medium text-slate-700 hover:bg-slate-50 px-5 h-10">
              {t("close")}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Cancel Confirmation Alert */}
      <AlertDialog open={showCancelAlert} onOpenChange={setShowCancelAlert}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("cancelConfirmTitle")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("cancelConfirmDesc")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isCancelling}>{t("cancelKeepBtn")}</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleCancelPayment}
              disabled={isCancelling}
              className="bg-red-600 hover:bg-red-700 text-white font-medium">
              {isCancelling ? t("cancelling") : t("cancelConfirmBtn")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

// My Orders Content Component (Payment History)
const MyOrdersContent = () => {
  const locale = useLocale();
  const t = useTranslations("Orders");
  const currentCurrency = useSelector(
    (state: any) => state.currency || { code: "IDR", symbol: "Rp", idrToUsdRate: 16000 }
  );

  const { data: paymentsData, isLoading, error } = useFindAllPaymentQuery();
  const [selectedPayment, setSelectedPayment] = useState<any>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"all" | "success" | "history">("all");

  const payments: any[] = paymentsData?.data || paymentsData?.datas || [];

  const filteredPayments = useMemo(() => {
    return payments.filter((p: any) => {
      const s = (p.status || "").toLowerCase();
      if (activeTab === "all") return true;
      if (activeTab === "success") {
        return s === "success" || s === "succes" || s === "completed" || s === "paid";
      }
      if (activeTab === "history") {
        return s === "failed" || s === "cancelled" || s === "expired";
      }
      return true;
    });
  }, [payments, activeTab]);

  const handleOpenDetail = (payment: any) => {
    setSelectedPayment(payment);
    setIsDetailOpen(true);
  };

  const formatPrice = (rawPrice: number) => {
    let displayPrice = Number(rawPrice || 0);
    if (currentCurrency.code !== "USD") {
      displayPrice = displayPrice * (currentCurrency.idrToUsdRate || 1);
    }
    return new Intl.NumberFormat(
      currentCurrency.code === "IDR"
        ? "id-ID"
        : currentCurrency.code === "TRY"
        ? "tr-TR"
        : "en-US",
      {
        style: "currency",
        currency: currentCurrency.code,
        maximumFractionDigits: currentCurrency.code === "IDR" ? 0 : 2
      }
    )
      .format(displayPrice)
      .replace("$", "US$ ");
  };

  const getStatusBadge = (status: string) => {
    const s = (status || "").toLowerCase();
    if (s === "success" || s === "succes" || s === "completed" || s === "paid") {
      return { label: "Success", bg: "bg-emerald-50 text-emerald-700 border-emerald-200" };
    }
    if (s === "pending") {
      return { label: "Pending", bg: "bg-amber-50 text-amber-700 border-amber-200" };
    }
    if (s === "cancelled" || s === "failed") {
      return { label: s === "cancelled" ? "Cancelled" : "Failed", bg: "bg-red-50 text-red-700 border-red-200" };
    }
    return { label: status || "Draft", bg: "bg-slate-50 text-slate-700 border-slate-200" };
  };

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header & Category Filter Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-100 pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <h2 className="text-xl font-bold text-slate-900">{t("title")}</h2>
            <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-600 border border-slate-200/60">
              {filteredPayments.length}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">{t("subtitle")}</p>
        </div>

        <div className="flex rounded-xl bg-slate-100 p-1 border border-slate-200/60">
          <button
            type="button"
            onClick={() => setActiveTab("all")}
            className={cn(
              "rounded-lg px-3.5 py-1.5 text-xs font-semibold transition-all",
              activeTab === "all"
                ? "bg-white text-slate-900 shadow-xs"
                : "text-slate-500 hover:text-slate-700"
            )}>
            {t("allTab")}
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("success")}
            className={cn(
              "rounded-lg px-3.5 py-1.5 text-xs font-semibold transition-all",
              activeTab === "success"
                ? "bg-white text-slate-900 shadow-xs"
                : "text-slate-500 hover:text-slate-700"
            )}>
            {t("successTab")}
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("history")}
            className={cn(
              "rounded-lg px-3.5 py-1.5 text-xs font-semibold transition-all",
              activeTab === "history"
                ? "bg-white text-slate-900 shadow-xs"
                : "text-slate-500 hover:text-slate-700"
            )}>
            {t("historyTab")}
          </button>
        </div>
      </div>

      {/* Table / Empty State */}
      {filteredPayments.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-200 py-16 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 mb-3 shadow-xs">
            <Ticket className="h-7 w-7 text-blue-500" />
          </div>
          <h3 className="text-sm font-bold text-slate-900 mb-1">{t("emptyTitle")}</h3>
          <p className="text-xs text-slate-500 max-w-xs mx-auto leading-relaxed">{t("emptyDesc")}</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-100 bg-slate-50/80">
                <tr>
                  <th className="px-5 py-3.5 font-semibold text-slate-600 uppercase tracking-wider text-[11px]">
                    {t("invoiceCode")}
                  </th>
                  <th className="px-5 py-3.5 font-semibold text-slate-600 uppercase tracking-wider text-[11px]">
                    Layanan
                  </th>
                  <th className="px-5 py-3.5 font-semibold text-slate-600 uppercase tracking-wider text-[11px]">
                    {t("paymentDate")}
                  </th>
                  <th className="px-5 py-3.5 font-semibold text-slate-600 uppercase tracking-wider text-[11px]">
                    {t("paymentMethod")}
                  </th>
                  <th className="px-5 py-3.5 font-semibold text-slate-600 uppercase tracking-wider text-[11px]">
                    {t("totalPaid")}
                  </th>
                  <th className="px-5 py-3.5 font-semibold text-slate-600 uppercase tracking-wider text-[11px]">
                    Status
                  </th>
                  <th className="px-5 py-3.5 text-right font-semibold text-slate-600 uppercase tracking-wider text-[11px]">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredPayments.map((payment: any) => {
                  const status = getStatusBadge(payment.status);
                  const isPending =
                    payment.status?.toLowerCase() === "pending" ||
                    payment.status?.toLowerCase() === "failed";

                  return (
                    <tr key={payment.id} className="transition-colors hover:bg-slate-50/60">
                      <td className="px-5 py-4 whitespace-nowrap">
                        <span className="font-mono font-semibold text-slate-800 bg-slate-100 border border-slate-200/70 px-2.5 py-1 rounded-md">
                          {payment.invoice_code || payment.id.slice(0, 15)}
                        </span>
                      </td>
                      <td className="px-5 py-4 whitespace-nowrap font-medium text-slate-700">
                        {payment.service_type === "document_visa" || Boolean(payment.book_document_visa_id)
                          ? (locale === "en" ? "Document Visa" : "Dokumen Visa")
                          : payment.service_type === "rent_motor" || Boolean(payment.book_motor_id)
                          ? (locale === "en" ? "Motor Rental" : "Sewa Motor")
                          : payment.service_type === "entertainment" || Boolean(payment.book_entertainment_attraction_id)
                          ? (locale === "en" ? "Attraction Ticket" : "Tiket Atraksi")
                          : (locale === "en" ? "Tour Package" : "Paket Tour")}
                      </td>
                      <td className="px-5 py-4 whitespace-nowrap text-slate-600">
                        {payment.created_at
                          ? new Date(payment.created_at).toLocaleDateString(
                              locale === "en" ? "en-US" : "id-ID",
                              { day: "numeric", month: "short", year: "numeric" }
                            )
                          : "—"}
                      </td>
                      <td className="px-5 py-4 whitespace-nowrap">
                        <span className="capitalize font-medium text-slate-700 flex items-center gap-1.5">
                          <CreditCard className="h-3.5 w-3.5 text-blue-600" />
                          <span>{payment.payment_method || "PayPal"}</span>
                        </span>
                      </td>
                      <td className="px-5 py-4 whitespace-nowrap font-bold text-slate-900">
                        {formatPrice(payment.amount)}
                      </td>
                      <td className="px-5 py-4 whitespace-nowrap">
                        <span
                          className={cn(
                            "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold",
                            status.bg
                          )}>
                          <span className="h-1.5 w-1.5 rounded-full bg-current" />
                          {status.label}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => handleOpenDetail(payment)}
                            className="h-8 rounded-lg border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center gap-1.5">
                            <Eye className="h-3.5 w-3.5 text-slate-500" />
                            <span>{t("viewDetails")}</span>
                          </Button>
                          {isPending && (() => {
                            const payType = payment.service_type === "document_visa" || Boolean(payment.book_document_visa_id)
                              ? "document-visa"
                              : payment.service_type === "rent_motor" || Boolean(payment.book_motor_id)
                              ? "motor"
                              : payment.service_type === "entertainment" || Boolean(payment.book_entertainment_attraction_id)
                              ? "entertainment"
                              : "tour";
                            const payId = payment.service_type === "document_visa" || Boolean(payment.book_document_visa_id)
                              ? (payment.book_document_visa_id || payment.id)
                              : payment.id;
                            return (
                              <Link href={`/${locale}/payments?order_id=${payId}&type=${payType}`}>
                                <Button
                                  type="button"
                                  size="sm"
                                  className="h-8 rounded-lg bg-blue-600 text-xs font-semibold text-white hover:bg-blue-700 px-3">
                                  Bayar
                                </Button>
                              </Link>
                            );
                          })()}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      <OrderDetailModal
        open={isDetailOpen}
        onOpenChange={setIsDetailOpen}
        payment={selectedPayment}
      />
    </div>
  );
};

// Desktop View Component
const DesktopProfileView = ({
  isLoggedIn,
  userName,
  userEmail,
  activeTab,
  setActiveTab
}: {
  isLoggedIn: boolean;
  userName: string;
  userEmail: string;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}) => {
  const tProfile = useTranslations("Profile");
  const { handleLogout, isLoading: isLoggingOut } = useLogout();
  const [isEditing, setIsEditing] = useState(false);

  // Fetch user data to get user ID (still needed for create/update)
  const { data: userData } = useGetUserQuery();
  const userId = userData?.data?.id;

  // Fetch profile data using the secure /profiles/me endpoint
  const {
    data: profileData,
    isLoading: isLoadingProfile,
    error: profileError,
    refetch: refetchProfile
  } = useGetProfileQuery();

  // Extract profile information
  // Handle "Profile not found" as valid empty state (profile doesn't exist yet)
  const isProfileNotFound =
    profileError &&
    "data" in profileError &&
    typeof profileError.data === "object" &&
    profileError.data !== null &&
    "message" in profileError.data &&
    (profileError.data as any).message === "Profile not found";

  const profile = isProfileNotFound ? null : profileData?.data;

  // Mutations
  const [createProfile, { isLoading: isCreating }] = useCreateProfileMutation();
  const [updateProfile, { isLoading: isUpdating }] = useUpdateProfileMutation();

  // Formik setup
  const formik = useFormik<ProfileFormValues>({
    initialValues: {
      phone_number: profile?.phone_number || "",
      address: profile?.address || "",
      state: profile?.state || "",
      country: profile?.country || ""
    },
    enableReinitialize: true,
    validate: (values) => {
      const result = profileSchema.safeParse(values);
      if (!result.success) {
        const errors: any = {};
        result.error.issues.forEach((issue) => {
          const path = issue.path[0];
          if (path) {
            errors[path] = issue.message;
          }
        });
        return errors;
      }
      return {};
    },
    onSubmit: async (values) => {
      try {
        if (!userId) {
          toast.error("User ID not found");
          return;
        }

        if (profile?.id) {
          // Update existing profile
          await updateProfile({
            id: profile.id,
            user_id: userId,
            ...values
          }).unwrap();
          toast.success("Profile updated successfully!");
        } else {
          // Create new profile
          await createProfile({
            user_id: userId,
            ...values
          }).unwrap();
          toast.success("Profile created successfully!");
        }

        // Manually refetch profile data to ensure UI updates
        await refetchProfile();
        setIsEditing(false);
      } catch (error: any) {
        toast.error(error?.data?.message || "Failed to save profile");
      }
    }
  });

  const handleCancel = () => {
    formik.resetForm({
      values: {
        phone_number: profile?.phone_number || "",
        address: profile?.address || "",
        state: profile?.state || "",
        country: profile?.country || ""
      }
    });
    setIsEditing(false);
  };

  const isSubmitting = isCreating || isUpdating;

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="mx-auto pt-48 pb-24 max-w-7xl px-4">
        <div className="flex gap-8">
          {/* Sidebar */}
          <div className="w-64 shrink-0">
            <div className="rounded-lg bg-white p-6 shadow-sm">
              {/* User Avatar */}
              <div className="mb-6 flex flex-col items-center text-center">
                <div className="relative mb-3 h-16 w-16 overflow-hidden rounded-full">
                  <Image
                    src={`/images/avatars/${Math.abs(userName.charCodeAt(0) % 12) + 1}.png`}
                    alt={userName}
                    fill
                    className="object-cover"
                  />
                </div>
                <h3 className="font-semibold text-gray-900">{userName}</h3>
                <p className="text-sm text-gray-500">{userEmail}</p>
              </div>

              {/* Navigation Menu */}
              <nav className="space-y-1">
                <button
                  onClick={() => setActiveTab("account")}
                  className={`flex w-full items-center gap-3 rounded-lg px-4 py-3 text-left transition-colors ${
                    activeTab === "account"
                      ? "bg-blue-50 text-blue-600"
                      : "text-gray-700 hover:bg-gray-50"
                  }`}>
                  <User className="h-5 w-5" />
                  <span className="font-medium">{tProfile("accountInfo")}</span>
                </button>
                <button
                  onClick={() => setActiveTab("my-booking")}
                  className={`flex w-full items-center gap-3 rounded-lg px-4 py-3 text-left transition-colors ${
                    activeTab === "my-booking"
                      ? "bg-blue-50 text-blue-600"
                      : "text-gray-700 hover:bg-gray-50"
                  }`}>
                  <Ticket className="h-5 w-5" />
                  <span className="font-medium">{tProfile("myBooking")}</span>
                </button>
                <button
                  onClick={() => setActiveTab("orders")}
                  className={`flex w-full items-center gap-3 rounded-lg px-4 py-3 text-left transition-colors ${
                    activeTab === "orders"
                      ? "bg-blue-50 text-blue-600"
                      : "text-gray-700 hover:bg-gray-50"
                  }`}>
                  <Gift className="h-5 w-5" />
                  <span className="font-medium">{tProfile("myOrders")}</span>
                </button>
                <button
                  onClick={() => setActiveTab("tickets")}
                  className={`flex w-full items-center gap-3 rounded-lg px-4 py-3 text-left transition-colors ${
                    activeTab === "tickets"
                      ? "bg-blue-50 text-blue-600"
                      : "text-gray-700 hover:bg-gray-50"
                  }`}>
                  <Wallet className="h-5 w-5" />
                  <span className="font-medium">{tProfile("savedTickets")}</span>
                </button>

                <button
                  onClick={() => setActiveTab("settings")}
                  className={`flex w-full items-center gap-3 rounded-lg px-4 py-3 text-left transition-colors ${
                    activeTab === "settings"
                      ? "bg-blue-50 text-blue-600"
                      : "text-gray-700 hover:bg-gray-50"
                  }`}>
                  <Settings className="h-5 w-5" />
                  <span className="font-medium">{tProfile("accountSettings")}</span>
                </button>
                <button
                  onClick={handleLogout}
                  disabled={isLoggingOut}
                  className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-left text-red-600 transition-colors hover:bg-red-50 disabled:opacity-50">
                  <LogOut className="h-5 w-5" />
                  <span className="font-medium">
                    {isLoggingOut ? "Logging out..." : tProfile("logout")}
                  </span>
                </button>
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            <div className="rounded-lg bg-white p-8 shadow-sm">
              {activeTab === "my-booking" ? (
                <MyBookingContent userName={userName} />
              ) : activeTab === "orders" ? (
                <MyOrdersContent />
              ) : (
                <>
                  <h2 className="mb-6 text-2xl font-bold text-gray-900">Informasi Akun</h2>

                  {/* Loading State */}
                  {isLoadingProfile ? (
                    <div className="space-y-6">
                      <div className="animate-pulse">
                        <div className="mb-4 h-6 w-32 rounded bg-gray-200"></div>
                        <div className="grid grid-cols-2 gap-6">
                          {[...Array(6)].map((_, i) => (
                            <div key={i}>
                              <div className="mb-2 h-4 w-24 rounded bg-gray-200"></div>
                              <div className="h-10 rounded bg-gray-200"></div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <>
                      {/* Personal Data Section */}
                      <form onSubmit={formik.handleSubmit}>
                        <div className="mb-8">
                          <h3 className="mb-4 text-lg font-semibold text-gray-900">Data Pribadi</h3>
                          <div className="grid grid-cols-2 gap-6">
                            <div>
                              <Label
                                htmlFor="fullName"
                                className="mb-2 block text-sm font-medium text-gray-700">
                                Nama lengkap
                              </Label>
                              <Input
                                id="fullName"
                                value={userName || ""}
                                readOnly
                                className="border-gray-300 bg-gray-50 focus:border-blue-500 focus:ring-blue-500"
                              />
                            </div>
                            <div>
                              <Label
                                htmlFor="email"
                                className="mb-2 block text-sm font-medium text-gray-700">
                                Email
                              </Label>
                              <Input
                                id="email"
                                type="email"
                                value={userEmail || ""}
                                disabled
                                className="border-gray-300 bg-gray-50 focus:border-blue-500 focus:ring-blue-500"
                              />
                            </div>
                            <div className="col-span-2">
                              <Label
                                htmlFor="address"
                                className="mb-2 block text-sm font-medium text-gray-700">
                                Address
                              </Label>
                              <Textarea
                                id="address"
                                name="address"
                                value={formik.values.address}
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                disabled={!isEditing}
                                className={`border-gray-300 focus:border-blue-500 focus:ring-blue-500 ${
                                  !isEditing ? "bg-gray-50" : ""
                                }`}
                              />
                              {formik.touched.address && formik.errors.address && (
                                <p className="mt-1 text-sm text-red-600">{formik.errors.address}</p>
                              )}
                            </div>
                            <div>
                              <Label
                                htmlFor="phone_number"
                                className="mb-2 block text-sm font-medium text-gray-700">
                                No. Handphone
                              </Label>
                              <Input
                                id="phone_number"
                                name="phone_number"
                                value={formik.values.phone_number}
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                disabled={!isEditing}
                                className={`border-gray-300 focus:border-blue-500 focus:ring-blue-500 ${
                                  !isEditing ? "bg-gray-50" : ""
                                }`}
                              />
                              {formik.touched.phone_number && formik.errors.phone_number && (
                                <p className="mt-1 text-sm text-red-600">
                                  {formik.errors.phone_number}
                                </p>
                              )}
                            </div>
                            <div>
                              <Label
                                htmlFor="state"
                                className="mb-2 block text-sm font-medium text-gray-700">
                                State
                              </Label>
                              <Input
                                id="state"
                                name="state"
                                value={formik.values.state}
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                disabled={!isEditing}
                                className={`border-gray-300 focus:border-blue-500 focus:ring-blue-500 ${
                                  !isEditing ? "bg-gray-50" : ""
                                }`}
                              />
                              {formik.touched.state && formik.errors.state && (
                                <p className="mt-1 text-sm text-red-600">{formik.errors.state}</p>
                              )}
                            </div>
                            <div>
                              <Label
                                htmlFor="country"
                                className="mb-2 block text-sm font-medium text-gray-700">
                                Country
                              </Label>
                              <Input
                                id="country"
                                name="country"
                                value={formik.values.country}
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                disabled={!isEditing}
                                className={`border-gray-300 focus:border-blue-500 focus:ring-blue-500 ${
                                  !isEditing ? "bg-gray-50" : ""
                                }`}
                              />
                              {formik.touched.country && formik.errors.country && (
                                <p className="mt-1 text-sm text-red-600">{formik.errors.country}</p>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex justify-end gap-3">
                          {!isEditing ? (
                            <Button
                              type="button"
                              onClick={() => setIsEditing(true)}
                              className="bg-blue-600 hover:bg-blue-700">
                              Edit Profil
                            </Button>
                          ) : (
                            <>
                              <Button
                                type="button"
                                variant="outline"
                                onClick={handleCancel}
                                disabled={isSubmitting}
                                className="border-gray-300 text-gray-700 hover:bg-gray-50">
                                Batal
                              </Button>
                              <Button
                                type="submit"
                                disabled={isSubmitting}
                                className="bg-blue-600 hover:bg-blue-700">
                                {isSubmitting ? "Menyimpan..." : "Simpan"}
                              </Button>
                            </>
                          )}
                        </div>
                      </form>
                    </>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
