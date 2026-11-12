import type { Metadata } from "next";
import { IBM_Plex_Mono, IBM_Plex_Sans } from "next/font/google";
import "./globals.css";
import { DeskProvider } from "@/lib/store";

const plex = IBM_Plex_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-plex",
});

const plexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-plex-mono",
});

export const metadata: Metadata = {
  title: "Project Cargo Desk",
  description:
    "Inquiry and quotation desk prepared for Interfreight Group. A demo by CasinWorks. Sample data only.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${plex.variable} ${plexMono.variable} h-full antialiased`}>
      <body className="min-h-full font-sans">
        <DeskProvider>{children}</DeskProvider>
      </body>
    </html>
  );
}
