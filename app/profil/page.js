"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../lib/supabase';
import Image from 'next/image';
import Link from 'next/link';
import PhoneVerification from '../../components/PhoneVerification';
import { useLanguage } from '../../components/LanguageContext';

export default function Profil() {
  const { t } = useLanguage();
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [listings, setListings] = useState([]);
  const [messages, setMessages] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [activeTab, setActiveTab] = useState('listings');
  const [updating, setUpdating] = useState(false);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({ username: '', full_name: '', bio: '' });
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

      const [{ data: profileData }, { data: listingsData }, { data: messagesData }, { data: favoritesData }] = await Promise.all([
        supabase.from('profiles').select('id, username, full_name, bio, avatar_url, phone, phone_verified, verification_level').eq('id', user.id).single(),
        supabase.from('listings').select('id, title, price, city, category, image_url, created_at, user_id, condition, views, last_bumped_at').eq('user_id', user.id).order('created_at', { ascending: false }),
        supabase.from('messages').select('id, sender_id, receiver_id, content, created_at, is_read, listing_id').or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`).order('created_at', { ascending: false }),
        supabase.from('favorites').select('listing_id, listings(id, title, price, image_url, city)').eq('user_id', user.id).order('created_at', { ascending: false }),
      ]);

      setProfile(profileData);
      if (profileData) {
        setFormData({
          username: profileData.username || '',
          full_name: profileData.full_name || '',
          phone: profileData.phone || '',
          bio: profileData.bio || ''
        });
      }

      setListings(listingsData || []);
      
      setMessages(messagesData || []);

      const favData = favoritesData || [];
      const formattedFavs = favData.map(f => ({
        id: f.listing_id,
        ...f.listings
      }));
      setFavorites(formattedFavs);

      // Mark messages as read
      const unreadIds = (messagesData || []).filter(m => !m.is_read && m.receiver_id === user.id).map(m => m.id);
      if (unreadIds.length > 0) {
        await supabase.from('messages').update({ is_read: true }).in('id', unreadIds);
      }

      setLoading(false);
    }
    loadProfile();
  }, []);

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push('/');
  }

  async function handleDeleteListing(id) {
    if (!confirm(t.confirmDelete)) return;
    setListings(listings.filter(l => l.id !== id));
    const { error } = await supabase.from('listings').delete().eq('id', id);
    if (error) {
      alert(t.deleteError + error.message);
      window.location.reload();
    }
  }

  async function handleBumpListing(id) {
    const listing = listings.find(l => l.id === id);
    const lastBump = listing.last_bumped_at || listing.created_at;
    const hoursSinceBump = (new Date() - new Date(lastBump)) / (1000 * 60 * 60);

    if (hoursSinceBump < 24) {
      const remainingHours = Math.ceil(24 - hoursSinceBump);
      alert(`${t.bumpWait} ${remainingHours}h.`);
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
      alert(t.bumpError + error.message);
    } else {
      const updatedListings = listings.map(l =>
        l.id === id ? { ...l, created_at: now, last_bumped_at: now } : l
      ).sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

      setListings(updatedListings);
      alert(t.bumpSuccess);
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
      alert(t.updateProfileError + error.message);
    } else {
      setProfile(prev => ({ ...prev, ...formData }));
      alert(t.updateProfileSuccess);
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
      alert(t.avatarSuccess);
    } catch (error) {
      alert(t.avatarError + error.message);
    }
    setUpdating(false);
  }

  async function handlePasswordReset() {
    const { error } = await supabase.auth.resetPasswordForEmail(user.email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    if (error) alert(error.message);
    else alert(t.passwordResetSent);
  }

  const unreadCount = messages.filter(m => !m.is_read).length;

  const tabs = [
    { key: 'listings', label: t.myListings, count: listings.length },
    { key: 'favorites', label: t.saved, count: favorites.length },
    { key: 'messages', label: t.messages, count: unreadCount || messages.length },
    { key: 'settings', label: t.settings, count: 0 },
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

        {/* Profile Header */}
        <div className="bg-white rounded-2xl border border-gray-200 p-8 mb-6 shadow-sm">
          <div className="flex items-center gap-5 mb-6">
            <div className="relative group">
              <div className="w-16 h-16 rounded-full bg-[#E6F1FB] overflow-hidden flex items-center justify-center text-2xl font-semibold text-[#185FA5] shrink-0 border border-gray-100">
                {profile?.avatar_url ? (
                  <Image src={profile.avatar_url} alt="Avatar" fill className="object-cover" />
                ) : (
                  profile?.username ? profile.username[0].toUpperCase() : user?.email[0].toUpperCase()
                )}
              </div>
              <label className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-full opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity">
                <span className="text-[10px] text-white font-bold">{t.changeAvatar}</span>
                <input type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} disabled={updating} />
              </label>
            </div>
            <div>
              <h1 className="text-lg font-semibold text-gray-900 mb-1 flex items-center gap-2">
                {profile?.full_name || profile?.username || t.userFallback}
                {profile?.verification_level > 2 && (
                  <span className="text-[#1D9E75] text-sm">🛡️</span>
                )}
              </h1>
              <p className="text-[13px] text-gray-500">{user?.email}</p>
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
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-gray-50 rounded-xl p-4 text-center">
              <div className="text-2xl font-semibold text-[#185FA5]">{listings.length}</div>
              <div className="text-[12px] text-gray-600 mt-1">{t.activeListings}</div>
            </div>
            <div className="bg-gray-50 rounded-xl p-4 text-center">
              <div className="text-2xl font-semibold text-[#1D9E75]">
                {profile?.verification_level || 1}
              </div>
              <div className="text-[12px] text-gray-600 mt-1">{t.verificationLevel}</div>
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
                      <button onClick={() => handleDeleteListing(listing.id)} className="text-[11px] text-[#E24B4A] bg-[#fdf0f0] hover:bg-[#fbdada] px-3 py-1.5 rounded-md font-medium text-center transition-colors cursor-pointer border-none outline-none">
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
      </div>
    </div>
  );
}