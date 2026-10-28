"use client";

import { Plane, Compass, Globe, Luggage, Clock, Award, ShieldCheck } from "lucide-react";
import { ServiceShowcasePage } from "../Shared/ServiceShowcasePage";

export const FlightPage = () => {
  return (
    <ServiceShowcasePage
      serviceKey="flight"
      badge="Pemesanan Tiket Pesawat Domestik & Internasional"
      title="Terbang ke Seluruh Penjuru Dunia dengan Harga Terbaik"
      subtitle="Dapatkan kemudahan pemesanan tiket maskapai terkemuka, rute transit optimal, fasilitas bagasi ekstra, serta bantuan reschedule & refund terpercaya."
      heroImage="https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&w=2000&q=80"
      heroImageAlt="Penerbangan dan Tiket Pesawat PacificTravelindo"
      inquiryPlaceholder="Ketik kota asal, kota tujuan (cth: Jakarta ke Istanbul, Tokyo, Jeddah)..."
      popularSearches={["Jakarta - Istanbul", "Jakarta - Tokyo", "Jakarta - Jeddah (Umrah)", "Bali - Sydney", "Surabaya - Singapore"]}
      ctaTitle="Butuh Rute Khusus, Tiket Grup, atau Promo Penerbangan?"
      ctaSubtitle="Tim ticketing kami berlisensi resmi IATA siap mencari rute paling efisien dengan harga kompetitif untuk Anda dan rombongan."
      features={[
        {
          icon: Plane,
          title: "Maskapai Lengkap Global",
          description: "Bermitra resmi dengan maskapai bintang lima dunia dan penerbangan low-cost terkemuka untuk seluruh rute domestik maupun mancanegara."
        },
        {
          icon: Award,
          title: "Sertifikasi Resmi IATA",
          description: "Sebagai agen perjalanan berlisensi IATA resmi, transaksi penerbangan Anda dijamin valid, aman, dan terverifikasi di sistem global."
        },
        {
          icon: Luggage,
          title: "Bantuan Bagasi & Special Request",
          description: "Kami membantu pengaturan bagasi lebih, pemilihan kursi prioritas, makanan khusus di pesawat, hingga bantuan kursi roda di bandara."
        },
        {
          icon: Clock,
          title: "Bantuan Reschedule & Re-route",
          description: "Tidak perlu panik jika rencana berubah. Tim customer service kami siap memandu proses perubahan jadwal sesuai ketentuan maskapai."
        }
      ]}
      faqs={[
        {
          question: "Apakah PacificTravelindo melayani pemesanan tiket grup rombongan?",
          answer:
            "Ya, kami sangat berpengalaman menangani tiket grup (group booking) untuk kebutuhan umrah, ziarah, tour korporat, maupun keluarga besar dengan fasilitas deposit fleksibel."
        },
        {
          question: "Bagaimana cara mendapatkan e-ticket setelah pemesanan?",
          answer:
            "Setelah pembayaran terkonfirmasi, e-ticket resmi dengan kode booking (PNR) akan langsung dikirimkan ke WhatsApp dan email terdaftar Anda."
        },
        {
          question: "Apakah bisa mengajukan perubahan jadwal (reschedule) atau pembatalan (refund)?",
          answer:
            "Tentu. Tim konsultan tiket kami akan membantu proses pengajuan ke maskapai sesuai dengan kelas tarif (fare rules) yang berlaku pada tiket Anda."
        },
        {
          question: "Apakah harga tiket pesawat sudah termasuk pajak bandara dan bagasi?",
          answer:
            "Seluruh penawaran dari kami mencakup rincian lengkap mengenai pajak bandara (airport tax), asuransi, serta ketentuan kuota bagasi cuma-cuma dari maskapai terkait."
        }
      ]}
    />
  );
};
