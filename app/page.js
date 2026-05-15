'use client';
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import Link from 'next/link';
import Image from 'next/image';
import dynamic from 'next/dynamic';
import { useLanguage } from '../components/LanguageContext';

const AdvancedFilters = dynamic(() => import('../components/AdvancedFilters'), {
  ssr: false,
});



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
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadListings('', '', '', '', '', '', 'newest', 0, false);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Update suggestions based on input
  useEffect(() => {
    if (search.length > 0) {
      const filtered = categories.filter(c => 
        c.name.toLowerCase().includes(search.toLowerCase())
      );
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSuggestions(filtered);
    } else {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSuggestions([]);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
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
    <div>
      {/* Hero: Editorial Style */}
      <section className="pt-32 pb-24 px-6 text-center relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#185FA5]/10 rounded-full blur-[120px] pointer-events-none" />
        <h1 className="text-5xl md:text-7xl font-black text-white mb-6 tracking-tight leading-[1.1] max-w-[900px] mx-auto">
          {t.hero}
        </h1>
        <p className="text-[16px] md:text-[18px] text-white/50 mb-12 max-w-[600px] mx-auto font-medium leading-relaxed">
          {t.heroSub}
        </p>
        
        <div className="max-w-[800px] mx-auto relative group">
          {/* Main Search Bar: Floating Island */}
          <div className="flex bg-white/[0.03] backdrop-blur-3xl rounded-full border border-white/10 overflow-hidden shadow-[0_32px_64px_rgba(0,0,0,0.4)] relative z-20 transition-all duration-500 group-focus-within:border-white/20 group-focus-within:bg-white/[0.05]">
            <select 
              value={filterCat} 
              onChange={e => setFilterCat(e.target.value)} 
              className="border-none outline-none py-4 px-6 text-[13px] font-bold uppercase tracking-widest text-white/60 bg-transparent border-r border-white/10 cursor-pointer hidden sm:block max-w-[180px] hover:text-white transition-colors"
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
              className="flex-1 border-none outline-none py-4 px-6 text-[15px] text-white placeholder:text-white/20 w-full bg-transparent" 
            />
            <button 
              onClick={handleSearch} 
              className="bg-white text-black hover:bg-[#185FA5] hover:text-white transition-all border-none py-4 px-8 text-[13px] font-black uppercase tracking-widest cursor-pointer shrink-0"
            >
              {t.search}
            </button>
          </div>

          {/* Search Suggestions Dropdown */}
          {showSuggestions && (search.length > 0 || suggestions.length > 0) && (
            <div className="absolute top-[64px] left-0 right-0 bg-[#0A0A0A]/95 backdrop-blur-3xl border border-white/10 rounded-2xl shadow-[0_40px_80px_rgba(0,0,0,0.7)] z-50 text-left overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
              {suggestions.length > 0 && (
                <div className="p-3 border-b border-white/5">
                  <div className="text-[10px] font-black text-white/20 uppercase tracking-[0.3em] px-4 py-2">{t.suggestionsCategories}</div>
                  {suggestions.map(s => (
                    <button 
                      key={s.value}
                      onClick={() => {
                        setFilterCat(s.value);
                        setSearch('');
                        loadListings('', s.value, minPrice, maxPrice, filterCity, filterCondition, sortBy, filterPhoto, filterVerified, 0, false);
                      }}
                      className="w-full text-left px-4 py-3 text-[13px] hover:bg-white/[0.05] rounded-xl flex items-center gap-3 transition-all group"
                    >
                      <span className="opacity-40 group-hover:opacity-100 transition-opacity">📁</span>
                      <span className="text-white/60 group-hover:text-white transition-colors">{s.name}</span>
                    </button>
                  ))}
                </div>
              )}
              <div className="p-3">
                <div className="text-[10px] font-black text-white/20 uppercase tracking-[0.3em] px-4 py-2">{t.suggestionsSearch}</div>
                <button 
                  onClick={handleSearch}
                  className="w-full text-left px-4 py-3 text-[13px] hover:bg-white/[0.05] rounded-xl flex items-center gap-3 transition-all group"
                >
                  <span className="opacity-40 group-hover:opacity-100 transition-opacity">🔍</span>
                  <span className="text-white/60 group-hover:text-white transition-colors font-bold">{t.suggestionsSearchFor} &quot;{search}&quot;</span>
                </button>
              </div>
            </div>
          )}



          {/* Advanced Filters Panel - Full screen on mobile, dropdown on desktop */}
          {showAdvanced && (
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
          )}
        </div>
        
        <div className="flex justify-center gap-12 mt-12 flex-wrap">
          {[t.trust1, t.trust2, t.trust3, t.trust4].map(item => (
            <div key={item} className="flex items-center gap-3 text-[11px] font-black uppercase tracking-[0.2em] text-white/40">
              <div className="w-1.5 h-1.5 rounded-full bg-[#185FA5] shadow-[0_0_10px_#185FA5]"></div>
              {item}
            </div>
          ))}
        </div>
      </section>

      {/* Categories: Minimalist Pill Bar */}
      <section className="py-20 px-6 bg-transparent">
        <div className="flex flex-wrap justify-center gap-3 max-w-[1200px] mx-auto">
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
                className={`rounded-full py-3 px-6 text-[11px] font-black uppercase tracking-widest cursor-pointer transition-all border outline-none ${
                  isSelected 
                    ? 'bg-white text-black border-white shadow-[0_0_30px_rgba(255,255,255,0.2)]' 
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
        <div className="flex justify-between items-end mb-12 px-2">
          <div>
            <div className="text-[11px] font-black text-[#185FA5] uppercase tracking-[0.3em] mb-2">{t.listings}</div>
            <h2 className="text-3xl font-black text-white">{t.newListings}</h2>
          </div>
          {(filterCat || search || minPrice || maxPrice || filterCity || filterCondition || filterPhoto || filterVerified || sortBy !== 'newest') && (
            <button 
              onClick={clearFilters} 
              className="text-[12px] font-bold text-white/40 hover:text-white uppercase tracking-widest bg-transparent border-none cursor-pointer flex items-center gap-2 transition-colors"
            >
              <span>×</span> {t.removeFilters}
            </button>
          )}
        </div>
        
        <div className="grid grid-cols-[repeat(auto-fit,minmax(155px,1fr))] sm:grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-4">
          {loading ? (
            Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="p-[1px] bg-white/5 rounded-[2.5rem] animate-pulse">
                <div className="bg-[#0A0A0A] rounded-[calc(2.5rem-1px)] h-[320px] w-full" />
              </div>
            ))
          ) : listings.length === 0 ? (
            <div className="col-span-full py-40 text-center bg-white/[0.02] rounded-[3rem] border border-white/5 shadow-inner">
              <div className="text-6xl mb-8 opacity-10">🔍</div>
              <p className="text-white font-black uppercase tracking-[0.3em] text-[14px] mb-4">{t.noResults}</p>
              <p className="text-white/40 font-medium mb-10 max-w-[300px] mx-auto text-sm">{t.noResultsSub}</p>
              <button 
                onClick={clearFilters}
                className="px-10 py-4 bg-white text-black hover:bg-[#185FA5] hover:text-white rounded-full text-[12px] font-black uppercase tracking-widest transition-all shadow-[0_20px_40px_rgba(255,255,255,0.05)] active:scale-95"
              >
                {t.showAll}
              </button>
            </div>
          ) : (
            listings.map((listing, index) => (
              <Link key={listing.id} href={`/oglas/${listing.id}`} className="block group h-full">
                {/* Vantablack Double-Bezel Architecture */}
                <div className="p-[1px] bg-white/10 rounded-[2.5rem] transition-all duration-700 hover:scale-[1.02] group h-full">
                  <div className="p-2 bg-[#050505] rounded-[calc(2.5rem-1px)] overflow-hidden flex flex-col h-full shadow-[0_30px_60px_rgba(0,0,0,0.5)] border border-white/5">
                    <div className="bg-[#0A0A0A] rounded-[2rem] overflow-hidden flex flex-col h-full transition-colors group-hover:bg-[#0D0D0D]">
                  <div 
                    className="h-[160px] bg-gray-900 relative flex items-center justify-center overflow-hidden shrink-0 border-b border-gray-100 select-none"
                    onContextMenu={(e) => e.preventDefault()}
                  >
                    {listing.image_url ? (
                      <>
                        {/* Blurred background */}
                        <div 
                          className="absolute inset-0 blur-md opacity-40 scale-110 pointer-events-none"
                          style={{ backgroundImage: `url(${listing.image_url})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
                        />
                        <Image 
                          src={listing.image_url} 
                          alt={listing.title} 
                          fill 
                          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 250px"
                          priority={index < 6}
                          quality={70}
                          fetchPriority={index < 2 ? "high" : "auto"}
                          className="object-contain relative z-10 group-hover:scale-105 transition-transform duration-500 pointer-events-none" 
                          draggable={false}
                        />
                        {/* Invisible protection layer */}
                        <div className="absolute inset-0 z-20 bg-transparent" />
                      </>
                    ) : (
                      <span className="opacity-40 text-3xl">📦</span>
                    )}
                  </div>
                    <div className="p-6 flex flex-col flex-1">
                      <div className="text-[11px] font-black text-[#185FA5] uppercase tracking-[0.2em] mb-3">{listing.category}</div>
                      <div className="text-[18px] font-bold text-white mb-2 line-clamp-2 leading-snug transition-colors group-hover:text-[#185FA5]">{listing.title}</div>
                      <div className="flex items-center justify-between mt-auto pt-4">
                        <div className="text-[20px] font-black text-white">{listing.price?.toLocaleString()} <span className="text-[12px] text-white/30 font-bold ml-1">RSD</span></div>
                      </div>
                      <div className="flex justify-between items-center mt-4 pt-4 border-t border-white/5">
                        <span className="text-[11px] font-bold text-white/30 uppercase tracking-widest flex items-center gap-2">
                          <span className="w-1 h-1 rounded-full bg-white/20"></span> {listing.city}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>

            ))
          )}
        </div>
        
        {hasMore && !loading && listings.length > 0 && (
          <div className="flex justify-center mt-20">
            <button 
              onClick={() => loadListings(search, filterCat, minPrice, maxPrice, filterCity, filterCondition, sortBy, filterPhoto, filterVerified, page + 1, true)}
              disabled={moreLoading}
              className="bg-white text-black hover:bg-[#185FA5] hover:text-white px-12 py-4 rounded-full font-black uppercase tracking-widest text-[12px] shadow-[0_20px_40px_rgba(255,255,255,0.1)] transition-all duration-500 active:scale-95 flex items-center gap-3 disabled:opacity-50"
            >
              {moreLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-gray-300 border-t-[#185FA5] rounded-full animate-spin"></div>
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