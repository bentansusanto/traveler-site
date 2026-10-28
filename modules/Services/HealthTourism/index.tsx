"use client";

import { Activity, HeartPulse, Stethoscope, Building2, ShieldCheck, Award, Smile } from "lucide-react";
import { ServiceShowcasePage } from "../Shared/ServiceShowcasePage";

export const HealthTourismPage = () => {
  return (
    <ServiceShowcasePage
      serviceKey="healthTourism"
      badge="Pusat Wisata Medis, Wellness & Perawatan Spesialis"
      title="Perawatan Medis Berstandar Dunia Sambil Menikmati Liburan"
      subtitle="Pendampingan terpadu untuk transplantasi rambut kelas dunia di Turki, pemeriksaan general check-up, perawatan gigi estetik, serta spa & wellness rejuvenasi."
      heroImage="https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=2000&q=80"
      heroImageAlt="Wisata Kesehatan & Medical Tourism PacificTravelindo"
      inquiryPlaceholder="Tulis layanan yang Anda minati (cth: Hair Transplant Istanbul, Dental Veneer, Check-up)..."
      popularSearches={["Hair Transplant Turki (FUE/DHI)", "Dental Esthetic & Veneer", "Medical Check Up Penang/Singapura", "Thermal Spa & Wellness", "Eye LASIK Surgery"]}
      ctaTitle="Konsultasikan Kebutuhan Medis & Rencana Perjalanan Anda"
      ctaSubtitle="Dapatkan second opinion awal, perkiraan estimasi biaya, rekomendasi klinik/rumah sakit berakreditasi JCI, dan paket akomodasi lengkap."
      features={[
        {
          icon: Building2,
          title: "Rumah Sakit & Klinik Terakreditasi JCI",
          description: "Bermitra dengan fasilitas kesehatan internasional di Turki, Malaysia, dan negara tujuan medis dengan dokter spesialis berpengalaman."
        },
        {
          icon: Stethoscope,
          title: "Paket Perawatan + Liburan Lengkap",
          description: "Pengurusan terpadu mencakup konsultasi awal, penjemputan VIP di bandara, hotel dekat klinik, penerjemah, dan tour pasca tindakan."
        },
        {
          icon: HeartPulse,
          title: "Pendamping Pribadi (Personal Assistant)",
          description: "Tersedia pendamping berbahasa Indonesia atau Inggris untuk mendampingi konsultasi dokter dan mengurus kenyamanan Anda selama di luar negeri."
        },
        {
          icon: Award,
          title: "Privasi Terjaga & Bebas Repot",
          description: "Data rekam medis dan privasi tindakan estetika Anda terjamin kerahasiaannya dengan standar etika medis internasional."
        }
      ]}
      faqs={[
        {
          question: "Mengapa Turki menjadi destinasi utama untuk perawatan hair transplant & dental?",
          answer:
            "Turki merupakan kiblat dunia untuk tindakan transplantasi rambut (FUE/DHI) dan estetika gigi berkat teknologi mutakhir, dokter berakreditasi Eropa, hasil natural, serta biaya yang jauh lebih efisien dibanding negara Barat."
        },
        {
          question: "Apakah aman menggabungkan tindakan medis dengan agenda wisata?",
          answer:
            "Sangat aman bila disesuaikan dengan prosedur dokter. Biasanya agenda wisata ringan dilakukan sebelum tindakan atau pada masa pemulihan santai yang sudah disetujui dokter penanggung jawab."
        },
        {
          question: "Bagaimana tahapan konsultasi awal sebelum berangkat?",
          answer:
            "Anda dapat mengirimkan foto kondisi awal atau rekam medis singkat kepada konsultan kami. Tim medis rekanan di negara tujuan akan memberikan rencana estimasi tindakan dan biaya tanpa dipungut biaya konsultasi awal."
        },
        {
          question: "Apakah ada pendamping atau penerjemah selama proses perawatan?",
          answer:
            "Ya, paket wisata kesehatan kami menyediakan tim pendamping yang membantu komunikasi langsung antara Anda dan dokter spesialis di klinik atau rumah sakit."
        }
      ]}
    />
  );
};
