"use client";

import { Car } from "lucide-react";
import { ServiceCatalogTemplate } from "../Shared/ServiceCatalogTemplate";

export const RentCarPage = () => {
  return (
    <ServiceCatalogTemplate
      serviceName="Rental Mobil"
      heroTitle="Jelajahi Setiap Destinasi Bersama Mobil Pilihan"
      heroSubtitle="Sewa mobil nyaman, armada terawat, dan harga transparan dengan opsi lepas kunci atau supir profesional."
      heroImage="https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=2000&q=80"
      heroImageAlt="Rental Mobil PacificTravelindo"
      searchPlaceholder="Cari mobil atau lokasi..."
      catalogTitle="Pilihan Mobil Terbaik"
      catalogSubtitle="Pilih mobil yang pas untuk perjalanan liburan atau dinas Anda"
      icon={Car}
      categories={[
        { id: "all", name: "Semua Kategori", count: 0 },
        { id: "family_mpv", name: "Family MPV", count: 0 },
        { id: "luxury_mpv", name: "Luxury MPV", count: 0 },
        { id: "suv", name: "SUV & 4x4", count: 0 },
        { id: "city_car", name: "Compact City Car", count: 0 },
        { id: "sedan", name: "Executive Sedan", count: 0 }
      ]}
      emptyTitle="Tidak ada mobil ditemukan"
      emptyDesc="Data unit rental mobil belum tersedia atau sedang dalam proses integrasi backend. Coba ubah kata kunci pencarian atau cek kembali nanti."
    />
  );
};
