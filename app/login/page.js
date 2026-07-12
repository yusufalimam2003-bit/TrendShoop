'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';

export default function LoginPage() {
  const { signIn } = useAuth();
  const router = useRouter();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const { error } = await signIn({ email: form.email, password: form.password });
    setLoading(false);
    if (error) { setError(error.message); return; }
    router.push('/');
  };

  return (
    <div style={{ padding: '40px 5%', maxWidth: 420, margin: '0 auto' }}>
      <div className="cairo" style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: 20 }}>
        تسجيل الدخول
      </div>

      {error && (
        <div style={{ background: '#fff4f0', border: '1.5px solid #ff7a1a', borderRadius: 10, padding: 12, marginBottom: 16, fontSize: '0.85rem' }}>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <input className="ts-input" type="email" placeholder="البريد الإلكتروني" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
        <input className="ts-input" type="password" placeholder="كلمة المرور" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} />
        <button className="ts-btn" disabled={loading} type="submit">{loading ? 'جاري الدخول...' : 'دخول'}</button>
      </form>

      <p style={{ marginTop: 16, fontSize: '0.9rem', color: '#6b6b6b' }}>
        ماعندك حساب؟ <a href="/signup" style={{ color: '#ff7a1a', fontWeight: 700 }}>سوي حساب جديد</a>
      </p>
    </div>
  );
}
