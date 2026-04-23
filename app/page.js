'use client';
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

const translations = {
  sr: {
    listings: 'Oglasi',
    howItWorks: 'Kako funkcioniše',
    signIn: 'Prijavi se',
    postAd: 'Postavi oglas',
    hero: 'Kupi i prodaj sve — brzo, sigurno, povoljno',
    heroSub: 'Hiljade oglasa u Srbiji. Provereni prodavci. Bez prevara.',
    searchPlaceholder: 'Šta tražiš?',
    search: 'Pretraži',
    allCats: 'Sve kategorije',
    electronics: 'Elektronika',
    cars: 'Automobili',
    realestate: 'Nekretnine',
    fashion: 'Moda',
    trust1: 'Provereni prodavci',
    trust2: 'Kupac zaštićen',
    trust3: 'Bez skrivenih troškova',
    trust4: 'Besplatno oglašavanje',
    categories: 'Kategorije',
    furniture: 'Nameštaj',
    gaming: 'Gaming',
    tools: 'Alati',
    books: 'Knjige',
    newListings: 'Novi oglasi',
    viewAll: 'Pogledaj sve →',
    verified: 'Proveren',
    about: 'O nama',
    help: 'Pomoć',
    terms: 'Uslovi korišćenja',
    contact: 'Kontakt',
  },
  en: {
    listings: 'Listings',
    howItWorks: 'How it works',
    signIn: 'Sign in',
    postAd: 'Post an ad',
    hero: 'Buy and sell anything — fast, safe, affordable',
    heroSub: 'Thousands of listings in Serbia. Verified sellers. No scams.',
    searchPlaceholder: 'What are you looking for?',
    search: 'Search',
    allCats: 'All categories',
    electronics: 'Electronics',
    cars: 'Cars',
    realestate: 'Real estate',
    fashion: 'Fashion',
    trust1: 'Verified sellers',
    trust2: 'Buyer protected',
    trust3: 'No hidden fees',
    trust4: 'Free listings',
    categories: 'Categories',
    furniture: 'Furniture',
    gaming: 'Gaming',
    tools: 'Tools',
    books: 'Books',
    newListings: 'Latest listings',
    viewAll: 'View all →',
    verified: 'Verified',
    about: 'About us',
    help: 'Help',
    terms: 'Terms of use',
    contact: 'Contact',
  },
};

export default function Home() {
  const [lang, setLang] = useState('sr');
  const [user, setUser] = useState(null);
  const [listings, setListings] = useState([]);
  const [search, setSearch] = useState('');
  const [filterCat, setFilterCat] = useState('');
  const t = translations[lang];

  async function loadListings(searchTerm, category) {
    let query = supabase.from('listings').select('*').order('created_at', { ascending: false }).limit(20);
    if (searchTerm) query = query.ilike('title', `%${searchTerm}%`);
    if (category) query = query.eq('category', category);
    const { data } = await query;
    setListings(data || []);
  }

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => setUser(user));
    loadListings('', '');
  }, []);

  return (
    <div>
      {/* Navbar */}
      <nav style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'14px 24px', background:'#fff', borderBottom:'1px solid #e5e5e5' }}>
        <div style={{ fontSize:'20px', fontWeight:'600', color:'#185FA5' }}>
          Povoljno<span style={{ color:'#E24B4A' }}>24</span>.rs
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:'20px' }}>
          <a href="#" style={{ fontSize:'13px', color:'#555' }}>{t.listings}</a>
          <a href="#" style={{ fontSize:'13px', color:'#555' }}>{t.howItWorks}</a>
          {user
            ? <a href="/profil" style={{ fontSize:'13px', color:'#555' }}>Profil</a>
            : <a href="/login" style={{ fontSize:'13px', color:'#555' }}>{t.signIn}</a>
          }
          <div style={{ display:'flex', border:'1px solid #ddd', borderRadius:'8px', overflow:'hidden' }}>
            <button onClick={() => setLang('sr')} style={{ padding:'6px 12px', fontSize:'12px', border:'none', cursor:'pointer', background: lang==='sr' ? '#185FA5' : 'transparent', color: lang==='sr' ? '#fff' : '#555' }}>🇷🇸 SR</button>
            <button onClick={() => setLang('en')} style={{ padding:'6px 12px', fontSize:'12px', border:'none', cursor:'pointer', background: lang==='en' ? '#185FA5' : 'transparent', color: lang==='en' ? '#fff' : '#555' }}>🇬🇧 EN</button>
          </div>
          <a href="/postoglas"><button style={{ background:'#185FA5', color:'#fff', border:'none', borderRadius:'8px', padding:'7px 16px', fontSize:'13px', cursor:'pointer' }}>{t.postAd}</button></a>
        </div>
      </nav>

      {/* Hero */}
      <div style={{ background:'#E6F1FB', padding:'48px 24px 40px', textAlign:'center' }}>
        <h1 style={{ fontSize:'28px', fontWeight:'600', color:'#0C447C', marginBottom:'8px' }}>{t.hero}</h1>
        <p style={{ fontSize:'15px', color:'#185FA5', marginBottom:'24px' }}>{t.heroSub}</p>
        <div style={{ display:'flex', maxWidth:'580px', margin:'0 auto', background:'#fff', borderRadius:'12px', border:'1px solid #ddd', overflow:'hidden' }}>
          <select value={filterCat} onChange={e => { setFilterCat(e.target.value); loadListings(search, e.target.value); }} style={{ border:'none', outline:'none', padding:'12px 14px', fontSize:'13px', color:'#555', background:'#f5f5f5', borderRight:'1px solid #eee' }}>
            <option value="">{t.allCats}</option>
            <option value="elektronika">{t.electronics}</option>
            <option value="automobili">{t.cars}</option>
            <option value="nekretnine">{t.realestate}</option>
            <option value="moda">{t.fashion}</option>
            <option value="namestaj">{t.furniture}</option>
            <option value="gaming">{t.gaming}</option>
            <option value="alati">{t.tools}</option>
            <option value="knjige">{t.books}</option>
          </select>
          <input type="text" value={search} onChange={e => setSearch(e.target.value)} onKeyDown={e => e.key === 'Enter' && loadListings(search, filterCat)} placeholder={t.searchPlaceholder} style={{ flex:1, border:'none', outline:'none', padding:'12px 16px', fontSize:'14px' }} />
          <button onClick={() => loadListings(search, filterCat)} style={{ background:'#185FA5', color:'#fff', border:'none', padding:'12px 20px', fontSize:'13px', cursor:'pointer' }}>{t.search}</button>
        </div>
        <div style={{ display:'flex', justifyContent:'center', gap:'28px', marginTop:'20px', flexWrap:'wrap' }}>
          {[t.trust1, t.trust2, t.trust3, t.trust4].map(item => (
            <div key={item} style={{ display:'flex', alignItems:'center', gap:'6px', fontSize:'12px', color:'#185FA5' }}>
              <div style={{ width:'8px', height:'8px', borderRadius:'50%', background:'#1D9E75' }}></div>
              {item}
            </div>
          ))}
        </div>
      </div>

      {/* Categories */}
      <div style={{ padding:'32px 24px', background:'#fff' }}>
        <h2 style={{ fontSize:'16px', fontWeight:'600', marginBottom:'16px' }}>{t.categories}</h2>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(130px, 1fr))', gap:'10px' }}>
          {[
            { icon:'📱', name: t.electronics, value:'elektronika' },
            { icon:'🚗', name: t.cars, value:'automobili' },
            { icon:'🏠', name: t.realestate, value:'nekretnine' },
            { icon:'👗', name: t.fashion, value:'moda' },
            { icon:'🛋️', name: t.furniture, value:'namestaj' },
            { icon:'🎮', name: t.gaming, value:'gaming' },
            { icon:'🔧', name: t.tools, value:'alati' },
            { icon:'📚', name: t.books, value:'knjige' },
          ].map(cat => (
            <div key={cat.name} onClick={() => { setFilterCat(cat.value); loadListings(search, cat.value); }} style={{ background: filterCat === cat.value ? '#E6F1FB' : '#f9f9f9', border: filterCat === cat.value ? '1px solid #185FA5' : '1px solid #eee', borderRadius:'12px', padding:'16px 12px', textAlign:'center', cursor:'pointer' }}>
              <div style={{ fontSize:'22px', marginBottom:'6px' }}>{cat.icon}</div>
              <div style={{ fontSize:'12px', color: filterCat === cat.value ? '#185FA5' : '#555' }}>{cat.name}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Listings */}
      <div style={{ padding:'8px 24px 32px', background:'#f5f5f5' }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'16px' }}>
          <h2 style={{ fontSize:'16px', fontWeight:'600' }}>{t.newListings}</h2>
          {filterCat && <button onClick={() => { setFilterCat(''); setSearch(''); loadListings('', ''); }} style={{ fontSize:'13px', color:'#E24B4A', background:'transparent', border:'none', cursor:'pointer' }}>× Ukloni filter</button>}
        </div>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(155px, 1fr))', gap:'12px' }}>
          {listings.length === 0 ? (
            <p style={{ fontSize:'14px', color:'#999', textAlign:'center', padding:'40px' }}>Nema oglasa za ovu pretragu.</p>
          ) : (
            listings.map(listing => (
              <a key={listing.id} href={`/oglas/${listing.id}`} style={{ textDecoration:'none', color:'inherit' }}>
                <div style={{ background:'#fff', border:'1px solid #eee', borderRadius:'12px', overflow:'hidden', cursor:'pointer' }}>
                  <div style={{ height:'120px', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'36px', background:'#f5f5f5', overflow:'hidden' }}>
                    {listing.image_url
                      ? <img src={listing.image_url} alt={listing.title} style={{ width:'100%', height:'100%', objectFit:'cover' }} />
                      : '📦'
                    }
                  </div>
                  <div style={{ padding:'10px 12px' }}>
                    <div style={{ fontSize:'13px', marginBottom:'4px', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{listing.title}</div>
                    <div style={{ fontSize:'15px', fontWeight:'600', color:'#185FA5' }}>{listing.price?.toLocaleString()} RSD</div>
                    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginTop:'6px' }}>
                      <span style={{ fontSize:'11px', color:'#999' }}>{listing.city}</span>
                      <span style={{ fontSize:'10px', background:'#EAF3DE', color:'#3B6D11', borderRadius:'4px', padding:'2px 6px' }}>{t.verified}</span>
                    </div>
                  </div>
                </div>
              </a>
            ))
          )}
        </div>
      </div>

      {/* Footer */}
      <div style={{ background:'#f0f0f0', borderTop:'1px solid #e5e5e5', padding:'16px 24px', display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:'8px' }}>
        <span style={{ fontSize:'12px', color:'#999' }}>© 2025 Povoljno24.rs</span>
        <div style={{ display:'flex', gap:'16px' }}>
          {[t.about, t.help, t.terms, t.contact].map(link => (
            <a key={link} href="#" style={{ fontSize:'12px', color:'#555' }}>{link}</a>
          ))}
        </div>
      </div>
    </div>
  );
}