-- ============================================================
-- TrendShoop — Full Database Schema (12 tables)
-- انسخ هذا الملف كامل والصقه بـ Supabase > SQL Editor > New Query > Run
--
-- ⚠️ إذا كنت سويت الملف السابق (trendshoop_database_schema.sql) قبل هذا،
-- شغّل هذا الجزء الأول لحذف الجداول القديمة قبل ما تكمل:
-- ============================================================

drop table if exists favorites cascade;
drop table if exists reviews cascade;
drop table if exists orders cascade;
drop table if exists products cascade;
drop table if exists shops cascade;
drop trigger if exists on_auth_user_created on auth.users;
drop function if exists handle_new_user();

-- ============================================================

-- 1) PROFILES (Users) — يمتد على auth.users المدمج بـ Supabase
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  phone text,
  created_at timestamp with time zone default now()
);

-- إنشاء بروفايل تلقائي عند تسجيل أي مستخدم جديد
create function handle_new_user() returns trigger as $$
begin
  insert into public.profiles (id, full_name, phone)
  values (new.id, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'phone');
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure handle_new_user();

-- 2) CATEGORIES
create table categories (
  id text primary key,
  name_ar text not null,
  name_en text not null,
  name_ku text not null
);

insert into categories (id, name_ar, name_en, name_ku) values
  ('clothes', 'ملابس', 'Clothing', 'جل و بەرگ'),
  ('electronics', 'إلكترونيات', 'Electronics', 'ئەلیکترۆنی'),
  ('beauty', 'جمال وعناية', 'Beauty & Care', 'جوانی'),
  ('home', 'المنزل', 'Home', 'ماڵەوە'),
  ('kids', 'أطفال', 'Kids', 'منداڵان'),
  ('accessories', 'إكسسوارات', 'Accessories', 'ئاکسسوار'),
  ('other', 'أخرى', 'Other', 'هیتر');

-- 3) SELLERS (Shops)
create table sellers (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  name text not null,
  category_id text references categories(id),
  phone text not null,
  description text,
  logo_url text,
  cover_url text,
  verified boolean default false,
  created_at timestamp with time zone default now()
);

-- 4) PRODUCTS
create table products (
  id uuid primary key default gen_random_uuid(),
  seller_id uuid references sellers(id) on delete cascade not null,
  category_id text references categories(id),
  name text not null,
  price numeric not null,
  image_url text,
  sponsored boolean default false,
  sold_count int default 0,
  created_at timestamp with time zone default now()
);

-- 5) ADDRESSES
create table addresses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  label text,
  full_name text not null,
  phone text not null,
  full_address text not null,
  is_default boolean default false,
  created_at timestamp with time zone default now()
);

-- 6) ORDERS
create table orders (
  id uuid primary key default gen_random_uuid(),
  buyer_id uuid references auth.users(id) on delete set null,
  seller_id uuid references sellers(id) on delete cascade not null,
  address_id uuid references addresses(id) on delete set null,
  buyer_name text not null,
  buyer_phone text not null,
  buyer_address text not null,
  total numeric not null,
  status text default 'placed', -- placed | preparing | shipped | delivered
  created_at timestamp with time zone default now()
);

-- 7) ORDER_ITEMS
create table order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid references orders(id) on delete cascade not null,
  product_id uuid references products(id) on delete set null,
  name text not null,
  price numeric not null,
  qty int not null
);

-- 8) CART
create table cart (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  product_id uuid references products(id) on delete cascade not null,
  qty int not null default 1,
  created_at timestamp with time zone default now(),
  unique(user_id, product_id)
);

-- 9) WISHLIST
create table wishlist (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  product_id uuid references products(id) on delete cascade not null,
  created_at timestamp with time zone default now(),
  unique(user_id, product_id)
);

-- 10) REVIEWS
create table reviews (
  id uuid primary key default gen_random_uuid(),
  product_id uuid references products(id) on delete cascade not null,
  user_id uuid references auth.users(id) on delete set null,
  reviewer_name text not null,
  stars int not null check (stars between 1 and 5),
  comment text,
  image_url text,
  created_at timestamp with time zone default now()
);

-- 11) COUPONS
create table coupons (
  id uuid primary key default gen_random_uuid(),
  code text unique not null,
  discount_percent numeric not null check (discount_percent > 0 and discount_percent <= 100),
  active boolean default true
);

insert into coupons (code, discount_percent) values
  ('WELCOME10', 10),
  ('TRND20', 20);

-- 12) NOTIFICATIONS
create table notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  message text not null,
  read boolean default false,
  created_at timestamp with time zone default now()
);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

alter table profiles enable row level security;
alter table sellers enable row level security;
alter table products enable row level security;
alter table addresses enable row level security;
alter table orders enable row level security;
alter table order_items enable row level security;
alter table cart enable row level security;
alter table wishlist enable row level security;
alter table reviews enable row level security;
alter table coupons enable row level security;
alter table notifications enable row level security;
alter table categories enable row level security;

-- categories: عرض عام
create policy "categories_public_read" on categories for select using (true);

-- profiles: كل مستخدم يدير بروفايله بس
create policy "profiles_select_own" on profiles for select using (auth.uid() = id);
create policy "profiles_update_own" on profiles for update using (auth.uid() = id);

-- sellers: عرض عام، التعديل لصاحب المتجر بس
create policy "sellers_public_read" on sellers for select using (true);
create policy "sellers_insert_own" on sellers for insert with check (auth.uid() = user_id);
create policy "sellers_update_own" on sellers for update using (auth.uid() = user_id);
create policy "sellers_delete_own" on sellers for delete using (auth.uid() = user_id);

-- products: عرض عام، التعديل لصاحب المتجر بس
create policy "products_public_read" on products for select using (true);
create policy "products_insert_own" on products for insert with check (
  seller_id in (select id from sellers where user_id = auth.uid())
);
create policy "products_update_own" on products for update using (
  seller_id in (select id from sellers where user_id = auth.uid())
);
create policy "products_delete_own" on products for delete using (
  seller_id in (select id from sellers where user_id = auth.uid())
);

-- addresses: كل مستخدم يدير عناوينه بس
create policy "addresses_own" on addresses for all using (auth.uid() = user_id);

-- orders: المشتري يسوي طلب، البائع يشوف طلبات متجره ويحدثها، المشتري يشوف طلباته
create policy "orders_insert_any" on orders for insert with check (true);
create policy "orders_select_buyer_or_seller" on orders for select using (
  auth.uid() = buyer_id or seller_id in (select id from sellers where user_id = auth.uid())
);
create policy "orders_update_seller" on orders for update using (
  seller_id in (select id from sellers where user_id = auth.uid())
);

-- order_items: تتبع سياسة الطلب الأصلي
create policy "order_items_insert_any" on order_items for insert with check (true);
create policy "order_items_select" on order_items for select using (
  order_id in (
    select id from orders where auth.uid() = buyer_id
    or seller_id in (select id from sellers where user_id = auth.uid())
  )
);

-- cart: كل مستخدم يدير سلته بس
create policy "cart_own" on cart for all using (auth.uid() = user_id);

-- wishlist: كل مستخدم يدير مفضلته بس
create policy "wishlist_own" on wishlist for all using (auth.uid() = user_id);

-- reviews: عرض عام، الإضافة لأي مستخدم مسجل دخول، التعديل/الحذف لصاحب التقييم بس
create policy "reviews_public_read" on reviews for select using (true);
create policy "reviews_insert_auth" on reviews for insert with check (auth.uid() = user_id);
create policy "reviews_update_own" on reviews for update using (auth.uid() = user_id);
create policy "reviews_delete_own" on reviews for delete using (auth.uid() = user_id);

-- coupons: عرض عام للتحقق من الكود بس (بدون تعديل من العميل)
create policy "coupons_public_read" on coupons for select using (active = true);

-- notifications: كل مستخدم يشوف ويدير إشعاراته بس، أي مستخدم مسجل يقدر يرسل إشعار (مثلاً بائع يبلغ مشتري)
create policy "notifications_select_own" on notifications for select using (auth.uid() = user_id);
create policy "notifications_update_own" on notifications for update using (auth.uid() = user_id);
create policy "notifications_insert_auth" on notifications for insert with check (auth.role() = 'authenticated');
