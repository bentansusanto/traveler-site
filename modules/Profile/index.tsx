"use client";
import { MobileBottomNavbar } from "@/components/layout/traveler-layout/MobileBottomNavbar";
import { TravelerLayout } from "@/components/layout/traveler-layout/TravelerLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useIsMobile } from "@/hooks/use-mobile";
import { useLogout } from "@/hooks/useLogout";
import { useGetUserQuery } from "@/store/services/auth.service";
import Cookies from "js-cookie";
import {
  ChevronRight,
  Gift,
  Globe,
  Headphones,
  Info,
  LogOut,
  Settings,
  User,
  Wallet
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

export const ProfilePage = () => {
  const isMobile = useIsMobile();
  const [activeTab, setActiveTab] = useState("account");

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
    const token = Cookies.get("travel_token");
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
  const { handleLogout, isLoading: isLoggingOut } = useLogout();

  // If not logged in, show different layout
  if (!isLoggedIn) {
    return (
      <>
        <div className="min-h-screen bg-gray-50 pb-20">
          {/* Blue Gradient Header */}
          <div className="relative h-40 bg-gradient-to-br from-blue-500 to-blue-600 px-5 pt-8">
            <h1 className="text-2xl font-bold text-white">Hi, sobat tiket</h1>
          </div>

          <div className="relative -mt-20 space-y-4 px-4 pb-8">
            {/* Login/Register Card */}
            <div className="rounded-2xl bg-white p-5 shadow-sm">
              <div className="mb-4 flex items-start gap-3">
                <div className="text-4xl">🎁</div>
                <div>
                  <h3 className="mb-1 font-semibold text-gray-900">Ada banyak diskon buatmu!</h3>
                  <p className="text-sm text-gray-600">
                    Log in atau daftar untuk menikmati diskon dan penawaran khusus.
                  </p>
                </div>
              </div>
              <Link href="/login" className="block">
                <Button className="w-full bg-blue-600 text-white hover:bg-blue-700">
                  Log in atau daftar
                </Button>
              </Link>
            </div>

            {/* Rewards Card */}
            <div className="rounded-2xl bg-gradient-to-r from-teal-400 to-blue-400 p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="mb-1 font-semibold text-white">Lihat benefit buatmu di sini</h3>
                  <p className="text-sm text-white/90">Cek penawaran dari Blibi Tiket Rewards!</p>
                </div>
                <div className="text-3xl">💰</div>
              </div>
            </div>

            {/* Customer Care 24/7 */}
            <div className="rounded-2xl bg-white p-5 shadow-sm">
              <h2 className="mb-4 font-bold text-gray-900">Customer Care 24/7</h2>
              <div className="space-y-3">
                <button className="flex w-full items-center justify-between rounded-lg p-3 transition-colors hover:bg-gray-50">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100">
                      <Headphones className="h-5 w-5 text-gray-600" />
                    </div>
                    <div className="text-left">
                      <p className="font-medium text-gray-900">Pusat Bantuan halo tiket</p>
                      <span className="inline-block rounded bg-red-600 px-2 py-0.5 text-[10px] font-bold text-white">
                        Baru
                      </span>
                    </div>
                  </div>
                  <ChevronRight className="h-5 w-5 text-gray-400" />
                </button>
                <button className="flex w-full items-center justify-between rounded-lg p-3 transition-colors hover:bg-gray-50">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100">
                      <Headphones className="h-5 w-5 text-gray-600" />
                    </div>
                    <p className="font-medium text-gray-900">Bantuan Langsung</p>
                  </div>
                  <ChevronRight className="h-5 w-5 text-gray-400" />
                </button>
              </div>
            </div>

            {/* Pengaturan */}
            <div className="rounded-2xl bg-white p-5 shadow-sm">
              <h2 className="mb-4 font-bold text-gray-900">Pengaturan</h2>
              <div className="space-y-3">
                <button className="flex w-full items-center justify-between rounded-lg p-3 transition-colors hover:bg-gray-50">
                  <div className="flex items-center gap-3">
                    <Globe className="h-5 w-5 text-gray-600" />
                    <p className="font-medium text-gray-900">Bahasa</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-500">Indonesia</span>
                    <ChevronRight className="h-5 w-5 text-gray-400" />
                  </div>
                </button>
                <button className="flex w-full items-center justify-between rounded-lg p-3 transition-colors hover:bg-gray-50">
                  <div className="flex items-center gap-3">
                    <Wallet className="h-5 w-5 text-gray-600" />
                    <p className="font-medium text-gray-900">Mata Uang</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-500">IDR</span>
                    <ChevronRight className="h-5 w-5 text-gray-400" />
                  </div>
                </button>
              </div>
            </div>

            {/* Lainnya */}
            <div className="rounded-2xl bg-white p-5 shadow-sm">
              <h2 className="mb-4 font-bold text-gray-900">Lainnya</h2>
              <button className="flex w-full items-center justify-between rounded-lg p-3 transition-colors hover:bg-gray-50">
                <div className="flex items-center gap-3">
                  <Info className="h-5 w-5 text-gray-600" />
                  <p className="font-medium text-gray-900">Tentang tiket.com</p>
                </div>
                <ChevronRight className="h-5 w-5 text-gray-400" />
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Bottom Navbar */}
        <MobileBottomNavbar />
      </>
    );
  }

  // If logged in, show original layout
  return (
    <>
      <div className="min-h-screen bg-gray-50 pb-20">
        {/* Blue Gradient Header */}
        <div className="relative h-40 bg-gradient-to-br from-blue-500 to-blue-600 px-5 pt-8">
          <h1 className="text-2xl font-bold text-white">Hi, {userName}</h1>
        </div>

        <div className="relative -mt-20 space-y-4 px-4 pb-8">
          {/* User Info Card */}
          <div className="rounded-2xl bg-white p-5 shadow-sm">
            {isLoading ? (
              // Loading skeleton
              <div className="flex animate-pulse items-center gap-4">
                <div className="h-16 w-16 shrink-0 rounded-full bg-gray-200"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-32 rounded bg-gray-200"></div>
                  <div className="h-3 w-48 rounded bg-gray-200"></div>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-4">
                <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-full">
                  <Image
                    src={`/images/avatars/${Math.abs(userName.charCodeAt(0) % 12) + 1}.png`}
                    alt={userName}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">{userName}</h3>
                  <p className="text-sm text-gray-500">{userEmail}</p>
                </div>
              </div>
            )}
          </div>

          {/* Benefits Card */}
          <div className="rounded-2xl bg-gradient-to-r from-teal-400 to-blue-400 p-5 text-white">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="mb-1 font-semibold">Lihat benefit buatmu di sini</h3>
                <p className="text-sm opacity-90">Cek penawaran dari Pacific Tiket Rewards!</p>
              </div>
              <Gift className="h-12 w-12 opacity-80" />
            </div>
          </div>

          {/* Customer Care Section */}
          <div className="rounded-2xl bg-white p-5 shadow-sm">
            <h3 className="mb-4 font-semibold text-gray-900">Customer Care 24/7</h3>
            <div className="space-y-3">
              <Link
                href="#"
                className="flex items-center justify-between rounded-lg p-3 transition-colors hover:bg-gray-50">
                <div className="flex items-center gap-3">
                  <div className="rounded-full bg-gray-100 p-2">
                    <Headphones className="h-5 w-5 text-gray-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Pusat Bantuan halo tiket</p>
                    <span className="inline-block rounded bg-red-500 px-2 py-0.5 text-xs text-white">
                      Baru
                    </span>
                  </div>
                </div>
                <ChevronRight className="h-5 w-5 text-gray-400" />
              </Link>
              <Link
                href="#"
                className="flex items-center justify-between rounded-lg p-3 transition-colors hover:bg-gray-50">
                <div className="flex items-center gap-3">
                  <div className="rounded-full bg-gray-100 p-2">
                    <Headphones className="h-5 w-5 text-gray-600" />
                  </div>
                  <p className="font-medium text-gray-900">Bantuan Langsung</p>
                </div>
                <ChevronRight className="h-5 w-5 text-gray-400" />
              </Link>
            </div>
          </div>

          {/* Settings Section */}
          <div className="rounded-2xl bg-white p-5 shadow-sm">
            <h3 className="mb-4 font-semibold text-gray-900">Pengaturan</h3>
            <div className="space-y-3">
              <Link
                href="#"
                className="flex items-center justify-between rounded-lg p-3 transition-colors hover:bg-gray-50">
                <div className="flex items-center gap-3">
                  <Globe className="h-5 w-5 text-gray-600" />
                  <p className="font-medium text-gray-900">Bahasa</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-500">Indonesia</span>
                  <ChevronRight className="h-5 w-5 text-gray-400" />
                </div>
              </Link>
              <Link
                href="#"
                className="flex items-center justify-between rounded-lg p-3 transition-colors hover:bg-gray-50">
                <div className="flex items-center gap-3">
                  <Wallet className="h-5 w-5 text-gray-600" />
                  <p className="font-medium text-gray-900">Mata Uang</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-500">IDR</span>
                  <ChevronRight className="h-5 w-5 text-gray-400" />
                </div>
              </Link>
            </div>
          </div>

          {/* About Section */}
          <div className="rounded-2xl bg-white p-5 shadow-sm">
            <h3 className="mb-4 font-semibold text-gray-900">Lainnya</h3>
            <Link
              href="#"
              className="flex items-center justify-between rounded-lg p-3 transition-colors hover:bg-gray-50">
              <div className="flex items-center gap-3">
                <Info className="h-5 w-5 text-gray-600" />
                <p className="font-medium text-gray-900">Tentang tiket.com</p>
              </div>
              <ChevronRight className="h-5 w-5 text-gray-400" />
            </Link>
          </div>

          {/* Logout Section - Only show when logged in */}
          {isLoggedIn && (
            <div className="rounded-2xl bg-white p-5 shadow-sm">
              <button
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="flex w-full items-center justify-between rounded-lg p-3 text-red-600 transition-colors hover:bg-red-50 disabled:opacity-50">
                <div className="flex items-center gap-3">
                  <LogOut className="h-5 w-5" />
                  <p className="font-medium">{isLoggingOut ? "Logging out..." : "Keluar Akun"}</p>
                </div>
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Bottom Navbar */}
      <MobileBottomNavbar />
    </>
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
  const { handleLogout, isLoading: isLoggingOut } = useLogout();
  return (
    <div className="bg-gray-50">
      <div className="mx-auto mt-[50px] max-w-7xl px-4 py-8">
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
                  <span className="font-medium">Informasi Akun</span>
                </button>
                <button
                  onClick={() => setActiveTab("orders")}
                  className={`flex w-full items-center gap-3 rounded-lg px-4 py-3 text-left transition-colors ${
                    activeTab === "orders"
                      ? "bg-blue-50 text-blue-600"
                      : "text-gray-700 hover:bg-gray-50"
                  }`}>
                  <Gift className="h-5 w-5" />
                  <span className="font-medium">Pesanan Saya</span>
                </button>
                <button
                  onClick={() => setActiveTab("tickets")}
                  className={`flex w-full items-center gap-3 rounded-lg px-4 py-3 text-left transition-colors ${
                    activeTab === "tickets"
                      ? "bg-blue-50 text-blue-600"
                      : "text-gray-700 hover:bg-gray-50"
                  }`}>
                  <Wallet className="h-5 w-5" />
                  <span className="font-medium">Simpan Tiket</span>
                </button>
                <button
                  onClick={() => setActiveTab("promo")}
                  className={`flex w-full items-center gap-3 rounded-lg px-4 py-3 text-left transition-colors ${
                    activeTab === "promo"
                      ? "bg-blue-50 text-blue-600"
                      : "text-gray-700 hover:bg-gray-50"
                  }`}>
                  <Gift className="h-5 w-5" />
                  <span className="font-medium">Info Promo</span>
                </button>
                <button
                  onClick={() => setActiveTab("settings")}
                  className={`flex w-full items-center gap-3 rounded-lg px-4 py-3 text-left transition-colors ${
                    activeTab === "settings"
                      ? "bg-blue-50 text-blue-600"
                      : "text-gray-700 hover:bg-gray-50"
                  }`}>
                  <Settings className="h-5 w-5" />
                  <span className="font-medium">Pengaturan Akun</span>
                </button>
                <button
                  onClick={handleLogout}
                  disabled={isLoggingOut}
                  className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-left text-red-600 transition-colors hover:bg-red-50 disabled:opacity-50">
                  <LogOut className="h-5 w-5" />
                  <span className="font-medium">
                    {isLoggingOut ? "Logging out..." : "Keluar Akun"}
                  </span>
                </button>
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            <div className="rounded-lg bg-white p-8 shadow-sm">
              <h2 className="mb-6 text-2xl font-bold text-gray-900">Informasi Akun</h2>

              {/* Personal Data Section */}
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
                      defaultValue="Ardiansyah"
                      className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <Label htmlFor="email" className="mb-2 block text-sm font-medium text-gray-700">
                      Email
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      defaultValue="ardiansyah@gmail.com"
                      className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <Label
                      htmlFor="gender"
                      className="mb-2 block text-sm font-medium text-gray-700">
                      Kelamin
                    </Label>
                    <Input
                      id="gender"
                      defaultValue="Batam"
                      className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone" className="mb-2 block text-sm font-medium text-gray-700">
                      No. Handphone
                    </Label>
                    <Input
                      id="phone"
                      defaultValue="Indonesia"
                      className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <Label htmlFor="city" className="mb-2 block text-sm font-medium text-gray-700">
                      Kata Tempat Tinggal
                    </Label>
                    <Input
                      id="city"
                      defaultValue="Batam"
                      className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <Label
                      htmlFor="country"
                      className="mb-2 block text-sm font-medium text-gray-700">
                      Negara
                    </Label>
                    <Input
                      id="country"
                      defaultValue="Indonesia"
                      className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* Password Section */}
              <div className="mb-8">
                <h3 className="mb-4 text-lg font-semibold text-gray-900">Pengaturan Password</h3>
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <Label
                      htmlFor="password"
                      className="mb-2 block text-sm font-medium text-gray-700">
                      Password
                    </Label>
                    <Input
                      id="password"
                      type="password"
                      defaultValue="........"
                      className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <Label
                      htmlFor="retryPassword"
                      className="mb-2 block text-sm font-medium text-gray-700">
                      Retry Password
                    </Label>
                    <Input
                      id="retryPassword"
                      type="password"
                      defaultValue="........"
                      className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-3">
                <Button
                  variant="outline"
                  className="border-gray-300 text-gray-700 hover:bg-gray-50">
                  Batal
                </Button>
                <Button className="bg-blue-600 hover:bg-blue-700">Simpan</Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
