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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { useIsMobile } from "@/hooks/use-mobile";
import { useLogout } from "@/hooks/useLogout";
import { useGetUserQuery } from "@/store/services/auth.service";
import { useFindDestinationIdQuery } from "@/store/services/destination.service";
import {
  useCreateTouristMutation,
  useDeleteTouristMutation,
  useUpdateManyTouristMutation
} from "@/store/services/tourist.service";
import { useFormik } from "formik";
import Cookies from "js-cookie";
import {
  ChevronRight,
  Gift,
  Globe,
  Headphones,
  Info,
  LogOut,
  Settings,
  Ticket,
  User,
  Wallet
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { orderTourSchema } from "../Orders/OrderTour/schema";

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
            <h1 className="text-2xl font-bold text-white">Welcome to Pacific Travelindo</h1>
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
                  <p className="text-sm text-white/90">
                    Cek penawaran dari Pacific Travelindo Rewards!
                  </p>
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
                      <p className="font-medium text-gray-900">Pusat Bantuan</p>
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
                  <p className="font-medium text-gray-900">Tentang Pacific Travelindo</p>
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
    skip: !item.destination_id
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

  const destination = destinationData?.data;
  const translation =
    destination?.translations?.find((tr: any) => tr.language_code === locale) ||
    destination?.translations?.[0];

  return (
    <div className="relative border-l-2 border-blue-300 pl-6">
      {/* Timeline dot */}
      <div className="absolute top-0 -left-[9px] h-4 w-4 rounded-full border-2 border-blue-500 bg-white"></div>

      {/* Itinerary item */}
      <div className="pb-6">
        {/* Header - Always visible */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="-ml-3 w-full rounded-lg p-3 text-left transition-colors hover:bg-gray-50">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1">
              {/* Day number */}
              <div className="mb-1 text-xs font-semibold text-blue-600">
                Day {dayRange || dayNumber}
              </div>

              {/* Destination name */}
              <h4 className="mb-1 font-semibold text-gray-900">
                {translation?.name || "Destination"}
              </h4>

              {/* Location */}
              {destination?.location && (
                <p className="mb-1 text-sm text-gray-500">
                  <Icon name="MapPin" className="mr-1 inline h-3 w-3" />
                  {destination.location}
                </p>
              )}

              {/* Visit Date */}
              <p className="text-sm text-gray-600">
                <Icon name="Calendar" className="mr-1 inline h-4 w-4" />
                {new Date(item.visit_date).toLocaleDateString("id-ID", {
                  day: "numeric",
                  month: "long",
                  year: "numeric"
                })}
              </p>
            </div>

            {/* Chevron icon */}
            <Icon
              name="ChevronDown"
              className={`h-5 w-5 flex-shrink-0 text-gray-400 transition-transform ${
                isExpanded ? "rotate-180" : ""
              }`}
            />
          </div>
        </button>

        {/* Expandable Detail Tour */}
        {isExpanded && translation?.detail_tour && translation.detail_tour.length > 0 && (
          <div className="mt-3 rounded-lg bg-blue-50 p-4">
            <p className="mb-3 text-sm font-semibold text-gray-700">Itinerary Detail:</p>
            <ul className="space-y-2">
              {translation.detail_tour.map((detail: string, idx: number) => (
                <li key={idx} className="flex items-start gap-2 text-sm text-gray-700">
                  <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-blue-500"></span>
                  <span className="capitalize">{detail}</span>
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
        <DialogHeader className="flex-shrink-0 border-b p-6">
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

        <div className="flex-shrink-0 border-t bg-white p-6 shadow-[0_-4px_10px_rgba(0,0,0,0.03)]">
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

// My Booking Content Component
const MyBookingContent = ({ userName }: { userName: string }) => {
  const { useGetAllTourQuery } = require("@/store/services/book-tour.service");
  const { useFindAllTouristQuery } = require("@/store/services/tourist.service");
  const { useLocale } = require("next-intl");
  const { cn } = require("@/lib/utils");

  const locale = useLocale();
  const { data: bookingsData, isLoading: isLoadingBookings } = useGetAllTourQuery(undefined);
  const {
    data: touristsData,
    isLoading: isLoadingTourists,
    refetch: refetchTourists
  } = useFindAllTouristQuery();

  const isLoading = isLoadingBookings || isLoadingTourists;

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

  if (isLoading) {
    return (
      <div>
        <h2 className="mb-6 text-2xl font-bold text-gray-900">My Booking</h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse rounded-lg border border-gray-200 p-4">
              <div className="mb-3 h-40 rounded-lg bg-gray-200"></div>
              <div className="mb-2 h-4 w-3/4 rounded bg-gray-200"></div>
              <div className="mb-2 h-3 w-1/2 rounded bg-gray-200"></div>
              <div className="h-6 w-20 rounded-full bg-gray-200"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!bookingsData?.data || bookingsData.data.length === 0) {
    return (
      <div>
        <h2 className="mb-6 text-2xl font-bold text-gray-900">My Booking</h2>
        <div className="flex flex-col items-center justify-center py-16">
          <Ticket className="mb-4 h-16 w-16 text-gray-300" />
          <h3 className="mb-2 text-lg font-semibold text-gray-900">Belum ada booking</h3>
          <p className="text-sm text-gray-500">Booking tour Anda akan muncul di sini</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h2 className="mb-6 text-2xl font-bold text-gray-900">My Booking</h2>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {bookingsData.data.map((booking: any) => {
          // Get first book tour item for visit date and destination
          const firstItem = booking.book_tour_items?.[0];
          const translation =
            firstItem?.destination?.translations?.find((tr: any) => tr.language_code === locale) ||
            firstItem?.destination?.translations?.[0];

          // Format subtotal as currency
          const formatSubtotal = (amount: string | number) => {
            const numAmount = typeof amount === "string" ? parseFloat(amount) : amount;
            return new Intl.NumberFormat("id-ID", {
              style: "currency",
              currency: "IDR",
              minimumFractionDigits: 0,
              maximumFractionDigits: 0
            }).format(numAmount);
          };

          // Get status label and color
          const getStatusBadge = (status: string) => {
            const statusConfig = {
              draft: { label: "Draft", color: "bg-gray-100 text-gray-700" },
              pending: { label: "Pending", color: "bg-yellow-100 text-yellow-700" },
              confirmed: { label: "Confirmed", color: "bg-green-100 text-green-700" },
              cancelled: { label: "Cancelled", color: "bg-red-100 text-red-700" }
            };
            return statusConfig[status as keyof typeof statusConfig] || statusConfig.draft;
          };

          const statusBadge = getStatusBadge(booking.status);

          // Get tourists for this booking
          const data = touristsData?.data || touristsData?.datas;
          const touristList = Array.isArray(data?.tourists)
            ? data.tourists
            : Array.isArray(data)
              ? data
              : [];
          const bookingTourists = touristList.filter((t: any) => t.book_tour_id === booking.id);

          const touristCount = bookingTourists.length;
          const subtotalValue =
            typeof booking.subtotal === "string" ? parseFloat(booking.subtotal) : booking.subtotal;
          const totalPrice = touristCount > 0 ? subtotalValue * touristCount : subtotalValue;

          return (
            <div
              key={booking.id}
              className="rounded-lg border border-gray-200 p-4 transition-shadow hover:shadow-md">
              {/* Header with Status Badge and Eye Icon */}
              <div className="mb-3 flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {translation?.name || "Destination"}
                  </h3>
                  {booking.country && (
                    <p className="text-sm text-gray-500">{booking.country.name}</p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleViewDetails(booking)}
                    className="flex h-8 w-8 items-center justify-center rounded-full transition-colors hover:bg-gray-100">
                    <Icon name="Eye" className="h-4 w-4 text-gray-600" />
                  </button>
                  <span
                    className={cn(
                      "inline-block rounded-full px-3 py-1 text-xs font-medium",
                      statusBadge.color
                    )}>
                    {statusBadge.label}
                  </span>
                </div>
              </div>

              {/* Visit Date */}
              {firstItem?.visit_date && (
                <p className="mb-2 text-sm text-gray-500">
                  {new Date(firstItem.visit_date).toLocaleDateString("id-ID", {
                    day: "numeric",
                    month: "long",
                    year: "numeric"
                  })}
                </p>
              )}

              {/* Subtotal */}
              <div className="mb-3">
                <p className="text-sm text-gray-500">Total Harga</p>
                <p className="text-lg font-bold text-gray-900">{formatSubtotal(totalPrice)}</p>
                {touristCount > 0 && (
                  <p className="text-xs text-gray-400">
                    {formatSubtotal(subtotalValue)} × {touristCount} orang
                  </p>
                )}
              </div>

              {/* Tourist List */}
              <div className="mb-4 space-y-2 rounded-lg bg-gray-50 p-3">
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-bold text-gray-900">
                    Traveler {touristCount > 0 ? `(${touristCount})` : ""}
                  </h4>
                  <button
                    onClick={() => handleOpenEditModal(booking)}
                    className="text-gray-400 transition-colors hover:text-blue-600">
                    <Icon name="Pencil" className="h-3.5 w-3.5" />
                  </button>
                </div>
                {touristCount > 0 ? (
                  <div className="grid grid-cols-1 gap-1.5">
                    {bookingTourists.map((t: any, idx: number) => (
                      <div
                        key={t.id || idx}
                        className="flex items-center gap-2 text-sm text-gray-700">
                        <div className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-blue-100 text-[10px] font-bold text-blue-600">
                          {idx + 1}
                        </div>
                        <span className="truncate">
                          {t.gender}. {t.name}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="py-1 text-xs text-gray-400 italic">Belum ada data traveler</p>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2">
                {touristCount > 0 && (
                  <Link href={`/${locale}/payments?order_id=${booking.id}`} className="flex-1">
                    <Button size="sm" className="w-full bg-blue-500 text-white hover:bg-blue-600">
                      Checkout
                    </Button>
                  </Link>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 border-red-300 text-red-600 hover:bg-red-50 hover:text-red-600">
                  Cancel Tour
                </Button>
              </div>
            </div>
          );
        })}
      </div>

      <TravelerEditModal
        open={isEditModalOpen}
        onOpenChange={setIsEditModalOpen}
        booking={editingBooking}
        touristsData={touristsData}
        onSuccess={() => {
          refetchTourists();
        }}
      />

      {/* Booking Detail Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="flex max-h-[85vh] max-w-2xl flex-col">
          <DialogHeader>
            <DialogTitle>Detail Booking</DialogTitle>
          </DialogHeader>
          <div className="overflow-y-auto pr-2">
            {selectedBooking && (
              <div className="space-y-4">
                {/* Booking Info */}
                <div className="rounded-lg border border-gray-200 p-4">
                  <h3 className="mb-2 font-semibold text-gray-900">Informasi Booking</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Booking ID:</span>
                      <span className="font-medium">{selectedBooking.id}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Status:</span>
                      <span className="font-medium capitalize">{selectedBooking.status}</span>
                    </div>
                    {selectedBooking.country && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Country:</span>
                        <span className="font-medium">{selectedBooking.country.name}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-gray-600">Subtotal:</span>
                      <span className="font-bold">
                        {new Intl.NumberFormat("id-ID", {
                          style: "currency",
                          currency: "IDR",
                          minimumFractionDigits: 0
                        }).format(parseFloat(selectedBooking.subtotal))}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Tour Itinerary */}
                <div className="rounded-lg border border-gray-200 p-4">
                  <h3 className="mb-4 font-semibold text-gray-900">
                    Tour Itinerary ({selectedBooking.book_tour_items?.length || 0} destinations)
                  </h3>
                  <div className="space-y-0">
                    {(() => {
                      // Sort items by visit_date chronologically
                      const items = selectedBooking.book_tour_items || [];
                      const sortedItems = [...items].sort(
                        (a: any, b: any) =>
                          new Date(a.visit_date).getTime() - new Date(b.visit_date).getTime()
                      );

                      return sortedItems.map((item: any, index: number) => (
                        <TourItemDetail
                          key={item.id}
                          item={item}
                          index={index}
                          locale={locale}
                          dayNumber={index + 1}
                          dayRange={undefined}
                        />
                      ));
                    })()}
                  </div>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
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
                  onClick={() => setActiveTab("my-booking")}
                  className={`flex w-full items-center gap-3 rounded-lg px-4 py-3 text-left transition-colors ${
                    activeTab === "my-booking"
                      ? "bg-blue-50 text-blue-600"
                      : "text-gray-700 hover:bg-gray-50"
                  }`}>
                  <Ticket className="h-5 w-5" />
                  <span className="font-medium">My Booking</span>
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
              {activeTab === "my-booking" ? (
                <MyBookingContent userName={userName} />
              ) : (
                <>
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
                        <Label
                          htmlFor="email"
                          className="mb-2 block text-sm font-medium text-gray-700">
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
                        <Label
                          htmlFor="phone"
                          className="mb-2 block text-sm font-medium text-gray-700">
                          No. Handphone
                        </Label>
                        <Input
                          id="phone"
                          defaultValue="Indonesia"
                          className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <Label
                          htmlFor="city"
                          className="mb-2 block text-sm font-medium text-gray-700">
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
                    <h3 className="mb-4 text-lg font-semibold text-gray-900">
                      Pengaturan Password
                    </h3>
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
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
