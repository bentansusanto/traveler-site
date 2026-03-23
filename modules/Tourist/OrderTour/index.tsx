"use client";

import Icon from "@/components/icon";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { useGetAllTourQuery, useUpdateTourMutation } from "@/store/services/book-tour.service";
import { useFindDestinationIdQuery } from "@/store/services/destination.service";
import { useFindAddOnsByCategoryQuery } from "@/store/services/add-ons.service";
import { Checkbox } from "@/components/ui/checkbox";
import { useCreateTouristMutation, useFindAllTouristQuery } from "@/store/services/tourist.service";
import { useFormik } from "formik";
import { useLocale } from "next-intl";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef } from "react";
import { toast } from "sonner";
import { orderTourSchema, OrderTourValues } from "./schema";

interface OrderTourPageProps {
  bookTourId: string;
}

const SummaryTourItem = ({ item, locale }: { item: any; locale: string }) => {
  const { data: destinationData } = useFindDestinationIdQuery(item.destination_id);
  const destinationName = useMemo(() => {
    if (!destinationData?.data?.translations) return "Destination";
    const translation = destinationData.data.translations.find((t: any) => t.locale === locale);
    return translation?.name || destinationData.data.translations[0]?.name || "Destination";
  }, [destinationData, locale]);

  return (
    <div className="flex items-start gap-3 text-sm">
      <div className="mt-1 flex flex-col items-center gap-1">
        <span className="h-2 w-2 flex-shrink-0 rounded-full bg-blue-500"></span>
        <div className="h-full min-h-[1.5rem] w-px bg-gray-200"></div>
      </div>
      <div>
        <p className="font-medium text-gray-900">{destinationName}</p>
        <p className="text-xs text-gray-500">
          {new Date(item.visit_date).toLocaleDateString("id-ID", {
            day: "numeric",
            month: "long",
            year: "numeric"
          })}
        </p>
      </div>
    </div>
  );
};

export const OrderTourPage = ({ bookTourId }: OrderTourPageProps) => {
  const locale = useLocale();
  const router = useRouter();
  const [createTourist, { isLoading: isCreatingTourist }] = useCreateTouristMutation();
  const [updateTour, { isLoading: isUpdatingTour }] = useUpdateTourMutation();

  const isCreating = isCreatingTourist || isUpdatingTour;

  // Fetch existing tourists for pre-population
  const { data: touristsData } = useFindAllTouristQuery();
  const { data: tourAddOnsResponse } = useFindAddOnsByCategoryQuery("tour");
  const { data: generalAddOnsResponse } = useFindAddOnsByCategoryQuery("general");

  const availableAddOns = useMemo(() => {
    const tourAddOnList = tourAddOnsResponse?.datas || (Array.isArray(tourAddOnsResponse?.data) ? tourAddOnsResponse.data : []);
    const generalAddOnList = generalAddOnsResponse?.datas || (Array.isArray(generalAddOnsResponse?.data) ? generalAddOnsResponse.data : []);

    return [
      ...tourAddOnList,
      ...generalAddOnList
    ];
  }, [tourAddOnsResponse, generalAddOnsResponse]);

  const hasPopulated = useRef(false);

  const initialTourists = useMemo(() => {
    const data = touristsData?.data || touristsData?.datas;
    const touristList = Array.isArray(data?.tourists)
      ? data.tourists
      : Array.isArray(data)
        ? data
        : [];
    const matching = touristList.filter((t: any) => t.book_tour_id === bookTourId);

    if (matching.length > 0) {
      return matching.map((t: any) => ({
        gender: t.gender || "",
        name: t.name || "",
        phoneNumber: t.phone_number || "",
        nationality: t.nationality || "",
        passportNumber: t.passport_number || ""
      }));
    }

    return [
      {
        gender: "",
        name: "",
        phoneNumber: "",
        nationality: "",
        passportNumber: ""
      }
    ];
  }, [touristsData, bookTourId]);

  const formik = useFormik<OrderTourValues>({
    initialValues: {
      tourists: initialTourists,
      add_ons: []
    },
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
        const payload = {
          book_tour_id: bookTourId,
          tourists: values.tourists.map((t: any) => ({
            name: t.name,
            phone_number: t.phoneNumber,
            gender: t.gender,
            nationality: t.nationality,
            passport_number: t.passportNumber
          }))
        };

        if (values.add_ons && values.add_ons.length > 0) {
          await updateTour({ id: bookTourId, add_ons: values.add_ons }).unwrap();
        }

        toast.success("Berhasil membuat data traveler!");

        setTimeout(() => {
          router.push(`/${locale}/payments?order_id=${bookTourId}`);
        }, 1500);
      } catch (error: any) {
        toast.error(error?.data?.message || "Gagal membuat data traveler");
      }
    }
  });

  // Fetch all bookings and filter by ID
  const { data: bookingsData, isLoading: isLoadingBookings } = useGetAllTourQuery(undefined, {
    skip: !bookTourId
  });

  // Find the specific booking
  const booking = useMemo(() => {
    const bookings = bookingsData?.datas || bookingsData?.data || [];
    return bookings.find((b: any) => b.id === bookTourId);
  }, [bookingsData, bookTourId]);

  // Effect to populate form when data is loaded
  useEffect(() => {
    if (touristsData && initialTourists.length > 0 && !hasPopulated.current) {
      // Only populate if we actually found matching tourists
      const isActuallyPopulated = initialTourists.some((t: any) => t.name !== "");
      if (isActuallyPopulated) {
        formik.setValues({
          ...formik.values,
          tourists: initialTourists
        });
        hasPopulated.current = true;
      }
    }
  }, [initialTourists, touristsData, formik]);

  // Set initial add_ons if booking has them
  useEffect(() => {
    if (booking?.booking_add_ons && formik.values.add_ons?.length === 0) {
      const existingAddOnIds = booking.booking_add_ons.map((ba: any) => ba.add_on_id);
      if (existingAddOnIds.length > 0) {
        formik.setFieldValue("add_ons", existingAddOnIds);
      }
    }
  }, [booking, formik.values.add_ons?.length]);

  const totalPrice = useMemo(() => {
    if (!booking) return 0;
    const itemsSubtotal = (booking.book_tour_items || []).reduce(
      (acc: number, item: any) => acc + Number(item.destination?.price || 0),
      0
    );
    const addOnsTotal = (formik.values.add_ons || []).reduce((acc: number, id: string) => {
      const addOn = availableAddOns.find((a) => a.id === id);
      return acc + (Number(addOn?.price) || 0);
    }, 0);
    return itemsSubtotal + addOnsTotal;
  }, [booking, formik.values.add_ons, availableAddOns]);

  const addTourist = () => {
    formik.setFieldValue("tourists", [
      ...formik.values.tourists,
      {
        gender: "",
        name: "",
        phoneNumber: "",
        nationality: "",
        passportNumber: ""
      }
    ]);
  };

  const removeTourist = (index: number) => {
    const newTourists = [...formik.values.tourists];
    newTourists.splice(index, 1);
    formik.setFieldValue("tourists", newTourists);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          {/* Left Column - Forms */}
          <div className="lg:col-span-8">
            {/* Data Traveler */}
            <div className="rounded-lg bg-white p-6 shadow-sm">
              <div className="mb-6 flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900">Data Traveler</h2>
                <Button
                  variant="outline"
                  onClick={addTourist}
                  className="border-gray-300 text-gray-700 hover:bg-gray-50">
                  + Tambah Traveler
                </Button>
              </div>

              {/* Warning Message */}
              {/* <div className="mb-6 rounded-lg bg-orange-50 p-4">
                <p className="text-sm text-orange-800">
                  <span className="font-semibold">
                    Pastikan nama penumpang persis seperti yang tertulis di KTP/Paspor/SIM yang
                    dikeluarkan pemerintah.
                  </span>
                  <br />
                  <span className="text-orange-700">
                    Hindari kesalahan apa pun, karena beberapa maskapai tidak mengizinkan koreksi
                    nama setelah pemesanan.
                  </span>
                </p>
              </div> */}

              {/* Tourist Forms */}
              <div className="space-y-6">
                {formik.values.tourists.map((tourist, index) => (
                  <div key={index} className="rounded-lg border border-gray-200 p-4">
                    <div className="mb-4 flex items-center justify-between">
                      <h3 className="font-semibold text-gray-900">Traveler {index + 1}</h3>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          type="button"
                          className="flex items-center gap-1.5 text-blue-600 hover:bg-blue-50 hover:text-blue-700">
                          <Icon name="Pencil" className="h-3.5 w-3.5" />
                          Edit
                        </Button>
                        {index > 0 && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeTourist(index)}
                            className="text-red-500 hover:text-red-600">
                            Hapus
                          </Button>
                        )}
                      </div>
                    </div>

                    <div className="space-y-4">
                      {/* Gender/Title */}
                      <div>
                        <Label htmlFor={`tourists.${index}.gender`}>
                          Titel<span className="text-red-500">*</span>
                        </Label>
                        <Select
                          value={tourist.gender}
                          onValueChange={(val) =>
                            formik.setFieldValue(`tourists.${index}.gender`, val)
                          }>
                          <SelectTrigger className="mt-1">
                            <SelectValue placeholder="Pilih Titel" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Mr">Mr</SelectItem>
                            <SelectItem value="Mrs">Mrs</SelectItem>
                            <SelectItem value="Miss">Ms</SelectItem>
                          </SelectContent>
                        </Select>
                        {formik.errors.tourists?.[index] &&
                          (formik.errors.tourists[index] as any).gender && (
                            <p className="mt-1 text-xs text-red-500">
                              {(formik.errors.tourists[index] as any).gender}
                            </p>
                          )}
                      </div>

                      {/* Name and Phone */}
                      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <div>
                          <Label htmlFor={`tourists.${index}.name`}>
                            Nama Lengkap<span className="text-red-500">*</span>
                          </Label>
                          <Input
                            id={`tourists.${index}.name`}
                            name={`tourists.${index}.name`}
                            placeholder="Sesuai KTP/Paspor"
                            className="mt-1"
                            value={tourist.name}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                          />
                          <p className="mt-1 text-xs text-gray-500">(tanpa gelar dan tanda baca)</p>
                          {formik.errors.tourists?.[index] &&
                            (formik.errors.tourists[index] as any).name && (
                              <p className="mt-1 text-xs text-red-500">
                                {(formik.errors.tourists[index] as any).name}
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
                            className="mt-1"
                            value={tourist.phoneNumber}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                          />
                          <p className="mt-1 text-xs text-gray-500">(aktif untuk koordinasi)</p>
                          {formik.errors.tourists?.[index] &&
                            (formik.errors.tourists[index] as any).phoneNumber && (
                              <p className="mt-1 text-xs text-red-500">
                                {(formik.errors.tourists[index] as any).phoneNumber}
                              </p>
                            )}
                        </div>
                      </div>

                      {/* Nationality and Passport */}
                      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <div>
                          <Label htmlFor={`tourists.${index}.nationality`}>
                            Kewarganegaraan<span className="text-red-500">*</span>
                          </Label>
                          <Select
                            value={tourist.nationality}
                            onValueChange={(val) =>
                              formik.setFieldValue(`tourists.${index}.nationality`, val)
                            }>
                            <SelectTrigger className="mt-1">
                              <SelectValue placeholder="Pilih kewarganegaraan" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Indonesia">Indonesia</SelectItem>
                              <SelectItem value="Malaysia">Malaysia</SelectItem>
                              <SelectItem value="Singapore">Singapore</SelectItem>
                            </SelectContent>
                          </Select>
                          {formik.errors.tourists?.[index] &&
                            (formik.errors.tourists[index] as any).nationality && (
                              <p className="mt-1 text-xs text-red-500">
                                {(formik.errors.tourists[index] as any).nationality}
                              </p>
                            )}
                        </div>
                        <div>
                          <Label htmlFor={`tourists.${index}.passportNumber`}>
                            Nomor Passport<span className="text-red-500">*</span>
                          </Label>
                          <Input
                            id={`tourists.${index}.passportNumber`}
                            name={`tourists.${index}.passportNumber`}
                            placeholder="A1234567"
                            className="mt-1"
                            value={tourist.passportNumber}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                          />
                          {formik.errors.tourists?.[index] &&
                            (formik.errors.tourists[index] as any).passportNumber && (
                              <p className="mt-1 text-xs text-red-500">
                                {(formik.errors.tourists[index] as any).passportNumber}
                              </p>
                            )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Add-ons Section */}
            {availableAddOns.length > 0 && (
              <div className="mt-6 rounded-lg bg-white p-6 shadow-sm">
                <div className="mb-6 flex items-center justify-between">
                  <h2 className="text-xl font-bold text-gray-900">Tambahkan Add-ons</h2>
                </div>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  {availableAddOns.map((addOn) => (
                    <div
                      key={addOn.id}
                      className={`flex items-center justify-between p-4 rounded-xl border transition-all cursor-pointer ${
                        formik.values.add_ons?.includes(addOn.id)
                          ? "border-blue-500 bg-blue-50"
                          : "border-gray-100 hover:border-blue-200"
                      }`}
                      onClick={() => {
                        const current = formik.values.add_ons || [];
                        if (current.includes(addOn.id)) {
                          formik.setFieldValue(
                            "add_ons",
                            current.filter((id) => id !== addOn.id)
                          );
                        } else {
                          formik.setFieldValue("add_ons", [...current, addOn.id]);
                        }
                      }}
                    >
                      <div className="flex items-center gap-3">
                        <Checkbox
                          id={addOn.id}
                          checked={formik.values.add_ons?.includes(addOn.id)}
                          onCheckedChange={() => {}} // Handled by div onClick
                        />
                        <div>
                          <p className="text-sm font-bold text-gray-900">{addOn.name}</p>
                          {addOn.description && (
                            <p className="text-xs text-gray-500 line-clamp-1">{addOn.description}</p>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-blue-600">
                          {new Intl.NumberFormat("id-ID", {
                            style: "currency",
                            currency: "IDR",
                            maximumFractionDigits: 0
                          }).format(addOn.price)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Booking Summary */}
          <div className="lg:col-span-4">
            <div className="sticky top-4 rounded-lg bg-white p-6 shadow-sm">
              <h3 className="mb-4 text-lg font-bold text-gray-900">Ringkasan Pemesanan</h3>

              {isLoadingBookings ? (
                <div className="space-y-4">
                  <div className="h-20 animate-pulse rounded-lg bg-gray-200"></div>
                  <div className="h-20 animate-pulse rounded-lg bg-gray-200"></div>
                </div>
              ) : !booking ? (
                <div className="rounded-lg border border-red-200 bg-red-50 p-4">
                  <p className="text-sm text-red-600">Booking tidak ditemukan</p>
                </div>
              ) : (
                <>
                  {/* Booking Info */}
                  <div className="mb-4 space-y-2">
                    <div className="flex items-center gap-2">
                      <Icon name="MapPin" className="h-4 w-4 text-red-500" />
                      <p className="font-semibold text-gray-900">
                        {booking.country?.name || "Tour Package"}
                      </p>
                    </div>
                    <p className="text-xs text-gray-500">Booking ID: {booking.id}</p>
                  </div>

                  {/* Tour Items (Itinerary style) */}
                  {booking.book_tour_items && booking.book_tour_items.length > 0 && (
                    <div className="mb-6 space-y-3">
                      <p className="text-sm font-semibold text-gray-700">
                        Rencana Perjalanan ({booking.book_tour_items.length} Destinasi)
                      </p>
                      <div className="space-y-0">
                        {(() => {
                          const sortedItems = [...booking.book_tour_items].sort(
                            (a: any, b: any) =>
                              new Date(a.visit_date).getTime() - new Date(b.visit_date).getTime()
                          );
                          return sortedItems.map((item: any) => (
                            <SummaryTourItem key={item.id} item={item} locale={locale} />
                          ));
                        })()}
                      </div>
                    </div>
                  )}

                  {/* Price Summary */}
                  <div className="border-t border-gray-200 pt-6">
                    {/* Checkout Button with Price */}
                    <Button
                      onClick={() => formik.handleSubmit()}
                      disabled={isCreating}
                      className="flex h-12 w-full items-center justify-between rounded-md bg-blue-500 px-6 font-bold text-white hover:bg-blue-600">
                      <span>{isCreating ? "Processing..." : "Checkout"}</span>
                      <span>
                        {new Intl.NumberFormat("id-ID", {
                          style: "currency",
                          currency: "IDR",
                          minimumFractionDigits: 0
                        }).format(totalPrice)}
                      </span>
                    </Button>
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
