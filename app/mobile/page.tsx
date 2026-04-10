import MobileGame from "@/components/mobile/MobileGame";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Mayank Jhunjhunwala — Portfolio",
  description:
    "Interactive mobile portfolio of Mayank Jhunjhunwala, Senior Fullstack Engineer specializing in Next.js, React, and TypeScript.",
  alternates: {
    canonical: "https://manku27.dev",
  },
  robots: {
    index: false,
    follow: false,
  },
};

export default function MobilePage() {
  return <MobileGame />;
}
