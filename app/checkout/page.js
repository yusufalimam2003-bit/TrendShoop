'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../lib/supabaseClient';
import { useAuth } from '../../context/AuthContext';
import Navbar from '../../components/Navbar';

export default function CheckoutPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [buyer, setBuyer] = useState({ name: '', phone: '', address: '' });
  const [coupon, setCoupon] = useState('');
  const [discount, setDiscount] = useState(0);
  const [couponMsg, setCouponMsg] = useState('');
  const [placing, setPlacing] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!authLoading && !user) { router.push('/login'); return; }
    if (user) loadCart();
  }, [authLoading, user]);

  async function loadCart() {
    setLoading(true);
    const { data, error } = await supabase
      .from('cart')
      .select('*, products(*, sellers(id, name))')
      .eq('user_id', user.id);
    if (error) { setError(error.message); setLoading(false); return; }
    setCartItems(data || []);
    setLoading(false);
  }

  async function removeItem(cartId) {
    await supabase.from('cart').delete().eq('id', cartId);
    loadCart();
  }

  async function applyCoupon() {
    const code = coupon.trim().toUpperCase();
    const { data, error } = await supabase.from('coupons').select('*').eq('code', code).eq('active', true).maybeSingle();
    if (error || !data) { setDiscount(0); setCouponMsg('الكود غير صحيح'); return; }
    setDiscount(data.discount_percent / 100);
    setCouponMsg('تم تطبيق الخصم 🎉');
  }

  const cartTotal = cartItems.reduce((s, i) => s + Number(i.products.price) * i.qty, 0);
  const finalTotal = Math.round(cartTotal * (1 - discount));

  async function handlePlaceOrder() {
    setError('');
    if (!buyer.name || !buyer.phone || !buyer.address) { setError('عبّي كل معلومات التوصيل'); return; }
    setPlacing(true);

    // نجمع منتجات كل بائع لوحده لأن كل بائع يحتاج طلب منفصل
    const bySeller = {};
    cartItems.forEach(item => {
      const sellerId = item.products.sellers.id;
      if (!bySeller[sellerId]) bySeller[sellerId] = [];
      bySeller[sellerId].push(item);
    });

    try {
      for (const sellerId of Object.keys(bySeller)) {
        const items = bySeller[sellerId];
        const subtotal = items.reduce((s, i) => s + Number(i.products.price) * i.qty, 0);
        const total = Math.round(subtotal * (1 - discount));

        const { data: order, error: orderErr } = await supabase
          .from('orders')
          .insert({
            buyer_id: user.id, seller_id: sellerId,
            buyer_name: buyer.name, buyer_phone: buyer.phone, buyer_address: buyer.address,
            total, status: 'placed',
          })
          .select()
          .single();
        if (orderErr) throw orderErr;

        const orderItems = items.map(i => ({
          order_id: order.id, product_id: i.products.id, name: i.products.name, price: i.products.price, qty: i.qty,
        }));
        const { error: itemsErr } = await supabase.from('order_items').insert(orderItems);
        if (itemsErr) throw itemsErr;
      }

      // نفضي السلة بعد نجاح الطلب
      await supabase.from('cart').delete().eq('user_id', user.id);
      setDone(true);
    } catch (e) {
      setError(e.message || String(e));
    }
    setPlacing(false);
  }

  if (authLoading || loading) return <div><Navbar /><p style={{ padding: 40, textAlign: 'center' }}>جاري التحميل...</p></div>;

  return (
    <div>
      <Navbar />
      <div style={{ padding: '24px 5%', maxWidth: 560, margin: '0 auto' }}>
        {done ? (
          <div style={{ textAlign: 'center', padding: '50px 20px' }}>
            <div className="cairo" style={{ fontWeight: 800, fontSize: '1.2rem' }}>✅ تم إرسال طلبك!</div>
            <p style={{ color: '#6b6b6b', marginTop: 8 }}>البائع رح يتواصل وياك على رقمك لتأكيد التوصيل.</p>
          </div>
        ) : cartItems.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '50px 20px', color: '#6b6b6b' }}>سلتك فارغة</div>
        ) : (
          <>
            <div className="cairo" style={{ fontSize: '1.3rem', fontWeight: 800, marginBottom: 16 }}>سلة التسوق</div>

            {error && <div style={{ background: '#fff4f0', border: '1.5px solid #ff7a1a', borderRadius: 10, padding: 12, marginBottom: 16, fontSize: '0.85rem' }}>{error}</div>}

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20 }}>
              {cartItems.map(item => (
                <div key={item.id} className="ts-card" style={{ padding: 12, display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: '0.88rem' }}>{item.products.name}</div>
                    <div style={{ fontSize: '0.75rem', color: '#999' }}>{item.products.sellers.name} · × {item.qty}</div>
                  </div>
                  <div className="cairo" style={{ fontWeight: 700 }}>{(item.products.price * item.qty).toLocaleString()}</div>
                  <button onClick={() => removeItem(item.id)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>✕</button>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
              <input className="ts-input" placeholder="كود الخصم (اختياري)" value={coupon} onChange={e => setCoupon(e.target.value)} />
              <button className="ts-btn-outline" onClick={applyCoupon}>تطبيق</button>
            </div>
            {couponMsg && <div style={{ fontSize: '0.8rem', marginBottom: 14 }}>{couponMsg}</div>}

            <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: '1.1rem', marginBottom: 24 }}>
              <span>المجموع الكلي</span><span className="cairo">{finalTotal.toLocaleString()} د.ع</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 20 }}>
              <input className="ts-input" placeholder="الاسم الكامل" value={buyer.name} onChange={e => setBuyer({ ...buyer, name: e.target.value })} />
              <input className="ts-input" placeholder="رقم الهاتف" value={buyer.phone} onChange={e => setBuyer({ ...buyer, phone: e.target.value })} />
              <input className="ts-input" placeholder="العنوان بالتفصيل" value={buyer.address} onChange={e => setBuyer({ ...buyer, address: e.target.value })} />
            </div>

            <button className="ts-btn" style={{ width: '100%', padding: 14 }} disabled={placing} onClick={handlePlaceOrder}>
              {placing ? 'جاري الإرسال...' : 'تأكيد الطلب (الدفع عند الاستلام)'}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
