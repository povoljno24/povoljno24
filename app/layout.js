import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import Navbar from "../components/Navbar";
import DynamicAurora from "../components/DynamicAurora";
import Footer from "../components/Footer";
import BottomNav from "../components/BottomNav";
import { LanguageProvider } from "../components/LanguageContext";
import { ToastProvider } from "../components/ToastContext";
import RealtimeNotifications from "../components/RealtimeNotifications";

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
});

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
      <body className="min-h-full flex flex-col bg-[#050505] text-[#F5F5F7] font-sans overflow-x-hidden w-full relative selection:bg-[#185FA5] selection:text-white">
        <DynamicAurora />
        
        {/* Grain Overlay for tactile feel */}
        <div className="fixed inset-0 pointer-events-none opacity-[0.03] z-[-5] mix-blend-overlay" 
             style={{ backgroundImage: 'url("https://grainy-gradients.vercel.app/noise.svg")' }} />

        <LanguageProvider>
          <ToastProvider>
            <RealtimeNotifications />
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
