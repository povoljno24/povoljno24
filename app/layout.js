import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import BottomNav from "../components/BottomNav";
import { LanguageProvider } from "../components/LanguageContext";
import { ToastProvider } from "../components/ToastContext";

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
    template: '%s | Povoljno24',
    default: 'Povoljno24 - Kupi i prodaj sve brzo i sigurno',
  },
  description: 'Najveća platforma za kupovinu i prodaju u Srbiji. Hiljade oglasa iz kategorija: elektronika, automobili, nekretnine, moda i još mnogo toga. Bezbedna trgovina i provereni prodavci.',
  keywords: ['oglasi', 'kupovina', 'prodaja', 'srbija', 'povoljno24', 'polovni automobili', 'nekretnine', 'mali oglasi', 'besplatni oglasi', 'beograd', 'novi sad', 'niš', 'kupujem prodajem', 'polovni telefoni'],
  openGraph: {
    title: 'Povoljno24 - Kupi i prodaj sve',
    description: 'Najveća platforma za kupovinu i prodaju u Srbiji.',
    url: 'https://povoljno24.com',
    siteName: 'Povoljno24',
    locale: 'sr_RS',
    type: 'website',
  },
};

export default function RootLayout({ children }) {
  return (
      <html
        lang="sr"
        className={`${geistSans.variable} ${geistMono.variable} h-full antialiased overflow-x-hidden w-full`}
      >
      <head>
        <link rel="preconnect" href="https://mbluydruyogrgaxztpi.supabase.co" />
        <link rel="dns-prefetch" href="https://mbluydruyogrgaxztpi.supabase.co" />
        <link rel="preconnect" href="https://mbluydruyogrgaxztpi.supabase.co" crossOrigin="anonymous" />
      </head>
      <body className="min-h-full flex flex-col bg-[#f5f5f5] text-[#1a1a1a] overflow-x-hidden w-full">
        <LanguageProvider>
          <ToastProvider>
            <Navbar />
            <main className="flex-1 flex flex-col pb-20 sm:pb-0">
              {children}
            </main>
            <Footer />
            <BottomNav />
          </ToastProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
