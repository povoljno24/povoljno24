import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import BottomNav from "../components/BottomNav";
import { LanguageProvider } from "../components/LanguageContext";
import { ToastProvider } from "../components/ToastContext";
import RealtimeNotifications from "../components/RealtimeNotifications";
import dynamic from "next/dynamic";

const DynamicAurora = dynamic(() => import("../components/DynamicAurora"), { 
  ssr: false,
  loading: () => <div className="fixed inset-0 bg-[#050505] -z-10" />
});

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
  display: 'swap',
});

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

export const metadata = {
  title: {
    template: '%s | Povoljno24',
    default: 'Povoljno24 - Kupi i prodaj sve brzo i sigurno',
  },
  description: 'Najveća platforma za kupovinu i prodaju u Srbiji. Hiljade oglasa iz kategorija: elektronika, automobili, nekretnine, moda i još mnogo toga. Bezbedna trgovina i provereni prodavci.',
};

export default function RootLayout({ children }) {
  return (
      <html
        lang="sr"
        className={`${jakarta.variable} h-full antialiased overflow-x-hidden w-full`}
      >
      <head>
        {supabaseUrl && <link rel="preconnect" href={supabaseUrl} />}
        <link rel="dns-prefetch" href={supabaseUrl} />
      </head>
      <body className="min-h-full flex flex-col bg-[#050505] text-[#F5F5F7] font-sans overflow-x-hidden w-full relative selection:bg-[#185FA5] selection:text-white">
        <DynamicAurora />
        
        {/* Simplified Grain Overlay to avoid external requests */}
        <div className="fixed inset-0 pointer-events-none opacity-[0.02] z-[-5] bg-[url('https://grainy-gradients.vercel.app/noise.svg')] mix-blend-overlay" />

        <LanguageProvider>
          <ToastProvider>
            <RealtimeNotifications />
            <Navbar />
            <main className="flex-1 flex flex-col pb-32 sm:pb-0 relative z-10">
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
