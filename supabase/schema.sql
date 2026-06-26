-- ===== پروفائلز ٹیبل (اپڈیٹڈ) =====
create table profiles (
  id uuid references auth.users on delete cascade primary key,
  full_name text,
  university text,
  avatar_url text,
  phone text,
  bank_account text,
  skills text[] default '{}',
  bio text,
  role text default 'user' check (role in ('admin', 'user')),
  is_approved_seller boolean default false,
  is_rejected boolean default false,
  reject_reason text,
  created_at timestamptz default now()
);

-- ===== پروڈکٹس ٹیبل =====
create table products (
  id uuid default gen_random_uuid() primary key,
  seller_id uuid references profiles(id) on delete cascade not null,
  name text not null,
  name_en text,
  description text not null,
  description_en text,
  category text not null check (category in ('extension', 'app', 'tool', 'website')),
  price integer not null default 0,
  image_url text,
  download_url text not null,
  tags text[] default '{}',
  is_featured boolean default false,
  is_approved boolean default false,
  rating numeric(3,2) default 0,
  review_count integer default 0,
  sales_count integer default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ===== ریویوز ٹیبل =====
create table reviews (
  id uuid default gen_random_uuid() primary key,
  product_id uuid references products(id) on delete cascade not null,
  user_id uuid references profiles(id) on delete cascade not null,
  rating integer not null check (rating >= 1 and rating <= 5),
  comment text,
  created_at timestamptz default now(),
  unique(product_id, user_id)
);

-- ===== آرڈرز ٹیبل =====
create table orders (
  id uuid default gen_random_uuid() primary key,
  buyer_id uuid references profiles(id) on delete cascade not null,
  total_amount integer not null default 0,
  status text default 'completed' check (status in ('pending', 'completed', 'refunded')),
  created_at timestamptz default now()
);

-- ===== آرڈر آئٹمز =====
create table order_items (
  id uuid default gen_random_uuid() primary key,
  order_id uuid references orders(id) on delete cascade not null,
  product_id uuid references products(id),
  product_name text not null,
  price integer not null,
  download_url text,
  created_at timestamptz default now()
);

-- ===== ایڈمن نوٹس (اختیاری — ہر سٹوڈنٹ پر نوٹ لکھنے کے لیے) =====
create table admin_notes (
  id uuid default gen_random_uuid() primary key,
  admin_id uuid references profiles(id) on delete cascade not null,
  student_id uuid references profiles(id) on delete cascade not null,
  note text not null,
  created_at timestamptz default now()
);

-- ===== RLS پالیسیز =====
alter table profiles enable row level security;
alter table products enable row level security;
alter table reviews enable row level security;
alter table orders enable row level security;
alter table order_items enable row level security;
alter table admin_notes enable row level security;

-- پروفائلز: سب دیکھ سکتے ہیں، صرف اپنا اپڈیٹ
create policy "profiles_select" on profiles for select using (true);
create policy "profiles_insert" on profiles for insert with check (auth.uid() = id);
create policy "profiles_update" on profiles for update using (auth.uid() = id or (select role from profiles where id = auth.uid()) = 'admin');
create policy "profiles_admin_update" on profiles for update using (
  exists (select 1 from profiles where id = auth.uid() and role = 'admin')
);

-- پروڈکٹس: صرف approve شدہ دکھیں (ایڈمن کو سب دکھیں)
create policy "products_select" on products for select using (
  is_approved = true
  or auth.uid() = seller_id
  or (select role from profiles where id = auth.uid()) = 'admin'
);
create policy "products_insert" on products for insert with check (auth.uid() = seller_id);
create policy "products_update" on products for update using (
  auth.uid() = seller_id
  or (select role from profiles where id = auth.uid()) = 'admin'
);
create policy "products_delete" on products for delete using (
  auth.uid() = seller_id
  or (select role from profiles where id = auth.uid()) = 'admin'
);

-- ریویوز
create policy "reviews_select" on reviews for select using (true);
create policy "reviews_insert" on reviews for insert with check (auth.uid() = user_id);
create policy "reviews_delete" on reviews for delete using (
  auth.uid() = user_id
  or (select role from profiles where id = auth.uid()) = 'admin'
);

-- آرڈرز
create policy "orders_select" on orders for select using (
  auth.uid() = buyer_id
  or (select role from profiles where id = auth.uid()) = 'admin'
);
create policy "orders_insert" on orders for insert with check (auth.uid() = buyer_id);

-- آرڈر آئٹمز
create policy "oi_select" on order_items for select using (
  exists (select 1 from orders where orders.id = order_items.order_id and (orders.buyer_id = auth.uid() or (select role from profiles where id = auth.uid()) = 'admin'))
);
create policy "oi_insert" on order_items for insert with check (
  exists (select 1 from orders where orders.id = order_items.order_id and orders.buyer_id = auth.uid())
);

-- ایڈمن نوٹس
create policy "notes_select" on admin_notes for select using (
  (select role from profiles where id = auth.uid()) = 'admin'
);
create policy "notes_insert" on admin_notes for insert with check (
  (select role from profiles where id = auth.uid()) = 'admin'
);
create policy "notes_delete" on admin_notes for delete using (
  (select role from profiles where id = auth.uid()) = 'admin'
);

-- ===== ٹرگرز =====
create or replace function handle_new_user()
returns trigger as $$ begin
  insert into profiles (id, full_name)
  values (new.id, new.raw_user_meta_data->>'full_name');
  return new;
end;
 $$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure handle_new_user();

create or replace function update_updated_at()
returns trigger as $$ begin
  new.updated_at = now();
  return new;
end;
 $$ language plpgsql;

create trigger set_updated_at
  before update on products
  for each row execute procedure update_updated_at();
