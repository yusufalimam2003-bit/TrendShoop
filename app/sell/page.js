'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../lib/supabaseClient';
import { useAuth } from '../../context/AuthContext';
import Navbar from '../../components/Navbar';

export default function SellPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState({ name: '', category_id: '', phone: '', description: '' });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    supabase.from('categories').select('*').then(({ data }) => {
      setCategories(data || []);
      if (data && data.length) setForm(f => ({ ...f, category_id: data[0].id }));
    });
  }, []);

  useEffect(() => {
    if (!authLoading && !user) router.push('/login');
  }, [authLoading, user]);

  const handleSubmit = async () => {
    setError('');
    if (!form.name || !form.phone) { setError('لازم تعبي اسم المتجر ورقم الهاتف على الأقل'); return; }
    setSubmitting(true);
    const { data, error } = await supabase
      .from('sellers')
      .insert({ user_id: user.id, name: form.name, category_id: form.category_id, phone: form.phone, description: form.description })
      .select()
      .single();
    setSubmitting(false);
    if (error) { setError(error.message); return; }
    router.push('/dashboard');
  };

  if (authLoading) return null;

  return (
    <div>
      <Navbar />
      <div style={{ padding: '24px 5%', maxWidth: 480, margin: '0 auto' }}>
        <div className="cairo" style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: 6 }}>سوّي متجرك الآن</div>
        <p style={{ color: '#6b6b6b', marginBottom: 24, fontSize: '0.9rem' }}>عبّي المعلومات وابدأ تعرض منتجاتك.</p>

        {error && (
          <div style={{ background: '#fff4f0', border: '1.5px solid #ff7a1a', borderRadius: 10, padding: 12, marginBottom: 16, fontSize: '0.85rem' }}>
            {error}
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <input className="ts-input" placeholder="اسم المتجر" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
          <select className="ts-input" value={form.category_id} onChange={e => setForm({ ...form, category_id: e.target.value })}>
            {categories.map(c => <option key={c.id} value={c.id}>{c.name_ar}</option>)}
          </select>
          <input className="ts-input" placeholder="رقم الهاتف" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} />
          <textarea className="ts-input" placeholder="وصف قصير عن متجرك" rows={3} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
          <button className="ts-btn" disabled={submitting} onClick={handleSubmit}>{submitting ? 'جاري الإنشاء...' : 'إنشاء المتجر'}</button>
        </div>
      </div>
    </div>
  );
}
