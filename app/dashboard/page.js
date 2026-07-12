'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../lib/supabaseClient';
import { useAuth } from '../../context/AuthContext';
import Navbar from '../../components/Navbar';

export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [seller, setSeller] = useState(null);
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [tab, setTab] = useState('products');
  const [form, setForm] = useState({ name: '', price: '', category_id: '' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!authLoading && !user) { router.push('/login'); return; }
    if (user) loadAll();
  }, [authLoading, user]);

  async function loadAll() {
    setLoading(true);
    const { data: sellerRow } = await supabase.from('sellers').select('*').eq('user_id', user.id).maybeSingle();
    if (!sellerRow) { router.push('/sell'); return; }
    setSeller(sellerRow);

    const { data: cats } = await supabase.from('categories').select('*');
    setCategories(cats || []);
    if (cats && cats.length) setForm(f => ({ ...f, category_id: cats[0].id }));

    const { data: prods } = await supabase.from('products').select('*').eq('seller_id', sellerRow.id).order('created_at', { ascending: false });
    setProducts(prods || []);

    const { data: ords } = await supabase.from('orders').select('*, order_items(*)').eq('seller_id', sellerRow.id).order('created_at', { ascending: false });
    setOrders(ords || []);

    setLoading(false);
  }

  async function handleAddProduct() {
    setError('');
    if (!form.name || !form.price) return;
    const { error } = await supabase.from('products').insert({
      seller_id: seller.id, name: form.name, price: Number(form.price), category_id: form.category_id,
    });
    if (error) { setError(error.message); return; }
    setForm({ name: '', price: '', category_id: categories[0]?.id || '' });
    loadAll();
  }

  async function handleDeleteProduct(id) {
    await supabase.from('products').delete().eq('id', id);
    loadAll();
  }

  async function advanceStatus(orderId, currentStatus) {
    const steps = ['placed', 'preparing', 'shipped', 'delivered'];
    const idx = steps.indexOf(currentStatus);
    const next = steps[Math.min(idx + 1, steps.length - 1)];
    await supabase.from('orders').update({ status: next }).eq('id', orderId);
    loadAll();
  }

  if (authLoading || loading) return <div><Navbar /><p style={{ padding: 40, textAlign: 'center' }}>جاري التحميل...</p></div>;
  if (!seller) return null;

  return (
    <div>
      <Navbar />
      <div style={{ padding: '24px 5%' }}>
        <div className="ts-card" style={{ padding: 20, marginBottom: 24 }}>
          <div className="cairo" style={{ fontSize: '1.3rem', fontWeight: 800 }}>{seller.name}</div>
          <div style={{ color: '#6b6b6b', fontSize: '0.85rem', marginTop: 4 }}>{seller.phone}</div>
        </div>

        <div style={{ display: 'flex', gap: 10, marginBottom: 22 }}>
          <button className={tab === 'products' ? 'ts-btn' : 'ts-btn-outline'} onClick={() => setTab('products')}>منتجاتي ({products.length})</button>
          <button className={tab === 'orders' ? 'ts-btn' : 'ts-btn-outline'} onClick={() => setTab('orders')}>الطلبات ({orders.length})</button>
        </div>

        {tab === 'products' && (
          <div>
            <div className="ts-card" style={{ padding: 18, marginBottom: 20 }}>
              {error && <div style={{ background: '#fff4f0', border: '1.5px solid #ff7a1a', borderRadius: 10, padding: 10, marginBottom: 12, fontSize: '0.85rem' }}>{error}</div>}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 10 }}>
                <input className="ts-input" placeholder="اسم المنتج" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
                <input className="ts-input" placeholder="السعر (د.ع)" type="number" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} />
                <select className="ts-input" value={form.category_id} onChange={e => setForm({ ...form, category_id: e.target.value })} style={{ gridColumn: '1 / -1' }}>
                  {categories.map(c => <option key={c.id} value={c.id}>{c.name_ar}</option>)}
                </select>
              </div>
              <button className="ts-btn" onClick={handleAddProduct}>+ إضافة المنتج</button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 14 }}>
              {products.map(p => (
                <div key={p.id} className="ts-card" style={{ padding: 14 }}>
                  <div style={{ fontWeight: 600, fontSize: '0.88rem', marginBottom: 6 }}>{p.name}</div>
                  <div className="cairo" style={{ fontWeight: 700, marginBottom: 10 }}>{Number(p.price).toLocaleString()} د.ع</div>
                  <button className="ts-btn-outline" style={{ width: '100%' }} onClick={() => handleDeleteProduct(p.id)}>حذف</button>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === 'orders' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {orders.length === 0 && <p style={{ color: '#6b6b6b' }}>ما وصلتك طلبات بعد.</p>}
            {orders.map(o => (
              <div key={o.id} className="ts-card" style={{ padding: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <div style={{ fontWeight: 700 }}>{o.buyer_name}</div>
                  <div style={{ fontSize: '0.75rem', background: '#ff7a1a', color: '#fff', padding: '3px 10px', borderRadius: 100 }}>{o.status}</div>
                </div>
                <div style={{ fontSize: '0.85rem', color: '#6b6b6b', marginBottom: 4 }}>📞 {o.buyer_phone}</div>
                <div style={{ fontSize: '0.85rem', color: '#6b6b6b', marginBottom: 10 }}>📍 {o.buyer_address}</div>
                {(o.order_items || []).map(it => (
                  <div key={it.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: 4 }}>
                    <span>{it.name} × {it.qty}</span><span>{(it.price * it.qty).toLocaleString()}</span>
                  </div>
                ))}
                <div style={{ fontWeight: 700, marginTop: 8, borderTop: '1px solid #eee', paddingTop: 8 }}>المجموع: {Number(o.total).toLocaleString()}</div>
                {o.status !== 'delivered' && (
                  <button className="ts-btn-outline" style={{ width: '100%', marginTop: 10 }} onClick={() => advanceStatus(o.id, o.status)}>▶ تحديث الحالة</button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
