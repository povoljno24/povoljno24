'use client';
import { useState } from 'react';
import { supabase } from '../../lib/supabase';

export default function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [message, setMessage] = useState('');

  async function handleRegister() {
    const { error } = await supabase.auth.signUp({ email, password });
    if (error) {
      setMessage(error.message);
    } else {
      setMessage('Uspešno! Proveri email da potvrdiš nalog.');
    }
  }

  return (
    <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background:'#f5f5f5' }}>
      <div style={{ background:'#fff', padding:'40px', borderRadius:'16px', border:'1px solid #eee', width:'100%', maxWidth:'400px' }}>
        <div style={{ fontSize:'20px', fontWeight:'600', color:'#185FA5', marginBottom:'8px' }}>
          Povoljno<span style={{ color:'#E24B4A' }}>24</span>.rs
        </div>
        <h1 style={{ fontSize:'18px', fontWeight:'600', marginBottom:'24px', color:'#1a1a1a' }}>Kreiraj nalog</h1>

        <div style={{ marginBottom:'16px' }}>
          <label style={{ fontSize:'13px', color:'#555', display:'block', marginBottom:'6px' }}>Korisničko ime</label>
          <input
            type="text"
            value={username}
            onChange={e => setUsername(e.target.value)}
            placeholder="npr. marko123"
            style={{ width:'100%', padding:'10px 14px', borderRadius:'8px', border:'1px solid #ddd', fontSize:'14px', outline:'none' }}
          />
        </div>

        <div style={{ marginBottom:'16px' }}>
          <label style={{ fontSize:'13px', color:'#555', display:'block', marginBottom:'6px' }}>Email adresa</label>
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="tvoj@email.com"
            style={{ width:'100%', padding:'10px 14px', borderRadius:'8px', border:'1px solid #ddd', fontSize:'14px', outline:'none' }}
          />
        </div>

        <div style={{ marginBottom:'24px' }}>
          <label style={{ fontSize:'13px', color:'#555', display:'block', marginBottom:'6px' }}>Lozinka</label>
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="Minimum 6 karaktera"
            style={{ width:'100%', padding:'10px 14px', borderRadius:'8px', border:'1px solid #ddd', fontSize:'14px', outline:'none' }}
          />
        </div>

        <button
          onClick={handleRegister}
          style={{ width:'100%', padding:'12px', background:'#185FA5', color:'#fff', border:'none', borderRadius:'8px', fontSize:'14px', fontWeight:'600', cursor:'pointer' }}>
          Registruj se
        </button>

        {message && (
          <p style={{ marginTop:'16px', fontSize:'13px', color: message.includes('Uspešno') ? '#3B6D11' : '#E24B4A', textAlign:'center' }}>
            {message}
          </p>
        )}

        <p style={{ marginTop:'20px', fontSize:'13px', color:'#555', textAlign:'center' }}>
          Već imaš nalog? <a href="/login" style={{ color:'#185FA5' }}>Prijavi se</a>
        </p>
      </div>
    </div>
  );
}