'use client';
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import Link from 'next/link';
import Image from 'next/image';

const translations = {
  sr: {
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
    verified: 'Proveren',
    minPrice: 'Min Cena',
    maxPrice: 'Max Cena',
    sortBy: 'Sortiraj po',
    sortNewest: 'Najnovije',
    sortPriceAsc: 'Najjeftinije',
    sortPriceDesc: 'Najskuplje',
    advancedFilters: 'Napredni filteri',
    applyFilters: 'Primeni filtere',
  },
  en: {
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
    verified: 'Verified',
    minPrice: 'Min Price',
    maxPrice: 'Max Price',
    sortBy: 'Sort by',
    sortNewest: 'Newest',
    sortPriceAsc: 'Cheapest',
    sortPriceDesc: 'Most expensive',
    advancedFilters: 'Advanced filters',
    applyFilters: 'Apply filters',
  },
};

export default function Home() {
  const [lang, setLang] = useState('sr');
  const [listings, setListings] = useState([]);
  
  // Basic search & filter states
  const [search, setSearch] = useState('');
  const [filterCat, setFilterCat] = useState('');
  
  // Advanced filter states
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
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
  const t = translations[lang];

  const categories = [
    { name: t.electronics, value: 'elektronika' },
    { name: t.cars, value: 'automobili' },
    { name: t.realestate, value: 'nekretnine' },
    { name: t.fashion, value: 'moda' },
    { name: t.furniture, value: 'namestaj' },
    { name: t.gaming, value: 'gaming' },
    { icon: '🔧', name: t.tools, value: 'alati' },
    { name: t.books, value: 'knjige' },
  ];

  async function loadListings(searchTerm, category, minP, maxP, sortParams, pageNum = 0, append = false) {
    if (!append) setLoading(true);
    else setMoreLoading(true);
    
    let query = supabase
      .from('listings')
      .select('*', { count: 'exact' });
      
    // Apply filters
    if (searchTerm) query = query.ilike('title', `%${searchTerm}%`);
    if (category) query = query.eq('category', category);
    if (minP && !isNaN(minP)) query = query.gte('price', parseFloat(minP));
    if (maxP && !isNaN(maxP)) query = query.lte('price', parseFloat(maxP));
    
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
    loadListings('', '', '', '', 'newest', 0, false);
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
    loadListings(search, filterCat, minPrice, maxPrice, sortBy, 0, false);
  };

  const clearFilters = () => {
    setFilterCat('');
    setSearch('');
    setMinPrice('');
    setMaxPrice('');
    setSortBy('newest');
    loadListings('', '', '', '', 'newest', 0, false);
  };

  return (
    <div>
      {/* Hero */}
      <section className="bg-[#E6F1FB] pt-12 pb-10 px-6 text-center">
        <h1 className="text-3xl font-semibold text-[#0C447C] mb-2">{t.hero}</h1>
        <p className="text-[15px] text-[#185FA5] mb-6">{t.heroSub}</p>
        
        <div className="max-w-[700px] mx-auto relative">
          {/* Main Search Bar */}
          <div className="flex bg-white rounded-xl border border-gray-300 overflow-hidden shadow-sm relative z-20">
            <select 
              value={filterCat} 
              onChange={e => setFilterCat(e.target.value)} 
              className="border-none outline-none py-3 px-4 text-[13px] text-gray-600 bg-gray-50 border-r border-gray-200 cursor-pointer hidden sm:block"
            >
              <option value="">{t.allCats}</option>
              {categories.map(c => (
                <option key={c.value} value={c.value}>{c.name}</option>
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
              className="flex-1 border-none outline-none py-3 px-4 text-sm w-full" 
            />
            <button 
              onClick={handleSearch} 
              className="bg-[#185FA5] hover:bg-[#0C447C] text-white transition-colors border-none py-3 px-5 sm:px-8 text-[13px] sm:text-[14px] font-semibold cursor-pointer shrink-0"
            >
              {t.search}
            </button>
          </div>

          {/* Search Suggestions Dropdown */}
          {showSuggestions && (search.length > 0 || suggestions.length > 0) && (
            <div className="absolute top-[52px] left-0 right-0 bg-white border border-gray-200 rounded-xl shadow-xl z-50 text-left overflow-hidden animate-in fade-in slide-in-from-top-1 duration-150">
              {suggestions.length > 0 && (
                <div className="p-2 border-b border-gray-50">
                  <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-3 py-1">Kategorije</div>
                  {suggestions.map(s => (
                    <button 
                      key={s.value}
                      onClick={() => {
                        setFilterCat(s.value);
                        setSearch('');
                        loadListings('', s.value, minPrice, maxPrice, sortBy, 0, false);
                      }}
                      className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 rounded-lg flex items-center gap-2 transition-colors group"
                    >
                      <span className="opacity-60 group-hover:opacity-100">📁</span>
                      <span className="text-gray-700">{s.name}</span>
                    </button>
                  ))}
                </div>
              )}
              <div className="p-2">
                <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-3 py-1">Pretraga</div>
                <button 
                  onClick={handleSearch}
                  className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 rounded-lg flex items-center gap-2 transition-colors group"
                >
                  <span className="opacity-60 group-hover:opacity-100">🔍</span>
                  <span className="text-gray-700 font-medium">Traži "{search}"</span>
                </button>
              </div>
            </div>
          )}

          {/* Advanced Filters Toggle */}
          <div className="flex justify-end mt-2">
            <button 
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="text-[12px] font-medium text-[#185FA5] hover:underline bg-transparent border-none cursor-pointer flex items-center gap-1"
            >
              {showAdvanced ? '− ' : '+ '}{t.advancedFilters}
            </button>
          </div>

          {/* Advanced Filters Panel */}
          {showAdvanced && (
            <div className="bg-white rounded-xl border border-gray-200 p-4 mt-2 shadow-sm text-left grid grid-cols-1 sm:grid-cols-3 gap-4 animate-in slide-in-from-top-2 duration-200">
              <div>
                <label className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-1.5 block">{t.minPrice} (RSD)</label>
                <input 
                  type="number" 
                  value={minPrice} 
                  onChange={e => setMinPrice(e.target.value)} 
                  placeholder="0" 
                  className="w-full border border-gray-300 rounded-lg py-2 px-3 text-[13px] outline-none focus:border-[#185FA5] focus:ring-1 focus:ring-[#185FA5]"
                />
              </div>
              <div>
                <label className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-1.5 block">{t.maxPrice} (RSD)</label>
                <input 
                  type="number" 
                  value={maxPrice} 
                  onChange={e => setMaxPrice(e.target.value)} 
                  placeholder="100000" 
                  className="w-full border border-gray-300 rounded-lg py-2 px-3 text-[13px] outline-none focus:border-[#185FA5] focus:ring-1 focus:ring-[#185FA5]"
                />
              </div>
              <div>
                <label className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-1.5 block">{t.sortBy}</label>
                <select 
                  value={sortBy} 
                  onChange={e => setSortBy(e.target.value)} 
                  className="w-full border border-gray-300 rounded-lg py-2 px-3 text-[13px] outline-none focus:border-[#185FA5] focus:ring-1 focus:ring-[#185FA5] bg-white cursor-pointer"
                >
                  <option value="newest">{t.sortNewest}</option>
                  <option value="price_asc">{t.sortPriceAsc}</option>
                  <option value="price_desc">{t.sortPriceDesc}</option>
                </select>
              </div>
              <div className="col-span-1 sm:col-span-3 flex justify-end">
                <button 
                  onClick={handleSearch}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 px-5 rounded-lg text-[13px] font-semibold transition-colors border border-gray-200"
                >
                  {t.applyFilters}
                </button>
              </div>
            </div>
          )}
        </div>
        
        <div className="flex justify-center gap-7 mt-6 flex-wrap">
          {[t.trust1, t.trust2, t.trust3, t.trust4].map(item => (
            <div key={item} className="flex items-center gap-1.5 text-[12px] font-medium text-[#185FA5]">
              <div className="w-2 h-2 rounded-full bg-[#1D9E75]"></div>
              {item}
            </div>
          ))}
        </div>
      </section>

      {/* Categories */}
      <section className="py-8 px-6 bg-white">
        <h2 className="text-base font-semibold mb-4 text-gray-800 max-w-[1200px] mx-auto">{t.categories}</h2>
        <div className="grid grid-cols-[repeat(auto-fit,minmax(120px,1fr))] gap-3 max-w-[1200px] mx-auto">
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
            <div 
              key={cat.name} 
              onClick={() => { 
                setFilterCat(cat.value); 
                loadListings(search, cat.value, minPrice, maxPrice, sortBy, 0, false); 
              }} 
              className={`rounded-xl py-4 px-3 text-center cursor-pointer transition-all ${filterCat === cat.value ? 'bg-[#E6F1FB] border-[#185FA5] border shadow-sm' : 'bg-gray-50 border border-gray-100 hover:bg-gray-100 hover:border-gray-200'}`}
            >
              <div className="text-2xl mb-1.5">{cat.icon}</div>
              <div className={`text-[12px] font-medium ${filterCat === cat.value ? 'text-[#185FA5]' : 'text-gray-600'}`}>{cat.name}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Listings */}
      <section className="pt-2 pb-12 px-6 bg-transparent max-w-[1200px] mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-base font-semibold text-gray-800">{t.newListings}</h2>
          {(filterCat || search || minPrice || maxPrice || sortBy !== 'newest') && (
            <button 
              onClick={clearFilters} 
              className="text-[13px] font-medium text-[#E24B4A] hover:underline bg-transparent border-none cursor-pointer flex items-center gap-1"
            >
              <span>×</span> Ukloni sve filtere
            </button>
          )}
        </div>
        
        <div className="grid grid-cols-[repeat(auto-fit,minmax(155px,1fr))] sm:grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-4">
          {loading ? (
            Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="bg-white border border-gray-200 rounded-xl overflow-hidden flex flex-col h-[260px] animate-pulse">
                <div className="h-[140px] bg-gray-200 shrink-0"></div>
                <div className="p-3.5 flex flex-col flex-1 gap-3">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-5 bg-gray-200 rounded w-1/2 mt-auto"></div>
                  <div className="flex justify-between items-center mt-2">
                    <div className="h-3 bg-gray-200 rounded w-1/3"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                  </div>
                </div>
              </div>
            ))
          ) : listings.length === 0 ? (
            <div className="col-span-full py-16 text-center bg-white rounded-2xl border border-gray-100 shadow-sm">
              <div className="text-4xl mb-3 opacity-50">🔍</div>
              <p className="text-[15px] font-medium text-gray-800 mb-1">Nema rezultata</p>
              <p className="text-sm text-gray-500">Pokušajte da promenite filtere ili kriterijum pretrage.</p>
              <button 
                onClick={clearFilters}
                className="mt-4 px-6 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-[13px] font-medium transition-colors"
              >
                Prikaži sve oglase
              </button>
            </div>
          ) : (
            listings.map(listing => (
              <Link key={listing.id} href={`/oglas/${listing.id}`} className="block group h-full">
                <div className="bg-white border border-gray-200 rounded-xl overflow-hidden cursor-pointer hover:shadow-lg hover:border-[#185FA5] transition-all duration-300 flex flex-col h-full transform hover:-translate-y-1">
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
                  <div className="p-3.5 flex flex-col flex-1">
                    <div className="text-[14px] font-medium text-gray-800 mb-1 line-clamp-2 leading-snug group-hover:text-[#185FA5] transition-colors">{listing.title}</div>
                    <div className="text-[16px] font-bold text-[#185FA5] mt-auto pt-2">{listing.price?.toLocaleString()} RSD</div>
                    <div className="flex justify-between items-center mt-3 pt-3 border-t border-gray-50">
                      <span className="text-[11px] text-gray-500 truncate pr-2 flex items-center gap-1">
                        📍 {listing.city}
                      </span>
                      {listing.is_verified && (
                        <span className="text-[10px] font-semibold bg-[#EAF3DE] text-[#3B6D11] rounded px-1.5 py-0.5 whitespace-nowrap shrink-0 border border-[#d3ecc1]">
                          {t.verified}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </Link>
            ))
          )}
        </div>
        
        {hasMore && !loading && listings.length > 0 && (
          <div className="flex justify-center mt-10">
            <button 
              onClick={() => loadListings(search, filterCat, minPrice, maxPrice, sortBy, page + 1, true)}
              disabled={moreLoading}
              className={`bg-white border border-gray-300 text-gray-700 hover:bg-[#E6F1FB] hover:text-[#185FA5] hover:border-[#185FA5] px-8 py-3 rounded-xl font-semibold shadow-sm transition-all duration-300 cursor-pointer active:scale-95 flex items-center gap-2 ${moreLoading ? 'opacity-70' : ''}`}
            >
              {moreLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-gray-300 border-t-[#185FA5] rounded-full animate-spin"></div>
                  Učitavam...
                </>
              ) : (
                'Učitaj još oglasa'
              )}
            </button>
          </div>
        )}
      </section>
    </div>
  );
}