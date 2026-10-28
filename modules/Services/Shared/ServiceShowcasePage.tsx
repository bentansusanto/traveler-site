"use client";

import { useTranslations } from "next-intl";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import {
  ChevronLeft,
  Search,
  ArrowRight,
  Sparkles,
  PhoneCall,
  Clock,
  ShieldCheck,
  CheckCircle2,
  Calendar,
  Send,
  HelpCircle,
  LucideIcon
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export interface ServiceFeatureItem {
  icon: LucideIcon;
  title: string;
  description: string;
}

export interface ServiceFAQItem {
  question: string;
  answer: string;
}

export interface ServiceShowcasePageProps {
  serviceKey: "rentCar" | "busShuttle" | "flight" | "hotel" | "healthTourism";
  badge: string;
  title: string;
  subtitle: string;
  heroImage: string;
  heroImageAlt: string;
  ctaTitle?: string;
  ctaSubtitle?: string;
  features: ServiceFeatureItem[];
  faqs: ServiceFAQItem[];
  popularSearches?: string[];
  inquiryPlaceholder?: string;
  supportPhone?: string;
  supportEmail?: string;
}

export const ServiceShowcasePage = ({
  serviceKey,
  badge,
  title,
  subtitle,
  heroImage,
  heroImageAlt,
  ctaTitle,
  ctaSubtitle,
  features,
  faqs,
  popularSearches = [],
  inquiryPlaceholder,
  supportPhone = "+62 811 1234 5678",
  supportEmail = "cs@pacifictravelindo.com"
}: ServiceShowcasePageProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [emailInquiry, setEmailInquiry] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) {
      toast.info("Silakan masukkan kata kunci pencarian Anda");
      return;
    }
    toast.info(`Layanan untuk "${searchQuery}" akan segera tersedia.`);
  };

  const handleInquirySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailInquiry.trim()) {
      toast.error("Silakan masukkan alamat email atau nomor telepon Anda");
      return;
    }
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setEmailInquiry("");
      toast.success(
        "Permintaan Anda telah kami terima! Tim konsultan PacificTravelindo akan segera menghubungi Anda."
      );
    }, 600);
  };

  const toggleFaq = (index: number) => {
    setOpenFaqIndex(openFaqIndex === index ? null : index);
  };

  return (
    <div className="min-h-screen bg-slate-50/50 pb-20 md:pb-24">
      {/* Hero Banner Section */}
      <div className="relative min-h-[380px] md:min-h-[500px] w-full overflow-hidden bg-slate-900 flex flex-col justify-center">
        {/* Background Image with Crisp Contrast Overlay */}
        <Image
          src={heroImage}
          alt={heroImageAlt}
          fill
          className="object-cover object-center"
          priority
        />
        <div className="absolute inset-0 bg-black/50" />

        {/* Top Mobile Floating Bar */}
        <div className="absolute inset-x-0 top-4 z-20 flex items-center gap-3 px-4 md:hidden">
          <Link
            href="/"
            prefetch={true}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-white/90 text-slate-800 shadow-md backdrop-blur-md transition-transform active:scale-95"
            aria-label="Kembali ke Beranda"
          >
            <ChevronLeft className="h-5 w-5" />
          </Link>
          <div
            onClick={() => {
              const inputEl = document.getElementById(`service-search-${serviceKey}`);
              inputEl?.focus();
            }}
            className="relative flex flex-1 items-center h-10 cursor-pointer rounded-2xl bg-white/95 px-3.5 shadow-md backdrop-blur-md"
          >
            <Search className="h-4 w-4 text-slate-400 mr-2 shrink-0" />
            <span className="text-xs font-medium text-slate-500 truncate">
              {searchQuery || "Cari informasi atau rute..."}
            </span>
          </div>
        </div>

        {/* Hero Content Center Wrapper */}
        <div className="relative mx-auto w-full max-w-7xl px-5 pt-20 pb-12 md:pt-36 md:pb-16 md:px-8 flex flex-col items-center text-center">
          {/* Tagline Badge */}
          <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-xs font-semibold text-white backdrop-blur-md shadow-xs mb-4">
            <Sparkles className="h-3.5 w-3.5 text-orange-400" />
            <span>{badge}</span>
          </div>

          {/* Main Title */}
          <h1 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white drop-shadow-md max-w-3xl leading-tight">
            {title}
          </h1>

          {/* Subtitle */}
          <p className="mt-3 md:mt-4 text-xs sm:text-base text-slate-200/90 max-w-2xl font-normal leading-relaxed">
            {subtitle}
          </p>

          {/* Desktop Search Card Bar */}
          <div className="mt-8 hidden w-full max-w-2xl md:block">
            <form
              onSubmit={handleSearchSubmit}
              className="flex items-center h-14 w-full rounded-2xl bg-white p-2 shadow-xl shadow-black/25 transition-all hover:shadow-2xl"
            >
              <div className="flex flex-1 items-center px-4">
                <Search className="h-5 w-5 text-slate-400 mr-3 shrink-0" />
                <input
                  id={`service-search-${serviceKey}`}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={inquiryPlaceholder || "Ketik destinasi, preferensi, atau rute tujuan..."}
                  className="w-full bg-transparent text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none"
                />
              </div>

              <button
                type="submit"
                className="flex h-10 items-center gap-2 rounded-xl bg-blue-600 px-6 text-xs font-bold text-white shadow-md shadow-blue-600/30 transition-all hover:bg-blue-700 active:scale-95 cursor-pointer"
              >
                <span>Cari Layanan</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </form>

            {/* Popular Quick Searches */}
            {popularSearches.length > 0 && (
              <div className="mt-3 flex flex-wrap items-center justify-center gap-2 text-xs text-slate-300">
                <span className="text-slate-400">Paling banyak dicari:</span>
                {popularSearches.map((keyword, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setSearchQuery(keyword);
                      toast.info(`Mencari opsi untuk: ${keyword}`);
                    }}
                    className="rounded-full bg-white/10 px-3 py-1 hover:bg-white/20 text-white backdrop-blur-md transition-colors cursor-pointer"
                  >
                    {keyword}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content Body */}
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 md:px-8 py-8 md:py-12 space-y-12 md:space-y-16">
        {/* Status Callout Banner */}
        <div className="rounded-2xl border border-blue-100 bg-gradient-to-br from-blue-50/80 via-white to-indigo-50/50 p-6 sm:p-8 shadow-xs">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2 max-w-2xl">
              <div className="inline-flex items-center gap-2 rounded-md bg-blue-600/10 px-2.5 py-1 text-xs font-bold text-blue-700">
                <Clock className="h-3.5 w-3.5 text-blue-600" />
                <span>Konsultasi & Reservasi Aktif</span>
              </div>
              <h2 className="text-lg sm:text-2xl font-bold tracking-tight text-slate-900">
                Layanan Terpadu Bersama Konsultan PacificTravelindo
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Kami siap membantu perencanaan perjalanan, perbandingan tiket, reservasi unit, maupun penawaran korporat secara langsung. Hubungi tim konsultan kami atau ajukan permintaan khusus di bawah ini.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 shrink-0">
              <a
                href={`https://wa.me/6281112345678?text=Halo%20PacificTravelindo,%20saya%20ingin%20konsultasi%20mengenai%20layanan%20${encodeURIComponent(title)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-xs sm:text-sm font-bold text-white shadow-md shadow-blue-600/25 transition-all hover:bg-blue-700 active:scale-95"
              >
                <PhoneCall className="h-4 w-4" />
                <span>Konsultasi Cepat (WhatsApp)</span>
              </a>
              <a
                href={`mailto:${supportEmail}?subject=Permintaan%20Informasi%20${encodeURIComponent(title)}`}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-5 py-3 text-xs sm:text-sm font-semibold text-slate-700 shadow-xs transition-all hover:bg-slate-50 hover:text-slate-900 active:scale-95"
              >
                <span>Email Konsultan</span>
              </a>
            </div>
          </div>
        </div>

        {/* Feature Highlights Grid */}
        <div>
          <div className="mb-6 md:mb-8 text-center sm:text-left">
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
              Keunggulan Layanan Kami
            </h2>
            <p className="mt-1 text-xs sm:text-sm text-slate-500">
              Standar pelayanan internasional dengan jaminan kenyamanan dan keamanan prima.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {features.map((feature, idx) => {
              const FeatureIcon = feature.icon;
              return (
                <div
                  key={idx}
                  className="group relative flex flex-col rounded-2xl bg-white p-6 border border-slate-200/80 shadow-xs transition-all duration-300 hover:-translate-y-1 hover:border-blue-300 hover:shadow-xl hover:shadow-slate-200/60"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600 mb-4 transition-transform group-hover:scale-110">
                    <FeatureIcon className="h-6 w-6" />
                  </div>
                  <h3 className="text-base font-bold text-slate-900 mb-2 group-hover:text-blue-600 transition-colors">
                    {feature.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Inquiry Card Form */}
        <div className="rounded-3xl bg-white border border-slate-200/80 p-6 sm:p-10 shadow-sm">
          <div className="max-w-3xl mx-auto text-center space-y-4">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 border border-emerald-200 px-3 py-1 text-xs font-semibold text-emerald-700">
              <ShieldCheck className="h-3.5 w-3.5" />
              <span>Dukungan Resmi & Bebas Biaya Awal</span>
            </div>
            <h2 className="text-xl sm:text-3xl font-bold tracking-tight text-slate-900">
              {ctaTitle || "Ajukan Permintaan atau Penawaran Khusus"}
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 max-w-xl mx-auto leading-relaxed">
              {ctaSubtitle ||
                "Dapatkan jadwal rute terbaik, ketersediaan unit armada, atau estimasi biaya dari travel specialist kami."}
            </p>

            <form
              onSubmit={handleInquirySubmit}
              className="mt-6 flex flex-col sm:flex-row items-center gap-3 max-w-lg mx-auto"
            >
              <input
                type="text"
                value={emailInquiry}
                onChange={(e) => setEmailInquiry(e.target.value)}
                placeholder="Masukkan No. WhatsApp atau Email Anda..."
                className="w-full rounded-xl border border-slate-300 px-4 py-3 text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-3 text-xs sm:text-sm font-bold text-white shadow-md shadow-blue-600/30 transition-all hover:bg-blue-700 active:scale-95 disabled:opacity-60 cursor-pointer shrink-0"
              >
                <Send className="h-4 w-4" />
                <span>{isSubmitting ? "Mengirim..." : "Kirim"}</span>
              </button>
            </form>

            <div className="pt-2 flex flex-wrap items-center justify-center gap-4 text-[11px] sm:text-xs text-slate-500">
              <span className="inline-flex items-center gap-1">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                Respon Cepat &lt; 15 Menit
              </span>
              <span className="inline-flex items-center gap-1">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                Bebas Konsultasi
              </span>
              <span className="inline-flex items-center gap-1">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                Armada & Rekanan Terverifikasi
              </span>
            </div>
          </div>
        </div>

        {/* FAQ Accordion Section */}
        {faqs.length > 0 && (
          <div className="max-w-4xl mx-auto space-y-6">
            <div className="text-center space-y-1.5">
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
                Pertanyaan yang Sering Diajukan
              </h2>
              <p className="text-xs sm:text-sm text-slate-500">
                Ketahui detail layanan kami sebelum melakukan pemesanan
              </p>
            </div>

            <div className="space-y-3">
              {faqs.map((faq, index) => {
                const isOpen = openFaqIndex === index;
                return (
                  <div
                    key={index}
                    className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white transition-all shadow-xs"
                  >
                    <button
                      type="button"
                      onClick={() => toggleFaq(index)}
                      className="flex w-full items-center justify-between p-4 sm:p-5 text-left text-xs sm:text-sm font-semibold text-slate-900 hover:text-blue-600 transition-colors cursor-pointer"
                    >
                      <span className="pr-4">{faq.question}</span>
                      <ChevronLeft
                        className={cn(
                          "h-4 w-4 text-slate-400 shrink-0 transition-transform duration-200",
                          isOpen ? "-rotate-90 text-blue-600" : ""
                        )}
                      />
                    </button>
                    {isOpen && (
                      <div className="px-4 pb-4 sm:px-5 sm:pb-5 pt-0 text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-slate-100">
                        <p className="pt-3">{faq.answer}</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
