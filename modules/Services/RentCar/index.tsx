"use client";

import { Car, ShieldCheck, Fuel, Users, Award, MapPin, Wrench } from "lucide-react";
import { ServiceShowcasePage } from "../Shared/ServiceShowcasePage";

export const RentCarPage = () => {
  return (
    <ServiceShowcasePage
      serviceKey="rentCar"
      badge="Layanan Rental Mobil & VIP Transfer"
      title="Sewa Mobil Nyaman & Terpercaya Untuk Liburan Anda"
      subtitle="Pilihan armada terawat mulai dari City Car, Family MPV, SUV hingga Luxury Van dengan opsi lepas kunci atau supir profesional berpengalaman."
      heroImage="https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=2000&q=80"
      heroImageAlt="Rental Mobil PacificTravelindo"
      inquiryPlaceholder="Cari tipe mobil (cth: Innova, Alphard, Fortuner) atau lokasi jemput..."
      popularSearches={["Toyota Innova Zenix", "Toyota Alphard", "Hiace Premio", "Pajero Sport", "Avanza"]}
      ctaTitle="Butuh Rekomendasi Mobil atau Sewa Jangka Panjang?"
      ctaSubtitle="Tim kami siap memberikan penawaran harga terbaik untuk rental harian, mingguan, perjalanan dinas, maupun penjemputan bandara."
      features={[
        {
          icon: Car,
          title: "Armada Terbaru & Bersih",
          description: "Seluruh unit selalu dicek secara berkala dan disterilisasi sebelum diserahterimakan kepada pelanggan."
        },
        {
          icon: Users,
          title: "Supir Berpengalaman",
          description: "Pengemudi profesional, ramah, memahami rute wisata lokal, serta tepat waktu untuk kenyamanan Anda."
        },
        {
          icon: ShieldCheck,
          title: "Asuransi Terproteksi",
          description: "Didukung perlindungan asuransi perjalanan agar perjalanan Anda sekeluarga lebih tenang dan bebas cemas."
        },
        {
          icon: Award,
          title: "Harga Transparan",
          description: "Tarif jelas tanpa biaya siluman tersembunyi. Layanan konsultasi dan booking mudah via tim kami."
        }
      ]}
      faqs={[
        {
          question: "Apakah tersedia opsi sewa lepas kunci (tanpa supir)?",
          answer:
            "Ya, kami menyediakan opsi lepas kunci dengan persyaratan verifikasi identitas resmi (KTP/Paspor, SIM aktif, dan akun media sosial/tiket perjalanan)."
        },
        {
          question: "Bagaimana sistem penjemputan atau pengantaran mobil?",
          answer:
            "Mobil dapat diantar atau dijemput langsung di bandara, stasiun, hotel tempat Anda menginap, atau titik temu yang disepakati."
        },
        {
          question: "Apakah tarif sudah termasuk BBM, tol, dan parkir?",
          answer:
            "Untuk paket 'All-In' (dengan supir), Anda dapat memilih paket yang sudah mengikutsertakan BBM dan tol, atau paket standar sesuai kebutuhan perjalanan Anda."
        },
        {
          question: "Bagaimana cara melakukan reservasi sewa mobil?",
          answer:
            "Anda dapat menghubungi tim konsultan kami via WhatsApp atau mengisi formulir kontak cepat. Tim kami akan segera mengonfirmasi ketersediaan armada dalam hitungan menit."
        }
      ]}
    />
  );
};
