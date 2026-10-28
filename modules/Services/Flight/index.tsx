"use client";

import { Plane } from "lucide-react";
import { ServiceCatalogTemplate } from "../Shared/ServiceCatalogTemplate";

export const FlightPage = () => {
  return (
    <ServiceCatalogTemplate
      serviceName="Tiket Pesawat"
      heroTitle="Terbang ke Seluruh Penjuru Dunia"
      heroSubtitle="Pesan tiket penerbangan domestik dan internasional dengan rute optimal dan harga terbaik berlisensi resmi IATA."
      heroImage="https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&w=2000&q=80"
      heroImageAlt="Penerbangan dan Tiket Pesawat PacificTravelindo"
      searchPlaceholder="Cari kota asal, destinasi, atau maskapai..."
      catalogTitle="Daftar Penerbangan Tersedia"
      catalogSubtitle="Pilih jadwal terbang sesuai rencana perjalanan Anda"
      icon={Plane}
      categories={[
        { id: "all", name: "Semua Rute", count: 0 },
        { id: "domestic", name: "Penerbangan Domestik", count: 0 },
        { id: "international", name: "Penerbangan Internasional", count: 0 },
        { id: "umrah_haji", name: "Rute Umrah & Haji", count: 0 },
        { id: "transit", name: "Rute Transit Populer", count: 0 }
      ]}
      emptyTitle="Tidak ada penerbangan ditemukan"
      emptyDesc="Data jadwal maskapai dan kuota penerbangan belum tersedia atau sedang dalam proses integrasi backend. Cek kembali nanti."
    />
  );
};
