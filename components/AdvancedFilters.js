'use client';

export default function AdvancedFilters({ 
  t, 
  setShowAdvanced, 
  minPrice, setMinPrice, 
  maxPrice, setMaxPrice, 
  sortBy, setSortBy, 
  filterCity, setFilterCity, 
  filterCondition, setFilterCondition, 
  filterPhoto, setFilterPhoto,
  filterVerified, setFilterVerified,
  handleSearch, clearFilters, 
  cities 
}) {
  const inputClasses = "w-full px-5 py-4 rounded-2xl border border-white/5 bg-white/[0.03] text-white placeholder:text-white/10 outline-none focus:border-[#185FA5] focus:bg-white/10 transition-all text-[14px]";
  const labelClasses = "text-[10px] font-black text-white/40 uppercase tracking-[0.3em] block mb-3 ml-1";

  return (
    <div className="fixed inset-0 sm:relative sm:inset-auto z-[100] sm:z-10 bg-[#0A0A0A] sm:bg-[#0A0A0A]/80 sm:backdrop-blur-3xl sm:rounded-[2.5rem] sm:border border-white/10 p-8 sm:p-10 mt-0 sm:mt-8 shadow-2xl text-left flex flex-col sm:grid sm:grid-cols-3 gap-8 sm:gap-10 animate-in fade-in slide-in-from-bottom sm:slide-in-from-top-4 duration-500 overflow-y-auto">
      <div className="flex items-center justify-between sm:hidden mb-4">
        <h3 className="text-2xl font-black text-white uppercase tracking-tight">{t.advancedFilters}</h3>
        <button 
          onClick={() => setShowAdvanced(false)}
          className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center text-2xl text-white/40 hover:text-white transition-all border border-white/5"
        >
          ×
        </button>
      </div>
      
      <div>
        <label className={labelClasses}>{t.minPrice} (RSD)</label>
        <input 
          type="number" 
          value={minPrice} 
          onChange={e => setMinPrice(e.target.value)} 
          placeholder="0" 
          className={inputClasses}
        />
      </div>
      <div>
        <label className={labelClasses}>{t.maxPrice} (RSD)</label>
        <input 
          type="number" 
          value={maxPrice} 
          onChange={e => setMaxPrice(e.target.value)} 
          placeholder="100.000" 
          className={inputClasses}
        />
      </div>
      <div>
        <label className={labelClasses}>{t.sortBy}</label>
        <select 
          value={sortBy} 
          onChange={e => setSortBy(e.target.value)} 
          className={inputClasses + " cursor-pointer appearance-none"}
        >
          <option value="newest" className="bg-[#050505]">{t.sortNewest}</option>
          <option value="price_asc" className="bg-[#050505]">{t.sortPriceAsc}</option>
          <option value="price_desc" className="bg-[#050505]">{t.sortPriceDesc}</option>
        </select>
      </div>
      <div>
        <label className={labelClasses}>{t.city}</label>
        <select 
          value={filterCity} 
          onChange={e => setFilterCity(e.target.value)} 
          className={inputClasses + " cursor-pointer appearance-none"}
        >
          <option value="" className="bg-[#050505]">{t.allCities}</option>
          {cities.map(city => (
            <option key={city} value={city} className="bg-[#050505]">{city}</option>
          ))}
        </select>
      </div>
      <div>
        <label className={labelClasses}>{t.condition}</label>
        <div className="flex bg-white/[0.03] p-1.5 rounded-[1.5rem] border border-white/5 h-[58px]">
          <button 
            type="button"
            onClick={() => setFilterCondition(filterCondition === 'Novo' ? '' : 'Novo')}
            className={`flex-1 rounded-[1.2rem] text-[11px] font-black uppercase tracking-widest transition-all ${filterCondition === 'Novo' ? 'bg-white text-black shadow-2xl scale-[1.02]' : 'text-white/20 hover:text-white/60'}`}
          >
            {t.condNew}
          </button>
          <button 
            type="button"
            onClick={() => setFilterCondition(filterCondition === 'Polovno' ? '' : 'Polovno')}
            className={`flex-1 rounded-[1.2rem] text-[11px] font-black uppercase tracking-widest transition-all ${filterCondition === 'Polovno' ? 'bg-white text-black shadow-2xl scale-[1.02]' : 'text-white/20 hover:text-white/60'}`}
          >
            {t.condUsed}
          </button>
        </div>
      </div>

      <div className="hidden sm:block"></div>

      <div>
        <label className={labelClasses}>Slike</label>
        <button 
          type="button"
          onClick={() => setFilterPhoto(!filterPhoto)}
          className={`w-full h-[58px] px-6 rounded-[1.5rem] text-left text-[11px] font-black uppercase tracking-widest transition-all flex items-center justify-between border ${filterPhoto ? 'bg-[#185FA5] text-white border-[#185FA5] shadow-[0_0_20px_rgba(24,95,165,0.2)]' : 'bg-white/[0.03] text-white/20 border-white/5 hover:border-white/20'}`}
        >
          <span className="flex items-center gap-3 truncate">📸 {t.onlyWithPhoto || 'Samo sa slikom'}</span>
          <div className={`w-5 h-5 rounded-lg flex items-center justify-center border transition-all ${filterPhoto ? 'bg-white border-white' : 'border-white/10 bg-black/20'}`}>
            {filterPhoto && <svg className="w-3.5 h-3.5 text-[#185FA5]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" d="M5 13l4 4L19 7" /></svg>}
          </div>
        </button>
      </div>

      <div>
        <label className={labelClasses}>Sigurnost</label>
        <button 
          type="button"
          onClick={() => setFilterVerified(!filterVerified)}
          className={`w-full h-[58px] px-6 rounded-[1.5rem] text-left text-[11px] font-black uppercase tracking-widest transition-all flex items-center justify-between border ${filterVerified ? 'bg-[#1D9E75] text-white border-[#1D9E75] shadow-[0_0_20px_rgba(29,158,117,0.2)]' : 'bg-white/[0.03] text-white/20 border-white/5 hover:border-white/20'}`}
        >
          <span className="flex items-center gap-3 truncate">🛡️ {t.onlyVerified || 'Samo provereni'}</span>
          <div className={`w-5 h-5 rounded-lg flex items-center justify-center border transition-all ${filterVerified ? 'bg-white border-white' : 'border-white/10 bg-black/20'}`}>
            {filterVerified && <svg className="w-3.5 h-3.5 text-[#1D9E75]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" d="M5 13l4 4L19 7" /></svg>}
          </div>
        </button>
      </div>

      <div className="mt-auto sm:mt-0 sm:col-span-1 flex flex-col sm:flex-row gap-4 sm:justify-end items-end pt-6 sm:pt-0">
        <button 
          type="button"
          onClick={() => { clearFilters(); setShowAdvanced(false); }}
          className="w-full sm:w-auto py-5 px-10 rounded-2xl text-[11px] font-black uppercase tracking-widest text-white/20 hover:text-white bg-white/5 transition-all"
        >
          {t.resetAll}
        </button>
        <button 
          type="button"
          onClick={() => { handleSearch(); setShowAdvanced(false); }}
          className="w-full sm:w-auto bg-white hover:bg-[#185FA5] hover:text-white text-black py-5 px-12 rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] transition-all shadow-2xl active:scale-95"
        >
          {t.applyFilters}
        </button>
      </div>
    </div>
  );
}
