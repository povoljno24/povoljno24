'use client';
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import Link from 'next/link';
import Image from 'next/image';
import { useLanguage } from '../components/LanguageContext';

import dynamic from 'next/dynamic';

const AdvancedFilters = dynamic(() => import('../components/AdvancedFilters'), { ssr: false });



const cities = [
  'Beograd', 'Novi Sad', 'Niš', 'Kragujevac', 'Priština', 'Subotica', 'Zrenjanin', 'Pančevo', 'Čačak', 'Kruševac', 'Kraljevo', 'Novi Pazar', 'Smederevo', 'Leskovac', 'Užice', 'Vranje', 'Valjevo', 'Šabac', 'Sombor', 'Požarevac', 'Pirot', 'Zaječar', 'Kikinda', 'Sremska Mitrovica', 'Jagodina', 'Vršac', 'Bor', 'Prokuplje', 'Loznica'
].sort();

export default function Home() {
  const { lang, t } = useLanguage();
  const [listings, setListings] = useState([]);
  
  // Basic search & filter states
  const [search, setSearch] = useState('');
  const [filterCat, setFilterCat] = useState('');
  
  // Advanced filter states
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [filterCity, setFilterCity] = useState('');
  const [filterCondition, setFilterCondition] = useState('');
  const [filterPhoto, setFilterPhoto] = useState(false);
  const [filterVerified, setFilterVerified] = useState(false);
  const [sortBy, setSortBy] = useState('newest');
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Pagination & Loading states
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(true);
  
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [moreLoading, setMoreLoading] = useState(false);
  
  const ITEMS_PER_PAGE = 20;


  const categories = [
    { name: t.electronics, value: 'elektronika' },
    { name: t.cars, value: 'automobili' },
    { name: t.realestate, value: 'nekretnine' },
    { name: t.fashion, value: 'moda' },
    { name: t.furniture, value: 'namestaj' },
    { name: t.gaming, value: 'gaming' },
    { name: t.tools, value: 'alati' },
    { name: t.books, value: 'knjige' },
    { name: t.services, value: 'usluge' },
    { name: t.jobs, value: 'posao' },
    { name: t.sports, value: 'sport' },
    { name: t.pets, value: 'kucni_ljubimci' },
    { name: t.kids, value: 'deca' },
    { name: t.music, value: 'muzika' },
    { name: t.agriculture, value: 'poljoprivreda' },
    { name: t.art, value: 'umetnost' },
    { name: t.other, value: 'ostalo' },
  ];

  async function loadListings(searchTerm, category, minP, maxP, city, condition, sortParams, photoOnly = false, verifiedOnly = false, pageNum = 0, append = false) {
    if (!append) setLoading(true);
    else setMoreLoading(true);
    
    let query = supabase
      .from('listings')
      .select('id, title, price, city, category, image_url, created_at, user_id, status', { count: 'exact' })
      .eq('status', 'active');
      
    // Apply filters
    if (searchTerm) query = query.ilike('title', `%${searchTerm}%`);
    if (category) query = query.eq('category', category);
    if (minP) query = query.gte('price', parseInt(minP));
    if (maxP) query = query.lte('price', parseInt(maxP));
    if (city) query = query.eq('city', city);
    if (condition) query = query.eq('condition', condition);
    if (photoOnly) query = query.not('image_url', 'is', null);
    if (verifiedOnly) query = query.eq('is_verified', true);
    
    // Apply sorting
    if (sortParams === 'price_asc') {
      query = query.order('price', { ascending: true });
    } else if (sortParams === 'price_desc') {
      query = query.order('price', { ascending: false });
    } else {
      // default: newest
      query = query.order('created_at', { ascending: false });
    }
    
    // Apply pagination
    query = query.range(pageNum * ITEMS_PER_PAGE, (pageNum + 1) * ITEMS_PER_PAGE - 1);
    
    const { data, count } = await query;
    
    if (append) {
      setListings(prev => [...prev, ...(data || [])]);
    } else {
      setListings(data || []);
    }
    
    setHasMore(count ? (pageNum + 1) * ITEMS_PER_PAGE < count : false);
    setPage(pageNum);
    setLoading(false);
    setMoreLoading(false);
  }

  useEffect(() => {
    loadListings('', '', '', '', '', '', 'newest', 0, false);
  }, []);

  // Update suggestions based on input
  useEffect(() => {
    if (search.length > 0) {
      const filtered = categories.filter(c => 
        c.name.toLowerCase().includes(search.toLowerCase())
      );
      setSuggestions(filtered);
    } else {
      setSuggestions([]);
    }
  }, [search]);

  const handleSearch = () => {
    setShowSuggestions(false);
    loadListings(search, filterCat, minPrice, maxPrice, filterCity, filterCondition, sortBy, filterPhoto, filterVerified, 0, false);
  };

  const clearFilters = () => {
    setFilterCat('');
    setSearch('');
    setMinPrice('');
    setMaxPrice('');
    setFilterCity('');
    setFilterCondition('');
    setFilterPhoto(false);
    setFilterVerified(false);
    setSortBy('newest');
    loadListings('', '', '', '', '', '', 'newest', false, false, 0, false);
  };

  return (
    <div className="bg-transparent min-h-screen">
      {/* Hero: Editorial Style */}
      <section className="pt-32 pb-24 px-6 text-center relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#185FA5]/10 rounded-full blur-[120px] pointer-events-none hero-blur" />
        <h1 className="text-5xl md:text-7xl font-black text-white mb-6 tracking-tight leading-[1.1] max-w-[900px] mx-auto uppercase">
          {t.hero}
        </h1>
        <p className="text-[14px] md:text-[16px] text-white/30 mb-12 max-w-[600px] mx-auto font-black uppercase tracking-[0.4em] leading-relaxed">
          {t.heroSub}
        </p>
        
        <div className="max-w-[850px] mx-auto relative group">
          {/* Main Search Bar: Floating Island */}
          <div className="flex bg-[#0A0A0A]/60 backdrop-blur-3xl rounded-[2.5rem] border border-white/10 overflow-hidden shadow-[0_32px_64px_rgba(0,0,0,0.6)] relative z-20 transition-all duration-500 group-focus-within:border-white/40 group-focus-within:bg-[#0A0A0A]/80">
            <select 
              value={filterCat} 
              onChange={e => setFilterCat(e.target.value)} 
              className="border-none outline-none py-6 px-8 text-[11px] font-black uppercase tracking-widest text-white/40 bg-transparent border-r border-white/10 cursor-pointer hidden sm:block max-w-[200px] hover:text-white transition-colors"
            >
              <option value="" className="bg-[#050505]">{t.allCats}</option>
              {categories.map(c => (
                <option key={c.value} value={c.value} className="bg-[#050505]">{c.name}</option>
              ))}
            </select>
            <input 
              type="text" 
              value={search} 
              onChange={e => setSearch(e.target.value)} 
              onFocus={() => setShowSuggestions(true)}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
              onKeyDown={e => e.key === 'Enter' && handleSearch()} 
              placeholder={t.searchPlaceholder} 
              className="flex-1 border-none outline-none py-6 px-8 text-[16px] text-white placeholder:text-white/10 w-full bg-transparent font-medium" 
            />
            <button 
              onClick={handleSearch} 
              className="bg-white text-black hover:bg-[#185FA5] hover:text-white transition-all border-none py-6 px-12 text-[11px] font-black uppercase tracking-[0.3em] cursor-pointer shrink-0"
            >
              {t.search}
            </button>
          </div>

          {/* Search Suggestions Dropdown */}
          {showSuggestions && (search.length > 0 || suggestions.length > 0) && (
            <div className="absolute top-[84px] left-0 right-0 bg-[#0A0A0A]/95 backdrop-blur-3xl border border-white/10 rounded-[2.5rem] shadow-[0_40px_80px_rgba(0,0,0,0.8)] z-50 text-left overflow-hidden animate-in fade-in slide-in-from-top-2 duration-300">
              {suggestions.length > 0 && (
                <div className="p-6 border-b border-white/5">
                  <div className="text-[10px] font-black text-white/20 uppercase tracking-[0.4em] px-4 py-3">{t.suggestionsCategories}</div>
                  {suggestions.map(s => (
                    <button 
                      key={s.value}
                      onClick={() => {
                        setFilterCat(s.value);
                        setSearch('');
                        loadListings('', s.value, minPrice, maxPrice, filterCity, filterCondition, sortBy, filterPhoto, filterVerified, 0, false);
                      }}
                      className="w-full text-left px-6 py-4 text-[14px] hover:bg-white/[0.05] rounded-2xl flex items-center gap-4 transition-all group"
                    >
                      <span className="opacity-20 group-hover:opacity-100 transition-all text-lg">📁</span>
                      <span className="text-white/40 group-hover:text-white transition-colors font-black uppercase tracking-widest">{s.name}</span>
                    </button>
                  ))}
                </div>
              )}
              <div className="p-6">
                <div className="text-[10px] font-black text-white/20 uppercase tracking-[0.4em] px-4 py-3">{t.suggestionsSearch}</div>
                <button 
                  onClick={handleSearch}
                  className="w-full text-left px-6 py-4 text-[14px] hover:bg-white/[0.05] rounded-2xl flex items-center gap-4 transition-all group"
                >
                  <span className="opacity-20 group-hover:opacity-100 transition-all text-lg">🔍</span>
                  <span className="text-white/40 group-hover:text-white transition-colors font-black uppercase tracking-widest">{t.suggestionsSearchFor} &quot;{search}&quot;</span>
                </button>
              </div>
            </div>
          )}

          {/* Advanced Filters Trigger */}
          <button 
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="mt-8 text-[10px] font-black text-white/20 hover:text-white uppercase tracking-[0.4em] transition-all flex items-center gap-3 mx-auto"
          >
            <span className="w-8 h-[1px] bg-white/10"></span>
            {showAdvanced ? 'Zatvori filtere' : 'Napredni filteri'}
            <span className="w-8 h-[1px] bg-white/10"></span>
          </button>

          {showAdvanced && (
            <div className="mt-8 animate-in slide-in-from-top-4 duration-500">
              <AdvancedFilters 
                t={t}
                setShowAdvanced={setShowAdvanced}
                minPrice={minPrice}
                setMinPrice={setMinPrice}
                maxPrice={maxPrice}
                setMaxPrice={setMaxPrice}
                sortBy={sortBy}
                setSortBy={setSortBy}
                filterCity={filterCity}
                setFilterCity={setFilterCity}
                filterCondition={filterCondition}
                setFilterCondition={setFilterCondition}
                filterPhoto={filterPhoto}
                setFilterPhoto={setFilterPhoto}
                filterVerified={filterVerified}
                setFilterVerified={setFilterVerified}
                handleSearch={handleSearch}
                clearFilters={clearFilters}
                cities={cities}
              />
            </div>
          )}
        </div>
        
        <div className="flex justify-center gap-12 mt-16 flex-wrap">
          {[t.trust1, t.trust2, t.trust3, t.trust4].map(item => (
            <div key={item} className="flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.3em] text-white/60">
              <div className="w-1.5 h-1.5 rounded-full bg-[#185FA5] shadow-[0_0_15px_#185FA5]"></div>
              {item}
            </div>
          ))}
        </div>
      </section>

      {/* Categories: Minimalist pill Bar */}
      <section className="py-20 px-6 bg-transparent overflow-hidden">
        <div className="flex flex-wrap justify-center gap-4 max-w-[1200px] mx-auto">
          {categories.map(cat => {
            const isSelected = filterCat === cat.value;
            return (
              <button 
                key={cat.value} 
                onClick={() => { 
                  const nextCat = isSelected ? '' : cat.value;
                  setFilterCat(nextCat); 
                  loadListings(search, nextCat, minPrice, maxPrice, filterCity, filterCondition, sortBy, filterPhoto, filterVerified, 0, false); 
                }} 
                className={`rounded-full py-4 px-8 text-[10px] font-black uppercase tracking-[0.2em] cursor-pointer transition-all border outline-none shadow-2xl ${
                  isSelected 
                    ? 'bg-white text-black border-white shadow-[0_0_40px_rgba(255,255,255,0.2)] scale-110 z-10' 
                    : 'bg-white/[0.03] text-white/40 border-white/5 hover:border-white/20 hover:text-white hover:bg-white/[0.06] active:scale-95'
                }`}
              >
                {cat.name}
              </button>
            );
          })}
        </div>
      </section>

      {/* Listings: Vantablack Glass Grid */}
      <section className="pb-32 px-6 max-w-[1400px] mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 px-4 gap-6">
          <div>
            <div className="text-[11px] font-black text-[#185FA5] uppercase tracking-[0.4em] mb-4">{t.listings}</div>
            <h2 className="text-4xl font-black text-white uppercase tracking-tight">{t.newListings}</h2>
          </div>
          {(filterCat || search || minPrice || maxPrice || filterCity || filterCondition || filterPhoto || filterVerified || sortBy !== 'newest') && (
            <button 
              onClick={clearFilters} 
              className="text-[10px] font-black text-white/20 hover:text-red-500 uppercase tracking-[0.3em] bg-white/[0.03] border border-white/5 px-8 py-3 rounded-full cursor-pointer flex items-center gap-3 transition-all hover:border-red-500/20"
            >
              <span className="text-lg">×</span> {t.removeFilters}
            </button>
          )}
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {loading ? (
            Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="bg-[#0A0A0A]/40 backdrop-blur-3xl rounded-[3rem] border border-white/5 h-[400px] animate-pulse" />
            ))
          ) : listings.length === 0 ? (
            <div className="col-span-full py-48 text-center bg-[#0A0A0A]/40 backdrop-blur-3xl rounded-[4rem] border border-white/10 shadow-2xl relative overflow-hidden">
               <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-white/[0.02] rounded-full blur-[100px] pointer-events-none" />
              <div className="text-7xl mb-10 opacity-10 grayscale">🔍</div>
              <p className="text-2xl font-black text-white uppercase tracking-tight mb-4">{t.noResults}</p>
              <p className="text-[13px] text-white/20 font-black uppercase tracking-widest mb-12 max-w-[400px] mx-auto">{t.noResultsSub}</p>
              <button 
                onClick={clearFilters}
                className="px-12 py-5 bg-white text-black hover:bg-[#185FA5] hover:text-white rounded-full text-[11px] font-black uppercase tracking-[0.3em] transition-all shadow-2xl active:scale-95"
              >
                {t.showAll}
              </button>
            </div>
          ) : (
            listings.map((listing, index) => (
              <Link key={listing.id} href={`/oglas/${listing.id}`} className="block group">
                <div className="bg-[#0A0A0A]/60 backdrop-blur-3xl border border-white/10 rounded-[2.5rem] overflow-hidden transition-all duration-700 hover:border-white/20 hover:bg-[#0A0A0A]/80 hover:scale-[1.02] hover:-translate-y-2 shadow-[0_32px_64px_rgba(0,0,0,0.6)] flex flex-col h-full relative">
                  
                  {/* Image Container */}
                  <div className="h-[260px] bg-[#050505] relative flex items-center justify-center overflow-hidden shrink-0 border-b border-white/5">
                    {listing.image_url ? (
                      <>
                        <div 
                          className="absolute inset-0 blur-3xl opacity-20 scale-125 pointer-events-none transition-all duration-1000 group-hover:scale-150"
                          style={{ backgroundImage: `url(${listing.image_url})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
                        />
                        <Image 
                          src={listing.image_url} 
                          alt={listing.title} 
                          fill 
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 300px"
                          priority={index < 4}
                          className="object-contain relative z-10 transition-transform duration-700 pointer-events-none group-hover:scale-105" 
                          draggable={false}
                        />
                        <div className="absolute inset-0 z-20 bg-transparent" />
                      </>
                    ) : (
                      <span className="opacity-10 text-5xl grayscale">📦</span>
                    )}
                  </div>

                  <div className="p-8 flex flex-col flex-1">
                    <div className="text-[10px] font-black text-[#185FA5] uppercase tracking-[0.3em] mb-4">🏷️ {t[`db_${listing.category}`] || listing.category}</div>
                    <div className="text-xl font-black text-white mb-4 line-clamp-2 leading-tight tracking-tight uppercase group-hover:text-[#185FA5] transition-colors">
                      {listing.title}
                    </div>
                    <div className="text-3xl font-black text-white mt-auto pt-8 flex items-baseline gap-2">
                      {listing.price?.toLocaleString()} <span className="text-[11px] text-white/20 uppercase tracking-widest font-bold">RSD</span>
                    </div>
                    <div className="text-[10px] font-black text-white/20 mt-6 pt-6 border-t border-white/5 flex items-center justify-between uppercase tracking-[0.2em]">
                      <span className="flex items-center gap-2">📍 {listing.city}</span>
                      <span className="w-1.5 h-1.5 rounded-full bg-white/10 group-hover:bg-[#185FA5] transition-colors"></span>
                    </div>
                  </div>
                </div>
              </Link>
            ))
          )}
        </div>
        
        {hasMore && !loading && listings.length > 0 && (
          <div className="flex justify-center mt-24">
            <button 
              onClick={() => loadListings(search, filterCat, minPrice, maxPrice, filterCity, filterCondition, sortBy, filterPhoto, filterVerified, page + 1, true)}
              disabled={moreLoading}
              className="bg-white text-black hover:bg-[#185FA5] hover:text-white px-16 py-5 rounded-full font-black uppercase tracking-[0.4em] text-[11px] shadow-[0_30px_60px_rgba(255,255,255,0.1)] transition-all duration-700 active:scale-95 flex items-center gap-4 disabled:opacity-50"
            >
              {moreLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-gray-300 border-t-black rounded-full animate-spin"></div>
                  {t.loading}
                </>
              ) : (
                t.loadMore
              )}
            </button>
          </div>
        )}
      </section>
    </div>
  );
}