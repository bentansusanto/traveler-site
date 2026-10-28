"use client";

import { Hotel } from "lucide-react";
import { ServiceCatalogTemplate } from "../Shared/ServiceCatalogTemplate";

export const HotelsPage = () => {
  return (
    <ServiceCatalogTemplate
      serviceName="Hotel & Resort"
      heroTitle="Temukan Akomodasi Terbaik di Lokasi Impian"
      heroSubtitle="Pilihan hotel butik, resor tepi pantai, dan penginapan berbintang dengan jaminan voucher instan dan rate terpercaya."
      heroImage="https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=2000&q=80"
      heroImageAlt="Hotel dan Resort PacificTravelindo"
      searchPlaceholder="Cari hotel, kota, atau daerah tujuan..."
      catalogTitle="Pilihan Hotel & Resort"
      catalogSubtitle="Pilih hotel yang pas untuk istirahat nyaman selama liburan Anda"
      icon={Hotel}
      categories={[
        { id: "all", name: "Semua Kategori", count: 0 },
        { id: "star_5", name: "Hotel Bintang 5", count: 0 },
        { id: "star_4", name: "Hotel Bintang 4", count: 0 },
        { id: "resort", name: "Resort & Villa", count: 0 },
        { id: "boutique", name: "Boutique & Cave Hotel", count: 0 },
        { id: "budget", name: "Smart Budget Hotel", count: 0 }
      ]}
      emptyTitle="Tidak ada hotel ditemukan"
      emptyDesc="Data kamar dan ketersediaan hotel belum tersedia atau sedang dalam proses integrasi backend. Cek kembali nanti."
    />
  );
};
