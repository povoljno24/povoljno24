'use client';
import { useState } from 'react';
import { supabase } from '../../lib/supabase';

export default function PostOglas() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('');
  const [city, setCity] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [imageFile, setImageFile] = useState(null);

  async function handleSubmit() {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      setMessage('Morate biti prijavljeni da biste postavili oglas.');
      setLoading(false);
      return;
    }

    let image_url = null;

    if (imageFile) {
      const fileExt = imageFile.name.split('.').pop();
      const fileName = `${user.id}-${Date.now()}.${fileExt}`;
      const { error: uploadError } = await supabase.storage
        .from('listing-images')
        .upload(fileName, imageFile);
      if (uploadError) {
        setMessage('Greška pri uploadu slike: ' + uploadError.message);
        setLoading(false);
        return;
      }
      const { data: urlData } = supabase.storage
        .from('listing-images')
        .getPublicUrl(fileName);
      image_url = urlData.publicUrl;
    }

    const { error } = await supabase.from('listings').insert({
      title,
      description,
      price: parseFloat(price),
      category,
      city,
      user_id: user.id,
      is_verified: false,
      image_url,
    });

    if (error) {
      setMessage('Greška: ' + error.message);
    } else {
      setMessage('Oglas je uspešno postavljen!');
      setTitle(''); setDescription(''); setPrice(''); setCategory(''); setCity(''); setImageFile(null);
    }
    setLoading(false);
  }

  return (
    <div style={{ minHeight:'100vh', background:'#f5f5f5', padding:'40px 24px' }}>
      <div style={{ maxWidth:'600px', margin:'0 auto', background:'#fff', borderRadius:'16px', border:'1px solid #eee', padding:'40px' }}>
        <a href="/" style={{ fontSize:'20px', fontWeight:'600', color:'#185FA5', textDecoration:'none' }}>
          Povoljno<span style={{ color:'#E24B4A' }}>24</span>.rs
        </a>
        <h1 style={{ fontSize:'18px', fontWeight:'600', margin:'16px 0 24px', color:'#1a1a1a' }}>Postavi oglas</h1>

        <div style={{ marginBottom:'16px' }}>
          <label style={{ fontSize:'13px', color:'#555', display:'block', marginBottom:'6px' }}>Naslov oglasa</label>
          <input type="text" value={title} onChange={e => setTitle(e.target.value)} placeholder="npr. iPhone 14 Pro, 256GB"
            style={{ width:'100%', padding:'10px 14px', borderRadius:'8px', border:'1px solid #ddd', fontSize:'14px', outline:'none' }} />
        </div>

        <div style={{ marginBottom:'16px' }}>
          <label style={{ fontSize:'13px', color:'#555', display:'block', marginBottom:'6px' }}>Opis</label>
          <textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="Opiši šta prodaješ..."
            rows={4} style={{ width:'100%', padding:'10px 14px', borderRadius:'8px', border:'1px solid #ddd', fontSize:'14px', outline:'none', resize:'vertical' }} />
        </div>

        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'16px', marginBottom:'16px' }}>
          <div>
            <label style={{ fontSize:'13px', color:'#555', display:'block', marginBottom:'6px' }}>Cena (RSD)</label>
            <input type="number" value={price} onChange={e => setPrice(e.target.value)} placeholder="npr. 15000"
              style={{ width:'100%', padding:'10px 14px', borderRadius:'8px', border:'1px solid #ddd', fontSize:'14px', outline:'none' }} />
          </div>
          <div>
            <label style={{ fontSize:'13px', color:'#555', display:'block', marginBottom:'6px' }}>Grad</label>
            <input type="text" value={city} onChange={e => setCity(e.target.value)} placeholder="npr. Beograd"
              style={{ width:'100%', padding:'10px 14px', borderRadius:'8px', border:'1px solid #ddd', fontSize:'14px', outline:'none' }} />
          </div>
        </div>

        <div style={{ marginBottom:'16px' }}>
          <label style={{ fontSize:'13px', color:'#555', display:'block', marginBottom:'6px' }}>Kategorija</label>
          <select value={category} onChange={e => setCategory(e.target.value)}
            style={{ width:'100%', padding:'10px 14px', borderRadius:'8px', border:'1px solid #ddd', fontSize:'14px', outline:'none', background:'#fff' }}>
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
        </div>

        <div style={{ marginBottom:'24px' }}>
          <label style={{ fontSize:'13px', color:'#555', display:'block', marginBottom:'6px' }}>Fotografija proizvoda</label>
          <input type="file" accept="image/*" onChange={e => setImageFile(e.target.files[0])}
            style={{ width:'100%', padding:'10px 14px', borderRadius:'8px', border:'1px solid #ddd', fontSize:'14px' }} />
          {imageFile && <p style={{ fontSize:'12px', color:'#3B6D11', marginTop:'6px' }}>✓ {imageFile.name}</p>}
        </div>

        <button onClick={handleSubmit} disabled={loading}
          style={{ width:'100%', padding:'12px', background: loading ? '#aaa' : '#185FA5', color:'#fff', border:'none', borderRadius:'8px', fontSize:'14px', fontWeight:'600', cursor: loading ? 'not-allowed' : 'pointer' }}>
          {loading ? 'Postavljam...' : 'Postavi oglas'}
        </button>

        {message && (
          <p style={{ marginTop:'16px', fontSize:'13px', color: message.includes('uspešno') ? '#3B6D11' : '#E24B4A', textAlign:'center' }}>
            {message}
          </p>
        )}

        <p style={{ marginTop:'20px', fontSize:'13px', color:'#555', textAlign:'center' }}>
          Nisi prijavljen? <a href="/login" style={{ color:'#185FA5' }}>Prijavi se</a>
        </p>
      </div>
    </div>
  );
}