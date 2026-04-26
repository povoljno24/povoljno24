import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: {
    template: '%s | Povoljno24.rs',
    default: 'Povoljno24.rs - Kupi i prodaj sve brzo i sigurno',
  },
  description: 'Najveća platforma za kupovinu i prodaju u Srbiji. Hiljade oglasa iz kategorija: elektronika, automobili, nekretnine, moda i još mnogo toga.',
  keywords: ['oglasi', 'kupovina', 'prodaja', 'srbija', 'povoljno24', 'polovni automobili', 'nekretnine'],
  openGraph: {
    title: 'Povoljno24.rs - Kupi i prodaj sve',
    description: 'Najveća platforma za kupovinu i prodaju u Srbiji.',
    url: 'https://povoljno24.rs',
    siteName: 'Povoljno24.rs',
    locale: 'sr_RS',
    type: 'website',
  },
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="sr"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[#f5f5f5] text-[#1a1a1a]">
        <Navbar />
        <main className="flex-1 flex flex-col">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
