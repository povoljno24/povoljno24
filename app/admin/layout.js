'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../lib/supabase';
import { useLanguage } from '../../components/LanguageContext';

export default function AdminLayout({ children }) {
  const { t } = useLanguage();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    async function checkAdmin() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login');
        return;
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('is_admin')
        .eq('id', user.id)
        .single();

      if (!profile?.is_admin) {
        router.push('/');
        return;
      }

      setIsAdmin(true);
      setLoading(false);
    }
    checkAdmin();
  }, []);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-[#185FA5] border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm font-medium text-gray-500 italic">{t.adminVerifying}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-[#f8fafc]">
      <div className="bg-[#1e293b] text-white py-3 px-6 shadow-md flex justify-between items-center">
        <div className="flex items-center gap-3">
          <span className="text-xl">🛡️</span>
          <span className="font-bold tracking-tight">{t.adminPanel}</span>
        </div>
        <div className="text-[11px] font-bold bg-white/10 px-3 py-1.5 rounded-full uppercase tracking-widest text-blue-300">
          Superadmin Mode
        </div>
      </div>
      {children}
    </div>
  );
}
