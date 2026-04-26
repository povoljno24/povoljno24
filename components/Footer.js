import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-gray-100 border-t border-gray-200 px-6 py-4 flex flex-col sm:flex-row justify-between items-center gap-4 mt-auto">
      <span className="text-sm text-gray-500">© {new Date().getFullYear()} Povoljno24.rs</span>
      <div className="flex gap-4">
        <Link href="#" className="text-xs text-gray-600 hover:text-[#185FA5] transition-colors">O nama</Link>
        <Link href="#" className="text-xs text-gray-600 hover:text-[#185FA5] transition-colors">Pomoć</Link>
        <Link href="#" className="text-xs text-gray-600 hover:text-[#185FA5] transition-colors">Uslovi korišćenja</Link>
        <Link href="#" className="text-xs text-gray-600 hover:text-[#185FA5] transition-colors">Kontakt</Link>
      </div>
    </footer>
  );
}
