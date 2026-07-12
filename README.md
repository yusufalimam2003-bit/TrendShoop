# TrendShoop

منصة تسوق إلكتروني متعددة البائعين — Next.js + Supabase.

## خطوات التشغيل على جهازك

### 1) تثبيت المتطلبات
```bash
npm install
```

### 2) إعداد قاعدة البيانات
1. افتح مشروعك على [supabase.com](https://supabase.com)
2. روح لـ **SQL Editor → New Query**
3. افتح ملف `database/full_schema.sql` من هذا المجلد، انسخ محتواه كامل، الصقه، واضغط **Run**

### 3) ربط مفاتيح Supabase
1. سوي نسخة من ملف `.env.local.example` باسم `.env.local`
2. روح لمشروعك بـ Supabase → **Settings → API**
3. انسخ **Project URL** و **anon public key** والصقهم بملف `.env.local`

```
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=xxxxxxxxxxxxxxxxxxxxxxxx
```

⚠️ لا تحط Service Role Key هنا أبداً — بس anon key.

### 4) تشغيل المشروع محلياً
```bash
npm run dev
```
افتح المتصفح على: http://localhost:3000

### 5) نشره أونلاين (لاحقاً)
- ارفع المشروع على GitHub
- اربطه بـ [Vercel](https://vercel.com) (مجاني)
- بإعدادات Vercel، ضيف نفس متغيرين البيئة (`NEXT_PUBLIC_SUPABASE_URL` و `NEXT_PUBLIC_SUPABASE_ANON_KEY`)
- بعد النشر، وجّه دومين TrendShoop.com لمشروع Vercel

## هيكلة المشروع
```
app/
  page.js              → الصفحة الرئيسية (تصفح المنتجات)
  login/page.js        → تسجيل الدخول
  signup/page.js       → إنشاء حساب
  sell/page.js         → إنشاء متجر جديد
  dashboard/page.js    → لوحة تحكم البائع (منتجات + طلبات)
  checkout/page.js     → السلة والطلب
  store/[id]/page.js   → صفحة المتجر العامة
context/
  AuthContext.jsx      → إدارة تسجيل الدخول/الخروج
lib/
  supabaseClient.js    → الاتصال بـ Supabase
database/
  full_schema.sql      → قاعدة البيانات الكاملة (12 جدول)
```

## الحالة الحالية (MVP)
هذا أساس شغال متصل بقاعدة بيانات حقيقية:
- ✅ تسجيل دخول / حساب / خروج حقيقي
- ✅ إنشاء متجر وإضافة منتجات (تنحفظ بقاعدة البيانات فعلياً)
- ✅ تصفح المنتجات وصفحات المتاجر العامة
- ✅ سلة حقيقية + كوبونات + إنشاء طلبات حقيقية
- ✅ لوحة بائع لمتابعة الطلبات وتحديث حالتها

## ناقص لسا (خطوات جاية)
- المفضلة (Wishlist) والتقييمات (Reviews) — الجداول جاهزة بقاعدة البيانات، تحتاج ربط بالواجهة
- رفع صور حقيقية (Supabase Storage) بدل روابط نصية
- لوحة إدارة (Admin)
- الإشعارات (Notifications)
- العناوين المحفوظة (Addresses)
