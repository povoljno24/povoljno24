'use client';
import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

export default function Profil() {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [listings, setListings] = useState([]);
  const [messages, setMessages] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('listings'); // 'listings' | 'favorites' | 'messages'
  const router = useRouter();

  useEffect(() => {
    async function loadProfile() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      setUser(user);

      const [profileRes, listingsRes, messagesRes, favoritesRes] = await Promise.all([
        supabase.from('profiles').select('*').eq('id', user.id).single(),
        supabase.from('listings').select('*').eq('user_id', user.id).order('created_at', { ascending: false }),
        supabase.from('messages').select('*').eq('receiver_id', user.id).order('created_at', { ascending: false }),
        supabase.from('favorites').select('listing_id, listings(*)').eq('user_id', user.id).order('created_at', { ascending: false }),
      ]);

      setProfile(profileRes.data);
      setListings(listingsRes.data || []);
      setMessages(messagesRes.data || []);
      setFavorites((favoritesRes.data || []).map(f => f.listings).filter(Boolean));

      // Mark messages as read
      const unreadIds = (messagesRes.data || []).filter(m => !m.is_read).map(m => m.id);
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
    if (!confirm('Da li ste sigurni da želite da obrišete ovaj oglas?')) return;
    setListings(listings.filter(l => l.id !== id));
    const { error } = await supabase.from('listings').delete().eq('id', id);
    if (error) {
      alert('Greška pri brisanju: ' + error.message);
      window.location.reload();
    }
  }

  const unreadCount = messages.filter(m => !m.is_read).length;

  const tabs = [
    { key: 'listings', label: 'Moji oglasi', count: listings.length },
    { key: 'favorites', label: 'Sačuvano', count: favorites.length },
    { key: 'messages', label: 'Poruke', count: unreadCount || messages.length },
  ];

  if (loading) return (
    <div className="flex-1 flex items-center justify-center">
      <p className="text-gray-500">Učitavanje...</p>
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
            Odjavi se
          </button>
        </div>

        {/* Profile Header */}
        <div className="bg-white rounded-2xl border border-gray-200 p-8 mb-6 shadow-sm">
          <div className="flex items-center gap-5 mb-6">
            <div className="w-16 h-16 rounded-full bg-[#E6F1FB] flex items-center justify-center text-2xl font-semibold text-[#185FA5] shrink-0">
              {profile?.username ? profile.username[0].toUpperCase() : user?.email[0].toUpperCase()}
            </div>
            <div>
              <h1 className="text-lg font-semibold text-gray-900 mb-1">
                {profile?.username || 'Korisnik'}
              </h1>
              <p className="text-[13px] text-gray-500">{user?.email}</p>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-gray-50 rounded-xl p-4 text-center">
              <div className="text-2xl font-semibold text-[#185FA5]">{listings.length}</div>
              <div className="text-[12px] text-gray-600 mt-1">Aktivnih oglasa</div>
            </div>
            <div className="bg-gray-50 rounded-xl p-4 text-center">
              <div className="text-2xl font-semibold text-[#1D9E75]">
                {profile?.verification_level || 1}
              </div>
              <div className="text-[12px] text-gray-600 mt-1">Nivo verifikacije</div>
            </div>
            <div className="bg-gray-50 rounded-xl p-4 text-center">
              <div className="text-2xl font-semibold text-gray-900">
                {new Date(user?.created_at).getFullYear()}
              </div>
              <div className="text-[12px] text-gray-600 mt-1">Član od</div>
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
              <h2 className="text-base font-semibold text-gray-900">Moji oglasi</h2>
              <Link
                href="/postoglas"
                className="text-[12px] font-semibold text-white bg-[#185FA5] hover:bg-[#0C447C] px-4 py-2 rounded-lg transition-colors"
              >
                + Novi oglas
              </Link>
            </div>
            {listings.length === 0 ? (
              <div className="bg-white rounded-2xl border border-gray-200 p-10 text-center shadow-sm">
                <p className="text-gray-500 text-sm mb-4">Još nemaš aktivnih oglasa.</p>
                <Link href="/postoglas" className="inline-block bg-[#185FA5] hover:bg-[#0C447C] text-white px-5 py-2.5 rounded-lg text-[13px] transition-colors font-medium">
                  Postavi prvi oglas
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
                      <div className="text-[11px] text-gray-500 mt-0.5 truncate">{listing.city} · {listing.category}</div>
                    </div>
                    <div className="flex flex-col gap-2 shrink-0 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                      <Link href={`/oglas/edit/${listing.id}`} className="text-[11px] text-[#185FA5] bg-[#E6F1FB] hover:bg-[#d0e5f7] px-3 py-1.5 rounded-md font-medium text-center transition-colors">
                        Izmeni
                      </Link>
                      <button onClick={() => handleDeleteListing(listing.id)} className="text-[11px] text-[#E24B4A] bg-[#fdf0f0] hover:bg-[#fbdada] px-3 py-1.5 rounded-md font-medium text-center transition-colors cursor-pointer border-none outline-none">
                        Obriši
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
            <h2 className="text-base font-semibold mb-4 text-gray-900">Sačuvani oglasi</h2>
            {favorites.length === 0 ? (
              <div className="bg-white rounded-2xl border border-gray-200 p-10 text-center shadow-sm">
                <div className="text-4xl mb-3 opacity-30">🤍</div>
                <p className="text-gray-500 text-sm mb-4">Nisi sačuvao/la nijedan oglas.</p>
                <Link href="/" className="inline-block bg-[#185FA5] hover:bg-[#0C447C] text-white px-5 py-2.5 rounded-lg text-[13px] transition-colors font-medium">
                  Pregledaj oglase
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
                      Pogledaj
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
            <h2 className="text-base font-semibold mb-4 text-gray-900">Poruke</h2>
            <div className="bg-white rounded-2xl border border-gray-200 p-10 text-center shadow-sm">
              <div className="text-4xl mb-3 opacity-30">💬</div>
              <p className="text-gray-700 font-medium mb-1">Inbox poruka</p>
              <p className="text-sm text-gray-500 mb-5">
                Pregledaj sve primljene i poslate poruke na jednom mestu.
              </p>
              <Link
                href="/poruke"
                className="inline-block bg-[#185FA5] hover:bg-[#0C447C] text-white px-6 py-2.5 rounded-lg text-[13px] font-semibold transition-colors"
              >
                Otvori inbox →
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}