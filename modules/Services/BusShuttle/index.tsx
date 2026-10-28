"use client";

import { Bus } from "lucide-react";
import { ServiceCatalogTemplate } from "../Shared/ServiceCatalogTemplate";

export const BusShuttlePage = () => {
  return (
    <ServiceCatalogTemplate
      serviceName="Bus & Shuttle"
      heroTitle="Perjalanan Nyaman Bersama Rombongan Anda"
      heroSubtitle="Sewa bus pariwisata eksekutif dan shuttle antar kota dengan fasilitas lengkap dan driver berlisensi resmi."
      heroImage="https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=2000&q=80"
      heroImageAlt="Bus dan Shuttle Pariwisata PacificTravelindo"
      searchPlaceholder="Cari rute bus atau shuttle..."
      catalogTitle="Pilihan Armada Bus & Shuttle"
      catalogSubtitle="Pilih kapasitas armada yang tepat untuk perjalanan keluarga atau rombongan Anda"
      icon={Bus}
      categories={[
        { id: "all", name: "Semua Armada", count: 0 },
        { id: "microbus", name: "Microbus (Hiace/Elf)", count: 0 },
        { id: "medium_bus", name: "Medium Bus (29-35 Seat)", count: 0 },
        { id: "big_bus", name: "Big Bus (45-59 Seat)", count: 0 },
        { id: "airport_shuttle", name: "Airport Shuttle", count: 0 }
      ]}
      emptyTitle="Tidak ada rute atau armada ditemukan"
      emptyDesc="Data jadwal bus dan rute shuttle belum tersedia atau sedang dalam proses integrasi backend. Cek kembali dalam waktu dekat."
    />
  );
};
