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
import { orderTourSchema } from "@/modules/Tourist/OrderTour/schema";
import {
  useGetAllTourQuery,
  useUpdateStatusTourMutation
} from "@/store/services/book-tour.service";
import {
  useCreateTouristMutation,
  useDeleteTouristMutation,
  useFindAllTouristQuery,
  useUpdateManyTouristMutation
} from "@/store/services/tourist.service";
import { useFormik } from "formik";
import { Ticket } from "lucide-react";
import { useLocale } from "next-intl";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";
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
                        <SelectItem value="Miss">Ms</SelectItem>
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

export const MyBookingPageMobile = () => {
  const locale = useLocale();
  const {
    data: bookingsData,
    isLoading: isLoadingBookings,
    refetch: refetchBookings
  } = useGetAllTourQuery(undefined);
  const {
    data: touristsData,
    isLoading: isLoadingTourists,
    refetch: refetchTourists
  } = useFindAllTouristQuery();
  const [updateStatusTour, { isLoading: isUpdatingStatus }] = useUpdateStatusTourMutation();

  const [activeFilter, setActiveFilter] = useState("All");
  const [editingBooking, setEditingBooking] = useState<any>(null);
  const [dataDetail, setDataDetail] = useState<any>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  const [isCancelAlertOpen, setIsCancelAlertOpen] = useState(false);
  const [bookingToCancelId, setBookingToCancelId] = useState<string | null>(null);

  const filters = ["All", "Tour Holiday & Religion", "Flight", "Hotels"];

  const isLoading = isLoadingBookings || isLoadingTourists;

  // Filter logic (currently showing all for categories other than All until API supports type)
  const filteredBookings =
    bookingsData?.data?.filter((booking: any) => {
      if (activeFilter === "All") return true;
      // NOTE: Assuming bookingsData currently doesn't have explicit type field
      // For now, "Tour Holiday & Religion" shows all since that's what we have
      if (activeFilter === "Tour Holiday & Religion") return true;
      return false;
    }) || [];

  const handleOpenEditModal = (booking: any) => {
    setEditingBooking(booking);
    setIsEditModalOpen(true);
  };

  const handleOpenDetailModal = (booking: any) => {
    setDataDetail(booking);
    setIsDetailModalOpen(true);
  };

  const handleCancelTour = (bookingId: string) => {
    setBookingToCancelId(bookingId);
    setIsCancelAlertOpen(true);
  };

  const onConfirmCancel = async () => {
    if (!bookingToCancelId) return;

    try {
      await updateStatusTour({
        id: bookingToCancelId,
        data: { status: "cancelled" }
      }).unwrap();
      toast.success("Tour has been canceled successfully");
      refetchBookings();
    } catch (error) {
      console.error("Failed to cancel tour:", error);
      toast.error("Failed to cancel tour");
    } finally {
      setIsCancelAlertOpen(false);
      setBookingToCancelId(null);
    }
  };

  const services = [
    { id: "all", label: "All" },
    { id: "tour", label: "Tour Holiday & Religion" },
    { id: "flight", label: "Flight" },
    { id: "hotel", label: "Hotels" }
  ];

  return (
    <div className="flex min-h-screen flex-col bg-gray-50 pb-20">
      {/* Header */}
      <div className="sticky top-0 z-10 flex items-center justify-center border-b bg-white px-4 py-4 shadow-sm">
        <h1 className="text-lg font-bold text-gray-900">My Bookings</h1>
      </div>

      {/* Filter Badges */}
      <div className="scrollbar-hide flex w-full gap-2 overflow-x-auto bg-white px-4 py-3">
        {services.map((service) => (
          <button
            key={service.id}
            onClick={() => setActiveFilter(service.label)}
            className={cn(
              "rounded-full border px-4 py-1.5 text-sm font-medium whitespace-nowrap transition-colors",
              activeFilter === service.label
                ? "bg-gray-900 text-white"
                : "border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
            )}>
            {service.label}
          </button>
        ))}
      </div>

      {/* Booking List */}
      <div className="flex-1 space-y-4 p-4">
        {isLoading ? (
          // Loading Skeletons
          [1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse rounded-lg bg-white p-4 shadow-sm">
              <div className="mb-3 h-32 rounded-lg bg-gray-200"></div>
              <div className="mb-2 h-4 w-3/4 rounded bg-gray-200"></div>
              <div className="h-4 w-1/2 rounded bg-gray-200"></div>
            </div>
          ))
        ) : filteredBookings.length === 0 ? (
          // Empty State
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <Ticket className="mb-4 h-16 w-16 text-gray-300" />
            <h3 className="mb-2 text-lg font-semibold text-gray-900">No bookings yet</h3>
            <p className="text-sm text-gray-500">Your booked tours and trips will appear here.</p>
          </div>
        ) : (
          // Booking Cards
          filteredBookings.map((booking: any) => {
            const firstItem = booking.book_tour_items?.[0];
            const translation =
              firstItem?.destination?.translations?.find(
                (tr: any) => tr.language_code === locale
              ) || firstItem?.destination?.translations?.[0];

            const formatSubtotal = (amount: string | number) => {
              const numAmount = typeof amount === "string" ? parseFloat(amount) : amount;
              return new Intl.NumberFormat("id-ID", {
                style: "currency",
                currency: "IDR",
                minimumFractionDigits: 0,
                maximumFractionDigits: 0
              }).format(numAmount);
            };

            const getStatusBadge = (status: string) => {
              const statusConfig = {
                draft: { label: "Draft", color: "bg-gray-100 text-gray-700" },
                pending: { label: "Pending", color: "bg-yellow-100 text-yellow-700" },
                ongoing: { label: "Ongoing", color: "bg-blue-100 text-blue-700" },
                completed: { label: "Completed", color: "bg-green-100 text-green-700" },
                cancelled: { label: "Cancelled", color: "bg-red-100 text-red-700" }
              };
              return statusConfig[status as keyof typeof statusConfig] || statusConfig.draft;
            };

            const statusBadge = getStatusBadge(booking.status);

            const data = touristsData?.data || touristsData?.datas;
            const touristList = Array.isArray(data?.tourists)
              ? data.tourists
              : Array.isArray(data)
                ? data
                : [];
            const bookingTourists = touristList.filter((t: any) => t.book_tour_id === booking.id);
            const touristCount = bookingTourists.length;
            const subtotalValue =
              typeof booking.subtotal === "string"
                ? parseFloat(booking.subtotal)
                : booking.subtotal;
            const totalPrice = touristCount > 0 ? subtotalValue * touristCount : subtotalValue;

            return (
              <div
                key={booking.id}
                className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
                <div className="mb-3 flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="line-clamp-2 text-base font-bold text-gray-900">
                      {translation?.name || "Destination"}
                    </h3>
                  </div>
                  <div className="flex items-center">
                    {booking.status.toLowerCase() !== "cancelled" && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="ml-1 h-6 w-6 text-gray-400 hover:text-blue-600"
                        onClick={() => handleOpenDetailModal(booking)}>
                        <Icon name="Eye" className="h-4 w-4" />
                      </Button>
                    )}
                    <Badge
                      variant="secondary"
                      className={cn("ml-2 shrink-0 font-medium", statusBadge.color)}>
                      {statusBadge.label}
                    </Badge>
                  </div>
                </div>

                <div className="mb-4 space-y-1.5 text-sm text-gray-500">
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-4 shrink-0 text-gray-400">📅</div>
                    <span>
                      {new Date(firstItem?.visit_date).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "long",
                        year: "numeric"
                      })}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-4 shrink-0 text-gray-400">👥</div>
                    <span>{touristCount} Traveler</span>
                  </div>
                </div>

                <div className="border-t border-dashed pt-3">
                  <div className="mb-3 flex flex-col items-end">
                    <span className="text-xs text-gray-500">Total Harga</span>
                    <span className="text-lg font-bold text-blue-600">
                      {formatSubtotal(totalPrice)}
                    </span>
                    {touristCount > 0 && (
                      <span className="text-xs text-gray-400">
                        {formatSubtotal(subtotalValue)} × {touristCount} orang
                      </span>
                    )}
                  </div>

                  <div className="grid gap-2">
                    {!["ongoing", "completed", "pending", "cancelled"].includes(
                      booking.status.toLowerCase()
                    ) && (
                      <>
                        {touristCount === 0 ? (
                          <>
                            <Button
                              variant="destructive"
                              className="w-full bg-red-50 text-red-600 hover:bg-red-100"
                              onClick={() => handleCancelTour(booking.id)}>
                              {isUpdatingStatus ? "Cancelling..." : "Cancel Tour"}
                            </Button>
                            <Button
                              variant="outline"
                              className="w-full border-blue-200 text-blue-600 hover:bg-blue-50"
                              onClick={() => handleOpenEditModal(booking)}>
                              Add Data Traveler
                            </Button>
                          </>
                        ) : (
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              className="flex-1 border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
                              onClick={() => handleCancelTour(booking.id)}>
                              {isUpdatingStatus ? "Cancelling..." : "Cancel Tour"}
                            </Button>
                            <Link
                              href={`/${locale}/payments?order_id=${booking.id}`}
                              className="flex-1">
                              <Button className="w-full bg-blue-600 hover:bg-blue-700">
                                Checkout
                              </Button>
                            </Link>
                          </div>
                        )}
                        {/* Edit Traveler Button */}
                        {touristCount > 0 && booking.status !== "cancelled" && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="mt-2 w-full"
                            onClick={() => handleOpenEditModal(booking)}>
                            Edit Traveler Data
                          </Button>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })
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

      <AlertDialog open={isCancelAlertOpen} onOpenChange={setIsCancelAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This tour booking will be permanently cancelled.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setBookingToCancelId(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={onConfirmCancel}
              className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
              disabled={isUpdatingStatus}>
              {isUpdatingStatus ? "Cancelling..." : "Continue"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <BookTourDetail open={isDetailModalOpen} setOpen={setIsDetailModalOpen} data={dataDetail} />

      {/* Bottom Actions - Sort/Filter (Visual Only for now as per screenshot layout) */}
      <MobileBottomNavbar />
    </div>
  );
};
