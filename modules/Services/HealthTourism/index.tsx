"use client";

import { Activity } from "lucide-react";
import { ServiceCatalogTemplate } from "../Shared/ServiceCatalogTemplate";

export const HealthTourismPage = () => {
  return (
    <ServiceCatalogTemplate
      serviceName="Wisata Medis & Kesehatan"
      heroTitle="Perawatan Medis Berstandar Dunia Sambil Berlibur"
      heroSubtitle="Paket terpadu transplantasi rambut di Turki, estetika gigi, medical check up, dan pemulihan wellness berstandar rumah sakit JCI."
      heroImage="https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=2000&q=80"
      heroImageAlt="Wisata Medis & Kesehatan PacificTravelindo"
      searchPlaceholder="Cari perawatan, klinik, atau kota..."
      catalogTitle="Pilihan Paket Medis & Wellness"
      catalogSubtitle="Pilih tindakan medis dan program wellness sesuai kebutuhan Anda"
      icon={Activity}
      categories={[
        { id: "all", name: "Semua Kategori", count: 0 },
        { id: "hair_transplant", name: "Hair Transplant (Turki)", count: 0 },
        { id: "dental", name: "Dental & Estetik Gigi", count: 0 },
        { id: "checkup", name: "Medical Check Up Global", count: 0 },
        { id: "wellness", name: "Thermal Spa & Wellness", count: 0 },
        { id: "eye_care", name: "Eye LASIK & Spesialis", count: 0 }
      ]}
      emptyTitle="Tidak ada paket medis ditemukan"
      emptyDesc="Data paket medis dan jadwal klinik belum tersedia atau sedang dalam proses integrasi backend. Cek kembali nanti."
    />
  );
};
