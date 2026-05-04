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

const oglasSchema = z.object({
  title: z.string().min(3, 'Naslov mora imati najmanje 3 karaktera.'),
  description: z.string().min(10, 'Opis mora imati najmanje 10 karaktera.'),
  price: z.preprocess((val) => Number(val), z.number().positive('Cena mora biti veća od 0.')),
  city: z.string().min(2, 'Unesite validan grad.'),
  category: z.string().min(1, 'Izaberite kategoriju.'),
  condition: z.string().min(1, 'Izaberite stanje predmeta.'),
});

export default function EditOglas({ params }) {
  const { id } = use(params);
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
        setMessage('Oglas nije pronađen.');
        setFetching(false);
        return;
      }

      if (data.user_id !== user.id) {
        router.push('/');
        return;
      }

      // Pre-populate the form
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
  }, [id, router, reset]);

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length + existingImages.length + newImageFiles.length > 10) {
      alert('Maksimalno 10 slika je dozvoljeno.');
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

    // Upload new images
    if (newImageFiles.length > 0) {
      try {
        for (let i = 0; i < newImageFiles.length; i++) {
          const file = newImageFiles[i];
          const options = { maxSizeMB: 1, maxWidthOrHeight: 1920, useWebWorker: true };
          const compressedFile = await imageCompression(file, options);
          const watermarkedBlob = await applyWatermark(compressedFile);
          const finalFile = new File([watermarkedBlob], file.name, { type: file.type });
          
          // eslint-disable-next-line react-hooks/purity
          const fileName = `${user.id}-${Date.now()}-${Math.random().toString(36).substring(2, 9)}-edit-${i}.${finalFile.name.split('.').pop()}`;
          const { error: uploadError } = await supabase.storage.from('listing-images').upload(fileName, finalFile);
          if (uploadError) throw uploadError;
          
          const { data: urlData } = supabase.storage.from('listing-images').getPublicUrl(fileName);
          uploadedUrls.push(urlData.publicUrl);
        }
      } catch (error) {
        setMessage('Greška pri obradi novih slika: ' + error.message);
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
      setMessage('Greška: ' + error.message);
    } else {
      // Check for price drop
      if (data.price < oldPrice) {
        // Fetch all users who favorited this listing
        const { data: fans } = await supabase
          .from('favorites')
          .select('user_id')
          .eq('listing_id', id);

        if (fans?.length > 0) {
          const notifications = fans.map(fan => ({
            user_id: fan.user_id,
            type: 'price_drop',
            content: `Cena je pala! Oglas koji pratite "${data.title}" je sada ${data.price.toLocaleString()} RSD.`,
            listing_id: id
          }));
          await supabase.from('notifications').insert(notifications);
        }
      }
      
      setMessage('Oglas je uspešno izmenjen!');
      setTimeout(() => router.push('/profil'), 1500);
    }
    setLoading(false);
  }

  if (fetching) return (
    <div className="flex-1 flex items-center justify-center">
      <p className="text-gray-500">Učitavanje...</p>
    </div>
  );

  return (
    <div className="flex-1 bg-[#f5f5f5] py-10 px-6">
      <div className="max-w-[600px] mx-auto bg-white rounded-2xl border border-gray-200 p-8 shadow-sm">
        <Link href="/profil" className="inline-block mb-6 text-sm text-gray-600 hover:text-[#185FA5] transition-colors">
          ← Nazad na profil
        </Link>
        <h1 className="text-xl font-semibold mb-6 text-gray-900">Izmeni oglas</h1>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="mb-4">
            <label className="text-[13px] text-gray-600 block mb-1.5 font-medium">Naslov oglasa</label>
            <input 
              type="text" 
              {...register('title')}
              className={`w-full px-3.5 py-2.5 rounded-lg border text-sm outline-none focus:ring-1 transition-all ${errors.title ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-[#185FA5] focus:ring-[#185FA5]'}`} 
            />
            {errors.title && <p className="mt-1 text-xs text-red-500">{errors.title.message}</p>}
          </div>

          <div className="mb-4">
            <label className="text-[13px] text-gray-600 block mb-1.5 font-medium">Opis</label>
            <textarea 
              {...register('description')}
              rows={4} 
              className={`w-full px-3.5 py-2.5 rounded-lg border text-sm outline-none focus:ring-1 transition-all resize-y ${errors.description ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-[#185FA5] focus:ring-[#185FA5]'}`} 
            />
            {errors.description && <p className="mt-1 text-xs text-red-500">{errors.description.message}</p>}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="text-[13px] text-gray-600 block mb-1.5 font-medium">Cena (RSD)</label>
              <input 
                type="number" 
                {...register('price')}
                className={`w-full px-3.5 py-2.5 rounded-lg border text-sm outline-none focus:ring-1 transition-all ${errors.price ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-[#185FA5] focus:ring-[#185FA5]'}`} 
              />
              {errors.price && <p className="mt-1 text-xs text-red-500">{errors.price.message}</p>}
            </div>
            <div>
              <label className="text-[13px] text-gray-600 block mb-1.5 font-medium">Grad</label>
              <input 
                type="text" 
                {...register('city')}
                className={`w-full px-3.5 py-2.5 rounded-lg border text-sm outline-none focus:ring-1 transition-all ${errors.city ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-[#185FA5] focus:ring-[#185FA5]'}`} 
              />
              {errors.city && <p className="mt-1 text-xs text-red-500">{errors.city.message}</p>}
            </div>
          </div>

          <div className="mb-6">
            <label className="text-[13px] text-gray-600 block mb-1.5 font-medium">Kategorija</label>
            <select 
              {...register('category')}
              className={`w-full px-3.5 py-2.5 rounded-lg border text-sm outline-none focus:ring-1 transition-all bg-white ${errors.category ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-[#185FA5] focus:ring-[#185FA5]'}`}
            >
              <option value="">Izaberi kategoriju</option>
              <option value="elektronika">Elektronika</option>
              <option value="automobili">Automobili</option>
              <option value="nekretnine">Nekretnine</option>
              <option value="moda">Moda</option>
              <option value="namestaj">Nameštaj</option>
              <option value="gaming">Gaming</option>
              <option value="alati">Alati</option>
              <option value="knjige">Knjige</option>
            </select>
            {errors.category && <p className="mt-1 text-xs text-red-500">{errors.category.message}</p>}
          </div>

          <div className="mb-6">
            <label className="text-[13px] text-gray-600 block mb-1.5 font-medium">Stanje predmeta</label>
            <div className="grid grid-cols-2 gap-4">
              <label className="cursor-pointer">
                <input type="radio" value="Novo" {...register('condition')} className="peer hidden" />
                <div className="w-full text-center py-2.5 rounded-lg border border-gray-300 text-sm font-medium transition-all peer-checked:bg-[#E6F1FB] peer-checked:border-[#185FA5] peer-checked:text-[#185FA5] hover:bg-gray-50">
                  Novo
                </div>
              </label>
              <label className="cursor-pointer">
                <input type="radio" value="Polovno" {...register('condition')} className="peer hidden" />
                <div className="w-full text-center py-2.5 rounded-lg border border-gray-300 text-sm font-medium transition-all peer-checked:bg-[#E6F1FB] peer-checked:border-[#185FA5] peer-checked:text-[#185FA5] hover:bg-gray-50">
                  Polovno
                </div>
              </label>
            </div>
            {errors.condition && <p className="mt-1 text-xs text-red-500">{errors.condition.message}</p>}
          </div>
          <div className="mb-6">
            <label className="text-[13px] text-gray-600 block mb-1.5 font-medium">Fotografije (max 10)</label>
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 mb-4">
              {/* Existing Images */}
              {existingImages.map((src, idx) => (
                <div 
                  key={`exist-${idx}`} 
                  className="relative aspect-square rounded-lg overflow-hidden bg-gray-100 border border-gray-200 group select-none"
                  onContextMenu={(e) => e.preventDefault()}
                >
                  <Image src={src} alt="Existing" fill className="object-cover pointer-events-none" draggable={false} />
                  <div className="absolute inset-0 z-10 bg-transparent" />
                  <button 
                    type="button"
                    onClick={() => removeExisting(idx)}
                    className="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity shadow-lg z-20"
                  >
                    ✕
                  </button>
                </div>
              ))}
              {/* New Previews */}
              {newPreviews.map((src, idx) => (
                <div 
                  key={`new-${idx}`} 
                  className="relative aspect-square rounded-lg overflow-hidden bg-gray-50 border border-dashed border-[#185FA5] group select-none"
                  onContextMenu={(e) => e.preventDefault()}
                >
                  <Image src={src} alt="New Preview" fill className="object-cover opacity-70 pointer-events-none" draggable={false} />
                  <div className="absolute inset-0 z-10 bg-transparent" />
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
                    <span className="bg-white/80 px-1.5 py-0.5 rounded text-[8px] font-bold text-[#185FA5] uppercase">Novo</span>
                  </div>
                  <button 
                    type="button"
                    onClick={() => removeNew(idx)}
                    className="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity shadow-lg z-20"
                  >
                    ✕
                  </button>
                </div>
              ))}
              {/* Add Button */}
              {existingImages.length + newImageFiles.length < 10 && (
                <label className="aspect-square rounded-lg border-2 border-dashed border-gray-300 flex flex-col items-center justify-center cursor-pointer hover:border-[#185FA5] hover:bg-[#E6F1FB] transition-all text-gray-400 hover:text-[#185FA5]">
                  <span className="text-2xl font-light">+</span>
                  <span className="text-[10px] font-semibold uppercase">Dodaj</span>
                  <input type="file" accept="image/*" multiple onChange={handleImageChange} className="hidden" />
                </label>
              )}
            </div>
          </div>

          <button 
            type="submit"
            disabled={loading}
            className={`w-full py-3 text-white rounded-lg text-sm font-semibold transition-colors ${loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-[#185FA5] hover:bg-[#0C447C] cursor-pointer'}`}
          >
            {loading ? 'Čuvanje...' : 'Sačuvaj izmene'}
          </button>
        </form>

        {message && (
          <p className={`mt-4 text-[13px] text-center py-2 rounded-md ${message.includes('uspešno') ? 'text-[#3B6D11] bg-[#EAF3DE]' : 'text-[#E24B4A] bg-red-50'}`}>
            {message}
          </p>
        )}
      </div>
    </div>
  );
}
