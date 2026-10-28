"use client";

import { Bus, Clock, MapPin, Users, ShieldCheck, Ticket, Route } from "lucide-react";
import { ServiceShowcasePage } from "../Shared/ServiceShowcasePage";

export const BusShuttlePage = () => {
  return (
    <ServiceShowcasePage
      serviceKey="busShuttle"
      badge="Layanan Antar Kota & Shuttle Pariwisata"
      title="Perjalanan Rombongan & Shuttle Antar Kota Nyaman"
      subtitle="Solusi transportasi terpercaya untuk liburan keluarga, perjalanan ziarah, study tour, gathering perusahaan, hingga airport transfer bandara."
      heroImage="https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=2000&q=80"
      heroImageAlt="Bus dan Shuttle Pariwisata PacificTravelindo"
      inquiryPlaceholder="Masukkan rute perjalanan (cth: Jakarta - Bandung, Bandara - Hotel, Wisata Bali)..."
      popularSearches={["Bandara Shuttle", "Medium Bus 31 Seat", "Big Bus 50 Seat", "Hiace Luxury 10 Seat", "Tour Ziarah"]}
      ctaTitle="Rencanakan Rute & Sewa Bus Rombongan Sekarang"
      ctaSubtitle="Dapatkan estimasi biaya transparan dan armada terbaik sesuai kapasitas rombongan Anda dengan driver berlisensi."
      features={[
        {
          icon: Bus,
          title: "Varian Armada Lengkap",
          description: "Mulai dari Microbus (Hiace/Elf), Medium Bus (25-35 kursi), hingga Big Bus Executive (45-59 kursi) ber-AC dingin dan fasilitas lengkap."
        },
        {
          icon: Route,
          title: "Rute Fleksibel & Custom",
          description: "Perjalanan dapat disesuaikan dengan rencana itinerary Anda, baik shuttle point-to-point maupun keliling tempat wisata."
        },
        {
          icon: Users,
          title: "Crew & Driver Tersertifikasi",
          description: "Pengemudi berpengalaman jarak jauh dengan jam terbang tinggi serta mengutamakan keselamatan penumpang."
        },
        {
          icon: ShieldCheck,
          title: "Legalitas & Uji KIR Resmi",
          description: "Armada kami memiliki dokumen operasional resmi, lulus uji kelaikan jalan (KIR), dan terawat prima."
        }
      ]}
      faqs={[
        {
          question: "Berapa kapasitas penumpang yang tersedia untuk armada bus?",
          answer:
            "Kami menyediakan Toyota Hiace (10-14 kursi), Isuzu Elf (15-19 kursi), Medium Bus (29-35 kursi), dan Big Bus SHD/HDD (45-59 kursi)."
        },
        {
          question: "Fasilitas apa saja yang ada di dalam armada bus pariwisata?",
          answer:
            "Fasilitas mencakup AC double blower, reclining seats, USB charger di setiap kursi, audio/karaoke, TV LED, bagasi luas, dan kotak P3K standar."
        },
        {
          question: "Apakah bisa melayani sewa bus untuk perjalanan luar kota atau pulau?",
          answer:
            "Tentu saja! Kami melayani perjalanan antar kota di seluruh pulau Jawa, Bali, Lombok, Sumatera, hingga rute khusus perjalanan religi atau gathering instansi."
        },
        {
          question: "Bagaimana alur pemesanan dan pembayaran sewa bus?",
          answer:
            "Konsultasikan tanggal dan rute rombongan Anda melalui konsultan kami untuk menerima quotation resmi, dilanjutkan pembayaran deposit untuk penguncian unit armada."
        }
      ]}
    />
  );
};
