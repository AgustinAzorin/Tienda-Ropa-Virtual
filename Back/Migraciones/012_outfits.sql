create table if not exists outfits (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  name text not null,
  is_public boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists outfit_items (
  id uuid primary key default gen_random_uuid(),
  outfit_id uuid not null references outfits(id) on delete cascade,
  product_id uuid not null references products(id) on delete cascade,
  variant_id uuid references product_variants(id) on delete set null,
  sort_order integer not null default 0
);

create index if not exists idx_outfits_user_created_at on outfits(user_id, created_at desc);
create index if not exists idx_outfit_items_outfit_sort on outfit_items(outfit_id, sort_order asc);
