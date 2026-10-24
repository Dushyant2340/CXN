-- CXN BioProfile: Supabase schema. Run in Dashboard > SQL Editor.
create extension if not exists pgcrypto;
create table if not exists public.biographies (
 id uuid primary key default gen_random_uuid(), slug text unique,
 name text not null, category text not null default 'Other', place text,
 summary text not null, story text not null, sources jsonb not null default '[]'::jsonb,
 verified boolean not null default false,
 status text not null default 'draft' check(status in ('draft','published','rejected','needs_changes')),
 created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table if not exists public.submissions (
 id uuid primary key default gen_random_uuid(), name text not null, category text not null,
 place text, summary text not null, story text not null, sources jsonb not null default '[]'::jsonb,
 submitter_email text, consent boolean not null default false,
 status text not null default 'pending' check(status in ('pending','reviewing','approved','rejected','needs_changes')),
 reviewer_notes text, created_at timestamptz not null default now()
);
alter table public.biographies enable row level security;
alter table public.submissions enable row level security;
drop policy if exists "Public read published biographies" on public.biographies;
create policy "Public read published biographies" on public.biographies for select to anon, authenticated using(status='published');
drop policy if exists "Public submit proposals" on public.submissions;
create policy "Public submit proposals" on public.submissions for insert to anon, authenticated with check(
 consent=true and length(trim(name)) between 2 and 120
 and length(trim(summary)) between 10 and 700
 and length(trim(story)) between 20 and 12000
 and jsonb_typeof(sources)='array' and jsonb_array_length(sources) between 1 and 20
 and status='pending'
);
grant select on public.biographies to anon, authenticated;
grant insert on public.submissions to anon, authenticated;
revoke select, update, delete on public.submissions from anon, authenticated;
-- No public write policy for biographies. Review submissions in Supabase dashboard.
-- NEVER expose a service_role/secret key in frontend code.
