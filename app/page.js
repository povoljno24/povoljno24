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
    scooter: 'Električni trotinet',
    sofa: 'Ugaona garnitura',
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
    scooter: 'Electric scooter',
    sofa: 'Corner sofa set',
  },
};

export default function Home() {
  const [lang, setLang] = useState('sr');
  const [user, setUser] = useState(null);
  const t = translations[lang];

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => setUser(user));
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
          <select style={{ border:'none', outline:'none', padding:'12px 14px', fontSize:'13px', color:'#555', background:'#f5f5f5', borderRight:'1px solid #eee' }}>
            <option>{t.allCats}</option>
            <option>{t.electronics}</option>
            <option>{t.cars}</option>
            <option>{t.realestate}</option>
            <option>{t.fashion}</option>
          </select>
          <input type="text" placeholder={t.searchPlaceholder} style={{ flex:1, border:'none', outline:'none', padding:'12px 16px', fontSize:'14px' }} />
          <button style={{ background:'#185FA5', color:'#fff', border:'none', padding:'12px 20px', fontSize:'13px', cursor:'pointer' }}>{t.search}</button>
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
            { icon:'📱', name: t.electronics },
            { icon:'🚗', name: t.cars },
            { icon:'🏠', name: t.realestate },
            { icon:'👗', name: t.fashion },
            { icon:'🛋️', name: t.furniture },
            { icon:'🎮', name: t.gaming },
            { icon:'🔧', name: t.tools },
            { icon:'📚', name: t.books },
          ].map(cat => (
            <div key={cat.name} style={{ background:'#f9f9f9', border:'1px solid #eee', borderRadius:'12px', padding:'16px 12px', textAlign:'center', cursor:'pointer' }}>
              <div style={{ fontSize:'22px', marginBottom:'6px' }}>{cat.icon}</div>
              <div style={{ fontSize:'12px', color:'#555' }}>{cat.name}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Listings */}
      <div style={{ padding:'8px 24px 32px', background:'#f5f5f5' }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'16px' }}>
          <h2 style={{ fontSize:'16px', fontWeight:'600' }}>{t.newListings}</h2>
          <a href="#" style={{ fontSize:'13px', color:'#185FA5' }}>{t.viewAll}</a>
        </div>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(155px, 1fr))', gap:'12px' }}>
          {[
            { icon:'📱', title:'iPhone 14 Pro, 256GB', price:'82.000 RSD', city:'Beograd' },
            { icon:'🚲', title: t.scooter, price:'24.500 RSD', city:'Novi Sad' },
            { icon:'🛋️', title: t.sofa, price:'38.000 RSD', city:'Niš' },
            { icon:'💻', title:'MacBook Air M2', price:'115.000 RSD', city:'Kragujevac' },
          ].map(listing => (
            <div key={listing.title} style={{ background:'#fff', border:'1px solid #eee', borderRadius:'12px', overflow:'hidden', cursor:'pointer' }}>
              <div style={{ height:'120px', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'36px', background:'#f5f5f5' }}>{listing.icon}</div>
              <div style={{ padding:'10px 12px' }}>
                <div style={{ fontSize:'13px', marginBottom:'4px', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{listing.title}</div>
                <div style={{ fontSize:'15px', fontWeight:'600', color:'#185FA5' }}>{listing.price}</div>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginTop:'6px' }}>
                  <span style={{ fontSize:'11px', color:'#999' }}>{listing.city}</span>
                  <span style={{ fontSize:'10px', background:'#EAF3DE', color:'#3B6D11', borderRadius:'4px', padding:'2px 6px' }}>{t.verified}</span>
                </div>
              </div>
            </div>
          ))}
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