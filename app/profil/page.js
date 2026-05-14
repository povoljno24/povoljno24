"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../lib/supabase';
import Image from 'next/image';
import Link from 'next/link';
import PhoneVerification from '../../components/PhoneVerification';
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
            phone: profileRes.data.phone || '',
            bio: profileRes.data.bio || ''
          });
        }

        setListings(listingsRes.data || []);
        setMessages(messagesRes.data || []);
        setTransactions(transactionsRes.data || []);

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
  }, [router]);

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push('/');
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
          id: Date.now().toString(),
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
    <div className="flex-1 flex items-center justify-center">
      <p className="text-gray-500">{t.loading}</p>
    </div>
  );

  return (
    <div className="flex-1 bg-[#f5f5f5]">
      <div className="max-w-[700px] mx-auto my-8 px-6">
        <div className="flex justify-end mb-4">
          <button
            onClick={handleLogout}
            className="text-sm text-gray-600 bg-transparent border border-gray-300 px-4 py-2 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
          >
            {t.logout}
          </button>
        </div>

        {/* Profile Progress Gamification */}
        <ProfileProgress profile={profile} user={user} />

        {/* Profile Header */}
        <div className="bg-white rounded-2xl border border-gray-200 p-8 mb-6 shadow-sm relative">
          <button
            onClick={() => setActiveTab('settings')}
            className={`absolute top-4 right-4 p-2 rounded-full transition-colors ${activeTab === 'settings' ? 'text-[#185FA5] bg-[#E6F1FB]' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50'}`}
            title={t.settings}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </button>
          <div className="flex items-center gap-5 mb-6 pr-10">
            <div className="relative group">
              <div className="w-16 h-16 rounded-full bg-[#E6F1FB] overflow-hidden flex items-center justify-center text-2xl font-semibold text-[#185FA5] shrink-0 border border-gray-100">
                {profile?.avatar_url ? (
                  <Image src={profile.avatar_url} alt="Avatar" fill className="object-cover" />
                ) : (
                  (profile?.username?.[0] || user?.email?.[0] || '?').toUpperCase()
                )}
              </div>
              <label className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-full opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity">
                <span className="text-[10px] text-white font-bold">{t.changeAvatar}</span>
                <input type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} disabled={updating} />
              </label>
            </div>
            <div>
              <h1 className="text-lg font-semibold text-gray-900 mb-0 flex items-center gap-2">
                {profile?.full_name || profile?.username || user?.user_metadata?.username || user?.email?.split('@')[0] || t.userFallback}
              </h1>
              <UserBadges profile={profile} user={user} listingsCount={listings.length} />
              <p className="text-[13px] text-gray-500 mt-1">{user?.email || user?.phone}</p>
              {profile?.bio && <p className="text-[12px] text-gray-600 mt-1 italic line-clamp-1">&quot;{profile.bio}&quot;</p>}
              {profile?.phone_verified && (
                <div className="mt-2 flex items-center gap-1.5 text-[12px] font-semibold text-[#1D9E75] bg-[#EAF3DE] px-2 py-0.5 rounded-md border border-[#d3ecc1] w-fit">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  {profile.phone}
                </div>
              )}
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-gray-50 rounded-xl p-4 text-center">
              <div className="text-2xl font-semibold text-[#185FA5]">{listings.length}</div>
              <div className="text-[12px] text-gray-600 mt-1">{t.activeListings}</div>
            </div>
            <div className="bg-gray-50 rounded-xl p-4 text-center">
              <div className="text-2xl font-semibold text-[#185FA5]">{totalEarnings.toLocaleString()} <span className="text-sm">RSD</span></div>
              <div className="text-[12px] text-gray-600 mt-1">{t.earnings || 'Zarada'}</div>
            </div>
            <div className="bg-gray-50 rounded-xl p-4 text-center">
              <div className="text-2xl font-semibold text-[#1D9E75]">
                {packagesSent}
              </div>
              <div className="text-[12px] text-gray-600 mt-1">{t.sentPackages || 'Poslatih paketa'}</div>
            </div>
            <div className="bg-gray-50 rounded-xl p-4 text-center">
              <div className="text-2xl font-semibold text-gray-900">
                {user?.created_at ? new Date(user.created_at).getFullYear() : '...'}
              </div>
              <div className="text-[12px] text-gray-600 mt-1">{t.memberSince}</div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-1 bg-white border border-gray-200 rounded-xl p-1 mb-5 shadow-sm">
          {tabs.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg text-[13px] font-semibold transition-all cursor-pointer border-none
                ${activeTab === tab.key
                  ? 'bg-[#185FA5] text-white shadow-sm'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                }`}
            >
              {tab.label}
              {tab.count > 0 && (
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center
                  ${activeTab === tab.key ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-600'}`}>
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Tab: My Listings */}
        {activeTab === 'listings' && (
          <>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-base font-semibold text-gray-900">{t.myListings}</h2>
              <Link
                href="/postoglas"
                className="text-[12px] font-semibold text-white bg-[#185FA5] hover:bg-[#0C447C] px-4 py-2 rounded-lg transition-colors"
              >
                {t.newListing}
              </Link>
            </div>
            {listings.length === 0 ? (
              <div className="bg-white rounded-2xl border border-gray-200 p-10 text-center shadow-sm">
                <p className="text-gray-500 text-sm mb-4">{t.noListings}</p>
                <Link href="/postoglas" className="inline-block bg-[#185FA5] hover:bg-[#0C447C] text-white px-5 py-2.5 rounded-lg text-[13px] transition-colors font-medium">
                  {t.postFirst}
                </Link>
              </div>
            ) : (
              <div className="grid gap-3">
                {listings.map(listing => (
                  <div key={listing.id} className="bg-white rounded-xl border border-gray-200 p-4 flex gap-4 items-center hover:shadow-md transition-all group">
                    <Link
                      href={`/oglas/${listing.id}`}
                      className="w-16 h-16 rounded-lg bg-gray-900 overflow-hidden shrink-0 relative flex items-center justify-center border border-gray-100 shadow-sm group-hover:border-[#185FA5] transition-colors select-none"
                      onContextMenu={(e) => e.preventDefault()}
                    >
                      {listing.image_url ? (
                        <>
                          <Image
                            src={listing.image_url}
                            alt={listing.title}
                            fill
                            className="object-contain pointer-events-none"
                            draggable={false}
                          />
                          {/* Invisible protection layer */}
                          <div className="absolute inset-0 z-10 bg-transparent" />
                        </>
                      ) : (
                        <span className="text-2xl opacity-30 text-white">📦</span>
                      )}
                    </Link>
                    <div className="flex-1 min-w-0">
                      <Link href={`/oglas/${listing.id}`} className="text-sm font-semibold text-gray-900 mb-1 truncate block hover:text-[#185FA5] transition-colors">
                        {listing.title}
                      </Link>
                      <div className="text-[13px] text-[#185FA5] font-semibold">{listing.price?.toLocaleString()} RSD</div>
                      <div className="text-[11px] text-gray-500 mt-0.5 truncate">{listing.city} · {t[`db_${listing.category}`] || listing.category}</div>
                    </div>
                    <div className="flex flex-col gap-2 shrink-0 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => handleBumpListing(listing.id)}
                        className="text-[11px] text-[#1D9E75] bg-[#EAF3DE] hover:bg-[#d3ecc1] px-3 py-1.5 rounded-md font-bold text-center transition-colors border border-[#d3ecc1]"
                      >
                        {t.bumpBtn}
                      </button>
                      <Link href={`/oglas/edit/${listing.id}`} className="text-[11px] text-[#185FA5] bg-[#E6F1FB] hover:bg-[#d0e5f7] px-3 py-1.5 rounded-md font-medium text-center transition-colors">
                        {t.editBtn}
                      </Link>
                      <button onClick={() => handleDeleteListingClick(listing.id)} className="text-[11px] text-[#E24B4A] bg-[#fdf0f0] hover:bg-[#fbdada] px-3 py-1.5 rounded-md font-medium text-center transition-colors cursor-pointer border-none outline-none">
                        {t.deleteBtn}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* Tab: Favorites */}
        {activeTab === 'favorites' && (
          <>
            <h2 className="text-base font-semibold mb-4 text-gray-900">{t.savedListings}</h2>
            {favorites.length === 0 ? (
              <div className="bg-white rounded-2xl border border-gray-200 p-10 text-center shadow-sm">
                <div className="text-4xl mb-3 opacity-30">🤍</div>
                <p className="text-gray-500 text-sm mb-4">{t.noFavorites}</p>
                <Link href="/" className="inline-block bg-[#185FA5] hover:bg-[#0C447C] text-white px-5 py-2.5 rounded-lg text-[13px] transition-colors font-medium">
                  {t.browseListings}
                </Link>
              </div>
            ) : (
              <div className="grid gap-3">
                {favorites.map(listing => (
                  <div key={listing.id} className="bg-white rounded-xl border border-gray-200 p-4 flex gap-4 items-center hover:shadow-md transition-all group">
                    <Link href={`/oglas/${listing.id}`} className="w-16 h-16 rounded-lg bg-gray-900 overflow-hidden shrink-0 relative flex items-center justify-center border border-gray-100 shadow-sm group-hover:border-[#185FA5] transition-colors">
                      {listing.image_url ? (
                        <Image src={listing.image_url} alt={listing.title} fill className="object-contain" />
                      ) : (
                        <span className="text-2xl opacity-30 text-white">📦</span>
                      )}
                    </Link>
                    <div className="flex-1 min-w-0">
                      <Link href={`/oglas/${listing.id}`} className="text-sm font-semibold text-gray-900 mb-1 truncate block hover:text-[#185FA5] transition-colors">
                        {listing.title}
                      </Link>
                      <div className="text-[13px] text-[#185FA5] font-semibold">{listing.price?.toLocaleString()} RSD</div>
                      <div className="text-[11px] text-gray-500 mt-0.5 truncate">📍 {listing.city} · {listing.category}</div>
                    </div>
                    <Link
                      href={`/oglas/${listing.id}`}
                      className="shrink-0 text-[11px] text-[#185FA5] bg-[#E6F1FB] hover:bg-[#d0e5f7] px-3 py-1.5 rounded-md font-medium transition-colors opacity-0 group-hover:opacity-100"
                    >
                      {t.view}
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* Tab: Messages */}
        {activeTab === 'messages' && (
          <>
            <h2 className="text-base font-semibold mb-4 text-gray-900">{t.messages}</h2>
            <div className="bg-white rounded-2xl border border-gray-200 p-10 text-center shadow-sm">
              <div className="text-4xl mb-3 opacity-30">💬</div>
              <p className="text-gray-700 font-medium mb-1">{t.inbox}</p>
              <p className="text-sm text-gray-500 mb-5">{t.inboxSub}</p>
              <Link
                href="/poruke"
                className="inline-block bg-[#185FA5] hover:bg-[#0C447C] text-white px-6 py-2.5 rounded-lg text-[13px] font-semibold transition-colors"
              >
                {t.openInbox}
              </Link>
            </div>
          </>
        )}

        {/* Tab: Settings */}
        {activeTab === 'settings' && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl border border-gray-200 p-8 shadow-sm">
              <h2 className="text-base font-semibold text-gray-900 mb-6">{t.profileSettings}</h2>

              <form onSubmit={handleUpdateProfile} className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest block mb-2">{t.username}</label>
                    <input
                      type="text"
                      value={formData.username}
                      onChange={e => setFormData({ ...formData, username: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-lg border border-gray-200 text-sm outline-none focus:border-[#185FA5] transition-all"
                      placeholder={t.usernamePlaceholder}
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest block mb-2">{t.fullName}</label>
                    <input
                      type="text"
                      value={formData.full_name}
                      onChange={e => setFormData({ ...formData, full_name: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-lg border border-gray-200 text-sm outline-none focus:border-[#185FA5] transition-all"
                      placeholder={t.fullNamePlaceholder}
                    />
                  </div>
                </div>
                <div>
                  <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest block mb-2">{t.bio}</label>
                  <textarea
                    value={formData.bio}
                    onChange={e => setFormData({ ...formData, bio: e.target.value })}
                    rows={3}
                    className="w-full px-3.5 py-2.5 rounded-lg border border-gray-200 text-sm outline-none focus:border-[#185FA5] transition-all resize-none"
                    placeholder={t.bioPlaceholder}
                  />
                </div>
                <button
                  type="submit"
                  disabled={updating}
                  className="bg-[#185FA5] hover:bg-[#0C447C] text-white px-8 py-2.5 rounded-lg text-[13px] font-semibold transition-all disabled:bg-gray-300"
                >
                  {updating ? t.saving : t.saveChanges}
                </button>
              </form>
            </div>

            <div className="bg-white rounded-2xl border border-gray-200 p-8 shadow-sm">
              <h3 className="text-base font-semibold text-gray-900 mb-6">{t.securityTitle}</h3>

              <div className="space-y-6">
                {profile?.phone_verified ? (
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100">
                    <div>
                      <div className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-1">{t.phoneLabel}</div>
                      <div className="text-[15px] font-bold text-gray-900">{profile.phone}</div>
                    </div>
                    <div className="bg-[#EAF3DE] text-[#3B6D11] text-[10px] font-bold px-3 py-1.5 rounded-full border border-[#d3ecc1]">
                      {t.verified2}
                    </div>
                  </div>
                ) : (
                  <PhoneVerification onVerified={(phone) => setProfile(prev => ({ ...prev, phone, phone_verified: true }))} />
                )}

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-gray-50 rounded-xl border border-gray-100">
                  <div>
                    <div className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-1">{t.password}</div>
                    <div className="text-[13px] text-gray-600">{t.lastChanged}</div>
                  </div>
                  <button
                    onClick={handlePasswordReset}
                    className="text-[12px] font-bold text-[#185FA5] hover:underline"
                  >
                    {t.changePassword}
                  </button>
                </div>

                <div className="pt-4 border-t border-gray-100">
                  <button
                    onClick={handleLogout}
                    className="text-[13px] text-red-500 font-semibold hover:bg-red-50 px-4 py-2 rounded-lg transition-colors"
                  >
                    {t.logoutAll}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Delete Modal */}
        {deleteModal.isOpen && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl">
              <h3 className="text-lg font-bold text-gray-900 mb-4">{t.deleteAdTitle || 'Brisanje oglasa'}</h3>
              
              <div className="mb-6 space-y-4">
                <p className="text-sm text-gray-600">{t.didYouSellOnPlatform || 'Da li ste prodali ovaj predmet preko Povoljno24?'}</p>
                
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" name="sold" checked={soldFormData.soldOnPlatform} onChange={() => setSoldFormData(prev => ({ ...prev, soldOnPlatform: true }))} className="w-4 h-4 text-[#185FA5]" />
                    <span className="text-sm text-gray-700">{t.yes || 'Da'}</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" name="sold" checked={!soldFormData.soldOnPlatform} onChange={() => setSoldFormData(prev => ({ ...prev, soldOnPlatform: false }))} className="w-4 h-4 text-[#185FA5]" />
                    <span className="text-sm text-gray-700">{t.no || 'Ne'}</span>
                  </label>
                </div>

                {soldFormData.soldOnPlatform && (
                  <div className="bg-gray-50 p-4 rounded-xl space-y-4 border border-gray-100">
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">{t.finalPrice || 'Konačna cena (RSD)'}</label>
                      <input 
                        type="number" 
                        value={soldFormData.price}
                        onChange={e => setSoldFormData(prev => ({ ...prev, price: e.target.value }))}
                        className="w-full px-3 py-2 rounded-lg border border-gray-200 outline-none focus:border-[#185FA5] text-sm"
                        placeholder="0"
                      />
                    </div>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={soldFormData.wasShipped}
                        onChange={e => setSoldFormData(prev => ({ ...prev, wasShipped: e.target.checked }))}
                        className="w-4 h-4 rounded text-[#185FA5]"
                      />
                      <span className="text-sm text-gray-700">{t.sentViaCourier || 'Poslato kurirskom službom'}</span>
                    </label>
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-3">
                <button 
                  onClick={() => setDeleteModal({ isOpen: false, listingId: null })}
                  className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                  disabled={updating}
                >
                  {t.cancelDelete || 'Odustani'}
                </button>
                <button 
                  onClick={handleConfirmDelete}
                  disabled={updating || (soldFormData.soldOnPlatform && !soldFormData.price)}
                  className="px-4 py-2 text-sm font-bold text-white bg-[#E24B4A] hover:bg-[#c93c3b] rounded-lg transition-colors disabled:opacity-50"
                >
                  {updating ? (t.deleting || 'Brisanje...') : (t.deleteBtn || 'Obriši')}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}