"use client";

import { Hotel, Bed, Star, Coffee, ShieldCheck, MapPin, Sparkles } from "lucide-react";
import { ServiceShowcasePage } from "../Shared/ServiceShowcasePage";

export const HotelsPage = () => {
  return (
    <ServiceShowcasePage
      serviceKey="hotel"
      badge="Reservasi Hotel & Resort Berbintang Internasional"
      title="Akomodasi Nyaman di Lokasi Strategis Favorit Anda"
      subtitle="Temukan pilihan hotel butik, resort tepi pantai, hotel berbintang 4 & 5 di pusat kota dunia, hingga penginapan bernuansa lokal dengan jaminan harga transparan."
      heroImage="https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=2000&q=80"
      heroImageAlt="Hotel dan Resort PacificTravelindo"
      inquiryPlaceholder="Ketik kota atau nama hotel (cth: Istanbul Sultanahmet, Makkah Tower, Bali Ubud)..."
      popularSearches={["Hotel Bintang 5 Istanbul", "Hotel Dekat Masjidil Haram", "Resort Ubud Bali", "Hotel Dekat Shinjuku Tokyo", "Cappadocia Cave Hotel"]}
      ctaTitle="Dapatkan Harga Spesial Kontrak Perjalanan Kami"
      ctaSubtitle="Nikmati penawaran eksklusif, free upgrade kamar, dan sarapan cuma-cuma melalui jaringan rekanan hotel PacificTravelindo."
      features={[
        {
          icon: Hotel,
          title: "Pilihan Hotel Terverifikasi",
          description: "Mulai dari hotel bisnis strategis, hotel ramah keluarga, hingga luxury cave hotel unik di Cappadocia dan resor tropis."
        },
        {
          icon: Star,
          title: "Rate Spesial & Jaringan Luas",
          description: "Manfaatkan harga B2B/Corporate rate yang seringkali lebih bersahabat dibandingkan pemesanan online reguler."
        },
        {
          icon: Coffee,
          title: "Fasilitas & Layanan Ramah Muslim",
          description: "Tersedia kurasi hotel dengan menu halal-friendly, lokasi dekat masjid/tempat ibadah, dan fasilitas penunjang keluarga."
        },
        {
          icon: ShieldCheck,
          title: "Konfirmasi Cepat & Pasti Masuk Sistem",
          description: "Voucher hotel resmi yang terhubung langsung dengan sistem reservasi hotel untuk proses check-in mulus bebas kendala."
        }
      ]}
      faqs={[
        {
          question: "Apakah voucher hotel PacificTravelindo terjamin saat check-in?",
          answer:
            "100% terjamin. Setiap voucher kami memiliki nomor konfirmasi resmi dari jaringan hotel atau wholesaler terverifikasi yang langsung aktif di sistem front desk."
        },
        {
          question: "Apakah bisa mengajukan permintaan khusus (early check-in, kamar bebas rokok, connecting room)?",
          answer:
            "Bisa. Kami akan meneruskan catatan khusus Anda ke pihak manajemen hotel untuk memprioritaskan ketersediaannya pada hari kedatangan Anda."
        },
        {
          question: "Apakah pemesanan hotel untuk rombongan keluarga besar atau kantor bisa dapat diskon?",
          answer:
            "Tentu. Untuk pemesanan lebih dari 5 kamar (group booking), kami menyediakan tarif grup khusus dengan negosiasi langsung ke pihak hotel."
        },
        {
          question: "Bagaimana jika saya perlu mengubah tanggal menginap?",
          answer:
            "Kirimkan permohonan ke tim kami dengan menyebutkan nomor voucher Anda. Kami akan memeriksa kebijakan pembatalan/perubahan kamar untuk memproses penyesuaian tanggal Anda."
        }
      ]}
    />
  );
};
