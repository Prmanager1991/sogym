-- =============================================
-- Soǵym — SQL миграции для Supabase
-- Выполнить в: Supabase Dashboard → SQL Editor
-- =============================================

-- 1. ПРОДАВЦЫ
create table if not exists public.sellers (
  id            uuid primary key default gen_random_uuid(),
  name          text not null,
  phone         text not null unique,
  city          text not null default 'Астана',
  district      text,
  avatar_url    text,
  rating        numeric(3,2) default 0,
  reviews_count int default 0,
  created_at    timestamptz default now()
);

-- 2. ОБЪЯВЛЕНИЯ
create table if not exists public.listings (
  id          uuid primary key default gen_random_uuid(),
  seller_id   uuid not null references public.sellers(id) on delete cascade,
  title       text not null,
  category    text not null check (category in ('horse','beef','lamb','chicken')),
  price       int not null,
  unit        text not null default 'kg' check (unit in ('kg','piece','whole')),
  quantity    int not null default 0,
  city        text not null,
  district    text,
  delivery    boolean default false,
  halal       boolean default false,
  organic     boolean default false,
  freshness   text check (freshness in ('today','tomorrow','fresh')),
  description text,
  photos      text[] default '{}',
  status      text not null default 'active' check (status in ('active','sold','archived')),
  created_at  timestamptz default now()
);

-- 3. ОТЗЫВЫ
create table if not exists public.reviews (
  id          uuid primary key default gen_random_uuid(),
  seller_id   uuid not null references public.sellers(id) on delete cascade,
  reviewer_name text not null,
  rating      int not null check (rating between 1 and 5),
  text        text,
  created_at  timestamptz default now()
);

-- 4. КЛИКИ (для отзывов — только перешедшие через сайт)
create table if not exists public.contact_clicks (
  id          uuid primary key default gen_random_uuid(),
  listing_id  uuid not null references public.listings(id) on delete cascade,
  seller_id   uuid not null references public.sellers(id) on delete cascade,
  session_id  text,
  created_at  timestamptz default now()
);

-- 5. STORAGE для фото
insert into storage.buckets (id, name, public)
values ('listings', 'listings', true)
on conflict do nothing;

-- 6. RLS политики
alter table public.sellers enable row level security;
alter table public.listings enable row level security;
alter table public.reviews enable row level security;
alter table public.contact_clicks enable row level security;

-- Все читают объявления и продавцов
create policy "Public read sellers"  on public.sellers  for select using (true);
create policy "Public read listings" on public.listings for select using (true);
create policy "Public read reviews"  on public.reviews  for select using (true);

-- Вставка для анонимных (MVP без auth)
create policy "Anyone insert sellers"  on public.sellers  for insert with check (true);
create policy "Anyone insert listings" on public.listings for insert with check (true);
create policy "Anyone insert reviews"  on public.reviews  for insert with check (true);
create policy "Anyone insert clicks"   on public.contact_clicks for insert with check (true);
create policy "Anyone update listings" on public.listings for update using (true);
create policy "Anyone update sellers"  on public.sellers  for update using (true);

-- Storage policy
create policy "Public upload photos"
  on storage.objects for insert
  with check (bucket_id = 'listings');

create policy "Public read photos"
  on storage.objects for select
  using (bucket_id = 'listings');

-- 7. Индексы
create index if not exists listings_category_idx  on public.listings(category);
create index if not exists listings_city_idx      on public.listings(city);
create index if not exists listings_status_idx    on public.listings(status);
create index if not exists listings_seller_idx    on public.listings(seller_id);

-- 8. Функция обновления рейтинга продавца
create or replace function update_seller_rating()
returns trigger language plpgsql as $$
begin
  update public.sellers set
    rating = (select round(avg(rating)::numeric, 2) from public.reviews where seller_id = new.seller_id),
    reviews_count = (select count(*) from public.reviews where seller_id = new.seller_id)
  where id = new.seller_id;
  return new;
end;
$$;

create or replace trigger after_review_insert
  after insert on public.reviews
  for each row execute function update_seller_rating();

-- 9. Тестовые данные
insert into public.sellers (id, name, phone, city, district, rating, reviews_count) values
  ('11111111-1111-1111-1111-111111111111', 'Руслан Ахметов',  '77771112233', 'Астана',   'Алатауский р-н',   4.9, 28),
  ('22222222-2222-2222-2222-222222222222', 'Айгуль Сейткали', '77772223344', 'Астана',   'Сарыаркинский р-н',4.7, 15),
  ('33333333-3333-3333-3333-333333333333', 'Нурлан Абдиев',   '77773334455', 'Алматы',   'Есильский р-н',    4.8, 31),
  ('44444444-4444-4444-4444-444444444444', 'Гульнар Мусина',  '77774445566', 'Алматы',   'Байконурский р-н', 4.6, 8),
  ('55555555-5555-5555-5555-555555555555', 'Болат Жақсыбеков','77775556677', 'Шымкент',  'Центральный р-н',  5.0, 7)
on conflict do nothing;

insert into public.listings (seller_id, title, category, price, unit, quantity, city, district, delivery, halal, organic, freshness, description, photos, status) values
  ('11111111-1111-1111-1111-111111111111','Соғым (конина)','horse',2800,'kg',200,'Астана','Алатауский р-н',true,true,true,'today','Лошадь степного откорма, 3 года. Кормили только натуральным зерном и сеном. Забой в удобное время. Можно взять тушей или частями.',ARRAY[]::text[],'active'),
  ('22222222-2222-2222-2222-222222222222','Говядина (домашний бык)','beef',3200,'kg',320,'Астана','Сарыаркинский р-н',false,true,true,'tomorrow','Казахская белоголовая, 2 года. Откорм домашний, без антибиотиков и добавок.',ARRAY[]::text[],'active'),
  ('33333333-3333-3333-3333-333333333333','Баранина, каракул','lamb',3500,'kg',75,'Алматы','Есильский р-н',true,true,false,'fresh','Каракульский баран, жирный хвост. Только халал. Доставим в любой район.',ARRAY[]::text[],'active'),
  ('44444444-4444-4444-4444-444444444444','Домашняя курица','chicken',1800,'kg',12,'Алматы','Байконурский р-н',true,false,true,null,'Деревенская курица. Питание: зерно, трава. Вес 2–2.5 кг каждая.',ARRAY[]::text[],'active'),
  ('55555555-5555-5555-5555-555555555555','Конина охлаждённая','horse',3000,'kg',130,'Шымкент','Центральный р-н',true,true,true,'today','Кобыла 4 года, казахская порода. Свежий забой сегодня утром.',ARRAY[]::text[],'active')
on conflict do nothing;
