'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { supabase } from '../../../lib/supabaseClient';
import { useAuth } from '../../../context/AuthContext';
import Navbar from '../../../components/Navbar';

export default function StorePage() {
  const { id } = useParams();
  const { user } = useAuth();
  const [seller, setSeller] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) load();
  }, [id]);

  async function load() {
    setLoading(true);
    const { data: s } = await supabase.from('sellers').select('*').eq('id', id).maybeSingle();
    setSeller(s);
    const { data: p } = await supabase.from('products').select('*').eq('seller_id', id).order('created_at', { ascending: false });
    setProducts(p || []);
    setLoading(false);
  }

  async function addToCart(productId) {
    if (!user) { alert('لازم تسجل دخولك الأول'); return; }
    const { data: existing } = await supabase.from('cart').select('*').eq('user_id', user.id).eq('product_id', productId).maybeSingle();
    if (existing) {
      await supabase.from('cart').update({ qty: existing.qty + 1 }).eq('id', existing.id);
    } else {
      await supabase.from('cart').insert({ user_id: user.id, product_id: productId, qty: 1 });
    }
    alert('أُضيف للسلة ✓');
  }

  if (loading) return <div><Navbar /><p style={{ padding: 40, textAlign: 'center' }}>جاري التحميل...</p></div>;
  if (!seller) return <div><Navbar /><p style={{ padding: 40, textAlign: 'center' }}>المتجر مو موجود</p></div>;

  return (
    <div>
      <Navbar />
      <div style={{ height: 160, background: seller.cover_url ? `url(${seller.cover_url})` : 'linear-gradient(120deg,#111,#333)', backgroundSize: 'cover', backgroundPosition: 'center' }} />
      <div style={{ padding: '0 5% 24px' }}>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 16, marginTop: -36, marginBottom: 20 }}>
          <div style={{ width: 80, height: 80, borderRadius: '50%', background: '#fff', border: '4px solid #fff', overflow: 'hidden', flexShrink: 0 }}>
            {seller.logo_url ? <img src={seller.logo_url} alt={seller.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : null}
          </div>
          <div>
            <div className="cairo" style={{ fontSize: '1.3rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: 8 }}>
              {seller.name}
              {seller.verified && <span style={{ background: '#111', color: '#fff', fontSize: '0.65rem', padding: '3px 9px', borderRadius: 100 }}>✓ بائع موثّق</span>}
            </div>
            <div style={{ fontSize: '0.85rem', color: '#6b6b6b' }}>{seller.phone}</div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(190px, 1fr))', gap: 16 }}>
          {products.map(p => (
            <div key={p.id} className="ts-card" style={{ overflow: 'hidden' }}>
              <div style={{ aspectRatio: '1/1', background: '#f6f6f6', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                {p.image_url ? <img src={p.image_url} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : '📦'}
              </div>
              <div style={{ padding: 12 }}>
                <div style={{ fontSize: '0.88rem', fontWeight: 600, minHeight: '2.6em', marginBottom: 8 }}>{p.name}</div>
                <div className="cairo" style={{ fontWeight: 700, marginBottom: 10 }}>{Number(p.price).toLocaleString()} د.ع</div>
                <button className="ts-btn" style={{ width: '100%' }} onClick={() => addToCart(p.id)}>أضف للسلة</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
