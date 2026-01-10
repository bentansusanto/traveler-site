"use client";

import { Hammer, Mail } from "lucide-react";

export function generateStaticParams() {
  return [{ locale: "en" }, { locale: "id" }];
}

export default function MaintenancePage() {
  return (
    <div
      className={`relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-[#0F0F0F] p-4 text-white`}>
      {/* Background Decorative Elements */}
      <div className="pointer-events-none absolute top-[-20%] left-[-10%] h-[600px] w-[600px] rounded-full bg-purple-900/20 blur-[120px]" />
      <div className="pointer-events-none absolute right-[-10%] bottom-[-20%] h-[500px] w-[500px] rounded-full bg-blue-900/10 blur-[100px]" />

      <div className="relative z-10 w-full max-w-2xl space-y-8 text-center">
        {/* Icon Animation */}
        <div className="relative mx-auto flex h-24 w-24 items-center justify-center">
          <div className="absolute inset-0 rotate-6 animate-pulse rounded-2xl bg-gradient-to-tr from-amber-500 to-purple-600 opacity-20" />
          <div className="absolute inset-0 flex items-center justify-center rounded-2xl border border-white/10 bg-white/5 shadow-2xl backdrop-blur-xl">
            <Hammer className="h-10 w-10 text-amber-400" />
          </div>
        </div>

        {/* Text Content */}
        <div className="space-y-4">
          <h1 className="bg-gradient-to-r from-white via-gray-200 to-gray-400 bg-clip-text text-4xl font-bold tracking-tight text-transparent md:text-6xl">
            Under Maintenance
          </h1>
          <p className="mx-auto max-w-lg text-lg leading-relaxed font-light text-gray-400 md:text-xl">
            We're currently crafting a better experience for you.
            <br className="hidden md:block" />
            Please check back soon for our new look.
          </p>
        </div>

        {/* Progress Indicator (Decorative) */}
        <div className="mx-auto h-1.5 w-full max-w-xs overflow-hidden rounded-full bg-gray-800">
          <div className="h-full w-2/3 animate-[shimmer_2s_infinite] bg-gradient-to-r from-amber-500 via-purple-500 to-blue-500" />
        </div>

        {/* Contact/Socials */}
        <div className="flex flex-col items-center justify-center gap-4 pt-8 sm:flex-row">
          <a
            href="mailto:contact@veepearl.com"
            className="group relative flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-6 py-3 text-sm font-medium transition-all duration-300 hover:bg-white/10">
            <Mail className="h-4 w-4 text-gray-400 transition-colors group-hover:text-white" />
            <span>Contact Support</span>
          </a>

          {/* Optional: Add social or other links here */}
        </div>
      </div>

      <footer className="absolute bottom-8 w-full text-center">
        <p className="text-xs font-semibold tracking-widest text-gray-600 uppercase">
          Pacifictravelindo &copy; {new Date().getFullYear()}
        </p>
      </footer>
    </div>
  );
}
