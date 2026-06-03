import type { Metadata } from "next";
import { Poppins, Geist } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/context/AuthContext";
import { Toaster as Sonner } from "@/components/ui/sonner";

const geist = Geist({ subsets: ['latin'], variable: '--font-sans' });

const poppins = Poppins({
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-poppins",
});

export const metadata: Metadata = {
  title: "Assetra",
  description: "Assetra adalah platform digital untuk mahasiswa unila untuk menjual barang bekas dan membeli barang bekas.",
  keywords: [
    "Assetra",
    "Assetra Platform",
    "Assetra Platform Digital",
    "Assetra Platform Digital Mahasiswa",
    "Assetra Platform Digital Mahasiswa UNILA",
    "Assetra Platform Digital Mahasiswa UNILA untuk menjual barang bekas",
    "Assetra Platform Digital Mahasiswa UNILA untuk membeli barang bekas",
    "Assetra Platform Digital Mahasiswa UNILA untuk menjual barang bekas dan membeli barang bekas",
  ],
  authors: [
    {
      name: "Assetra",
      url: "https://assetra.vercel.app",
    },
  ],
  openGraph: {
    title: "Assetra",
    description: "Assetra adalah platform digital untuk mahasiswa unila untuk menjual barang bekas dan membeli barang bekas.",
    images: [
      {
        url: "https://assetra.vercel.app/og.png",
        width: 800,
        height: 600,
      },
    ],
    siteName: "Assetra",
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={cn("antialiased", poppins.variable, "font-sans", geist.variable)}
    >

      <body className="overflow-x-hidden">
        <TooltipProvider>
          <Sonner />
          <AuthProvider>
            {children}
          </AuthProvider>
        </TooltipProvider>
      </body>
    </html>
  );
}
