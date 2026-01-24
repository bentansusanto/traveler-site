"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function NotFound() {
  const router = useRouter();

  return (
    <div className="flex h-screen flex-col items-center justify-center bg-white px-4 text-center">
      <div className="mb-8 flex justify-center">
        <img src="/images/404.svg" alt="Page Not Found" className="h-64 w-auto object-contain" />
      </div>

      <h1 className="mb-2 text-xl font-bold text-gray-900 md:text-2xl">Page Not Found</h1>

      <p className="mb-8 text-sm text-gray-500 md:text-base">
        The page you are looking for doesn't exist.
      </p>

      <div className="flex w-[200px] flex-col gap-3 sm:max-w-xs">
        <Button
          className="w-[200px] rounded-full bg-blue-500 hover:bg-blue-600"
          size="lg"
          onClick={() => window.location.reload()}>
          Try Again
        </Button>

        <Link href="/" className="w-[200px]">
          <Button
            variant="outline"
            className="w-[200px] rounded-full border-blue-500 text-blue-500 hover:bg-blue-50"
            size="lg">
            Return To Home
          </Button>
        </Link>
      </div>
    </div>
    // <TravelerLayout>
    // </TravelerLayout>
  );
}
