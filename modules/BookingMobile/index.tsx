"use client";
import Icon from "@/components/icon";
import { MobileBottomNavbar } from "@/components/layout/traveler-layout/MobileBottomNavbar";
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
import { Badge } from "@/components/ui/badge";
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
import { cn } from "@/lib/utils";
import { orderTourSchema } from "@/modules/Booking/BookingTour/schema";
import {
  useGetAllTourQuery,
  useUpdateStatusTourMutation
} from "@/store/services/book-tour.service";
import {
  useFindAllBookMotorsQuery,
  useUpdateStatusMotorMutation
} from "@/store/services/book-motor.service";
import {
  useFindAllBookEntertainmentAttractionsQuery,
  useCancelBookingMutation as useCancelBookEntertainmentAttractionMutation
} from "@/store/services/book-entertainment-attraction.service";
import {
  useFindAllBookDocumentVisasQuery,
  useCancelBookDocumentVisaMutation
} from "@/store/services/book-document-visa.service";
import {
  useCreateTouristMutation,
  useDeleteTouristMutation,
  useFindAllTouristQuery,
  useUpdateManyTouristMutation
} from "@/store/services/tourist.service";
import { useFormik } from "formik";
import { Ticket } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import Link from "next/link";
import { useState } from "react";
import { useSelector } from "react-redux";
import { toast } from "sonner";
import { ImageWithFallback } from "@/components/ui/image-with-fallback";
import { useMotorSummary } from "@/components/ui/motor-item-row";
import { BookTourDetail } from "../Booking/BookingTour/BookTourDetail";

// Reusing the TravelerEditModal from Profile/index.tsx
//Ideally this should be refactored into a shared component, but for now copying to ensure functionality matches
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

  const initialTourists = booking
    ? (() => {
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
      })()
    : [];

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
                    <Label className="text-xs font-semibold text-slate-700 block mb-1.5">
                      Titel<span className="text-red-500">*</span>
                    </Label>
                    <div className="inline-flex h-10 items-center rounded-xl bg-slate-100/90 p-1 border border-slate-200/80 gap-1">
                      {[
                        { value: "Mr", label: "Mr" },
                        { value: "Mrs", label: "Mrs" },
                        { value: "Miss", label: "Ms" }
                      ].map((opt) => {
                        const currentGender = tourist.gender || "Mr";
                        const isSelected = currentGender === opt.value;
                        return (
                          <button
                            key={opt.value}
                            type="button"
                            onClick={() => {
                              formik.setFieldValue(`tourists.${index}.gender`, opt.value);
                              formik.setFieldTouched(`tourists.${index}.gender`, true, false);
                            }}
                            className={cn(
                              "h-8 min-w-[64px] px-3.5 rounded-lg text-xs font-semibold transition-all duration-150 active:scale-95 flex items-center justify-center",
                              isSelected
                                ? "bg-blue-600 text-white shadow-sm shadow-blue-300/40"
                                : "text-slate-600 hover:text-slate-900 hover:bg-white/70"
                            )}>
                            {opt.label}
                          </button>
                        );
                      })}
                    </div>
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

const BookingMobileCard = ({
  booking,
  locale,
  t,
  touristsData,
  formatPrice,
  formatDateRange,
  getStatusBadge,
  handleOpenDetailModal
}: any) => {
  const isMotor = booking.type === "motor";
  const isEntertainment = booking.type === "entertainment";
  const isVisa =
    booking.type === "visa" ||
    (!!booking.document_visa_id &&
      !booking.book_motor_items?.length &&
      !booking.book_entertainment_attraction_items?.length &&
      !booking.itinerary_id);

  const itinerary = booking.itinerary;
  const items = itinerary?.itinerary_items || booking.book_tour_items || [];
  const firstItem = isMotor
    ? booking.book_motor_items?.[0]
    : isEntertainment
    ? booking.book_entertainment_attraction_items?.[0]
    : items[0];
  const destination = firstItem?.destination;
  const translation = isMotor 
    ? { name: firstItem?.motor_name }
    : (destination?.translations?.find((tr: any) => tr.language_code === locale) || destination?.translations?.[0]);

  const effectiveMotorId =
    firstItem?.motor_id ||
    firstItem?.motor?.id ||
    booking.motor_id ||
    "";

  const {
    motorName: fetchedMotorName,
    motorThumbnail: fetchedMotorThumbnail,
    engineCc: fetchedEngineCc
  } = useMotorSummary(isMotor ? effectiveMotorId : undefined);

  const motorTrans =
    firstItem?.motor?.translations?.find((tr: any) => tr.language_code === locale) ||
    firstItem?.motor?.translations?.[0];
  const motorName =
    fetchedMotorName ||
    motorTrans?.name_motor ||
    firstItem?.motor?.name_motor ||
    firstItem?.motor?.name ||
    firstItem?.motor_name ||
    booking.motor_name;

  const destinationTitle = isMotor
    ? (motorName || translation?.name || t("motorRental"))
    : isEntertainment
    ? (firstItem?.entertainment_attraction_name ||
       booking.entertainment_attraction?.name ||
       booking.entertainment_attraction_name ||
       booking.title ||
       (locale === "en" ? "Attraction Ticket" : "Tiket Atraksi"))
    : isVisa
    ? (booking.document_visa_title ||
       booking.document_visa?.title ||
       booking.package_name ||
       (locale === "en" ? "Document Visa" : "Dokumen Visa"))
    : (itinerary?.name ||
       itinerary?.title ||
       translation?.name ||
       (itinerary?.country?.name
         ? `Trip ke ${itinerary.country.name}`
         : (booking.country?.name ? `Trip ke ${booking.country.name}` : t("tourPackage"))));

  const thumbnail = isMotor
    ? (fetchedMotorThumbnail || firstItem?.motor_thumbnail || firstItem?.motor?.thumbnail || "/images/turkey-destination.jpg")
    : isEntertainment
    ? (booking.entertainment_attraction?.thumbnail || firstItem?.entertainment_attraction_thumbnail || "/images/turkey-destination.jpg")
    : isVisa
    ? (booking.document_visa?.thumbnail || booking.thumbnail || booking.document_visa?.country?.image || "/images/turkey-destination.jpg")
    : (destination?.thumbnail || destination?.translations?.[0]?.thumbnail || itinerary?.thumbnail || "/images/turkey-destination.jpg");

  const engineCc = isMotor ? (fetchedEngineCc || firstItem?.engine_cc || firstItem?.motor?.engine_cc) : null;
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
    typeof booking.subtotal === "string"
      ? parseFloat(booking.subtotal)
      : (booking.subtotal || 0);

  const totalPrice = Number(
    booking.total_price ||
    booking.total ||
    (isEntertainment || isVisa
      ? subtotalValue || booking.total_price || 0
      : touristCount > 0 ? subtotalValue * touristCount : subtotalValue)
  );
  
  const displayDate = isMotor
    ? booking.start_date
    : isEntertainment
    ? (firstItem?.visit_date || booking.booking_date || booking.created_at)
    : isVisa
    ? (booking.target_travel_date || booking.created_at)
    : (firstItem?.visit_date || itinerary?.createdAt || booking.created_at);

  const rentalDuration = (() => {
    if (!booking.start_date || !booking.end_date) return 1;
    const start = new Date(booking.start_date);
    const end = new Date(booking.end_date);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 1;
  })();

  const statusLower = (booking.status || "draft").toLowerCase();
  const canProceed = ["pending", "draft"].includes(statusLower);

  const proceedAction = (() => {
    if (!canProceed) return null;
    if (isMotor) {
      if (touristCount === 0 || statusLower === "draft") {
        return {
          href: `/${locale}/orders/rent-motor?book_motor_id=${booking.id}&motor_id=${effectiveMotorId}&duration=${rentalDuration}`,
          label: t("continueBooking") || (locale === "en" ? "Continue Booking" : "Lanjutkan")
        };
      }
      return {
        href: `/${locale}/payments?order_id=${booking.id}&type=motor`,
        label: t("checkout") || (locale === "en" ? "Checkout" : "Bayar Sekarang")
      };
    }
    if (isEntertainment) {
      if (touristCount === 0 || statusLower === "draft") {
        return {
          href: `/${locale}/book-entertainment-attraction?book_entertainment_attraction_id=${booking.id}`,
          label: t("continueBooking") || (locale === "en" ? "Continue Booking" : "Lanjutkan")
        };
      }
      return {
        href: `/${locale}/payments?order_id=${booking.id}&type=entertainment`,
        label: t("checkout") || (locale === "en" ? "Checkout" : "Bayar Sekarang")
      };
    }
    if (isVisa) {
      const hasApplicants = Array.isArray(booking.applicants) && booking.applicants.length > 0;
      if (!hasApplicants || statusLower === "draft") {
        return {
          href: `/${locale}/orders/document-visa?book_document_visa_id=${booking.id}&document_visa_id=${booking.document_visa_id || ""}`,
          label: t("continueBooking") || (locale === "en" ? "Continue Booking" : "Lanjutkan")
        };
      }
      return {
        href: `/${locale}/payments?order_id=${booking.id}&type=document-visa`,
        label: t("checkout") || (locale === "en" ? "Checkout" : "Bayar Sekarang")
      };
    }
    return {
      href: `/${locale}/payments?order_id=${booking.id}`,
      label: t("checkout") || (locale === "en" ? "Checkout" : "Bayar Sekarang")
    };
  })();

  const serviceBadge = isVisa
    ? {
        label: locale === "en" ? "Document Visa" : "Dokumen Visa",
        icon: "FileText",
        bg: "bg-blue-50/80 text-blue-700"
      }
    : isEntertainment
    ? {
        label: locale === "en" ? "Attraction Tickets" : "Tiket Atraksi",
        icon: "Ticket",
        bg: "bg-purple-50/80 text-purple-700"
      }
    : isMotor
    ? {
        label: t("motorFilter") || (locale === "en" ? "Motorcycle" : "Rental Motor"),
        icon: "Bike",
        bg: "bg-blue-50/80 text-blue-700"
      }
    : {
        label: t("tourFilter") || "Tour Holiday & Religion",
        icon: "Compass",
        bg: "bg-blue-50/80 text-blue-700"
      };

  const subtitle = isVisa
    ? (() => {
        const country = booking.country_name || booking.document_visa?.country?.name || "";
        const pkg = booking.package_name || "";
        if (country && pkg) return `${country} · ${pkg}`;
        return country || pkg || "";
      })()
    : isEntertainment
    ? (booking.entertainment_attraction?.location || booking.location || (booking.book_entertainment_attraction_items?.length ? `${booking.book_entertainment_attraction_items.length} ${locale === "en" ? "package(s)" : "paket tiket"}` : ""))
    : isMotor
    ? (engineCc ? `${engineCc}cc` : (booking.country?.name || ""))
    : (itinerary?.country?.name || booking.country?.name || "");

  const countLabel = isMotor
    ? t("dayCount", { count: rentalDuration })
    : isVisa
    ? `${touristCount || 1} ${locale === "en" ? (touristCount > 1 ? "applicants" : "applicant") : "pemohon"}`
    : isEntertainment
    ? `${touristCount || 1} ${locale === "en" ? "tickets" : "tiket"}`
    : t("travelerCount", { count: touristCount || 1 });

  return (
    <div
      key={booking.id}
      className="group flex flex-col justify-between rounded-2xl border border-slate-200/90 bg-white shadow-xs hover:shadow-md hover:border-blue-200 transition-all duration-200 overflow-hidden">
      
      {/* Top Section: Header + Main Info */}
      <div className="p-4 space-y-3">
        {/* Header: Service Type & Booking Code (Left) | Status Badge (Right) */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <span
              className={cn(
                "inline-flex items-center gap-1.5 rounded-lg px-2 py-0.5 text-[11px] font-bold shrink-0",
                serviceBadge.bg
              )}>
              <Icon name={serviceBadge.icon} className="h-3.5 w-3.5 shrink-0" />
              <span>{serviceBadge.label}</span>
            </span>
            <span className="font-mono text-[11px] font-semibold text-slate-400 truncate">
              #{booking.code || booking.id.slice(0, 10)}
            </span>
          </div>

          <span
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold shrink-0",
              statusBadge.bg
            )}>
            <span className="h-1.5 w-1.5 rounded-full bg-current" />
            {statusBadge.label}
          </span>
        </div>

        {/* Body: Thumbnail + Title + Meta */}
        <div
          onClick={() => handleOpenDetailModal(booking)}
          className="flex items-start gap-3.5 cursor-pointer">
          {/* Thumbnail */}
          <div className="relative h-20 w-20 sm:h-22 sm:w-22 rounded-xl overflow-hidden shrink-0 border border-slate-100 bg-slate-50 group-hover:opacity-95 transition-opacity">
            <ImageWithFallback
              src={thumbnail}
              alt={destinationTitle}
              fill
              className="object-cover"
              fallbackSrc="/images/turkey-destination.jpg"
            />
            {isMotor && firstItem?.qty && firstItem.qty > 1 && (
              <span className="absolute bottom-1 right-1 rounded-md bg-black/70 px-1.5 py-0.5 text-[10px] font-bold text-white">
                {firstItem.qty}x
              </span>
            )}
          </div>

          {/* Title & Meta Details */}
          <div className="flex-1 min-w-0 space-y-1.5">
            <h3 className="text-sm sm:text-base font-bold text-slate-900 leading-snug line-clamp-2 group-hover:text-blue-600 transition-colors">
              {destinationTitle}
            </h3>

            {/* Date & Duration Row */}
            <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-xs text-slate-500">
              <div className="flex items-center gap-1.5">
                <Icon name="Calendar" className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                <span className="font-medium text-slate-700">
                  {isMotor
                    ? formatDateRange(booking.start_date, booking.end_date)
                    : (displayDate ? new Date(displayDate).toLocaleDateString(locale === "en" ? "en-US" : "id-ID", {
                        day: "numeric",
                        month: "short",
                        year: "numeric"
                      }) : "—")}
                </span>
              </div>

              <div className="flex items-center gap-1 text-slate-400">
                <span>•</span>
                <span className="inline-flex items-center gap-1 font-semibold text-slate-600">
                  <Icon name={isMotor ? "Clock" : isVisa ? "Users" : isEntertainment ? "Ticket" : "Users"} className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                  {countLabel}
                </span>
              </div>
            </div>

            {/* Location or Extra Tag */}
            {subtitle && (
              <p className="flex items-center gap-1.5 text-[11px] text-slate-400 truncate pt-0.5">
                {engineCc && isMotor ? (
                  <span className="rounded bg-slate-100 px-1.5 py-0.2 text-[10px] font-medium text-slate-600 shrink-0">
                    {engineCc}cc
                  </span>
                ) : null}
                <span className="flex items-center gap-0.5 truncate">
                  <Icon name="MapPin" className="h-3.5 w-3.5 text-red-500 shrink-0" />
                  <span className="truncate">{subtitle}</span>
                </span>
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Footer: Price (Left) + Action CTAs (Right) */}
      <div className="border-t border-slate-100 bg-slate-50/50 px-4 py-3 flex items-center justify-between gap-2.5">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block leading-tight">
            {t("totalPrice")}
          </span>
          <p className="text-base font-extrabold text-blue-600 leading-none mt-0.5">
            {formatPrice(totalPrice)}
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => handleOpenDetailModal(booking)}
            className="h-9 px-3 rounded-xl border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-100/80 active:scale-95 transition-all flex items-center gap-1.5">
            <Icon name="Eye" className="h-3.5 w-3.5 text-slate-500" />
            <span>{t("viewDetails")}</span>
          </Button>

          {proceedAction && (
            <Link href={proceedAction.href}>
              <Button
                type="button"
                size="sm"
                className={cn(
                  "h-9 px-3.5 sm:px-4 rounded-xl text-xs font-bold text-white shadow-xs active:scale-95 transition-all flex items-center gap-1.5",
                  statusLower === "expired"
                    ? "bg-slate-800 hover:bg-slate-900"
                    : "bg-blue-600 hover:bg-blue-700 shadow-blue-200"
                )}>
                <span>{proceedAction.label}</span>
                <Icon name="ArrowRight" className="h-3.5 w-3.5" />
              </Button>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};

export const MyBookingPageMobile = () => {
  const locale = useLocale();
  const {
    data: bookingsData,
    isLoading: isLoadingBookings,
    refetch: refetchBookings
  } = useGetAllTourQuery(undefined);
  const {
    data: motorBookingsData,
    isLoading: isLoadingMotorBookings,
    refetch: refetchMotorBookings
  } = useFindAllBookMotorsQuery(undefined);
  const {
    data: entertainmentBookingsData,
    isLoading: isLoadingEntertainmentBookings,
    refetch: refetchEntertainmentBookings
  } = useFindAllBookEntertainmentAttractionsQuery(undefined);
  const {
    data: visaBookingsData,
    isLoading: isLoadingVisaBookings,
    refetch: refetchVisaBookings
  } = useFindAllBookDocumentVisasQuery(undefined);
  const {
    data: touristsData,
    isLoading: isLoadingTourists,
    refetch: refetchTourists
  } = useFindAllTouristQuery();
  const [updateStatusTour, { isLoading: isUpdatingStatus }] = useUpdateStatusTourMutation();
  const [updateStatusMotor, { isLoading: isUpdatingMotorStatus }] = useUpdateStatusMotorMutation();
  const [cancelEntertainmentBooking] = useCancelBookEntertainmentAttractionMutation();
  const [cancelVisaBooking] = useCancelBookDocumentVisaMutation();
  const [activeFilter, setActiveFilter] = useState("all");
  const [editingBooking, setEditingBooking] = useState<any>(null);
  const [dataDetail, setDataDetail] = useState<any>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isCancelAlertOpen, setIsCancelAlertOpen] = useState(false);
  const [bookingToCancelId, setBookingToCancelId] = useState<string | null>(null);
  const [bookingToCancelType, setBookingToCancelType] = useState<string | null>(null);

  const t = useTranslations("MyBooking");
  const tPayment = useTranslations("Payment");

  // Currency configuration from Redux store
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

  const isLoading =
    isLoadingBookings ||
    isLoadingTourists ||
    isLoadingMotorBookings ||
    isLoadingEntertainmentBookings ||
    isLoadingVisaBookings;

  // Normalize Tour book data
  const normalizedTourBookings = (bookingsData?.data || bookingsData?.datas || []).map((b: any) => ({
    ...b,
    type: "tour"
  }));
  
  // Normalize Motor book data
  const normalizedMotorBookings = (motorBookingsData?.data || motorBookingsData?.datas || []).map((b: any) => ({
    ...b,
    type: "motor"
  }));

  // Normalize Entertainment book data
  const rawEntertainment = (entertainmentBookingsData as any)?.data || (entertainmentBookingsData as any)?.datas || [];
  const normalizedEntertainmentBookings = (Array.isArray(rawEntertainment) ? rawEntertainment : rawEntertainment ? [rawEntertainment] : []).map((b: any) => ({
    ...b,
    type: "entertainment"
  }));

  // Normalize Visa book data
  const rawVisaDatas = (visaBookingsData as any)?.datas;
  const rawVisaData = (visaBookingsData as any)?.data;
  const visaList = Array.isArray(rawVisaDatas)
    ? rawVisaDatas
    : Array.isArray(rawVisaData)
    ? rawVisaData
    : rawVisaDatas
    ? [rawVisaDatas]
    : rawVisaData
    ? [rawVisaData]
    : [];
  const normalizedVisaBookings = visaList
    .filter((b: any) => b && typeof b === "object" && b.id)
    .map((b: any) => ({
      ...b,
      type: "visa"
    }));

  const allBookings = [
    ...normalizedTourBookings,
    ...normalizedMotorBookings,
    ...normalizedEntertainmentBookings,
    ...normalizedVisaBookings
  ].sort((a: any, b: any) => {
    const timeA = new Date(a.created_at || a.booking_date || 0).getTime();
    const timeB = new Date(b.created_at || b.booking_date || 0).getTime();
    return timeB - timeA;
  });

  // Filter logic
  const filteredBookings = allBookings.filter((booking: any) => {
    if (activeFilter === "all") return true;
    if (activeFilter === "tour" && booking.type === "tour") return true;
    if (activeFilter === "motor" && booking.type === "motor") return true;
    if (activeFilter === "entertainment" && booking.type === "entertainment") return true;
    if (activeFilter === "visa" && booking.type === "visa") return true;
    return false;
  });

  const handleOpenEditModal = (booking: any) => {
    setEditingBooking(booking);
    setIsEditModalOpen(true);
  };

  const handleOpenDetailModal = (booking: any) => {
    setDataDetail(booking);
    setIsDetailModalOpen(true);
  };

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
        toast.success(t("cancelSuccess"));
      } else if (bookingToCancelType === "visa") {
        await cancelVisaBooking(bookingToCancelId).unwrap();
        toast.success(t("cancelSuccess"));
      } else if (bookingToCancelType === "entertainment") {
        await cancelEntertainmentBooking(bookingToCancelId).unwrap();
        toast.success(t("cancelSuccess"));
      } else {
        await updateStatusTour({
          id: bookingToCancelId,
          status: "cancelled"
        }).unwrap();
        toast.success(t("cancelSuccess"));
      }
      refetchBookings();
      refetchMotorBookings();
      refetchEntertainmentBookings();
      refetchVisaBookings();
    } catch (error) {
      console.error("Failed to cancel booking:", error);
      toast.error(t("cancelFailed"));
    } finally {
      setIsCancelAlertOpen(false);
      setBookingToCancelId(null);
      setBookingToCancelType(null);
    }
  };

  const services = [
    { id: "all", label: t("allFilter") || "All" },
    { id: "tour", label: t("tourFilter") || "Tour Holiday & Religion" },
    { id: "motor", label: t("motorFilter") || "Motorcycle" },
    { id: "entertainment", label: t("entertainmentFilter") || (locale === "en" ? "Attraction Tickets" : "Tiket Atraksi") },
    { id: "visa", label: t("visaFilter") || (locale === "en" ? "Document Visa" : "Dokumen Visa") }
  ];

  const getStatusBadge = (status: string) => {
    const s = (status || "draft").toLowerCase();
    switch (s) {
      case "pending":
        return { label: tPayment("pendingStatus"), bg: "bg-amber-50 text-amber-700 border-amber-200" };
      case "confirmed":
      case "ongoing":
        return { label: "Ongoing", bg: "bg-blue-50 text-blue-700 border-blue-200" };
      case "paid":
        return { label: "Paid", bg: "bg-emerald-50 text-emerald-700 border-emerald-200" };
      case "documents_submitted":
        return { label: "Documents Submitted", bg: "bg-blue-50 text-blue-700 border-blue-200" };
      case "under_review":
        return { label: "Under Review", bg: "bg-amber-50 text-amber-700 border-amber-200" };
      case "revision_required":
        return { label: "Revision Required", bg: "bg-orange-50 text-orange-700 border-orange-200" };
      case "submitted_to_embassy":
        return { label: "Embassy", bg: "bg-indigo-50 text-indigo-700 border-indigo-200" };
      case "appointment_scheduled":
        return { label: "Appointment", bg: "bg-purple-50 text-purple-700 border-purple-200" };
      case "approved":
        return { label: "Approved", bg: "bg-emerald-50 text-emerald-700 border-emerald-200" };
      case "rejected":
        return { label: "Rejected", bg: "bg-rose-50 text-rose-700 border-rose-200" };
      case "completed":
        return { label: "Completed", bg: "bg-emerald-50 text-emerald-700 border-emerald-200" };
      case "cancelled":
        return { label: "Cancelled", bg: "bg-red-50 text-red-700 border-red-200" };
      case "expired":
        return { label: t("expiredStatus") || "Expired", bg: "bg-rose-50 text-rose-700 border-rose-200" };
      case "draft":
      default:
        return { label: "Draft", bg: "bg-slate-50 text-slate-700 border-slate-200" };
    }
  };

  const formatDateRange = (startDateStr?: string, endDateStr?: string) => {
    if (!startDateStr) return "—";
    const start = new Date(startDateStr);
    const startFormatted = start.toLocaleDateString(locale === "en" ? "en-US" : "id-ID", {
      day: "numeric",
      month: "short"
    });
    if (!endDateStr) return startFormatted;
    const end = new Date(endDateStr);
    const endFormatted = end.toLocaleDateString(locale === "en" ? "en-US" : "id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric"
    });
    return `${startFormatted} – ${endFormatted}`;
  };

  return (
    <div className="flex min-h-screen flex-col bg-slate-50/70 pb-24">
      {/* Header */}
      <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-100 bg-white/95 backdrop-blur-md px-4 py-3.5 shadow-xs">
        <h1 className="text-base font-bold text-slate-900">{t("title")}</h1>
        <span className="text-xs font-semibold text-slate-400">
          {filteredBookings.length} {filteredBookings.length === 1 ? "Booking" : "Bookings"}
        </span>
      </div>

      {/* Filter Badges */}
      <div className="scrollbar-hide flex w-full gap-2 overflow-x-auto bg-white px-4 py-2.5 border-b border-slate-100">
        {services.map((service) => (
          <button
            key={service.id}
            onClick={() => setActiveFilter(service.id)}
            className={cn(
              "rounded-full px-3.5 py-1.5 text-xs font-semibold whitespace-nowrap transition-all duration-200",
              activeFilter === service.id
                ? "bg-blue-600 text-white shadow-sm shadow-blue-200"
                : "bg-slate-100/90 text-slate-600 hover:bg-slate-200/70"
            )}>
            {service.label}
          </button>
        ))}
      </div>

      {/* Booking List */}
      <div className="flex-1 p-4">
        {isLoading ? (
          // Loading Skeletons
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="animate-pulse rounded-2xl bg-white p-4 shadow-sm border border-slate-100 space-y-3">
                <div className="flex justify-between items-center">
                  <div className="h-4 w-24 rounded bg-slate-200"></div>
                  <div className="h-5 w-16 rounded-full bg-slate-200"></div>
                </div>
                <div className="flex gap-3">
                  <div className="h-20 w-20 rounded-xl bg-slate-200 shrink-0"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 w-3/4 rounded bg-slate-200"></div>
                    <div className="h-3 w-1/2 rounded bg-slate-100"></div>
                  </div>
                </div>
                <div className="h-10 w-full rounded-xl bg-slate-100"></div>
              </div>
            ))}
          </div>
        ) : filteredBookings.length === 0 ? (
          // Empty State
          <div className="flex flex-col items-center justify-center py-20 text-center px-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 mb-4 shadow-sm">
              <Ticket className="h-8 w-8 text-blue-500" />
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-1">{t("emptyTitle")}</h3>
            <p className="text-xs text-slate-500 max-w-xs">{t("emptyDesc")}</p>
          </div>
        ) : (
          // Booking Cards Grid (1 col on mobile, 2 cols on tablet)
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {filteredBookings.map((booking: any) => (
              <BookingMobileCard
                key={booking.id}
                booking={booking}
                locale={locale}
                t={t}
                touristsData={touristsData}
                formatPrice={formatPrice}
                formatDateRange={formatDateRange}
                getStatusBadge={getStatusBadge}
                handleOpenDetailModal={handleOpenDetailModal}
              />
            ))}
          </div>
        )}
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

      <BookTourDetail
        open={isDetailModalOpen}
        setOpen={setIsDetailModalOpen}
        data={dataDetail}
        onCancelled={() => {
          refetchBookings();
          refetchMotorBookings();
          refetchEntertainmentBookings();
          refetchVisaBookings();
        }}
      />

      {/* Bottom Actions - Navigation */}
      <MobileBottomNavbar />
    </div>
  );
};
