'use client';
import { useState } from 'react';
import { supabase } from '../../lib/supabase';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const registerSchema = z.object({
  username: z.string().min(3, 'Korisničko ime mora imati najmanje 3 karaktera.'),
  email: z.string().email('Unesite validnu email adresu.'),
  password: z.string().min(6, 'Lozinka mora imati najmanje 6 karaktera.'),
});

export default function Register() {
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(registerSchema)
  });

  async function onSubmit(data) {
    setLoading(true);
    const { data: authData, error } = await supabase.auth.signUp({ 
      email: data.email, 
      password: data.password 
    });
    
    if (error) {
      setMessage(error.message);
    } else if (authData.user) {
      const { error: profileError } = await supabase.from('profiles').insert({
        id: authData.user.id,
        username: data.username,
        email: data.email,
      });
      if (profileError) {
        setMessage('Greška pri kreiranju profila: ' + profileError.message);
      } else {
        setMessage('Uspešno! Proveri email da potvrdiš nalog.');
      }
    }
    setLoading(false);
  }

  return (
    <div className="flex-1 flex items-center justify-center p-6 bg-[#f5f5f5]">
      <div className="bg-white p-8 rounded-2xl border border-gray-200 w-full max-w-[400px] shadow-sm">
        <h1 className="text-xl font-semibold mb-6 text-gray-900 text-center">Kreiraj nalog</h1>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="mb-4">
            <label className="text-[13px] text-gray-600 block mb-1.5 font-medium">Korisničko ime</label>
            <input
              type="text"
              {...register('username')}
              placeholder="npr. marko123"
              className={`w-full px-3.5 py-2.5 rounded-lg border text-sm outline-none focus:ring-1 transition-all ${errors.username ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-[#185FA5] focus:ring-[#185FA5]'}`}
            />
            {errors.username && <p className="mt-1 text-xs text-red-500">{errors.username.message}</p>}
          </div>

          <div className="mb-4">
            <label className="text-[13px] text-gray-600 block mb-1.5 font-medium">Email adresa</label>
            <input
              type="email"
              {...register('email')}
              placeholder="tvoj@email.com"
              className={`w-full px-3.5 py-2.5 rounded-lg border text-sm outline-none focus:ring-1 transition-all ${errors.email ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-[#185FA5] focus:ring-[#185FA5]'}`}
            />
            {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>}
          </div>

          <div className="mb-6">
            <label className="text-[13px] text-gray-600 block mb-1.5 font-medium">Lozinka</label>
            <input
              type="password"
              {...register('password')}
              placeholder="Minimum 6 karaktera"
              className={`w-full px-3.5 py-2.5 rounded-lg border text-sm outline-none focus:ring-1 transition-all ${errors.password ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-[#185FA5] focus:ring-[#185FA5]'}`}
            />
            {errors.password && <p className="mt-1 text-xs text-red-500">{errors.password.message}</p>}
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 text-white rounded-lg text-sm font-semibold transition-colors ${loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-[#185FA5] hover:bg-[#0C447C] cursor-pointer'}`}
          >
            {loading ? 'Kreiranje...' : 'Registruj se'}
          </button>
        </form>

        {message && (
          <p className={`mt-4 text-[13px] text-center py-2 rounded-md ${message.includes('Uspešno') ? 'text-[#3B6D11] bg-[#EAF3DE]' : 'text-[#E24B4A] bg-red-50'}`}>
            {message}
          </p>
        )}

        <p className="mt-6 text-[13px] text-gray-600 text-center">
          Već imaš nalog? <Link href="/login" className="text-[#185FA5] hover:underline font-medium">Prijavi se</Link>
        </p>
      </div>
    </div>
  );
}