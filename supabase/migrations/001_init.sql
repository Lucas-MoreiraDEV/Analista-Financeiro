-- Usuários (extende o auth.users do Supabase)
create table profiles (
  id uuid references auth.users on delete cascade primary key,
  email text not null,
  plano text default 'free' check (plano in ('free', 'pro')),
  stripe_customer_id text,
  stripe_subscription_id text,
  created_at timestamptz default now()
);

-- Transações
create table transacoes (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references profiles(id) on delete cascade not null,
  tipo text check (tipo in ('receita', 'despesa')) not null,
  valor numeric(10,2) not null,
  categoria text not null,
  descricao text,
  data date not null,
  created_at timestamptz default now()
);

-- Metas por categoria
create table metas (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references profiles(id) on delete cascade not null,
  categoria text not null,
  limite numeric(10,2) not null,
  mes int not null,
  ano int not null
);

-- RLS (segurança: cada user só vê seus dados)
alter table profiles enable row level security;
alter table transacoes enable row level security;
alter table metas enable row level security;

create policy "user vê só seu perfil" on profiles
  for all using (auth.uid() = id);

create policy "user vê só suas transações" on transacoes
  for all using (auth.uid() = user_id);

create policy "user vê só suas metas" on metas
  for all using (auth.uid() = user_id);