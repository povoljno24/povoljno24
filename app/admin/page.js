'use client';
import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import Image from 'next/image';
import Link from 'next/link';
import { useLanguage } from '../../components/LanguageContext';

export default function AdminDashboard() {
  const { t } = useLanguage();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('reports'); // 'reports' | 'listings'

  useEffect(() => {
    loadReports();
  }, []);

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

    if (error) alert(error.message);
    else setReports(data || []);
    setLoading(false);
  }

  async function handleDeleteListing(id, reportId) {
    if (!confirm(t.confirmDelete)) return;
    
    const { error } = await supabase.from('listings').delete().eq('id', id);
    if (error) alert(error.message);
    else {
      // Also resolve the report
      await supabase.from('reports').update({ status: 'resolved' }).eq('id', reportId);
      loadReports();
      alert(t.adminListingDeleted);
    }
  }

  async function handleDismissReport(id) {
    const { error } = await supabase.from('reports').update({ status: 'resolved' }).eq('id', id);
    if (error) alert(error.message);
    else {
      loadReports();
      alert(t.adminReportDismissed);
    }
  }

  return (
    <div className="p-8 max-w-[1200px] mx-auto">
      <div className="flex gap-4 mb-8">
        <button 
          onClick={() => setActiveTab('reports')}
          className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === 'reports' ? 'bg-[#185FA5] text-white shadow-lg' : 'bg-white text-gray-500 hover:bg-gray-50 border border-gray-200'}`}
        >
          {t.adminReports} ({reports.filter(r => r.status === 'pending').length})
        </button>
      </div>

      {loading ? (
        <div className="text-center py-20 text-gray-400 font-medium italic">{t.adminLoading}</div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-[11px] font-bold text-gray-500 uppercase tracking-widest">{t.adminListing}</th>
                <th className="px-6 py-4 text-[11px] font-bold text-gray-500 uppercase tracking-widest">{t.adminReason}</th>
                <th className="px-6 py-4 text-[11px] font-bold text-gray-500 uppercase tracking-widest">{t.adminReporter}</th>
                <th className="px-6 py-4 text-[11px] font-bold text-gray-500 uppercase tracking-widest">{t.adminStatus}</th>
                <th className="px-6 py-4 text-[11px] font-bold text-gray-500 uppercase tracking-widest text-right">{t.adminActions}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {reports.map(report => (
                <tr key={report.id} className={`hover:bg-gray-50/50 transition-colors ${report.status === 'resolved' ? 'opacity-50' : ''}`}>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-gray-100 overflow-hidden relative shrink-0">
                        {report.listings?.image_url && (
                          <Image src={report.listings.image_url} alt="" fill className="object-cover" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <div className="text-sm font-bold text-gray-900 truncate max-w-[200px]">
                          {report.listings?.title || t.adminDeleted}
                        </div>
                        <div className="text-[11px] text-[#185FA5] font-semibold">{report.listings?.price?.toLocaleString()} RSD</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-[12px] font-bold text-red-600 bg-red-50 px-2.5 py-1 rounded-md border border-red-100 uppercase tracking-tighter">
                      {report.reason}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-600 font-medium">@{report.profiles?.username || t.userWord}</div>
                    <div className="text-[10px] text-gray-400">{new Date(report.created_at).toLocaleDateString()}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${report.status === 'pending' ? 'bg-amber-50 text-amber-600 border-amber-100' : 'bg-gray-100 text-gray-400 border-gray-200'}`}>
                      {report.status.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      {report.status === 'pending' && (
                        <>
                          <button 
                            onClick={() => handleDismissReport(report.id)}
                            className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-all"
                            title={t.adminDismiss}
                          >
                            ✓
                          </button>
                          <button 
                            onClick={() => handleDeleteListing(report.listing_id, report.id)}
                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                            title={t.adminDeleteListing}
                          >
                            🗑️
                          </button>
                        </>
                      )}
                      <Link 
                        href={`/oglas/${report.listing_id}`} 
                        className="p-2 text-gray-400 hover:text-[#185FA5] hover:bg-blue-50 rounded-lg transition-all"
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
                  <td colSpan={5} className="px-6 py-20 text-center text-gray-400 italic">{t.adminNoReports}</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
