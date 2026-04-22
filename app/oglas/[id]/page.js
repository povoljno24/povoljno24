'use client';
import { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';
import { use } from 'react';

export default function Oglas({ params }) {
  const { id } = use(params);
  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [msgSent, setMsgSent] = useState(false);
  const [sendingMsg, setSendingMsg] = useState(false);
  const [msgError, setMsgError] = useState('');

  useEffect(() => {
    async function loadListing() {
      const { data } = await supabase
        .from('listings')
        .select('*')
        .eq('id', id)
        .single();
      setListing(data);
      setLoading(false);
    }
    loadListing();
  }, [id]);

  async function handleSendMessage() {
    setSendingMsg(true);
    setMsgError('');
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setMsgError('Morate biti prijavljeni da biste poslali poruku.');
      setSendingMsg(false);
      return;
    }
    if (!message.trim()) {
      setMsgError('Poruka ne može biti prazna.');
      setSendingMsg(false);
      return;
    }
    const { error } = await supabase.from('messages').insert({
      listing_id: listing.id,
      sender_id: user.id,
      receiver_id: listing.user_id,
      content: message,
      is_read: false,
    });
    if (error) {
      setMsgError('Greška: ' + error.message);
    } else {
      setMsgSent(true);
    }
    setSendingMsg(false);
  }

  if (loading) return (
    <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center' }}>
      <p style={{ color:'#555' }}>Učitavanje...</p>
    </div>
  );

  if (!listing) return (
    <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center' }}>
      <p style={{ color:'#555' }}>Oglas nije pronađen.</p>
    </div>
  );

  return (
    <div style={{ minHeight:'100vh', background:'#f5f5f5' }}>
      <nav style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'14px 24px', background:'#fff', borderBottom:'1px solid #e5e5e5' }}>
        <a href="/" style={{ fontSize:'20px', fontWeight:'600', color:'#185FA5', textDecoration:'none' }}>
          Povoljno<span style={{ color:'#E24B4A' }}>24</span>.rs
        </a>
        <a href="/" style={{ fontSize:'13px', color:'#555' }}>← Nazad</a>
      </nav>

      <div style={{ maxWidth:'700px', margin:'32px auto', padding:'0 24px' }}>
        <div style={{ background:'#fff', borderRadius:'16px', border:'1px solid #eee', overflow:'hidden', marginBottom:'24px' }}>
          {listing.image_url ? (
            <img src={listing.image_url} alt={listing.title} style={{ width:'100%', maxHeight:'400px', objectFit:'cover' }} />
          ) : (
            <div style={{ height:'200px', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'64px', background:'#f5f5f5' }}>📦</div>
          )}
          <div style={{ padding:'24px' }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'12px' }}>
              <h1 style={{ fontSize:'22px', fontWeight:'600', color:'#1a1a1a' }}>{listing.title}</h1>
              <span style={{ fontSize:'10px', background:'#EAF3DE', color:'#3B6D11', borderRadius:'4px', padding:'4px 8px' }}>Proveren</span>
            </div>
            <div style={{ fontSize:'28px', fontWeight:'600', color:'#185FA5', marginBottom:'16px' }}>
              {listing.price?.toLocaleString()} RSD
            </div>
            <div style={{ display:'flex', gap:'12px', marginBottom:'20px', flexWrap:'wrap' }}>
              <span style={{ fontSize:'12px', background:'#f5f5f5', padding:'4px 10px', borderRadius:'6px', color:'#555' }}>📍 {listing.city}</span>
              <span style={{ fontSize:'12px', background:'#f5f5f5', padding:'4px 10px', borderRadius:'6px', color:'#555' }}>🏷️ {listing.category}</span>
              <span style={{ fontSize:'12px', background:'#f5f5f5', padding:'4px 10px', borderRadius:'6px', color:'#555' }}>
                🕐 {new Date(listing.created_at).toLocaleDateString('sr-RS')}
              </span>
            </div>
            <div style={{ borderTop:'1px solid #eee', paddingTop:'16px' }}>
              <h2 style={{ fontSize:'14px', fontWeight:'600', marginBottom:'8px', color:'#1a1a1a' }}>Opis</h2>
              <p style={{ fontSize:'14px', color:'#555', lineHeight:'1.6' }}>{listing.description || 'Nema opisa.'}</p>
            </div>
          </div>
        </div>

        <div style={{ background:'#fff', borderRadius:'16px', border:'1px solid #eee', padding:'24px' }}>
          <h2 style={{ fontSize:'16px', fontWeight:'600', marginBottom:'16px', color:'#1a1a1a' }}>Kontaktiraj prodavca</h2>
          {msgSent ? (
            <p style={{ color:'#3B6D11', fontSize:'14px', textAlign:'center' }}>✓ Poruka je poslata prodavcu!</p>
          ) : (
            <>
              <textarea
                value={message}
                onChange={e => setMessage(e.target.value)}
                placeholder="Napiši poruku prodavcu..."
                rows={4}
                style={{ width:'100%', padding:'10px 14px', borderRadius:'8px', border:'1px solid #ddd', fontSize:'14px', outline:'none', resize:'vertical', marginBottom:'12px' }}
              />
              <button
                onClick={handleSendMessage}
                disabled={sendingMsg}
                style={{ width:'100%', padding:'14px', background: sendingMsg ? '#aaa' : '#185FA5', color:'#fff', border:'none', borderRadius:'8px', fontSize:'15px', fontWeight:'600', cursor: sendingMsg ? 'not-allowed' : 'pointer' }}>
                {sendingMsg ? 'Slanje...' : 'Pošalji poruku'}
              </button>
              {msgError && <p style={{ color:'#E24B4A', fontSize:'13px', marginTop:'8px', textAlign:'center' }}>{msgError}</p>}
            </>
          )}
        </div>
      </div>
    </div>
  );
}