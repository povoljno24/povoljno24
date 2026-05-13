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
  return (
    <div className="fixed inset-0 sm:relative sm:inset-auto z-[100] sm:z-10 bg-white sm:bg-white sm:rounded-xl sm:border border-gray-200 p-6 sm:p-4 mt-0 sm:mt-2 shadow-2xl sm:shadow-sm text-left flex flex-col sm:grid sm:grid-cols-3 gap-6 sm:gap-4 animate-in slide-in-from-bottom sm:slide-in-from-top-2 duration-300 sm:duration-200">
      <div className="flex items-center justify-between sm:hidden mb-2">
        <h3 className="text-xl font-bold text-gray-900">{t.advancedFilters}</h3>
        <button 
          onClick={() => setShowAdvanced(false)}
          className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-xl text-gray-500"
        >
          ×
        </button>
      </div>
      
      <div>
        <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-2 block">{t.minPrice} (RSD)</label>
        <input 
          type="number" 
          value={minPrice} 
          onChange={e => setMinPrice(e.target.value)} 
          placeholder="0" 
          className="w-full border border-gray-200 rounded-xl py-3 px-4 text-sm outline-none focus:border-[#185FA5] focus:ring-1 focus:ring-[#185FA5] bg-gray-50/50"
        />
      </div>
      <div>
        <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-2 block">{t.maxPrice} (RSD)</label>
        <input 
          type="number" 
          value={maxPrice} 
          onChange={e => setMaxPrice(e.target.value)} 
          placeholder="100000" 
          className="w-full border border-gray-200 rounded-xl py-3 px-4 text-sm outline-none focus:border-[#185FA5] focus:ring-1 focus:ring-[#185FA5] bg-gray-50/50"
        />
      </div>
      <div>
        <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-2 block">{t.sortBy}</label>
        <select 
          value={sortBy} 
          onChange={e => setSortBy(e.target.value)} 
          className="w-full border border-gray-200 rounded-xl py-3 px-4 text-sm outline-none focus:border-[#185FA5] focus:ring-1 focus:ring-[#185FA5] bg-gray-50/50 cursor-pointer appearance-none"
        >
          <option value="newest">{t.sortNewest}</option>
          <option value="price_asc">{t.sortPriceAsc}</option>
          <option value="price_desc">{t.sortPriceDesc}</option>
        </select>
      </div>
      <div>
        <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-2 block">{t.city}</label>
        <select 
          value={filterCity} 
          onChange={e => setFilterCity(e.target.value)} 
          className="w-full border border-gray-200 rounded-xl py-3 px-4 text-sm outline-none focus:border-[#185FA5] focus:ring-1 focus:ring-[#185FA5] bg-gray-50/50 cursor-pointer appearance-none"
        >
          <option value="">{t.allCities}</option>
          {cities.map(city => (
            <option key={city} value={city}>{city}</option>
          ))}
        </select>
      </div>
      <div>
        <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-2 block">{t.condition}</label>
        <div className="flex bg-gray-50 p-1.5 rounded-xl border border-gray-200 h-[46px]">
          <button 
            type="button"
            onClick={() => setFilterCondition(filterCondition === 'Novo' ? '' : 'Novo')}
            className={`flex-1 rounded-lg text-sm font-bold transition-all ${filterCondition === 'Novo' ? 'bg-[#185FA5] text-white shadow-md' : 'text-gray-500 hover:bg-gray-100'}`}
          >
            {t.condNew}
          </button>
          <button 
            type="button"
            onClick={() => setFilterCondition(filterCondition === 'Polovno' ? '' : 'Polovno')}
            className={`flex-1 rounded-lg text-sm font-bold transition-all ${filterCondition === 'Polovno' ? 'bg-[#185FA5] text-white shadow-md' : 'text-gray-500 hover:bg-gray-100'}`}
          >
            {t.condUsed}
          </button>
        </div>
      </div>
      <div>
        <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-2 block">{t.other || 'Dodatno'}</label>
        <div className="flex flex-col gap-1.5 justify-center h-[46px]">
          <button 
            type="button"
            onClick={() => setFilterPhoto(!filterPhoto)}
            className={`w-full py-1.5 px-3 rounded-lg text-left text-[12px] font-semibold transition-all flex items-center justify-between border ${filterPhoto ? 'bg-[#185FA5]/10 text-[#185FA5] border-[#185FA5]' : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'}`}
          >
            <span className="flex items-center gap-1.5 truncate">📸 {t.onlyWithPhoto || 'Samo sa slikom'}</span>
            <span className={`w-3.5 h-3.5 rounded flex items-center justify-center border shrink-0 ${filterPhoto ? 'bg-[#185FA5] border-[#185FA5] text-white text-[9px] font-bold' : 'border-gray-300 bg-white'}`}>{filterPhoto ? '✓' : ''}</span>
          </button>
          <button 
            type="button"
            onClick={() => setFilterVerified(!filterVerified)}
            className={`w-full py-1.5 px-3 rounded-lg text-left text-[12px] font-semibold transition-all flex items-center justify-between border ${filterVerified ? 'bg-[#185FA5]/10 text-[#185FA5] border-[#185FA5]' : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'}`}
          >
            <span className="flex items-center gap-1.5 truncate">🛡️ {t.onlyVerified || 'Samo provereni'}</span>
            <span className={`w-3.5 h-3.5 rounded flex items-center justify-center border shrink-0 ${filterVerified ? 'bg-[#185FA5] border-[#185FA5] text-white text-[9px] font-bold' : 'border-gray-300 bg-white'}`}>{filterVerified ? '✓' : ''}</span>
          </button>
        </div>
      </div>
      <div className="mt-auto sm:mt-0 sm:col-span-3 flex flex-col sm:flex-row gap-3 sm:justify-end">
        <button 
          type="button"
          onClick={() => { clearFilters(); setShowAdvanced(false); }}
          className="sm:hidden w-full py-4 rounded-xl text-sm font-bold text-gray-500 bg-gray-100"
        >
          {t.resetAll}
        </button>
        <button 
          type="button"
          onClick={() => { handleSearch(); setShowAdvanced(false); }}
          className="w-full sm:w-auto bg-[#185FA5] hover:bg-[#0C447C] text-white py-4 sm:py-2.5 px-10 rounded-xl text-sm sm:text-[13px] font-bold transition-all shadow-xl active:scale-95"
        >
          {t.applyFilters}
        </button>
      </div>
    </div>
  );
}
