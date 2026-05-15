'use client';
import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useLanguage } from '../../components/LanguageContext';

export default function AdminDashboard() {
  const { t } = useLanguage();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('reports'); // 'reports' | 'listings'
  const router = useRouter();

  useEffect(() => {
    async function checkAdmin() {
      const { data: { user } } = await supabase.auth.getUser();
      const adminEmails = ['alex@pixelsurgestudio.dev', 'admin@povoljno24.com'];
      if (!user || !adminEmails.includes(user?.email)) {
        router.push('/');
        return;
      }
      loadReports();
    }
    checkAdmin();
  }, [router]);

  async function loadReports() {
    setLoading(true);
    const { data, error } = await supabase
      .from('reports')
      .select(`
        *,
        listings(title, price, image_url),
        profiles:reporter_id(username)
      `)
      .order('created_at', { ascending: false });

    if (error) console.error(error);
    else setReports(data || []);
    setLoading(false);
  }

  async function handleDeleteListing(id, reportId) {
    if (!confirm(t.confirmDelete)) return;
    
    const { error } = await supabase.from('listings').delete().eq('id', id);
    if (error) alert(error.message);
    else {
      await supabase.from('reports').update({ status: 'resolved' }).eq('id', reportId);
      loadReports();
    }
  }

  async function handleDismissReport(id) {
    const { error } = await supabase.from('reports').update({ status: 'resolved' }).eq('id', id);
    if (error) alert(error.message);
    else {
      loadReports();
    }
  }

  return (
    <div className="p-8 max-w-[1200px] mx-auto py-20 bg-transparent">
      <div className="flex gap-6 mb-12">
        <button 
          onClick={() => setActiveTab('reports')}
          className={`px-10 py-4 rounded-full text-[11px] font-black uppercase tracking-[0.3em] transition-all ${activeTab === 'reports' ? 'bg-white text-black shadow-2xl scale-105' : 'bg-white/[0.03] text-white/40 border border-white/5 hover:border-white/20'}`}
        >
          {t.adminReports} ({reports.filter(r => r.status === 'pending').length})
        </button>
      </div>

      {loading ? (
        <div className="text-center py-48 text-white/10 font-black uppercase tracking-[0.5em] animate-pulse">{t.adminLoading}</div>
      ) : (
        <div className="bg-[#0A0A0A]/60 backdrop-blur-3xl rounded-[3rem] border border-white/10 overflow-hidden shadow-[0_64px_128px_rgba(0,0,0,0.8)] relative">
           <div className="absolute -top-24 -left-24 w-48 h-48 bg-[#185FA5]/10 rounded-full blur-[80px] pointer-events-none" />
          
          <div className="overflow-x-auto no-scrollbar">
            <table className="w-full text-left border-collapse">
              <thead className="bg-white/[0.02] border-b border-white/5">
                <tr>
                  <th className="px-8 py-6 text-[10px] font-black text-white/20 uppercase tracking-[0.4em]">{t.adminListing}</th>
                  <th className="px-8 py-6 text-[10px] font-black text-white/20 uppercase tracking-[0.4em]">{t.adminReason}</th>
                  <th className="px-8 py-6 text-[10px] font-black text-white/20 uppercase tracking-[0.4em]">{t.adminReporter}</th>
                  <th className="px-8 py-6 text-[10px] font-black text-white/20 uppercase tracking-[0.4em]">{t.adminStatus}</th>
                  <th className="px-8 py-6 text-[10px] font-black text-white/20 uppercase tracking-[0.4em] text-right">{t.adminActions}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {reports.map(report => (
                  <tr key={report.id} className={`hover:bg-white/[0.03] transition-colors ${report.status === 'resolved' ? 'opacity-30' : ''} group`}>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-[#050505] overflow-hidden relative shrink-0 border border-white/5">
                          {report.listings?.image_url && (
                            <Image src={report.listings.image_url} alt="" fill className="object-cover" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <div className="text-[14px] font-black text-white uppercase tracking-tight truncate max-w-[180px]">
                            {report.listings?.title || t.adminDeleted}
                          </div>
                          <div className="text-[10px] text-[#185FA5] font-black uppercase tracking-widest">{report.listings?.price?.toLocaleString()} RSD</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <span className="text-[10px] font-black text-[#E24B4A] bg-red-500/10 px-4 py-2 rounded-full border border-red-500/20 uppercase tracking-widest shadow-[0_0_15px_rgba(226,75,74,0.1)]">
                        {report.reason}
                      </span>
                    </td>
                    <td className="px-8 py-6">
                      <div className="text-[13px] text-white/60 font-black tracking-tight uppercase group-hover:text-white transition-colors">@{report.profiles?.username || t.userWord}</div>
                      <div className="text-[10px] text-white/20 font-bold uppercase tracking-widest mt-1">{new Date(report.created_at).toLocaleDateString()}</div>
                    </td>
                    <td className="px-8 py-6">
                      <span className={`text-[9px] font-black px-4 py-1.5 rounded-full border uppercase tracking-[0.2em] ${report.status === 'pending' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' : 'bg-white/5 text-white/20 border-white/5'}`}>
                        {report.status}
                      </span>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <div className="flex justify-end gap-3 opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0">
                        {report.status === 'pending' && (
                          <>
                            <button 
                              onClick={() => handleDismissReport(report.id)}
                              className="w-10 h-10 flex items-center justify-center text-white/20 hover:text-green-500 hover:bg-green-500/10 rounded-full transition-all border border-white/5 hover:border-green-500/20"
                              title={t.adminDismiss}
                            >
                              ✓
                            </button>
                            <button 
                              onClick={() => handleDeleteListing(report.listing_id, report.id)}
                              className="w-10 h-10 flex items-center justify-center text-white/20 hover:text-red-500 hover:bg-red-500/10 rounded-full transition-all border border-white/5 hover:border-red-500/20"
                              title={t.adminDeleteListing}
                            >
                              🗑️
                            </button>
                          </>
                        )}
                        <Link 
                          href={`/oglas/${report.listing_id}`} 
                          className="w-10 h-10 flex items-center justify-center text-white/20 hover:text-[#185FA5] hover:bg-[#185FA5]/10 rounded-full transition-all border border-white/5 hover:border-[#185FA5]/20"
                          title={t.adminViewListing}
                        >
                          👁️
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
                {reports.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-8 py-32 text-center text-white/10 font-black uppercase tracking-[0.4em] italic">{t.adminNoReports}</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
