'use client';
import Link from 'next/link';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, signOut } = useAuth();

  return (
    <nav dir="ltr" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 5%', borderBottom: '1px solid #e7e7e7', position: 'sticky', top: 0, background: '#fff', zIndex: 40, flexWrap: 'wrap', gap: 10 }}>
      <Link href="/" className="cairo" style={{ fontWeight: 900, fontSize: '1.4rem' }}>
        Trend<span style={{ color: '#ff7a1a' }}>Shoop</span>
      </Link>
      <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
        {user ? (
          <>
            <Link href="/dashboard" className="ts-btn-outline">متجري</Link>
            <span style={{ fontSize: '0.85rem', color: '#6b6b6b' }}>{user.email}</span>
            <button className="ts-btn-outline" onClick={signOut}>تسجيل الخروج</button>
          </>
        ) : (
          <>
            <Link href="/login" className="ts-btn-outline">تسجيل الدخول</Link>
            <Link href="/signup" className="ts-btn">إنشاء حساب</Link>
          </>
        )}
        <Link href="/checkout" className="ts-btn">السلة</Link>
      </div>
    </nav>
  );
}
