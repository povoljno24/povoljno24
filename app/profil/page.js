"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../lib/supabase';
import Image from 'next/image';
import Link from 'next/link';
import EmailVerification from '../../components/EmailVerification';
import { useLanguage } from '../../components/LanguageContext';
import { useToast } from '../../components/ToastContext';
import ProfileProgress from '../../components/ProfileProgress';
import UserBadges from '../../components/UserBadges';

export default function Profil() {
  const { t } = useLanguage();
  const { showToast } = useToast();
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [listings, setListings] = useState([]);
  const [messages, setMessages] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [activeTab, setActiveTab] = useState('listings');
  const [updating, setUpdating] = useState(false);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({ username: '', full_name: '', bio: '' });
  const [transactions, setTransactions] = useState([]);
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, listingId: null });
  const [soldFormData, setSoldFormData] = useState({ soldOnPlatform: true, price: '', wasShipped: false });
  const router = useRouter();

  useEffect(() => {
    async function loadProfile() {
      const { data } = await supabase.auth.getUser();
      const user = data?.user;
      
      if (!user) {
        router.push('/login');
        return;
      }
      setUser(user);

      try {
        const [profileRes, listingsRes, messagesRes, favoritesRes, transactionsRes] = await Promise.all([
          supabase.from('profiles').select('*').eq('id', user.id).single(),
          supabase.from('listings').select('*').eq('user_id', user.id).order('created_at', { ascending: false }),
          supabase.from('messages').select('*').or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`).order('created_at', { ascending: false }),
          supabase.from('favorites').select('*, listings(*)').eq('user_id', user.id).order('created_at', { ascending: false }),
          supabase.from('transactions').select('*').eq('seller_id', user.id)
        ]);

        if (profileRes.data) {
          setProfile(profileRes.data);
          setFormData({
            username: profileRes.data.username || '',
            full_name: profileRes.data.full_name || '',
            bio: profileRes.data.bio || ''
          });
        }

        const allListings = listingsRes.data || [];
        const filteredListings = allListings.filter(l => l.status !== 'collected');
        const collectedListings = allListings.filter(l => l.status === 'collected');

        setListings(filteredListings);
        setMessages(messagesRes.data || []);
        setTransactions(transactionsRes.data || []);

        if (collectedListings.length > 0) {
          setTimeout(() => {
            setDeleteModal({ isOpen: true, listingId: collectedListings[0].id });
            setSoldFormData({ soldOnPlatform: true, price: '', wasShipped: collectedListings[0].status === 'shipped' || true });
          showToast(t.kpiPrompt, 'info');
          }, 1000);
        }

        const favData = favoritesRes.data || [];
        const formattedFavs = favData
          .filter(f => f.listings)
          .map(f => ({
            id: f.listing_id,
            ...f.listings
          }));
        setFavorites(formattedFavs);

        const unreadIds = (messagesRes.data || []).filter(m => !m.is_read && m.receiver_id === user.id).map(m => m.id);
        if (unreadIds.length > 0) {
          await supabase.from('messages').update({ is_read: true }).in('id', unreadIds);
          window.dispatchEvent(new Event('counts_changed'));
        }
      } catch (err) {
        console.error('Profile load error:', err);
      } finally {
        setLoading(false);
      }
    }
    loadProfile();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router]);

  async function handleLogout() {
    await supabase.auth.signOut();
    window.location.href = '/';
  }

  function handleDeleteListingClick(id) {
    setDeleteModal({ isOpen: true, listingId: id });
    setSoldFormData({ soldOnPlatform: true, price: '', wasShipped: false });
  }

  async function handleConfirmDelete() {
    const { listingId } = deleteModal;
    const listing = listings.find(l => l.id === listingId);
    if (!listing) return;
    
    setUpdating(true);

    if (soldFormData.soldOnPlatform && soldFormData.price) {
      const { error: txError } = await supabase.from('transactions').insert({
        seller_id: user.id,
        listing_id: String(listing.id),
        listing_title: listing.title,
        sale_price: Number(soldFormData.price),
        was_shipped: soldFormData.wasShipped
      });
      if (txError) {
        console.error("Failed to save transaction", txError);
      } else {
        setTransactions(prev => [...prev, {
          id: crypto.randomUUID(),
          sale_price: Number(soldFormData.price),
          was_shipped: soldFormData.wasShipped
        }]);
      }
    }

    setListings(listings.filter(l => l.id !== listingId));
    const { error } = await supabase.from('listings').delete().eq('id', listingId);
    
    setUpdating(false);
    setDeleteModal({ isOpen: false, listingId: null });

    if (error) {
      showToast(t.deleteError + error.message, 'error');
      window.location.reload();
    }
  }

  async function handleBumpListing(id) {
    const listing = listings.find(l => l.id === id);
    const lastBump = listing.last_bumped_at || listing.created_at;
    const hoursSinceBump = (new Date() - new Date(lastBump)) / (1000 * 60 * 60);

    if (hoursSinceBump < 24) {
      const remainingHours = Math.ceil(24 - hoursSinceBump);
      showToast(`${t.bumpWait} ${remainingHours}h.`, 'error');
      return;
    }

    const now = new Date().toISOString();
    const { error } = await supabase
      .from('listings')
      .update({
        created_at: now,
        last_bumped_at: now
      })
      .eq('id', id);

    if (error) {
      showToast(t.bumpError + error.message, 'error');
    } else {
      const updatedListings = listings.map(l =>
        l.id === id ? { ...l, created_at: now, last_bumped_at: now } : l
      ).sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

      setListings(updatedListings);
      showToast(t.bumpSuccess, 'success');
    }
  }

  async function handleUpdateProfile(e) {
    e.preventDefault();
    setUpdating(true);
    const { error } = await supabase
      .from('profiles')
      .update({
        username: formData.username,
        full_name: formData.full_name,
        bio: formData.bio,
      })
      .eq('id', user.id);

    if (error) {
      showToast(t.updateProfileError + error.message, 'error');
    } else {
      setProfile(prev => ({ ...prev, ...formData }));
      showToast(t.updateProfileSuccess, 'success');
    }
    setUpdating(false);
  }

  async function handleAvatarUpload(e) {
    const file = e.target.files[0];
    if (!file) return;

    setUpdating(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}-${Date.now()}.${fileExt}`;
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName);

      const avatarUrl = urlData.publicUrl;
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: avatarUrl })
        .eq('id', user.id);

      if (updateError) throw updateError;

      setProfile(prev => ({ ...prev, avatar_url: avatarUrl }));
      showToast(t.avatarSuccess, 'success');
    } catch (error) {
      showToast(t.avatarError + error.message, 'error');
    }
    setUpdating(false);
  }

  async function handlePasswordReset() {
    const { error } = await supabase.auth.resetPasswordForEmail(user.email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    if (error) showToast(error.message, 'error');
    else showToast(t.passwordResetSent, 'success');
  }

  const unreadCount = messages.filter(m => !m.is_read).length;
  const totalEarnings = transactions.reduce((sum, tx) => sum + Number(tx.sale_price || 0), 0);
  const packagesSent = transactions.filter(tx => tx.was_shipped).length;

  const tabs = [
    { key: 'listings', label: t.myListings, count: listings.length },
    { key: 'favorites', label: t.saved, count: favorites.length },
    { key: 'messages', label: t.messages, count: unreadCount || messages.length },
  ];

  if (loading) return (
    <div className="flex-1 flex items-center justify-center bg-transparent">
      <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
    </div>
  );

  const cardClasses = "bg-[#0A0A0A]/60 backdrop-blur-3xl rounded-[2.5rem] border border-white/10 p-8 sm:p-10 shadow-[0_32px_64px_rgba(0,0,0,0.6)] overflow-hidden relative group";
  const inputClasses = "w-full px-5 py-4 rounded-2xl border border-white/5 bg-white/[0.03] text-white placeholder:text-white/10 outline-none focus:border-[#185FA5] focus:bg-white/10 transition-all text-sm";
  const labelClasses = "text-[10px] font-black text-white/40 uppercase tracking-[0.3em] block mb-3 ml-1";

  return (
    <div className="flex-1 bg-transparent py-12">
      <div className="max-w-[1000px] mx-auto px-6">
        <div className="flex justify-end mb-8">
          <button
            onClick={handleLogout}
            className="text-[11px] font-black uppercase tracking-widest text-white/40 hover:text-white bg-white/[0.03] border border-white/10 px-6 py-3 rounded-full transition-all hover:bg-white/10"
          >
            {t.logout}
          </button>
        </div>

        {/* Profile Progress Gamification */}
        <div className="mb-12">
          <ProfileProgress profile={profile} user={user} />
        </div>

        {/* Profile Header Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          <div className={`${cardClasses} lg:col-span-2`}>
            <button
              onClick={() => setActiveTab('settings')}
              className={`absolute top-6 right-6 p-3 rounded-full transition-all ${activeTab === 'settings' ? 'text-black bg-white scale-110' : 'text-white/20 hover:text-white hover:bg-white/10'}`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </button>

            <div className="flex items-center gap-8 mb-10">
              <div className="relative group">
                <div className="w-24 h-24 rounded-full bg-white/[0.03] overflow-hidden flex items-center justify-center text-3xl font-black text-[#185FA5] shrink-0 border border-white/10 group-hover:border-white/40 transition-all duration-500">
                  {profile?.avatar_url ? (
                    <Image src={profile.avatar_url} alt="Avatar" fill sizes="96px" className="object-cover" />
                  ) : (
                    (profile?.username?.[0] || user?.email?.[0] || '?').toUpperCase()
                  )}
                </div>
                <label className="absolute inset-0 flex items-center justify-center bg-black/60 rounded-full opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity backdrop-blur-sm">
                  <span className="text-[10px] text-white font-black uppercase tracking-widest">{t.changeAvatar}</span>
                  <input type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} disabled={updating} />
                </label>
              </div>
              <div className="min-w-0">
                <h1 className="text-2xl sm:text-3xl font-black text-white mb-2 tracking-tight break-words">
                  {profile?.full_name || profile?.username || t.userFallback}
                </h1>
                <UserBadges profile={profile} user={user} listingsCount={listings.length} />
                <p className="text-[12px] sm:text-[14px] text-white/40 font-bold mt-4 uppercase tracking-widest break-all">
                  {user?.email}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-white/[0.03] rounded-3xl p-5 sm:p-6 border border-white/5 transition-all hover:bg-white/[0.05]">
                <div className="text-2xl sm:text-3xl font-black text-white">{listings.length}</div>
                <div className="text-[9px] sm:text-[10px] text-white/20 font-black uppercase tracking-[0.2em] mt-2">{t.activeListings}</div>
              </div>
              <div className="bg-white/[0.03] rounded-3xl p-5 sm:p-6 border border-white/5 transition-all hover:bg-white/[0.05]">
                <div className="text-2xl sm:text-3xl font-black text-[#185FA5]">{totalEarnings.toLocaleString()}</div>
                <div className="text-[9px] sm:text-[10px] text-white/20 font-black uppercase tracking-[0.2em] mt-2">{t.earningsLabel}</div>
              </div>
              <div className="bg-white/[0.03] rounded-3xl p-5 sm:p-6 border border-white/5 transition-all hover:bg-white/[0.05]">
                <div className="text-2xl sm:text-3xl font-black text-[#1D9E75]">{packagesSent}</div>
                <div className="text-[9px] sm:text-[10px] text-white/20 font-black uppercase tracking-[0.2em] mt-2">{t.packagesLabel}</div>
              </div>
            </div>
          </div>

          <div className={cardClasses}>
            <div className="text-[11px] font-black text-white/20 uppercase tracking-[0.3em] mb-8">{t.infoLabel}</div>
            <div className="space-y-8">
              <div>
                <div className="text-[10px] font-black text-[#185FA5] uppercase tracking-widest mb-1">{t.memberSinceLabel2}</div>
                <div className="text-xl font-bold text-white">{user?.created_at ? new Date(user.created_at).getFullYear() : '...'}</div>
              </div>
              <div>
                <div className="text-[10px] font-black text-[#1D9E75] uppercase tracking-widest mb-2">{t.verificationStatusLabel}</div>
                {profile?.phone_verified ? (
                  <div className="flex items-center gap-2 text-white font-bold text-sm">
                    <span className="w-2 h-2 rounded-full bg-[#1D9E75] shadow-[0_0_10px_#1D9E75]"></span> {t.verifiedStatus}
                  </div>
                ) : (
                  <div className="text-white/20 font-bold text-sm">{t.notVerifiedStatus}</div>
                )}
              </div>
              {profile?.bio && (
                <div>
                  <div className="text-[10px] font-black text-white/20 uppercase tracking-widest mb-2">Bio</div>
                  <p className="text-[13px] text-white/60 leading-relaxed italic">&quot;{profile.bio}&quot;</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Tab System */}
        <div className="flex gap-2 bg-white/[0.03] border border-white/10 rounded-full p-2 mb-12 shadow-2xl backdrop-blur-2xl overflow-x-auto no-scrollbar whitespace-nowrap">
          {tabs.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex-1 flex items-center justify-center gap-3 py-4 px-6 rounded-full text-[12px] font-black uppercase tracking-widest transition-all duration-500
                ${activeTab === tab.key
                  ? 'bg-white text-black shadow-[0_20px_40px_rgba(255,255,255,0.1)]'
                  : 'text-white/20 hover:text-white hover:bg-white/5'
                }`}
            >
              {tab.label}
              {tab.count > 0 && (
                <span className={`text-[10px] font-black px-2 py-0.5 rounded-full min-w-[24px] text-center
                  ${activeTab === tab.key ? 'bg-black text-white' : 'bg-white/10 text-white/40'}`}>
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Tab Content Area */}
        <div className="min-h-[400px]">
          {activeTab === 'listings' && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-2xl font-black text-white uppercase tracking-tight">{t.myListings}</h2>
                <Link
                  href="/postoglas"
                  className="text-[11px] font-black uppercase tracking-[0.2em] text-black bg-white hover:bg-[#185FA5] hover:text-white px-8 py-3 rounded-full transition-all duration-500 shadow-xl"
                >
                  {t.newListing}
                </Link>
              </div>
              
              {listings.length === 0 ? (
                <div className={`${cardClasses} py-24 text-center`}>
                  <div className="text-6xl mb-8 opacity-10">📦</div>
                  <p className="text-white font-black uppercase tracking-[0.3em] text-[14px] mb-8">{t.noListings}</p>
                  <Link href="/postoglas" className="bg-white text-black hover:bg-[#185FA5] hover:text-white px-10 py-4 rounded-full text-[11px] font-black uppercase tracking-widest transition-all">
                    {t.postFirst}
                  </Link>
                </div>
              ) : (
                <div className="grid gap-6">
                  {listings.map(listing => (
                    <div key={listing.id} className={`${cardClasses} p-6 flex flex-col sm:flex-row gap-8 items-center`}>
                      <Link
                        href={`/oglas/${listing.id}`}
                        className="w-32 h-32 rounded-3xl bg-[#050505] overflow-hidden shrink-0 relative flex items-center justify-center border border-white/5 hover:border-[#185FA5] transition-all duration-500"
                      >
                        {listing.image_url ? (
                          <Image src={listing.image_url} alt={listing.title} fill sizes="128px" className="object-cover" />
                        ) : (
                          <span className="text-3xl opacity-10">📦</span>
                        )}
                      </Link>
                      <div className="flex-1 min-w-0 text-center sm:text-left">
                        <div className="text-[10px] font-black text-[#185FA5] uppercase tracking-widest mb-2">{t[`db_${listing.category}`] || listing.category}</div>
                        <Link href={`/oglas/${listing.id}`} className="text-xl font-bold text-white mb-2 truncate block hover:text-[#185FA5] transition-colors tracking-tight">
                          {listing.title}
                        </Link>
                        <div className="text-2xl font-black text-white">{listing.price?.toLocaleString()} <span className="text-[12px] text-white/20">RSD</span></div>
                        <div className="text-[11px] font-bold text-white/20 mt-4 uppercase tracking-widest">{listing.city}</div>
                      </div>
                      <div className="flex flex-row sm:flex-col gap-3 shrink-0">
                        <button
                          onClick={() => handleBumpListing(listing.id)}
                          className="bg-[#1D9E75]/10 text-[#1D9E75] hover:bg-[#1D9E75] hover:text-white px-5 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all border border-[#1D9E75]/20 shadow-[0_10px_20px_rgba(29,158,117,0.1)]"
                        >
                          {t.bumpBtn}
                        </button>
                        <Link href={`/oglas/edit/${listing.id}`} className="bg-white/5 text-white hover:bg-white hover:text-black px-5 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all text-center border border-white/10">
                          {t.editBtn}
                        </Link>
                        <button onClick={() => handleDeleteListingClick(listing.id)} className="bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white px-5 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all border border-red-500/20">
                          {t.deleteBtn}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'favorites' && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <h2 className="text-2xl font-black text-white uppercase tracking-tight mb-8">{t.savedListings}</h2>
              {favorites.length === 0 ? (
                <div className={`${cardClasses} py-24 text-center`}>
                  <div className="text-6xl mb-8 opacity-10">🤍</div>
                  <p className="text-white font-black uppercase tracking-[0.3em] text-[14px] mb-8">{t.noFavorites}</p>
                  <Link href="/" className="bg-white text-black hover:bg-[#185FA5] hover:text-white px-10 py-4 rounded-full text-[11px] font-black uppercase tracking-widest transition-all">
                    {t.browseListings}
                  </Link>
                </div>
              ) : (
                <div className="grid gap-6">
                  {favorites.map(listing => (
                    <div key={listing.id} className={`${cardClasses} p-6 flex flex-col sm:flex-row gap-8 items-center`}>
                      <Link href={`/oglas/${listing.id}`} className="w-24 h-24 rounded-2xl bg-[#050505] overflow-hidden shrink-0 relative flex items-center justify-center border border-white/5">
                        {listing.image_url ? (
                          <Image src={listing.image_url} alt={listing.title} fill sizes="96px" className="object-cover" />
                        ) : (
                          <span className="text-2xl opacity-10">📦</span>
                        )}
                      </Link>
                      <div className="flex-1 min-w-0 text-center sm:text-left">
                        <Link href={`/oglas/${listing.id}`} className="text-lg font-bold text-white mb-1 truncate block hover:text-[#185FA5] transition-colors">
                          {listing.title}
                        </Link>
                        <div className="text-xl font-black text-white">{listing.price?.toLocaleString()} <span className="text-[12px] text-white/20">RSD</span></div>
                      </div>
                      <Link
                        href={`/oglas/${listing.id}`}
                        className="bg-white text-black hover:bg-[#185FA5] hover:text-white px-8 py-3 rounded-full text-[11px] font-black uppercase tracking-widest transition-all"
                      >
                        {t.view}
                      </Link>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'messages' && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <h2 className="text-2xl font-black text-white uppercase tracking-tight mb-8">{t.messages}</h2>
              <div className={`${cardClasses} py-24 text-center`}>
                <div className="text-6xl mb-8 opacity-10">💬</div>
                <p className="text-white font-black uppercase tracking-[0.3em] text-[14px] mb-8">{t.inboxSub}</p>
                <Link
                  href="/poruke"
                  className="bg-white text-black hover:bg-[#185FA5] hover:text-white px-10 py-4 rounded-full text-[11px] font-black uppercase tracking-widest transition-all shadow-[0_20px_40px_rgba(255,255,255,0.1)]"
                >
                  {t.openInbox}
                </Link>
              </div>
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-12">
              <div className={cardClasses}>
                <h2 className="text-2xl font-black text-white uppercase tracking-tight mb-12">{t.profileSettings}</h2>

                <form onSubmit={handleUpdateProfile} className="space-y-10">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                    <div>
                      <label className={labelClasses}>{t.username}</label>
                      <input
                        type="text"
                        value={formData.username}
                        onChange={e => setFormData({ ...formData, username: e.target.value })}
                        className={inputClasses}
                        placeholder={t.usernamePlaceholder}
                      />
                    </div>
                    <div>
                      <label className={labelClasses}>{t.fullName}</label>
                      <input
                        type="text"
                        value={formData.full_name}
                        onChange={e => setFormData({ ...formData, full_name: e.target.value })}
                        className={inputClasses}
                        placeholder={t.fullNamePlaceholder}
                      />
                    </div>
                  </div>
                  <div>
                    <label className={labelClasses}>{t.bio}</label>
                    <textarea
                      value={formData.bio}
                      onChange={e => setFormData({ ...formData, bio: e.target.value })}
                      rows={4}
                      className={inputClasses + " resize-none"}
                      placeholder={t.bioPlaceholder}
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={updating}
                    className="bg-white text-black hover:bg-[#185FA5] hover:text-white px-12 py-4 rounded-full text-[12px] font-black uppercase tracking-widest transition-all disabled:opacity-30"
                  >
                    {updating ? t.saving : t.saveChanges}
                  </button>
                </form>
              </div>

              <div className={cardClasses}>
                <h3 className="text-xl font-black text-white uppercase tracking-tight mb-10">{t.securityTitle}</h3>

                <div className="space-y-8">
                  {profile?.phone_verified ? (
                    <div className="flex items-center justify-between p-6 bg-white/[0.03] rounded-3xl border border-white/5">
                      <div>
                        <div className="text-[10px] font-black text-[#185FA5] uppercase tracking-widest mb-2">{t.emailVerifiedLabel}</div>
                        <div className="text-lg font-bold text-white">{profile.phone || profile.email}</div>
                      </div>
                      <div className="bg-[#1D9E75]/10 text-[#1D9E75] text-[10px] font-black px-5 py-2.5 rounded-full border border-[#1D9E75]/20 shadow-[0_0_15px_rgba(29,158,117,0.1)]">
                        {t.verified2}
                      </div>
                    </div>
                  ) : (
                    <div className="bg-white/[0.02] p-8 rounded-3xl border border-white/5">
                      <EmailVerification onVerified={(email) => setProfile(prev => ({ ...prev, phone: email, phone_verified: true }))} />
                    </div>
                  )}

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 p-6 bg-white/[0.03] rounded-3xl border border-white/5">
                    <div>
                      <div className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-2">{t.password}</div>
                      <div className="text-sm font-medium text-white/60">{t.lastChanged}</div>
                    </div>
                    <button
                      onClick={handlePasswordReset}
                      className="text-[11px] font-black text-[#185FA5] hover:text-white uppercase tracking-widest transition-colors"
                    >
                      {t.changePassword}
                    </button>
                  </div>

                  <div className="pt-6 border-t border-white/5 text-center">
                    <button
                      onClick={handleLogout}
                      className="text-[11px] font-black uppercase tracking-[0.2em] text-red-500/60 hover:text-red-500 hover:bg-red-500/5 px-8 py-3 rounded-full transition-all"
                    >
                      {t.logoutAll}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Delete Modal: Cinematic Dark Overlay */}
        {deleteModal.isOpen && (
          <div className="fixed inset-0 bg-black/90 backdrop-blur-xl z-[200] flex items-center justify-center p-6 animate-in fade-in duration-500">
            <div className="bg-[#0A0A0A] border border-white/10 rounded-[3rem] p-10 sm:p-16 w-full max-w-[540px] shadow-[0_64px_128px_rgba(0,0,0,0.8)] relative overflow-hidden">
               <div className="absolute -top-24 -left-24 w-48 h-48 bg-red-500/10 rounded-full blur-[80px] pointer-events-none" />
              
              <h3 className="text-3xl font-black text-white mb-10 tracking-tight uppercase">{t.deleteAdTitle}</h3>
              
              <div className="mb-12 space-y-8">
                <p className="text-lg font-medium text-white/60 leading-relaxed">{t.didYouSellOnPlatform}</p>
                
                <div className="grid grid-cols-2 gap-4">
                  <button 
                    onClick={() => setSoldFormData(prev => ({ ...prev, soldOnPlatform: true }))}
                    className={`py-4 rounded-2xl border transition-all text-[12px] font-black uppercase tracking-widest
                      ${soldFormData.soldOnPlatform ? 'bg-white text-black border-white' : 'bg-white/5 text-white/40 border-white/10 hover:border-white/40'}`}
                  >
                    {t.yes}
                  </button>
                  <button 
                    onClick={() => setSoldFormData(prev => ({ ...prev, soldOnPlatform: false }))}
                    className={`py-4 rounded-2xl border transition-all text-[12px] font-black uppercase tracking-widest
                      ${!soldFormData.soldOnPlatform ? 'bg-white text-black border-white' : 'bg-white/5 text-white/40 border-white/10 hover:border-white/40'}`}
                  >
                    {t.no}
                  </button>
                </div>

                {soldFormData.soldOnPlatform && (
                  <div className="bg-white/[0.03] p-8 rounded-[2rem] space-y-6 border border-white/5 animate-in slide-in-from-top-4 duration-500">
                    <div>
                      <label className={labelClasses}>{t.finalPrice}</label>
                      <div className="relative">
                        <input 
                          type="number" 
                          value={soldFormData.price}
                          onChange={e => setSoldFormData(prev => ({ ...prev, price: e.target.value }))}
                          className={inputClasses}
                          placeholder="0"
                        />
                        <span className="absolute right-5 top-1/2 -translate-y-1/2 text-[10px] font-black text-white/20">RSD</span>
                      </div>
                    </div>
                    <label className="flex items-center gap-4 cursor-pointer group">
                      <div className={`w-6 h-6 rounded-lg border flex items-center justify-center transition-all duration-300 ${soldFormData.wasShipped ? 'bg-[#185FA5] border-[#185FA5]' : 'border-white/10 group-hover:border-white/40'}`}>
                        {soldFormData.wasShipped && <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>}
                      </div>
                      <input type="checkbox" checked={soldFormData.wasShipped} onChange={e => setSoldFormData(prev => ({ ...prev, wasShipped: e.target.checked }))} className="hidden" />
                      <span className="text-[12px] font-bold text-white/60 group-hover:text-white transition-colors">{t.sentViaCourier}</span>
                    </label>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <button 
                  onClick={() => setDeleteModal({ isOpen: false, listingId: null })}
                  className="py-5 text-[12px] font-black uppercase tracking-widest text-white/20 hover:text-white bg-white/5 rounded-2xl transition-all"
                  disabled={updating}
                >
                  {t.cancelDelete}
                </button>
                <button 
                  onClick={handleConfirmDelete}
                  disabled={updating || (soldFormData.soldOnPlatform && !soldFormData.price)}
                  className="py-5 text-[12px] font-black uppercase tracking-widest text-white bg-red-500 hover:bg-red-600 rounded-2xl transition-all shadow-[0_20px_40px_rgba(239,68,68,0.2)] disabled:opacity-20"
                >
                  {updating ? t.deleting : t.deleteBtn}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}