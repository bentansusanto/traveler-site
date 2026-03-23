"use client";

import Icon from "@/components/icon";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { DatePicker } from "@/components/ui/date-picker";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCreateBookMotorMutation } from "@/store/services/book-motor.service";
import { useFindMotorByIdQuery } from "@/store/services/motor.service";
import { useFindAddOnsByCategoryQuery } from "@/store/services/add-ons.service";
import { Checkbox } from "@/components/ui/checkbox";
import { format, differenceInDays } from "date-fns";
import { id as idLocale } from "date-fns/locale";
import { useFormik } from "formik";
import { useLocale } from "next-intl";
import { useRouter, useSearchParams } from "next/navigation";
import { useMemo } from "react";
import { toast } from "sonner";
import { orderRentMotorSchema, OrderRentMotorValues } from "./schema";

export const OrderRentMotorPage = () => {
  const locale = useLocale();
  const router = useRouter();
  const searchParams = useSearchParams();
  const motorId = searchParams.get("motor_id");

  const { data: motorResponse, isLoading: isLoadingMotor } = useFindMotorByIdQuery(
    motorId as string,
    { skip: !motorId }
  );
  const { data: motorAddOnsResponse } = useFindAddOnsByCategoryQuery("motor");
  const { data: generalAddOnsResponse } = useFindAddOnsByCategoryQuery("general");
  
  const availableAddOns = useMemo(() => {
    const motorAddOnList = motorAddOnsResponse?.datas || (Array.isArray(motorAddOnsResponse?.data) ? motorAddOnsResponse.data : []);
    const generalAddOnList = generalAddOnsResponse?.datas || (Array.isArray(generalAddOnsResponse?.data) ? generalAddOnsResponse.data : []);
    
    return [
      ...motorAddOnList,
      ...generalAddOnList
    ];
  }, [motorAddOnsResponse, generalAddOnsResponse]);

  const [createBookMotor, { isLoading: isCreating }] = useCreateBookMotorMutation();

  const motor = motorResponse?.data;
  const translation = motor?.translations?.find((t: any) => t.language_code === locale) || motor?.translations?.[0];

  const formik = useFormik<OrderRentMotorValues>({
    initialValues: {
      tourists: [
        {
          gender: "",
          name: "",
          nationality: "",
          passport_number: "",
          phone_number: ""
        }
      ],
      start_date: new Date(),
      end_date: new Date(new Date().getTime() + 24 * 60 * 60 * 1000), // Default 1 day
      add_ons: []
    },
    validate: (values) => {
      const result = orderRentMotorSchema.safeParse(values);
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
      if (!motorId) return;

      try {
        const payload = {
          items: [
            {
              motor_id: motorId,
              qty: 1
            }
          ],
          tourists: values.tourists,
          start_date: values.start_date.toISOString(),
          end_date: values.end_date.toISOString(),
          add_ons: values.add_ons
        };

        const response = await createBookMotor(payload).unwrap();
        toast.success("Berhasil membuat pesanan rental motor!");
        
        const bookingId = response.data?.id;
        if (bookingId) {
          router.push(`/${locale}/payments?order_id=${bookingId}&type=motor`);
        } else {
          router.push(`/${locale}/my-bookings`);
        }
      } catch (error: any) {
        toast.error(error?.data?.message || "Gagal membuat pesanan");
      }
    }
  });

  const rentalDays = useMemo(() => {
    if (!formik.values.start_date || !formik.values.end_date) return 0;
    const diff = differenceInDays(formik.values.end_date, formik.values.start_date);
    return Math.max(diff, 1);
  }, [formik.values.start_date, formik.values.end_date]);

  const durationBreakdown = useMemo(() => {
    if (rentalDays < 7) {
      return `${rentalDays} Hari`;
    }
    const weeks = Math.floor(rentalDays / 7);
    const remainingDays = rentalDays % 7;
    
    if (remainingDays === 0) {
      return `${weeks} Minggu`;
    }
    return `${weeks} Minggu, ${remainingDays} Hari`;
  }, [rentalDays]);

  const calculateTotalPrice = () => {
    if (!motor) return 0;
    const prices = motor.motor_prices || motor.prices || [];
    const dailyPrice = prices.find((p: any) => p.price_type === "daily")?.price || 0;
    const weeklyPrice = prices.find((p: any) => p.price_type === "weekly")?.price || 0;

    const weeks = Math.floor(rentalDays / 7);
    const remainingDays = rentalDays % 7;

    const basePrice = rentalDays >= 7 && weeklyPrice > 0
      ? (weeks * Number(weeklyPrice)) + (remainingDays * Number(dailyPrice))
      : rentalDays * Number(dailyPrice);

    const addOnsPrice = (formik.values.add_ons || []).reduce((acc, id) => {
      const addOn = availableAddOns.find(a => a.id === id);
      return acc + (Number(addOn?.price) || 0);
    }, 0);

    return basePrice + addOnsPrice;
  };

  const totalPrice = calculateTotalPrice();

  if (isLoadingMotor) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" />
      </div>
    );
  }

  if (!motor) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center">
        <h1 className="text-xl font-bold">Motor tidak ditemukan</h1>
        <Button onClick={() => router.back()} className="mt-4">Kembali</Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="sticky top-0 z-20 flex items-center justify-between border-b bg-white px-4 py-4">
        <button onClick={() => router.back()} className="rounded-full p-2 hover:bg-gray-100">
          <Icon name="ChevronLeft" className="h-6 w-6" />
        </button>
        <h1 className="text-lg font-bold">Checkout Rental Motor</h1>
        <div className="w-10"></div>
      </div>

      <div className="container mx-auto max-w-2xl px-4 py-6">
        <div className="grid grid-cols-1 gap-6">
          {/* Motor Summary */}
          <Card className="overflow-hidden rounded-3xl border-none shadow-sm ring-1 ring-gray-100">
            <CardContent className="p-0">
              <div className="flex gap-4 p-4">
                <div className="relative h-20 w-24 flex-shrink-0 overflow-hidden rounded-2xl bg-gray-100">
                  <img
                    src={motor.thumbnail || "/images/placeholder.jpg"}
                    alt={translation?.name_motor}
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="flex flex-col justify-center">
                  <h3 className="font-bold text-gray-900">{translation?.name_motor}</h3>
                  <p className="text-sm text-gray-500">{motor.merek?.name_merek} • {motor.engine_cc}cc</p>
                  <div className="mt-1 flex items-center gap-1 text-blue-600">
                    <Icon name="MapPin" className="h-3.5 w-3.5" />
                    <span className="text-xs font-medium">{motor.state?.name}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Rental Duration */}
          <Card className="rounded-3xl border-none shadow-sm ring-1 ring-gray-100">
            <CardContent className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <Icon name="Calendar" className="h-5 w-5 text-blue-600" />
                <h2 className="text-base font-bold text-gray-900">Durasi Rental</h2>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Mulai</Label>
                  <DatePicker
                    date={formik.values.start_date}
                    setDate={(date) => formik.setFieldValue("start_date", date)}
                  />
                  {formik.errors.start_date && (
                    <p className="text-xs text-red-500">{formik.errors.start_date as string}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label>Selesai</Label>
                  <DatePicker
                    date={formik.values.end_date}
                    setDate={(date) => formik.setFieldValue("end_date", date)}
                  />
                  {formik.errors.end_date && (
                    <p className="text-xs text-red-500">{formik.errors.end_date as string}</p>
                  )}
                </div>
              </div>
              <div className="mt-4 rounded-2xl bg-blue-50 p-4 text-center">
                <p className="text-sm font-bold text-gray-700">Total Durasi: <span className="text-blue-700">{rentalDays} Hari</span></p>
                {rentalDays >= 7 && (
                  <p className="mt-1 text-xs font-medium text-gray-500">
                    Perhitungan harga: <span className="font-bold text-blue-600">{durationBreakdown}</span>
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Add-ons Section */}
          {availableAddOns.length > 0 && (
            <Card className="rounded-3xl border-none shadow-sm ring-1 ring-gray-100">
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Icon name="PlusCircle" className="h-5 w-5 text-blue-600" />
                  <h2 className="text-base font-bold text-gray-900">Tambahkan Add-ons</h2>
                </div>
                <div className="space-y-4 font-outfit">
                  {availableAddOns.map((addOn) => (
                    <div
                      key={addOn.id}
                      className={`flex items-center justify-between p-4 rounded-2xl border transition-all cursor-pointer ${
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
                          {addOn.max_price && addOn.max_price > addOn.price && (
                            <span className="text-[10px] text-gray-400 block -mt-1">
                              s/d {new Intl.NumberFormat("id-ID", {
                                style: "currency",
                                currency: "IDR",
                                maximumFractionDigits: 0
                              }).format(addOn.max_price)}
                            </span>
                          )}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Traveler Info */}
          <Card className="rounded-3xl border-none shadow-sm ring-1 ring-gray-100">
            <CardContent className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <Icon name="User" className="h-5 w-5 text-blue-600" />
                <h2 className="text-base font-bold text-gray-900">Informasi Renter</h2>
              </div>
              <div className="space-y-4">
                {formik.values.tourists.map((_, index) => (
                  <div key={index} className="space-y-4">
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor={`tourists.${index}.name`}>Nama Lengkap (Sesuai KTP/Paspor)</Label>
                        <Input
                          id={`tourists.${index}.name`}
                          name={`tourists.${index}.name`}
                          placeholder="Contoh: John Doe"
                          className="h-12 rounded-xl"
                          onChange={formik.handleChange}
                          value={formik.values.tourists[index].name || ""}
                        />
                        {formik.errors.tourists?.[index] && (formik.errors.tourists[index] as any).name && (
                          <p className="text-xs text-red-500">{(formik.errors.tourists[index] as any).name}</p>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label>Jenis Kelamin</Label>
                        <Select
                          value={formik.values.tourists[index].gender || ""}
                          onValueChange={(val) => formik.setFieldValue(`tourists.${index}.gender`, val)}>
                          <SelectTrigger className="h-12 rounded-xl">
                            <SelectValue placeholder="Pilih jenis kelamin" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Mr">Laki-laki (Mr)</SelectItem>
                            <SelectItem value="Miss">Perempuan (Miss)</SelectItem>
                            <SelectItem value="Mrs">Perempuan (Mrs)</SelectItem>
                          </SelectContent>
                        </Select>
                        {formik.errors.tourists?.[index] && (formik.errors.tourists[index] as any).gender && (
                          <p className="text-xs text-red-500">{(formik.errors.tourists[index] as any).gender}</p>
                        )}
                      </div>
                    </div>
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor={`tourists.${index}.passport_number`}>Nomor KTP/Paspor</Label>
                        <Input
                          id={`tourists.${index}.passport_number`}
                          name={`tourists.${index}.passport_number`}
                          placeholder="Masukkan nomor identitas"
                          className="h-12 rounded-xl"
                          onChange={formik.handleChange}
                          value={formik.values.tourists[index].passport_number || ""}
                        />
                        {formik.errors.tourists?.[index] && (formik.errors.tourists[index] as any).passport_number && (
                          <p className="text-xs text-red-500">{(formik.errors.tourists[index] as any).passport_number}</p>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor={`tourists.${index}.nationality`}>Kewarganegaraan</Label>
                        <Input
                          id={`tourists.${index}.nationality`}
                          name={`tourists.${index}.nationality`}
                          placeholder="Contoh: Indonesia"
                          className="h-12 rounded-xl"
                          onChange={formik.handleChange}
                          value={formik.values.tourists[index].nationality || ""}
                        />
                        {formik.errors.tourists?.[index] && (formik.errors.tourists[index] as any).nationality && (
                          <p className="text-xs text-red-500">{(formik.errors.tourists[index] as any).nationality}</p>
                        )}
                      </div>
                    </div>
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor={`tourists.${index}.phone_number`}>Nomor Telepon</Label>
                        <Input
                          id={`tourists.${index}.phone_number`}
                          name={`tourists.${index}.phone_number`}
                          placeholder="Contoh: 0812345678"
                          className="h-12 rounded-xl"
                          onChange={formik.handleChange}
                          value={formik.values.tourists[index].phone_number || ""}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Floating Price Summary */}
      <div className="fixed bottom-0 left-0 right-0 border-t bg-white p-4 shadow-[0_-4px_10px_rgba(0,0,0,0.05)]">
        <div className="container mx-auto max-w-2xl flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Total Pembayaran</span>
            <span className="text-lg font-black text-blue-600">
              {new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(totalPrice)}
            </span>
          </div>
          <Button
            onClick={() => formik.handleSubmit()}
            disabled={isCreating}
            className="h-12 bg-blue-600 px-8 rounded-2xl font-bold shadow-lg shadow-blue-100 hover:bg-blue-700 active:scale-95 disabled:opacity-50"
          >
            {isCreating ? "Memproses..." : "Bayar Sekarang"}
          </Button>
        </div>
      </div>
    </div>
  );
};
