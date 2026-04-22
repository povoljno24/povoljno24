'use client';
import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';

export default function Profil() {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadProfile() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { window.location.href = '/login'; return; }
      setUser(user);

      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      setProfile(profileData);

      const { data: listingsData } = await supabase
        .from('listings')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      setListings(listingsData || []);
      setLoading(false);
    }
    loadProfile();
  }, []);

  async function handleLogout() {
    await supabase.auth.signOut();
    window.location.href = '/';
  }

  if (loading) return (
    <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center' }}>
      <p style={{ color:'#555' }}>Učitavanje...</p>
    </div>
  );

  return (
    <div style={{ minHeight:'100vh', background:'#f5f5f5' }}>
      {/* Navbar */}
      <nav style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'14px 24px', background:'#fff', borderBottom:'1px solid #e5e5e5' }}>
        <a href="/" style={{ fontSize:'20px', fontWeight:'600', color:'#185FA5', textDecoration:'none' }}>
          Povoljno<span style={{ color:'#E24B4A' }}>24</span>.rs
        </a>
        <div style={{ display:'flex', alignItems:'center', gap:'16px' }}>
          <a href="/postoglas" style={{ fontSize:'13px', color:'#fff', background:'#185FA5', padding:'7px 16px', borderRadius:'8px', textDecoration:'none' }}>Postavi oglas</a>
          <button onClick={handleLogout} style={{ fontSize:'13px', color:'#555', background:'transparent', border:'1px solid #ddd', padding:'7px 16px', borderRadius:'8px', cursor:'pointer' }}>Odjavi se</button>
        </div>
      </nav>

      <div style={{ maxWidth:'700px', margin:'32px auto', padding:'0 24px' }}>
        {/* Profile card */}
        <div style={{ background:'#fff', borderRadius:'16px', border:'1px solid #eee', padding:'32px', marginBottom:'24px' }}>
          <div style={{ display:'flex', alignItems:'center', gap:'20px', marginBottom:'24px' }}>
            <div style={{ width:'64px', height:'64px', borderRadius:'50%', background:'#E6F1FB', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'24px', fontWeight:'600', color:'#185FA5' }}>
              {profile?.username ? profile.username[0].toUpperCase() : user?.email[0].toUpperCase()}
            </div>
            <div>
              <h1 style={{ fontSize:'18px', fontWeight:'600', color:'#1a1a1a', marginBottom:'4px' }}>
                {profile?.username || 'Korisnik'}
              </h1>
              <p style={{ fontSize:'13px', color:'#999' }}>{user?.email}</p>
            </div>
          </div>

          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:'12px' }}>
            <div style={{ background:'#f5f5f5', borderRadius:'12px', padding:'16px', textAlign:'center' }}>
              <div style={{ fontSize:'22px', fontWeight:'600', color:'#185FA5' }}>{listings.length}</div>
              <div style={{ fontSize:'12px', color:'#555', marginTop:'4px' }}>Aktivnih oglasa</div>
            </div>
            <div style={{ background:'#f5f5f5', borderRadius:'12px', padding:'16px', textAlign:'center' }}>
              <div style={{ fontSize:'22px', fontWeight:'600', color:'#1D9E75' }}>
                {profile?.verification_level || 1}
              </div>
              <div style={{ fontSize:'12px', color:'#555', marginTop:'4px' }}>Nivo verifikacije</div>
            </div>
            <div style={{ background:'#f5f5f5', borderRadius:'12px', padding:'16px', textAlign:'center' }}>
              <div style={{ fontSize:'22px', fontWeight:'600', color:'#1a1a1a' }}>
                {new Date(user?.created_at).getFullYear()}
              </div>
              <div style={{ fontSize:'12px', color:'#555', marginTop:'4px' }}>Član od</div>
            </div>
          </div>
        </div>

        {/* User's listings */}
        <h2 style={{ fontSize:'16px', fontWeight:'600', marginBottom:'16px', color:'#1a1a1a' }}>Moji oglasi</h2>
        {listings.length === 0 ? (
          <div style={{ background:'#fff', borderRadius:'16px', border:'1px solid #eee', padding:'40px', textAlign:'center' }}>
            <p style={{ color:'#999', fontSize:'14px', marginBottom:'16px' }}>Još nemaš aktivnih oglasa.</p>
            <a href="/postoglas" style={{ background:'#185FA5', color:'#fff', padding:'10px 20px', borderRadius:'8px', textDecoration:'none', fontSize:'13px' }}>Postavi prvi oglas</a>
          </div>
        ) : (
          <div style={{ display:'grid', gap:'12px' }}>
            {listings.map(listing => (
              <div key={listing.id} style={{ background:'#fff', borderRadius:'12px', border:'1px solid #eee', padding:'16px', display:'flex', gap:'16px', alignItems:'center' }}>
                <div style={{ width:'64px', height:'64px', borderRadius:'8px', background:'#f5f5f5', overflow:'hidden', flexShrink:0 }}>
                  {listing.image_url
                    ? <img src={listing.image_url} alt={listing.title} style={{ width:'100%', height:'100%', objectFit:'cover' }} />
                    : <div style={{ width:'100%', height:'100%', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'24px' }}>📦</div>
                  }
                </div>
                <div style={{ flex:1 }}>
                  <div style={{ fontSize:'14px', fontWeight:'600', color:'#1a1a1a', marginBottom:'4px' }}>{listing.title}</div>
                  <div style={{ fontSize:'13px', color:'#185FA5', fontWeight:'600' }}>{listing.price?.toLocaleString()} RSD</div>
                  <div style={{ fontSize:'11px', color:'#999', marginTop:'2px' }}>{listing.city} · {listing.category}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}