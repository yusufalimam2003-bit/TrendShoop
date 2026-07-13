'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';

export default function HomePage() {
  const { user } = useAuth();
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [category, setCategory] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    setError('');
    const { data: cats, error: catErr } = await supabase.from('categories').select('*');
    if (catErr) { setError('خطأ بتحميل التصنيفات: ' + catErr.message); setLoading(false); return; }
    setCategories(cats || []);

    // نجيب المنتجات مع اسم المتجر (join)
    const { data: prods, error: prodErr } = await supabase
      .from('products')
      .select('*, sellers(name, id)')
      .order('sponsored', { ascending: false })
      .order('created_at', { ascending: false });

    if (prodErr) { setError('خطأ بتحميل المنتجات: ' + prodErr.message); setLoading(false); return; }
    setProducts(prods || []);
    setLoading(false);
  }

  async function addToCart(productId) {
    if (!user) {
      alert('لازم تسجل دخولك الأول عشان تضيف للسلة');
      return;
    }
    const { data: existing } = await supabase
      .from('cart')
      .select('*')
      .eq('user_id', user.id)
      .eq('product_id', productId)
      .maybeSingle();

    if (existing) {
      await supabase.from('cart').update({ qty: existing.qty + 1 }).eq('id', existing.id);
    } else {
      await supabase.from('cart').insert({ user_id: user.id, product_id: productId, qty: 1 });
    }
    alert('أُضيف للسلة ✓');
  }

  const filtered = category === 'all' ? products : products.filter(p => p.category_id === category);

  return (
    <div>
      <Navbar />
      <div style={{ padding: '24px 5%' }}>
        <div style={{ background: '#111', color: '#fff', borderRadius: 18, padding: '40px 34px', marginBottom: 24 }}>
          <div className="cairo" style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: 10 }}>كل المتاجر، بمكان وحد</div>
          <p style={{ color: '#ccc', maxWidth: 480, lineHeight: 1.8 }}>
            تصفح منتجات من متاجر حقيقية بالعراق — الآن متصلة بقاعدة بيانات حقيقية.
          </p>
        </div>

        {error && (
          <div style={{ background: '#fff4f0', border: '1.5px solid #ff7a1a', borderRadius: 10, padding: 14, marginBottom: 20, fontSize: '0.85rem' }}>
            ⚠️ {error}
          </div>
        )}

        <div style={{ display: 'flex', gap: 10, overflowX: 'auto', paddingBottom: 14, marginBottom: 20 }}>
          <div
            onClick={() => setCategory('all')}
            style={{ padding: '8px 16px', borderRadius: 100, fontSize: '0.85rem', border: '1px solid #e7e7e7', cursor: 'pointer', whiteSpace: 'nowrap', background: category === 'all' ? '#ff7a1a' : 'transparent', color: category === 'all' ? '#fff' : '#111' }}
          >الكل</div>
          {categories.map(cat => (
            <div
              key={cat.id}
              onClick={() => setCategory(cat.id)}
              style={{ padding: '8px 16px', borderRadius: 100, fontSize: '0.85rem', border: '1px solid #e7e7e7', cursor: 'pointer', whiteSpace: 'nowrap', background: category === cat.id ? '#ff7a1a' : 'transparent', color: category === cat.id ? '#fff' : '#111' }}
            >{cat.name_ar}</div>
          ))}
        </div>

        {loading ? (
          <p style={{ textAlign: 'center', padding: 40, color: '#6b6b6b' }}>جاري التحميل...</p>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: '#6b6b6b' }}>
            <div className="cairo" style={{ fontWeight: 700, marginBottom: 6, color: '#111' }}>لا توجد منتجات بعد</div>
            <Link href="/sell" className="ts-btn" style={{ display: 'inline-block', marginTop: '12px' }}>سوي متجرك الآن</Link>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(190px, 1fr))', gap: 16 }}>
            {filtered.map(p => (
              <div key={p.id} className="ts-card" style={{ overflow: 'hidden', position: 'relative' }}>
                {p.sponsored && (
                  <div style={{ position: 'absolute', top: 8, right: 8, background: '#111', color: '#fff', fontSize: '0.65rem', padding: '3px 8px', borderRadius: 6 }}>مموّل</div>
                )}
                <Link href={`/store/${p.sellers?.id}`}>
                  <div style={{ aspectRatio: '1/1', background: '#f6f6f6', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                    {p.image_url ? <img src={p.image_url} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <span style={{ color: '#ccc' }}>📦</span>}
                  </div>
                </Link>
                <div style={{ padding: 12 }}>
                  <Link href={`/store/${p.sellers?.id}`} style={{ fontSize: '0.7rem', color: '#999', marginBottom: 3, display: 'block', textDecoration: 'underline' }}>
                    {p.sellers?.name}
                  </Link>
                  <div style={{ fontSize: '0.88rem', fontWeight: 600, minHeight: '2.6em', marginBottom: 8 }}>{p.name}</div>
                  <div className="cairo" style={{ fontWeight: 700, marginBottom: 10 }}>{Number(p.price).toLocaleString()} د.ع</div>
                  <button className="ts-btn" style={{ width: '100%' }} onClick={() => addToCart(p.id)}>أضف للسلة</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
