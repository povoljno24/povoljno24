'use client';
import { useState, useEffect } from 'react';
import { supabase } from '../../../../lib/supabase';
import { useRouter } from 'next/navigation';
import { use } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Image from 'next/image';
import imageCompression from 'browser-image-compression';
import { applyWatermark } from '../../../../lib/watermark';
import { useLanguage } from '../../../../components/LanguageContext';

export default function EditOglas({ params }) {
  const { id } = use(params);
  const { t } = useLanguage();

  const oglasSchema = z.object({
    title: z.string().min(3, t.valTitleMin),
    description: z.string().min(10, t.valDescMin),
    price: z.preprocess((val) => Number(val), z.number().positive(t.valPricePos)),
    city: z.string().min(2, t.valCity),
    category: z.string().min(1, t.valCat),
    condition: z.string().min(1, t.valCond),
  });
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [existingImages, setExistingImages] = useState([]);
  const [newImageFiles, setNewImageFiles] = useState([]);
  const [newPreviews, setNewPreviews] = useState([]);
  const [oldPrice, setOldPrice] = useState(null);
  const router = useRouter();

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: zodResolver(oglasSchema)
  });

  useEffect(() => {
    async function loadListing() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login');
        return;
      }

      const { data, error } = await supabase
        .from('listings')
        .select('*')
        .eq('id', id)
        .single();

      if (error || !data) {
        setMessage(t.noResults);
        setFetching(false);
        return;
      }

      if (data.user_id !== user.id) {
        router.push('/');
        return;
      }

      reset({
        title: data.title,
        description: data.description || '',
        price: data.price,
        category: data.category,
        city: data.city,
        condition: data.condition || 'Polovno',
      });
      
      setOldPrice(data.price);
      setExistingImages(data.images || (data.image_url ? [data.image_url] : []));
      setFetching(false);
    }
    loadListing();
  }, [id, router, reset, t.noResults]);

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length + existingImages.length + newImageFiles.length > 10) {
      alert(t.maxImages);
      return;
    }
    setNewImageFiles(prev => [...prev, ...files]);
    const previews = files.map(file => URL.createObjectURL(file));
    setNewPreviews(prev => [...prev, ...previews]);
  };

  const removeExisting = (index) => {
    setExistingImages(prev => prev.filter((_, i) => i !== index));
  };

  const removeNew = (index) => {
    setNewImageFiles(prev => prev.filter((_, i) => i !== index));
    setNewPreviews(prev => prev.filter((_, i) => i !== index));
  };

  async function onSubmit(data) {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();

    const uploadedUrls = [...existingImages];

    if (newImageFiles.length > 0) {
      try {
        for (let i = 0; i < newImageFiles.length; i++) {
          const file = newImageFiles[i];
          const options = { maxSizeMB: 1, maxWidthOrHeight: 1920, useWebWorker: true };
          const compressedFile = await imageCompression(file, options);
          const watermarkedBlob = await applyWatermark(compressedFile);
          const finalFile = new File([watermarkedBlob], file.name, { type: file.type });
          
          const fileName = `${user.id}-${Date.now()}-${Math.random().toString(36).substring(2, 9)}-edit-${i}.${finalFile.name.split('.').pop()}`;
          const { error: uploadError } = await supabase.storage.from('listing-images').upload(fileName, finalFile);
          if (uploadError) throw uploadError;
          
          const { data: urlData } = supabase.storage.from('listing-images').getPublicUrl(fileName);
          uploadedUrls.push(urlData.publicUrl);
        }
      } catch (error) {
        setMessage(t.imageError + error.message);
        setLoading(false);
        return;
      }
    }
    
    const { error } = await supabase
      .from('listings')
      .update({
        title: data.title,
        description: data.description,
        price: Number(data.price),
        category: data.category,
        city: data.city,
        condition: data.condition,
        image_url: uploadedUrls[0] || null,
        images: uploadedUrls,
      })
      .eq('id', id);

    if (error) {
      setMessage(t.errorPrefix + error.message);
    } else {
      if (data.price < oldPrice) {
        const { data: fans } = await supabase
          .from('favorites')
          .select('user_id')
          .eq('listing_id', id);

        if (fans?.length > 0) {
          const notifications = fans.map(fan => ({
            user_id: fan.user_id,
            type: 'price_drop',
            content: t.priceDropNotif.replace('{title}', data.title).replace('{price}', data.price.toLocaleString()),
            listing_id: id
          }));
          await supabase.from('notifications').insert(notifications);
        }
      }
      
      setMessage(t.updateSuccess);
      setTimeout(() => router.push('/profil'), 1500);
    }
    setLoading(false);
  }

  if (fetching) return (
    <div className="flex-1 flex items-center justify-center bg-transparent">
      <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
    </div>
  );

  const inputClasses = (hasError) => `
    w-full px-5 py-4 rounded-2xl border text-[14px] outline-none transition-all duration-300
    bg-white/[0.03] text-white placeholder:text-white/10
    ${hasError 
      ? 'border-red-500/50 focus:border-red-500 focus:bg-red-500/5' 
      : 'border-white/5 focus:border-[#185FA5] focus:bg-white/10 focus:ring-1 focus:ring-[#185FA5]/50'}
  `;

  const labelClasses = "text-[10px] font-black text-white/40 uppercase tracking-[0.3em] block mb-3 ml-1";

  return (
    <div className="flex-1 bg-transparent py-20 px-6">
      <div className="max-w-[700px] mx-auto bg-[#0A0A0A]/60 backdrop-blur-3xl rounded-[3rem] border border-white/10 p-10 sm:p-16 shadow-[0_64px_128px_rgba(0,0,0,0.8)] relative overflow-hidden group">
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-[#185FA5]/10 rounded-full blur-[80px] pointer-events-none" />
        
        <Link href="/profil" className="inline-block mb-10 text-[10px] font-black text-white/20 hover:text-white uppercase tracking-widest transition-all">
          ← {t.backToProfile}
        </Link>
        <h1 className="text-3xl font-black mb-12 text-white tracking-tight uppercase">{t.editAdTitle}</h1>

        <form onSubmit={handleSubmit(onSubmit)} className="relative z-10">
          <div className="mb-8">
            <label className={labelClasses}>{t.adTitle}</label>
            <input 
              type="text" 
              {...register('title')}
              className={inputClasses(errors.title)} 
            />
            {errors.title && <p className="mt-2 text-[11px] font-bold text-red-500 uppercase tracking-widest ml-1">{errors.title.message}</p>}
          </div>

          <div className="mb-8">
            <label className={labelClasses}>{t.description}</label>
            <textarea 
              {...register('description')}
              rows={5} 
              className={inputClasses(errors.description) + " resize-none"} 
            />
            {errors.description && <p className="mt-2 text-[11px] font-bold text-red-500 uppercase tracking-widest ml-1">{errors.description.message}</p>}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 mb-8">
            <div>
              <label className={labelClasses}>{t.price}</label>
              <div className="relative">
                <input 
                  type="number" 
                  {...register('price')}
                  className={inputClasses(errors.price)} 
                />
                <span className="absolute right-5 top-1/2 -translate-y-1/2 text-[10px] font-black text-white/20 uppercase">RSD</span>
              </div>
              {errors.price && <p className="mt-2 text-[11px] font-bold text-red-500 uppercase tracking-widest ml-1">{errors.price.message}</p>}
            </div>
            <div>
              <label className={labelClasses}>{t.cityLabel}</label>
              <input 
                type="text" 
                {...register('city')}
                className={inputClasses(errors.city)} 
              />
              {errors.city && <p className="mt-2 text-[11px] font-bold text-red-500 uppercase tracking-widest ml-1">{errors.city.message}</p>}
            </div>
          </div>

          <div className="mb-8">
            <label className={labelClasses}>{t.category}</label>
            <select 
              {...register('category')}
              className={inputClasses(errors.category)}
            >
              <option value="" className="bg-[#0A0A0A]">{t.chooseCat}</option>
              <option value="elektronika" className="bg-[#0A0A0A]">{t.electronics}</option>
              <option value="automobili" className="bg-[#0A0A0A]">{t.cars}</option>
              <option value="nekretnine" className="bg-[#0A0A0A]">{t.realestate}</option>
              <option value="moda" className="bg-[#0A0A0A]">{t.fashion}</option>
              <option value="namestaj" className="bg-[#0A0A0A]">{t.furniture}</option>
              <option value="gaming" className="bg-[#0A0A0A]">{t.gaming}</option>
              <option value="alati" className="bg-[#0A0A0A]">{t.tools}</option>
              <option value="knjige" className="bg-[#0A0A0A]">{t.books}</option>
              <option value="usluge" className="bg-[#0A0A0A]">{t.services}</option>
              <option value="posao" className="bg-[#0A0A0A]">{t.jobs}</option>
              <option value="sport" className="bg-[#0A0A0A]">{t.sports}</option>
              <option value="kucni_ljubimci" className="bg-[#0A0A0A]">{t.pets}</option>
              <option value="deca" className="bg-[#0A0A0A]">{t.kids}</option>
              <option value="muzika" className="bg-[#0A0A0A]">{t.music}</option>
              <option value="poljoprivreda" className="bg-[#0A0A0A]">{t.agriculture}</option>
              <option value="umetnost" className="bg-[#0A0A0A]">{t.art}</option>
              <option value="ostalo" className="bg-[#0A0A0A]">{t.other}</option>
            </select>
            {errors.category && <p className="mt-2 text-[11px] font-bold text-red-500 uppercase tracking-widest ml-1">{errors.category.message}</p>}
          </div>

          <div className="mb-10">
            <label className={labelClasses}>{t.itemCondition}</label>
            <div className="grid grid-cols-2 gap-4">
              <label className="cursor-pointer">
                <input type="radio" value="Novo" {...register('condition')} className="peer hidden" />
                <div className="w-full text-center py-4 rounded-2xl border border-white/5 text-[12px] font-black uppercase tracking-widest transition-all peer-checked:bg-white peer-checked:text-black hover:bg-white/5 text-white/40">
                  {t.condNew}
                </div>
              </label>
              <label className="cursor-pointer">
                <input type="radio" value="Polovno" {...register('condition')} className="peer hidden" />
                <div className="w-full text-center py-4 rounded-2xl border border-white/5 text-[12px] font-black uppercase tracking-widest transition-all peer-checked:bg-white peer-checked:text-black hover:bg-white/5 text-white/40">
                  {t.condUsed}
                </div>
              </label>
            </div>
            {errors.condition && <p className="mt-2 text-[11px] font-bold text-red-500 uppercase tracking-widest ml-1">{errors.condition.message}</p>}
          </div>

          <div className="mb-12">
            <label className={labelClasses}>{t.photos}</label>
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-4 mb-6">
              {existingImages.map((src, idx) => (
                <div key={`exist-${idx}`} className="relative aspect-square rounded-2xl overflow-hidden bg-white/[0.03] border border-white/5 group shadow-xl">
                  <Image src={src} alt="Existing" fill className="object-cover" />
                  <button 
                    type="button"
                    onClick={() => removeExisting(idx)}
                    className="absolute top-2 right-2 w-7 h-7 bg-red-500 text-white rounded-full flex items-center justify-center text-[10px] opacity-0 group-hover:opacity-100 transition-all shadow-xl z-20 hover:scale-110"
                  >
                    ✕
                  </button>
                </div>
              ))}
              {newPreviews.map((src, idx) => (
                <div key={`new-${idx}`} className="relative aspect-square rounded-2xl overflow-hidden bg-[#185FA5]/10 border border-[#185FA5]/20 group shadow-xl">
                  <Image src={src} alt="New" fill className="object-cover" />
                  <div className="absolute inset-0 bg-[#185FA5]/20" />
                  <button 
                    type="button"
                    onClick={() => removeNew(idx)}
                    className="absolute top-2 right-2 w-7 h-7 bg-red-500 text-white rounded-full flex items-center justify-center text-[10px] opacity-0 group-hover:opacity-100 transition-all shadow-xl z-20 hover:scale-110"
                  >
                    ✕
                  </button>
                </div>
              ))}
              {existingImages.length + newPreviews.length < 10 && (
                <label className="aspect-square rounded-2xl border border-dashed border-white/10 flex flex-col items-center justify-center cursor-pointer hover:border-[#185FA5] hover:bg-[#185FA5]/5 transition-all text-white/20 hover:text-white group">
                  <span className="text-3xl font-light group-hover:scale-110 transition-transform">+</span>
                  <input type="file" accept="image/*" multiple onChange={handleImageChange} className="hidden" />
                </label>
              )}
            </div>
          </div>

          <button 
            type="submit"
            disabled={loading}
            className={`w-full py-5 rounded-2xl text-[13px] font-black uppercase tracking-[0.3em] transition-all duration-500 shadow-2xl active:scale-95
              ${loading ? 'bg-white/10 text-white/20 cursor-not-allowed' : 'bg-white text-black hover:bg-[#185FA5] hover:text-white cursor-pointer'}`}
          >
            {loading ? t.saving : t.saveChanges}
          </button>
        </form>

        {message && (
          <div className={`mt-8 p-4 rounded-2xl text-[12px] font-black uppercase tracking-widest text-center animate-in fade-in slide-in-from-bottom-2 duration-300
            ${message.includes('uspešno') || message.includes('successfully') ? 'text-[#3B6D11] bg-[#EAF3DE]/10 border border-[#3B6D11]/20' : 'text-[#E24B4A] bg-red-500/10 border border-red-500/20'}`}>
            {message}
          </div>
        )}
      </div>
    </div>
  );
}
