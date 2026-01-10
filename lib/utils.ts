import { type ClassValue, clsx } from "clsx";
import { Metadata } from "next";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function generateAvatarFallback(string: string) {
  const names = string.split(" ").filter((name: string) => name);
  const mapped = names.map((name: string) => name.charAt(0).toUpperCase());

  return mapped.join("");
}

export function generateMeta({
  title,
  description,
  keywords
}: {
  title: string;
  description: string;
  keywords?: string[];
}): Metadata {
  return {
    title: title,
    description: description,
    keywords: keywords?.join(", "),
    openGraph: {
      title: title,
      description: description,
      images: [`/images/bg-authentication.png`] // Using an existing valid image for OG
    },
    twitter: {
      card: "summary_large_image",
      title: title,
      description: description,
      images: [`/images/bg-authentication.png`]
    }
  };
}
