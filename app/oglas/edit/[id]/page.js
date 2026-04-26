'use client';
import { useState, useEffect } from 'react';
import { supabase } from '../../../../lib/supabase';
import { useRouter } from 'next/navigation';
import { use } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const oglasSchema = z.object({
  title: z.string().min(3, 'Naslov mora imati najmanje 3 karaktera.'),
  description: z.string().min(10, 'Opis mora imati najmanje 10 karaktera.'),
  price: z.preprocess((val) => Number(val), z.number().positive('Cena mora biti veća od 0.')),
  city: z.string().min(2, 'Unesite validan grad.'),
  category: z.string().min(1, 'Izaberite kategoriju.'),
});

export default function EditOglas({ params }) {
  const { id } = use(params);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
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
      });
      
      setFetching(false);
    }
    loadListing();
  }, [id, router, reset]);

  async function onSubmit(data) {
    setLoading(true);
    
    const { error } = await supabase
      .from('listings')
      .update({
        title: data.title,
        description: data.description,
        price: data.price,
        category: data.category,
        city: data.city,
      })
      .eq('id', id);

    if (error) {
      setMessage('Greška: ' + error.message);
    } else {
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
