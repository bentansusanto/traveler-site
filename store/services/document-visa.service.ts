import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth } from "./baseQuery";

export interface DocumentVisaTranslation {
  id?: string;
  language_code: string;
  title: string;
  slug?: string;
  description: string;
  terms_conditions?: string;
  submission_process?: string;
}

export interface DocumentVisaPackage {
  id: string;
  name: string;
  name_i18n?: Record<string, string>;
  raw_name?: any;
  processing_time_days: number;
  embassy_fee: number;
  service_fee: number;
  total_price: number;
  description?: string;
  description_i18n?: Record<string, string>;
  is_active?: boolean;
}

export interface DocumentVisaRequirement {
  id: string;
  title: string;
  name?: string;
  name_i18n?: Record<string, string>;
  raw_name?: any;
  description?: string;
  description_i18n?: Record<string, string>;
  is_mandatory: boolean;
  document_type?: string;
}

export interface DocumentCategory {
  id: string;
  name: string;
  slug?: string;
  icon?: string;
}

export interface DocumentVisaItem {
  id: string;
  title: string;
  slug?: string;
  category_id?: string;
  category?: DocumentCategory;
  country_id?: string;
  country_name: string;
  country_code: string;
  flag_url?: string;
  visa_type: "tourist" | "business" | "study" | "transit" | "umrah_hajj" | "passport_new" | "passport_renewal" | "other";
  entry_type: "single_entry" | "multiple_entry" | "not_applicable";
  validity_days?: number;
  validity?: string;
  max_stay_days?: number;
  processing_time_days?: number;
  processing_time?: string;
  starting_price: number; // in USD
  thumbnail: string;
  images?: string[];
  is_interview_required: boolean;
  is_biometric_required: boolean;
  is_active: boolean;
  description?: string;
  terms_conditions?: string;
  submission_process?: string;
  requirements: (string | DocumentVisaRequirement)[];
  inclusions?: string[];
  packages?: DocumentVisaPackage[];
  translations: DocumentVisaTranslation[];
  createdAt?: string;
  updatedAt?: string;
}

export interface FilterDocumentVisaQuery {
  page?: number | string;
  limit?: number | string;
  search?: string;
  category_id?: string;
  country_id?: string;
  visa_type?: string;
  entry_type?: string;
  sort?: string;
  lang?: string;
}

export interface DocumentVisaResponse {
  message: string;
  data: DocumentVisaItem[];
  meta?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface SingleDocumentVisaResponse {
  message: string;
  data: DocumentVisaItem;
}

export const INITIAL_DOCUMENT_VISAS: DocumentVisaItem[] = [
  {
    id: "visa_japan_01",
    title: "Japan Tourist eVisa / Visa Kunjungan Jepang",
    slug: "japan-tourist-evisa",
    country_name: "Japan",
    country_code: "JP",
    flag_url: "https://flagcdn.com/w80/jp.png",
    visa_type: "tourist",
    entry_type: "single_entry",
    validity_days: 90,
    validity: "90 Hari (Maks. Tinggal 15 Hari)",
    max_stay_days: 15,
    processing_time_days: 5,
    processing_time: "5 - 7 Hari Kerja",
    starting_price: 45,
    thumbnail: "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=800&q=80",
    images: [
      "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=800&q=80",
      "https://images.unsplash.com/photo-1503899036084-c55cdd92da26?w=800&q=80"
    ],
    is_interview_required: false,
    is_biometric_required: false,
    is_active: true,
    description: "Pendampingan pengajuan visa turis Jepang (eVisa & Stiker) untuk kunjungan wisata, liburan keluarga, dan transit.",
    requirements: [
      "Paspor asli berlaku minimal 6 bulan",
      "Pasfoto digital (4.5 x 3.5 cm, latar putih)",
      "Rekening koran 3 bulan terakhir dengan saldo mencukupi",
      "Tiket pesawat pulang-pergi dan bukti reservasi hotel",
      "Kartu Keluarga (KK) & KTP pemohon"
    ],
    inclusions: [
      "Pengecekan kelengkapan & verifikasi dokumen",
      "Pengisian formulir resmi eVisa / Kedubes",
      "Booking jadwal penyerahan berkas (JVAC)",
      "Update status pengajuan secara berkala"
    ],
    packages: [
      {
        id: "pkg_jp_standard",
        name: "Standard Processing (5-7 Hari Kerja)",
        processing_time_days: 7,
        embassy_fee: 25,
        service_fee: 20,
        total_price: 45,
        description: "Layanan pendampingan standar untuk pengajuan visa turis Jepang."
      },
      {
        id: "pkg_jp_express",
        name: "Express Priority (3-4 Hari Kerja)",
        processing_time_days: 4,
        embassy_fee: 25,
        service_fee: 45,
        total_price: 70,
        description: "Verifikasi kilat dan prioritas penyerahan berkas untuk jadwal keberangkatan mendesak."
      }
    ],
    translations: [
      {
        language_code: "id",
        title: "Japan Tourist eVisa / Visa Kunjungan Jepang",
        slug: "japan-tourist-evisa",
        description: "Pendampingan pengajuan visa turis Jepang (eVisa & Stiker) untuk kunjungan wisata dan liburan.",
        submission_process: "1. Konsultasi & Pengiriman Dokumen -> 2. Verifikasi Data -> 3. Pembayaran & Pengajuan -> 4. Visa Elektronik Diterbitkan."
      },
      {
        language_code: "en",
        title: "Japan Tourist eVisa Application Assistance",
        slug: "japan-tourist-evisa",
        description: "Official assistance for Japan tourist eVisa application with document checklist verification.",
        submission_process: "1. Document Upload & Consultation -> 2. Verification -> 3. Application Submission -> 4. eVisa Issued."
      }
    ]
  },
  {
    id: "visa_schengen_02",
    title: "Schengen Europe Tourist Visa (Prancis, Italia, Jerman, Swiss)",
    slug: "schengen-tourist-visa",
    country_name: "Schengen / Europe",
    country_code: "EU",
    flag_url: "https://flagcdn.com/w80/eu.png",
    visa_type: "tourist",
    entry_type: "multiple_entry",
    validity_days: 180,
    validity: "Hingga 90 Hari dalam Periode 180 Hari",
    max_stay_days: 90,
    processing_time_days: 15,
    processing_time: "15 - 20 Hari Kerja",
    starting_price: 135,
    thumbnail: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800&q=80",
    images: [
      "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800&q=80",
      "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=800&q=80"
    ],
    is_interview_required: false,
    is_biometric_required: true,
    is_active: true,
    description: "Pendampingan lengkap pengajuan visa Schengen untuk mengunjungi 29 negara Eropa dengan bantuan penyusunan itinerary dan asuransi.",
    requirements: [
      "Paspor asli berlaku minimal 6 bulan + paspor lama",
      "Pasfoto biometric 3.5 x 4.5 cm latar abu-abu/putih",
      "Rekening koran 3 bulan terakhir berstempel bank",
      "Surat keterangan kerja / SIUP & TDP untuk pengusaha",
      "Polis asuransi perjalanan internasional (min. cover €30.000)",
      "Itinerary harian lengkap & bukti booking tiket pesawat/hotel"
    ],
    inclusions: [
      "Booking slot janji temu VFS Global / TLScontact",
      "Pembuatan cover letter resmi & travel itinerary",
      "Bantuan penerbitan asuransi perjalanan Schengen",
      "Simulasi wawancara & briefing dokumen sebelum janji temu"
    ],
    packages: [
      {
        id: "pkg_sch_standard",
        name: "Full Assistance Schengen Visa",
        processing_time_days: 18,
        embassy_fee: 90,
        service_fee: 45,
        total_price: 135,
        description: "Pendampingan menyeluruh dari persiapan dokumen hingga booking janji temu VFS."
      }
    ],
    translations: [
      {
        language_code: "id",
        title: "Schengen Europe Tourist Visa (Prancis, Italia, Jerman, Swiss)",
        slug: "schengen-tourist-visa",
        description: "Pendampingan lengkap pengajuan visa Schengen ke 29 negara Eropa.",
        submission_process: "1. Review Profil & Dokumen -> 2. Pembuatan Itinerary & Asuransi -> 3. Janji Temu Biometrik -> 4. Visa Disetujui."
      },
      {
        language_code: "en",
        title: "Schengen Europe Tourist Visa Assistance",
        slug: "schengen-tourist-visa",
        description: "Complete assistance for Schengen visa granting access to 29 European countries.",
        submission_process: "1. Profile Assessment -> 2. Itinerary & Insurance Drafting -> 3. Biometric Appointment -> 4. Passport Collection."
      }
    ]
  },
  {
    id: "visa_usa_03",
    title: "USA B1/B2 Visitor Visa Assistance (Formulir DS-160)",
    slug: "usa-b1-b2-visa",
    country_name: "United States",
    country_code: "US",
    flag_url: "https://flagcdn.com/w80/us.png",
    visa_type: "tourist",
    entry_type: "multiple_entry",
    validity_days: 1825,
    validity: "5 - 10 Tahun (Masa Tinggal Ditentukan Imigrasi)",
    max_stay_days: 180,
    processing_time_days: 10,
    processing_time: "7 - 14 Hari Kerja (Setelah Wawancara)",
    starting_price: 185,
    thumbnail: "https://images.unsplash.com/photo-1485738422979-f5c462d49f74?w=800&q=80",
    images: [
      "https://images.unsplash.com/photo-1485738422979-f5c462d49f74?w=800&q=80",
      "https://images.unsplash.com/photo-1538688525198-9b88f6f53126?w=800&q=80"
    ],
    is_interview_required: true,
    is_biometric_required: true,
    is_active: true,
    description: "Pendampingan pengisian formulir online DS-160, pembayaran biaya MRV, penjadwalan janji temu, dan simulasi wawancara Kedubes AS.",
    requirements: [
      "Paspor asli berlaku minimal 6 bulan",
      "Konfirmasi formulir DS-160",
      "Foto visa Amerika (5 x 5 cm, latar putih tanpa kacamata)",
      "Bukti keuangan keluarga (rekening koran, bukti aset, SPT)",
      "Surat keterangan kerja atau sponsor perjalanan"
    ],
    inclusions: [
      "Pengisian formulir DS-160 secara presisi & akurat",
      "Penjadwalan slot janji temu Kedubes AS di Jakarta / Surabaya",
      "Simulasi latihan wawancara 1-on-1 (mock interview)",
      "Penyusunan urutan dokumen bukti pendukung"
    ],
    packages: [
      {
        id: "pkg_us_b1b2",
        name: "Full DS-160 & Interview Mentoring",
        processing_time_days: 10,
        embassy_fee: 185,
        service_fee: 55,
        total_price: 240,
        description: "Pengisian DS-160, booking jadwal wawancara, dan mentoring simulasi interview."
      }
    ],
    translations: [
      {
        language_code: "id",
        title: "USA B1/B2 Visitor Visa Assistance (Formulir DS-160)",
        slug: "usa-b1-b2-visa",
        description: "Panduan lengkap pengajuan visa turis & bisnis Amerika Serikat.",
        submission_process: "1. Pengisian Data DS-160 -> 2. Pembayaran Biaya MRV -> 3. Penjadwalan Wawancara -> 4. Wawancara & Pengambilan Paspor."
      },
      {
        language_code: "en",
        title: "USA B1/B2 Tourist & Business Visa (DS-160)",
        slug: "usa-b1-b2-visa",
        description: "Comprehensive assistance for US visa including DS-160 form filing and mock interview coaching.",
        submission_process: "1. DS-160 Data Entry -> 2. MRV Fee Payment -> 3. Interview Scheduling -> 4. Embassy Interview."
      }
    ]
  },
  {
    id: "visa_saudi_04",
    title: "Saudi Arabia Tourist & Umrah eVisa (Visa Ziarah)",
    slug: "saudi-arabia-umrah-evisa",
    country_name: "Saudi Arabia",
    country_code: "SA",
    flag_url: "https://flagcdn.com/w80/sa.png",
    visa_type: "umrah_hajj",
    entry_type: "multiple_entry",
    validity_days: 365,
    validity: "1 Tahun Multiple Entry (Tinggal 90 Hari)",
    max_stay_days: 90,
    processing_time_days: 2,
    processing_time: "1 - 3 Hari Kerja (Instan)",
    starting_price: 140,
    thumbnail: "https://images.unsplash.com/photo-1591604129939-f1efa4d9f7fa?w=800&q=80",
    images: [
      "https://images.unsplash.com/photo-1591604129939-f1efa4d9f7fa?w=800&q=80",
      "https://images.unsplash.com/photo-1565552645632-d725f8bfc19a?w=800&q=80"
    ],
    is_interview_required: false,
    is_biometric_required: false,
    is_active: true,
    description: "Visa elektronik resmi Arab Saudi untuk wisata, ibadah Umrah mandiri, ziarah ke Mekkah, Madinah, dan kota-kota lainnya.",
    requirements: [
      "Scan paspor asli berwarna (min. berlaku 6 bulan)",
      "Pasfoto digital latar putih kualitas tajam",
      "Asuransi kesehatan resmi Saudi (termasuk dalam paket)",
      "Alamat kontak & akomodasi di Arab Saudi"
    ],
    inclusions: [
      "Penerbitan eVisa resmi Kementerian Luar Negeri Arab Saudi",
      "Asuransi kesehatan wajib Kerajaan Arab Saudi (Cover COVID-19)",
      "Dapat langsung digunakan untuk ibadah Umrah & ziarah",
      "Panduan instalasi aplikasi Nusuk untuk tasreh Raudhah"
    ],
    packages: [
      {
        id: "pkg_sa_standard",
        name: "Saudi 1-Year Multiple Entry eVisa",
        processing_time_days: 2,
        embassy_fee: 105,
        service_fee: 35,
        total_price: 140,
        description: "eVisa resmi Arab Saudi masa berlaku 1 tahun dengan izin tinggal hingga 90 hari per kunjungan."
      }
    ],
    translations: [
      {
        language_code: "id",
        title: "Saudi Arabia Tourist & Umrah eVisa (Visa Ziarah)",
        slug: "saudi-arabia-umrah-evisa",
        description: "eVisa resmi Arab Saudi untuk wisata dan ibadah Umrah mandiri.",
        submission_process: "1. Kirim Scan Paspor & Foto -> 2. Verifikasi Data -> 3. Proses Penerbitan 1-2 Hari -> 4. eVisa Siap Dipakai."
      },
      {
        language_code: "en",
        title: "Saudi Arabia Tourist & Umrah eVisa",
        slug: "saudi-arabia-umrah-evisa",
        description: "Official Saudi 1-year multiple entry eVisa valid for tourism and Umrah pilgrimages.",
        submission_process: "1. Submit Passport & Photo -> 2. Verification -> 3. Fast Online Issuance -> 4. Ready to Fly."
      }
    ]
  },
  {
    id: "visa_australia_05",
    title: "Australia Visitor Visa (Subclass 600) e-Visitor",
    slug: "australia-visitor-visa-subclass-600",
    country_name: "Australia",
    country_code: "AU",
    flag_url: "https://flagcdn.com/w80/au.png",
    visa_type: "tourist",
    entry_type: "multiple_entry",
    validity_days: 365,
    validity: "1 - 3 Tahun (Tinggal 3 Bulan per Kunjungan)",
    max_stay_days: 90,
    processing_time_days: 14,
    processing_time: "10 - 20 Hari Kerja",
    starting_price: 160,
    thumbnail: "https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?w=800&q=80",
    images: [
      "https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?w=800&q=80",
      "https://images.unsplash.com/photo-1523482580672-f109ba8cb9be?w=800&q=80"
    ],
    is_interview_required: false,
    is_biometric_required: true,
    is_active: true,
    description: "Pendampingan pengajuan visa kunjungan Australia Subclass 600 secara digital melalui ImmiAccount resmi.",
    requirements: [
      "Scan berwarna paspor asli (min. berlaku 6 bulan)",
      "Pasfoto ukuran 3.5 x 4.5 cm latar putih",
      "Rekening koran 3 bulan terakhir",
      "Surat keterangan kerja / bukti kepemilikan usaha",
      "Kartu Keluarga (KK) & KTP"
    ],
    inclusions: [
      "Pembuatan & pengisian akun resmi ImmiAccount Australia",
      "Upload berkas digital berstandar imigrasi Australia",
      "Booking slot biometrik di VFS Global",
      "Pemeriksaan silang seluruh dokumen pendukung"
    ],
    packages: [
      {
        id: "pkg_au_standard",
        name: "Australia Subclass 600 Full Service",
        processing_time_days: 14,
        embassy_fee: 120,
        service_fee: 40,
        total_price: 160,
        description: "Pengisian ImmiAccount lengkap dan pendampingan janji biometrik."
      }
    ],
    translations: [
      {
        language_code: "id",
        title: "Australia Visitor Visa (Subclass 600)",
        slug: "australia-visitor-visa-subclass-600",
        description: "Bantuan pengajuan visa turis dan kunjungan keluarga ke Australia.",
        submission_process: "1. Konsultasi Dokumen -> 2. Pengisian ImmiAccount -> 3. Pengambilan Biometrik VFS -> 4. Visa Grant Notice Dikirim."
      },
      {
        language_code: "en",
        title: "Australia Tourist Visa Subclass 600",
        slug: "australia-visitor-visa-subclass-600",
        description: "Complete ImmiAccount digital application assistance for Australia visitor visa.",
        submission_process: "1. Document Check -> 2. ImmiAccount Submission -> 3. Biometrics Collection -> 4. Grant Notice Delivered."
      }
    ]
  },
  {
    id: "visa_korea_06",
    title: "South Korea Tourist Visa (C-3-9) / K-ETA Assistance",
    slug: "south-korea-tourist-visa-c39",
    country_name: "South Korea",
    country_code: "KR",
    flag_url: "https://flagcdn.com/w80/kr.png",
    visa_type: "tourist",
    entry_type: "single_entry",
    validity_days: 90,
    validity: "90 Hari (Masa Tinggal 30-90 Hari)",
    max_stay_days: 30,
    processing_time_days: 7,
    processing_time: "5 - 8 Hari Kerja",
    starting_price: 55,
    thumbnail: "https://images.unsplash.com/photo-1517154421773-0529f29ea451?w=800&q=80",
    images: [
      "https://images.unsplash.com/photo-1517154421773-0529f29ea451?w=800&q=80",
      "https://images.unsplash.com/photo-1538485399081-7191377e8241?w=800&q=80"
    ],
    is_interview_required: false,
    is_biometric_required: false,
    is_active: true,
    description: "Pengurusan visa kunjungan wisata Korea Selatan melalui Korea Visa Application Center (KVAC) Jakarta.",
    requirements: [
      "Paspor asli berlaku minimal 6 bulan",
      "Pasfoto terbaru 3.5 x 4.5 cm latar putih",
      "Surat keterangan kerja asli dalam bahasa Inggris",
      "Rekening koran 3 bulan terakhir + SPT PPh 21 (opsional)",
      "Kartu Keluarga (KK)"
    ],
    inclusions: [
      "Pemeriksaan ketat format dokumen sesuai ketentuan KVAC",
      "Pengisian formulir visa Korea Selatan",
      "Pengantaran & pengambilan berkas ke KVAC Lotte Mall",
      "Tracking status aplikasi harian"
    ],
    packages: [
      {
        id: "pkg_kr_single",
        name: "Single Entry KVAC Submission",
        processing_time_days: 7,
        embassy_fee: 30,
        service_fee: 25,
        total_price: 55,
        description: "Pengurusan visa turis Korea Selatan single entry."
      },
      {
        id: "pkg_kr_multiple",
        name: "Multiple Entry 5-Year Visa",
        processing_time_days: 8,
        embassy_fee: 65,
        service_fee: 35,
        total_price: 100,
        description: "Pengurusan visa multiple entry 5 tahun bagi pemohon yang memenuhi kualifikasi."
      }
    ],
    translations: [
      {
        language_code: "id",
        title: "South Korea Tourist Visa (C-3-9) / KVAC",
        slug: "south-korea-tourist-visa-c39",
        description: "Layanan pengurusan visa turis Korea Selatan via KVAC Jakarta.",
        submission_process: "1. Kelengkapan Berkas -> 2. Penyerahan ke KVAC -> 3. Proses Imigrasi -> 4. Paspor Selesai Ber-visa."
      },
      {
        language_code: "en",
        title: "South Korea Tourist Visa (C-3-9)",
        slug: "south-korea-tourist-visa-c39",
        description: "Official KVAC submission and processing service for South Korea travel.",
        submission_process: "1. Document Audit -> 2. KVAC Submission -> 3. Processing -> 4. Passport Collection."
      }
    ]
  },
  {
    id: "visa_turkey_07",
    title: "Turkey Tourist E-Visa & Residence Permit Document Prep",
    slug: "turkey-tourist-evisa-assistance",
    country_name: "Turkey",
    country_code: "TR",
    flag_url: "https://flagcdn.com/w80/tr.png",
    visa_type: "tourist",
    entry_type: "multiple_entry",
    validity_days: 180,
    validity: "180 Hari (Tinggal 30-90 Hari)",
    max_stay_days: 30,
    processing_time_days: 1,
    processing_time: "1 Hari Kerja (Instan)",
    starting_price: 35,
    thumbnail: "https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?w=800&q=80",
    images: [
      "https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?w=800&q=80",
      "https://images.unsplash.com/photo-1527838832700-5059252407fa?w=800&q=80"
    ],
    is_interview_required: false,
    is_biometric_required: false,
    is_active: true,
    description: "Penerbitan kilat E-Visa Turki resmi dan pendampingan dokumen legalitas tinggal / izin tinggal (Ikamet).",
    requirements: [
      "Paspor asli berlaku minimal 6 bulan dari tanggal kedatangan",
      "Tiket penerbangan dan reservasi hotel",
      "Alamat email aktif untuk menerima dokumen e-Visa PDF"
    ],
    inclusions: [
      "Penerbitan e-Visa resmi Republik Turki dalam hitungan jam",
      "Verifikasi nomor paspor agar terhindar dari kesalahan cetak",
      "Pengiriman dokumen e-Visa siap cetak via WhatsApp & Email",
      "Konsultasi aturan imigrasi bandara Istanbul"
    ],
    packages: [
      {
        id: "pkg_tr_instant",
        name: "Instant Official Turkey e-Visa",
        processing_time_days: 1,
        embassy_fee: 25,
        service_fee: 10,
        total_price: 35,
        description: "Pembuatan e-Visa Turki langsung jadi 1-3 jam kerja."
      }
    ],
    translations: [
      {
        language_code: "id",
        title: "Turkey Tourist E-Visa & Konsultasi Dokumen",
        slug: "turkey-tourist-evisa-assistance",
        description: "Layanan cepat e-Visa Turki resmi dan konsultasi dokumen izin tinggal.",
        submission_process: "1. Input Paspor -> 2. Verifikasi Data -> 3. Terbit 1-3 Jam -> 4. Dokumen Dikirim Langsung."
      },
      {
        language_code: "en",
        title: "Turkey Official Tourist E-Visa",
        slug: "turkey-tourist-evisa-assistance",
        description: "Instant official e-Visa processing for travelers visiting Istanbul, Cappadocia, and Turkey.",
        submission_process: "1. Data Input -> 2. Verification -> 3. Fast Approval -> 4. E-Visa PDF Delivered."
      }
    ]
  },
  {
    id: "doc_passport_08",
    title: "Layanan Pendampingan Paspor Baru & e-Paspor (Polikarbonat)",
    slug: "layanan-paspor-baru-epaspor-elektronik",
    country_name: "Indonesia",
    country_code: "ID",
    flag_url: "https://flagcdn.com/w80/id.png",
    visa_type: "passport_new",
    entry_type: "not_applicable",
    validity_days: 3650,
    validity: "Masa Berlaku 10 Tahun",
    max_stay_days: 0,
    processing_time_days: 4,
    processing_time: "3 - 5 Hari Kerja",
    starting_price: 40,
    thumbnail: "https://images.unsplash.com/photo-1544717305-2782549b5136?w=800&q=80",
    images: [
      "https://images.unsplash.com/photo-1544717305-2782549b5136?w=800&q=80",
      "https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800&q=80"
    ],
    is_interview_required: true,
    is_biometric_required: true,
    is_active: true,
    description: "Pendampingan booking antrean M-Paspor, verifikasi berkas, percepatan jadwal, dan pengurusan Paspor Elektronik 10 tahun.",
    requirements: [
      "KTP Elektronik asli pemohon",
      "Kartu Keluarga (KK) terbaru",
      "Akta Kelahiran / Buku Nikah / Ijazah sekolah",
      "Paspor lama (khusus perpanjangan/penggantian)"
    ],
    inclusions: [
      "Pemesanan kuota antrean resmi di Kantor Imigrasi terdekat",
      "Pemeriksaan ketepatan ejaan nama dan tanggal lahir",
      "Bantuan teknis aplikasi M-Paspor",
      "Pendampingan briefing wawancara & foto biometrik"
    ],
    packages: [
      {
        id: "pkg_pass_regular",
        name: "Pendampingan Paspor Reguler",
        processing_time_days: 5,
        embassy_fee: 25,
        service_fee: 15,
        total_price: 40,
        description: "Booking kuota M-Paspor dan pendampingan dokumen."
      },
      {
        id: "pkg_pass_epaspor",
        name: "e-Paspor Elektronik Polikarbonat 10 Tahun",
        processing_time_days: 4,
        embassy_fee: 45,
        service_fee: 25,
        total_price: 70,
        description: "Pengurusan paspor elektronik polikarbonat berfasilitas bebas visa ke berbagai negara."
      }
    ],
    translations: [
      {
        language_code: "id",
        title: "Layanan Paspor Baru & e-Paspor (Polikarbonat 10 Tahun)",
        slug: "layanan-paspor-baru-epaspor-elektronik",
        description: "Pendampingan antrean M-Paspor, perpanjangan, dan e-Paspor masa berlaku 10 tahun.",
        submission_process: "1. Upload Berkas Identitas -> 2. Pemilihan Kantor Imigrasi -> 3. Foto & Wawancara -> 4. Paspor Selesai."
      },
      {
        language_code: "en",
        title: "Indonesian Passport & E-Passport Assistance",
        slug: "layanan-paspor-baru-epaspor-elektronik",
        description: "Official appointment slot scheduling and document verification for Indonesian passport issuance.",
        submission_process: "1. Document Audit -> 2. Slot Booking -> 3. Photo & Biometrics -> 4. Passport Pick-up."
      }
    ]
  }
];

export const getLocalizedText = (value: any, locale: string = "en"): string => {
  if (!value && value !== 0) return "";
  const targetLocale = (locale || "en").toLowerCase();

  if (typeof value === "string") {
    const trimmed = value.trim();
    if (trimmed.startsWith("{") && trimmed.endsWith("}")) {
      try {
        const parsed = JSON.parse(trimmed);
        if (typeof parsed === "object" && parsed !== null) {
          return getLocalizedText(
            parsed[targetLocale] || parsed["en"] || parsed["id"] || parsed["tr"] || Object.values(parsed)[0] || "",
            targetLocale
          );
        }
      } catch {
        // fallback
      }
    }

    if (targetLocale === "en") {
      const dictionary: Record<string, string> = {
        "Scan Paspor Asli (Halaman Biodata)": "Original Passport Scan (Biodata Page)",
        "Pasfoto Berwarna Terbaru (Format Visa)": "Recent Color Photograph (Visa Format)",
        "Bukti Reservasi Tiket Pesawat & Hotel": "Roundtrip Flight & Hotel Reservation Booking Proof",
        "Kilat VIP Express (2 Hari Kerja)": "Express VIP Fast Track (2 Business Days)",
        "Prioritas verifikasi cepat dan antrean jalur kilat.": "High-priority verification and fast-track processing.",
        "Reguler Standar (5-7 Hari Kerja)": "Standard Regular (5-7 Business Days)",
        "Pengurusan reguler sesuai jadwal standar kedutaan.": "Standard submission according to embassy regular schedule.",
        "Tanpa Wawancara": "No Interview",
        "Perlu Wawancara": "Interview Required",
        "Wajib Hadir VFS": "In-Person VFS",
        "Digital Online": "Digital Online",
        "180 Hari": "180 Days",
        "2 Hari Kerja": "2 Business Days",
        "5 Hari Kerja": "5 Business Days",
        "5-7 Hari Kerja": "5-7 Business Days",
        "Sesuai Kebijakan": "As per consular policy"
      };
      if (dictionary[trimmed]) {
        return dictionary[trimmed];
      }
      return trimmed
        .replace(/(\d+)\s*Hari\s*Kerja/gi, "$1 Business Days")
        .replace(/(\d+)\s*Hari/gi, "$1 Days")
        .replace(/Biaya Kedubes/gi, "Embassy Fee")
        .replace(/Biaya Layanan/gi, "Service Fee")
        .replace(/Proses:/gi, "Processing:")
        .replace(/Estimasi:/gi, "Estimated:")
        .replace(/Tanpa Wawancara/gi, "No Interview")
        .replace(/Perlu Wawancara/gi, "Interview Required");
    }

    return value;
  }

  if (typeof value === "object" && value !== null) {
    if (Array.isArray(value)) {
      return value.map((v) => getLocalizedText(v, targetLocale)).filter(Boolean).join(", ");
    }
    const val =
      value[targetLocale] !== undefined
        ? value[targetLocale]
        : targetLocale === "en" && value["en"] !== undefined
        ? value["en"]
        : targetLocale === "id" && value["id"] !== undefined
        ? value["id"]
        : targetLocale === "tr" && value["tr"] !== undefined
        ? value["tr"]
        : value["en"] !== undefined
        ? value["en"]
        : value["id"] !== undefined
        ? value["id"]
        : value["tr"] !== undefined
        ? value["tr"]
        : Object.values(value)[0];
    return getLocalizedText(val, targetLocale);
  }

  return String(value);
};

export const normalizeVisaItem = (item: any, locale?: string): DocumentVisaItem => {
  if (!item) return item;
  const activeLocale = locale || "en";

  // Extract country name safely
  const rawCountryName =
    item.country_name ||
    item.country?.name ||
    (item.origin_country ? item.origin_country.name : "") ||
    "International";

  const firstPkgDays = item.packages?.[0]?.processing_time_days || item.processing_time_days;

  const rawValidity =
    item.validity ||
    (item.validity_days
      ? activeLocale === "id"
        ? `${item.validity_days} Hari`
        : `${item.validity_days} Days`
      : undefined);

  const rawProcessingTime =
    item.processing_time ||
    (firstPkgDays
      ? activeLocale === "id"
        ? `${firstPkgDays} Hari Kerja`
        : `${firstPkgDays} Business Days`
      : undefined);

  return {
    ...item,
    title: getLocalizedText(item.title, activeLocale),
    country_name: getLocalizedText(rawCountryName, activeLocale) || "International",
    description: item.description ? getLocalizedText(item.description, activeLocale) : undefined,
    validity: rawValidity ? getLocalizedText(rawValidity, activeLocale) : undefined,
    processing_time: rawProcessingTime ? getLocalizedText(rawProcessingTime, activeLocale) : undefined,
    submission_process: item.submission_process ? getLocalizedText(item.submission_process, activeLocale) : undefined,
    terms_conditions: item.terms_conditions ? getLocalizedText(item.terms_conditions, activeLocale) : undefined,
    starting_price: Number(item.starting_price || item.packages?.[0]?.total_price || 0),
    packages: Array.isArray(item.packages)
      ? item.packages.map((pkg: any) => {
          const i18nName = pkg.name_i18n || (typeof pkg.name === "object" ? pkg.name : undefined);
          const i18nDesc = pkg.description_i18n || (typeof pkg.description === "object" ? pkg.description : undefined);
          return {
            ...pkg,
            name: i18nName ? getLocalizedText(i18nName, activeLocale) : getLocalizedText(pkg.name, activeLocale),
            name_i18n: i18nName,
            raw_name: pkg.name,
            description: i18nDesc
              ? getLocalizedText(i18nDesc, activeLocale)
              : pkg.description
              ? getLocalizedText(pkg.description, activeLocale)
              : undefined,
            description_i18n: i18nDesc
          };
        })
      : item.packages,
    requirements: Array.isArray(item.requirements)
      ? item.requirements.map((req: any) => {
          if (typeof req === "string") return getLocalizedText(req, activeLocale);
          const rawName = req.name || req.title;
          const i18nName = req.name_i18n || (typeof rawName === "object" ? rawName : undefined);
          const i18nDesc = req.description_i18n || (typeof req.description === "object" ? req.description : undefined);
          const localizedName = i18nName ? getLocalizedText(i18nName, activeLocale) : getLocalizedText(rawName, activeLocale);
          return {
            ...req,
            title: localizedName,
            name: localizedName,
            name_i18n: i18nName,
            raw_name: rawName,
            description: i18nDesc
              ? getLocalizedText(i18nDesc, activeLocale)
              : req.description
              ? getLocalizedText(req.description, activeLocale)
              : undefined,
            description_i18n: i18nDesc
          };
        })
      : item.requirements,
    inclusions: Array.isArray(item.inclusions)
      ? item.inclusions.map((inc: any) => getLocalizedText(inc, activeLocale))
      : item.inclusions,
    translations: Array.isArray(item.translations)
      ? item.translations.map((tr: any) => ({
          ...tr,
          title: getLocalizedText(tr.title, tr.language_code),
          description: tr.description ? getLocalizedText(tr.description, tr.language_code) : undefined,
          submission_process: tr.submission_process ? getLocalizedText(tr.submission_process, tr.language_code) : undefined,
          terms_conditions: tr.terms_conditions ? getLocalizedText(tr.terms_conditions, tr.language_code) : undefined
        }))
      : item.translations
  };
};

export const documentVisaService = createApi({
  reducerPath: "documentVisaService",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["DocumentVisas", "DocumentCategories"],
  endpoints: (builder) => ({
    findAllDocumentVisas: builder.query<DocumentVisaResponse, FilterDocumentVisaQuery | void>({
      query: (params) => ({
        url: "/document-visas",
        params: params || {}
      }),
      transformResponse: (response: any, meta, arg) => {
        const lang = arg && typeof arg === "object" ? (arg as any).lang : undefined;
        const rawData = response?.datas || response?.data || [];
        if (Array.isArray(rawData) && rawData.length > 0) {
          return {
            message: response?.message || "Success",
            data: rawData.map((item: any) => normalizeVisaItem(item, lang)),
            meta: response?.meta
          };
        }
        return {
          message: "Success",
          data: INITIAL_DOCUMENT_VISAS,
          meta: {
            page: 1,
            limit: 20,
            total: INITIAL_DOCUMENT_VISAS.length,
            totalPages: 1
          }
        };
      },
      transformErrorResponse: () => {
        return {
          message: "Fallback data loaded",
          data: INITIAL_DOCUMENT_VISAS,
          meta: {
            page: 1,
            limit: 20,
            total: INITIAL_DOCUMENT_VISAS.length,
            totalPages: 1
          }
        };
      },
      providesTags: ["DocumentVisas"]
    }),

    findDocumentVisaById: builder.query<SingleDocumentVisaResponse, string | { id: string; lang?: string }>({
      query: (arg) => {
        const id = typeof arg === "string" ? arg : arg.id;
        const lang = typeof arg === "object" ? arg.lang : undefined;
        return `/document-visas/${id}${lang ? `?lang=${lang}` : ""}`;
      },
      transformResponse: (response: any, meta, arg) => {
        const id = typeof arg === "string" ? arg : arg.id;
        const lang = typeof arg === "object" ? arg.lang : undefined;
        if (response?.data) {
          return {
            ...response,
            data: normalizeVisaItem(response.data, lang)
          };
        }
        const fallback = INITIAL_DOCUMENT_VISAS.find((item) => item.id === id || item.slug === id) || INITIAL_DOCUMENT_VISAS[0];
        return { message: "Success", data: normalizeVisaItem(fallback, lang) };
      },
      transformErrorResponse: (err, meta, arg) => {
        const id = typeof arg === "string" ? arg : arg.id;
        const lang = typeof arg === "object" ? arg.lang : undefined;
        const fallback = INITIAL_DOCUMENT_VISAS.find((item) => item.id === id || item.slug === id) || INITIAL_DOCUMENT_VISAS[0];
        return { message: "Success", data: normalizeVisaItem(fallback, lang) };
      },
      providesTags: (result, error, arg) => [{ type: "DocumentVisas", id: typeof arg === "string" ? arg : arg.id }]
    }),

    findDocumentVisaBySlug: builder.query<SingleDocumentVisaResponse, { slug: string; lang?: string } | string>({
      query: (arg) => {
        const slug = typeof arg === "string" ? arg : arg.slug;
        const lang = typeof arg === "object" ? arg.lang : undefined;
        return `/document-visas/slug/${slug}${lang ? `?lang=${lang}` : ""}`;
      },
      transformResponse: (response: any, meta, arg) => {
        const slug = typeof arg === "string" ? arg : arg.slug;
        const lang = typeof arg === "object" ? arg.lang : undefined;
        if (response?.data) {
          return {
            ...response,
            data: normalizeVisaItem(response.data, lang)
          };
        }
        const fallback = INITIAL_DOCUMENT_VISAS.find((item) => item.slug === slug || item.id === slug) || INITIAL_DOCUMENT_VISAS[0];
        return { message: "Success", data: normalizeVisaItem(fallback, lang) };
      },
      transformErrorResponse: (err, meta, arg) => {
        const slug = typeof arg === "string" ? arg : arg.slug;
        const lang = typeof arg === "object" ? arg.lang : undefined;
        const fallback = INITIAL_DOCUMENT_VISAS.find((item) => item.slug === slug || item.id === slug) || INITIAL_DOCUMENT_VISAS[0];
        return { message: "Success", data: normalizeVisaItem(fallback, lang) };
      },
      providesTags: ["DocumentVisas"]
    }),

    findDocumentVisaCategories: builder.query<{ message: string; data: DocumentCategory[] }, void>({
      query: () => "/document-visas/categories",
      transformResponse: (response: any) => {
        const raw = response?.datas || response?.data || [];
        if (Array.isArray(raw) && raw.length > 0) {
          return {
            message: "Success",
            data: raw.map((c: any) => ({
              ...c,
              name: getLocalizedText(c.name)
            }))
          };
        }
        return {
          message: "Success",
          data: [
            { id: "cat_tourist", name: "Visa Turis / Kunjungan" },
            { id: "cat_business", name: "Visa Bisnis & Kerja" },
            { id: "cat_umrah", name: "Visa Umrah & Ziarah" },
            { id: "cat_study", name: "Visa Pelajar / Studi" },
            { id: "cat_passport", name: "Paspor & Dokumen Resmi" }
          ]
        };
      },
      transformErrorResponse: () => ({
        message: "Success",
        data: [
          { id: "cat_tourist", name: "Visa Turis / Kunjungan" },
          { id: "cat_business", name: "Visa Bisnis & Kerja" },
          { id: "cat_umrah", name: "Visa Umrah & Ziarah" },
          { id: "cat_study", name: "Visa Pelajar / Studi" },
          { id: "cat_passport", name: "Paspor & Dokumen Resmi" }
        ]
      }),
      providesTags: ["DocumentCategories"]
    }),

    createDocumentVisa: builder.mutation<SingleDocumentVisaResponse, any>({
      query: (body) => ({
        url: "/document-visas",
        method: "POST",
        body
      }),
      invalidatesTags: ["DocumentVisas"]
    }),

    updateDocumentVisa: builder.mutation<SingleDocumentVisaResponse, { id: string; data: any }>({
      query: ({ id, data }) => ({
        url: `/document-visas/${id}`,
        method: "PUT",
        body: data
      }),
      invalidatesTags: (result, error, { id }) => [{ type: "DocumentVisas", id }, "DocumentVisas"]
    }),

    deleteDocumentVisa: builder.mutation<{ message: string }, string>({
      query: (id) => ({
        url: `/document-visas/${id}`,
        method: "DELETE"
      }),
      invalidatesTags: ["DocumentVisas"]
    })
  })
});

export const {
  useFindAllDocumentVisasQuery,
  useFindDocumentVisaByIdQuery,
  useFindDocumentVisaBySlugQuery,
  useFindDocumentVisaCategoriesQuery,
  useCreateDocumentVisaMutation,
  useUpdateDocumentVisaMutation,
  useDeleteDocumentVisaMutation
} = documentVisaService;
