'use client';
import { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useRouter } from 'next/navigation';
import imageCompression from 'browser-image-compression';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { applyWatermark } from '../../lib/watermark';
import Image from 'next/image';
import { useLanguage } from '../../components/LanguageContext';



export default function PostOglas() {
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
  const [imageFiles, setImageFiles] = useState([]);
  const [previews, setPreviews] = useState([]);
  const router = useRouter();

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(oglasSchema)
  });

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length + imageFiles.length > 10) {
      alert(t.maxImages);
      return;
    }
    setImageFiles(prev => [...prev, ...files]);
    const newPreviews = files.map(file => URL.createObjectURL(file));
    setPreviews(prev => [...prev, ...newPreviews]);
  };

  const removeImage = (index) => {
    setImageFiles(prev => prev.filter((_, i) => i !== index));
    setPreviews(prev => prev.filter((_, i) => i !== index));
  };

  async function onSubmit(data) {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      setMessage(t.mustBeLoggedIn);
      setLoading(false);
      return;
    }

    const uploadedUrls = [];

    if (imageFiles.length > 0) {
      try {
        for (let i = 0; i < imageFiles.length; i++) {
          const file = imageFiles[i];
          const options = {
            maxSizeMB: 1,
            maxWidthOrHeight: 1920,
            useWebWorker: true,
          };
          const compressedFile = await imageCompression(file, options);

          // Apply Watermark
          const watermarkedBlob = await applyWatermark(compressedFile);
          
          // Convert Blob back to File for naming
          const finalFile = new File([watermarkedBlob], compressedFile.name, { type: compressedFile.type });

          const fileExt = finalFile.name.split('.').pop() || 'jpg';
          // eslint-disable-next-line react-hooks/purity
          const fileName = `${user.id}-${Date.now()}-${Math.random().toString(36).substring(2, 9)}-${i}.${fileExt}`;
          
          const { error: uploadError } = await supabase.storage
            .from('listing-images')
            .upload(fileName, finalFile);
            
          if (uploadError) throw uploadError;
          
          const { data: urlData } = supabase.storage
            .from('listing-images')
            .getPublicUrl(fileName);
          
          uploadedUrls.push(urlData.publicUrl);
        }
      } catch (error) {
        setMessage(t.errorPrefix + error.message);
        setLoading(false);
        return;
      }
    }

    const { error } = await supabase.from('listings').insert({
      title: data.title,
      description: data.description,
      price: data.price,
      category: data.category,
      city: data.city,
      condition: data.condition,
      user_id: user.id,
      is_verified: false,
      image_url: uploadedUrls[0] || null,
      images: uploadedUrls,
    });

    if (error) {
      setMessage(t.errorPrefix + error.message);
    } else {
      setMessage(t.postSuccess);
      setTimeout(() => router.push('/profil'), 1500);
    }
    setLoading(false);
  }

  return (
    <div className="flex-1 bg-[#f5f5f5] py-10 px-6">
      <div className="max-w-[600px] mx-auto bg-white rounded-2xl border border-gray-200 p-8 shadow-sm">
        <h1 className="text-xl font-semibold mb-6 text-gray-900">{t.postAdTitle}</h1>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="mb-4">
            <label className="text-[13px] text-gray-600 block mb-1.5 font-medium">{t.adTitle}</label>
            <input 
              type="text" 
              {...register('title')}
              placeholder={`${t.placeholderExample} iPhone 14 Pro, 256GB`}
              className={`w-full px-3.5 py-2.5 rounded-lg border text-sm outline-none focus:ring-1 transition-all ${errors.title ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-[#185FA5] focus:ring-[#185FA5]'}`} 
            />
            {errors.title && <p className="mt-1 text-xs text-red-500">{errors.title.message}</p>}
          </div>

          <div className="mb-4">
            <label className="text-[13px] text-gray-600 block mb-1.5 font-medium">{t.description}</label>
            <textarea 
              {...register('description')}
              placeholder={t.descPlaceholder}
              rows={4} 
              className={`w-full px-3.5 py-2.5 rounded-lg border text-sm outline-none focus:ring-1 transition-all resize-y ${errors.description ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-[#185FA5] focus:ring-[#185FA5]'}`} 
            />
            {errors.description && <p className="mt-1 text-xs text-red-500">{errors.description.message}</p>}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="text-[13px] text-gray-600 block mb-1.5 font-medium">{t.price}</label>
              <input 
                type="number" 
                {...register('price')}
                placeholder={`${t.placeholderExample} 15000`}
                className={`w-full px-3.5 py-2.5 rounded-lg border text-sm outline-none focus:ring-1 transition-all ${errors.price ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-[#185FA5] focus:ring-[#185FA5]'}`} 
              />
              {errors.price && <p className="mt-1 text-xs text-red-500">{errors.price.message}</p>}
            </div>
            <div>
              <label className="text-[13px] text-gray-600 block mb-1.5 font-medium">{t.cityLabel}</label>
              <input 
                type="text" 
                {...register('city')}
                placeholder={`${t.placeholderExample} Beograd`}
                className={`w-full px-3.5 py-2.5 rounded-lg border text-sm outline-none focus:ring-1 transition-all ${errors.city ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-[#185FA5] focus:ring-[#185FA5]'}`} 
              />
              {errors.city && <p className="mt-1 text-xs text-red-500">{errors.city.message}</p>}
            </div>
          </div>

          <div className="mb-4">
            <label className="text-[13px] text-gray-600 block mb-1.5 font-medium">{t.category}</label>
            <select 
              {...register('category')}
              className={`w-full px-3.5 py-2.5 rounded-lg border text-sm outline-none focus:ring-1 transition-all bg-white ${errors.category ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-[#185FA5] focus:ring-[#185FA5]'}`}
            >
              <option value="">{t.chooseCat}</option>
              <option value="elektronika">{t.electronics}</option>
              <option value="automobili">{t.cars}</option>
              <option value="nekretnine">{t.realestate}</option>
              <option value="moda">{t.fashion}</option>
              <option value="namestaj">{t.furniture}</option>
              <option value="gaming">{t.gaming}</option>
              <option value="alati">{t.tools}</option>
              <option value="knjige">{t.books}</option>
            </select>
            {errors.category && <p className="mt-1 text-xs text-red-500">{errors.category.message}</p>}
          </div>

          <div className="mb-6">
            <label className="text-[13px] text-gray-600 block mb-1.5 font-medium">{t.itemCondition}</label>
            <div className="grid grid-cols-2 gap-4">
              <label className="cursor-pointer">
                <input type="radio" value="Novo" {...register('condition')} className="peer hidden" />
                <div className="w-full text-center py-2.5 rounded-lg border border-gray-300 text-sm font-medium transition-all peer-checked:bg-[#E6F1FB] peer-checked:border-[#185FA5] peer-checked:text-[#185FA5] hover:bg-gray-50">
                  {t.condNew}
                </div>
              </label>
              <label className="cursor-pointer">
                <input type="radio" value="Polovno" {...register('condition')} className="peer hidden" />
                <div className="w-full text-center py-2.5 rounded-lg border border-gray-300 text-sm font-medium transition-all peer-checked:bg-[#E6F1FB] peer-checked:border-[#185FA5] peer-checked:text-[#185FA5] hover:bg-gray-50">
                  {t.condUsed}
                </div>
              </label>
            </div>
            {errors.condition && <p className="mt-1 text-xs text-red-500">{errors.condition.message}</p>}
          </div>

          <div className="mb-6">
            <label className="text-[13px] text-gray-600 block mb-1.5 font-medium">{t.photos}</label>
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 mb-4">
              {previews.map((src, idx) => (
                <div 
                  key={idx} 
                  className="relative aspect-square rounded-lg overflow-hidden bg-gray-100 border border-gray-200 group select-none"
                  onContextMenu={(e) => e.preventDefault()}
                >
                  <Image src={src} alt="Preview" fill className="object-cover pointer-events-none" draggable={false} />
                  <div className="absolute inset-0 z-10 bg-transparent" />
                  <button 
                    type="button"
                    onClick={() => removeImage(idx)}
                    className="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity shadow-lg z-20"
                  >
                    ✕
                  </button>
                </div>
              ))}
              {previews.length < 10 && (
                <label className="aspect-square rounded-lg border-2 border-dashed border-gray-300 flex flex-col items-center justify-center cursor-pointer hover:border-[#185FA5] hover:bg-[#E6F1FB] transition-all text-gray-400 hover:text-[#185FA5]">
                  <span className="text-2xl font-light">+</span>
                  <span className="text-[10px] font-semibold uppercase">{t.addPhoto}</span>
                  <input 
                    type="file" 
                    accept="image/*" 
                    multiple
                    onChange={handleImageChange}
                    className="hidden" 
                  />
                </label>
              )}
            </div>
            <p className="text-[11px] text-gray-500 italic">{t.photoTip}</p>
          </div>

          <button 
            type="submit"
            disabled={loading}
            className={`w-full py-3 text-white rounded-lg text-sm font-semibold transition-colors ${loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-[#185FA5] hover:bg-[#0C447C] cursor-pointer'}`}
          >
            {loading ? t.posting : t.postAdBtn}
          </button>
        </form>

        {message && (
          <p className={`mt-4 text-[13px] text-center py-2 rounded-md ${message.includes('uspešno') || message.includes('successfully') ? 'text-[#3B6D11] bg-[#EAF3DE]' : 'text-[#E24B4A] bg-red-50'}`}>
            {message}
          </p>
        )}
      </div>
    </div>
  );
}