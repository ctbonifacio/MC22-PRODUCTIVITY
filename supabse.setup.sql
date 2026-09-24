-- ============================================================
-- MC22 PERFORMANCE DATABASE
-- ============================================================

create extension if not exists pgcrypto;

-- ============================================================
-- BANK TARGETS
-- ============================================================

create table if not exists public.bank_targets (
    bank text primary key,
    talk_target numeric not null default 670,
    rpc_target numeric not null default 33,
    nptp_target numeric not null default 44,
    npayment_target numeric not null default 22,
    updated_at timestamptz not null default now()
);

insert into public.bank_targets
    (bank, talk_target, rpc_target, nptp_target, npayment_target)
values
    ('ENBD', 670, 33, 44, 22),
    ('HSBC', 670, 33, 44, 22),
    ('EIB', 670, 33, 44, 22),
    ('DIB', 670, 33, 44, 22)
on conflict (bank) do nothing;


-- ============================================================
-- AGENTS
-- ============================================================

create table if not exists public.agents (
    id uuid primary key default gen_random_uuid(),

    name text not null default 'New Agent',

    bank text not null default 'ENBD',

    photo_url text,

    talk_actual numeric not null default 0,

    rpc_actual numeric not null default 0,

    nptp_actual numeric not null default 0,

    npayment_actual numeric not null default 0,

    message text default 'KEEP GOING! 💙',

    accent text not null default '#1478c9',

    created_at timestamptz not null default now(),

    updated_at timestamptz not null default now()
);


-- ============================================================
-- ADD MISSING COLUMNS TO OLD AGENTS TABLE
-- ============================================================

alter table public.agents
add column if not exists name text;

alter table public.agents
add column if not exists bank text;

alter table public.agents
add column if not exists photo_url text;

alter table public.agents
add column if not exists talk_actual numeric;

alter table public.agents
add column if not exists rpc_actual numeric;

alter table public.agents
add column if not exists nptp_actual numeric;

alter table public.agents
add column if not exists npayment_actual numeric;

alter table public.agents
add column if not exists message text;

alter table public.agents
add column if not exists accent text;

alter table public.agents
add column if not exists created_at timestamptz;

alter table public.agents
add column if not exists updated_at timestamptz;


-- ============================================================
-- FIX NULL VALUES
-- ============================================================

update public.agents
set name = 'New Agent'
where name is null or name = '';

update public.agents
set bank = 'ENBD'
where bank is null or bank = '';

update public.agents
set talk_actual = 0
where talk_actual is null;

update public.agents
set rpc_actual = 0
where rpc_actual is null;

update public.agents
set nptp_actual = 0
where nptp_actual is null;

update public.agents
set npayment_actual = 0
where npayment_actual is null;

update public.agents
set message = 'KEEP GOING! 💙'
where message is null;

update public.agents
set accent = '#1478c9'
where accent is null;

update public.agents
set created_at = now()
where created_at is null;

update public.agents
set updated_at = now()
where updated_at is null;


-- ============================================================
-- DEFAULTS
-- ============================================================

alter table public.agents
alter column name set default 'New Agent';

alter table public.agents
alter column bank set default 'ENBD';

alter table public.agents
alter column talk_actual set default 0;

alter table public.agents
alter column rpc_actual set default 0;

alter table public.agents
alter column nptp_actual set default 0;

alter table public.agents
alter column npayment_actual set default 0;

alter table public.agents
alter column message set default 'KEEP GOING! 💙';

alter table public.agents
alter column accent set default '#1478c9';

alter table public.agents
alter column created_at set default now();

alter table public.agents
alter column updated_at set default now();


-- ============================================================
-- RLS
-- ============================================================

alter table public.agents enable row level security;

alter table public.bank_targets enable row level security;


-- ============================================================
-- AGENT POLICIES
-- ============================================================

drop policy if exists "leaders can read agents"
on public.agents;

drop policy if exists "leaders can add agents"
on public.agents;

drop policy if exists "leaders can update agents"
on public.agents;

drop policy if exists "leaders can delete agents"
on public.agents;


create policy "leaders can read agents"
on public.agents
for select
to authenticated
using (true);


create policy "leaders can add agents"
on public.agents
for insert
to authenticated
with check (true);


create policy "leaders can update agents"
on public.agents
for update
to authenticated
using (true)
with check (true);


create policy "leaders can delete agents"
on public.agents
for delete
to authenticated
using (true);


-- ============================================================
-- BANK TARGET POLICIES
-- ============================================================

drop policy if exists "leaders can read bank targets"
on public.bank_targets;

drop policy if exists "leaders can insert bank targets"
on public.bank_targets;

drop policy if exists "leaders can update bank targets"
on public.bank_targets;

drop policy if exists "leaders can delete bank targets"
on public.bank_targets;


create policy "leaders can read bank targets"
on public.bank_targets
for select
to authenticated
using (true);


create policy "leaders can insert bank targets"
on public.bank_targets
for insert
to authenticated
with check (true);


create policy "leaders can update bank targets"
on public.bank_targets
for update
to authenticated
using (true)
with check (true);


create policy "leaders can delete bank targets"
on public.bank_targets
for delete
to authenticated
using (true);


-- ============================================================
-- REALTIME
-- ============================================================

alter table public.agents replica identity full;

alter table public.bank_targets replica identity full;


do $$
begin

    if not exists (
        select 1
        from pg_publication_tables
        where pubname = 'supabase_realtime'
        and schemaname = 'public'
        and tablename = 'agents'
    ) then

        alter publication supabase_realtime
        add table public.agents;

    end if;


    if not exists (
        select 1
        from pg_publication_tables
        where pubname = 'supabase_realtime'
        and schemaname = 'public'
        and tablename = 'bank_targets'
    ) then

        alter publication supabase_realtime
        add table public.bank_targets;

    end if;

end
$$;


-- ============================================================
-- STORAGE
-- ============================================================

insert into storage.buckets
    (id, name, public)
values
    ('agent-photos', 'agent-photos', true)
on conflict (id)
do update set public = true;


drop policy if exists "leaders upload agent photos"
on storage.objects;

drop policy if exists "leaders update agent photos"
on storage.objects;

drop policy if exists "leaders delete agent photos"
on storage.objects;

drop policy if exists "leaders read agent photos"
on storage.objects;


create policy "leaders upload agent photos"
on storage.objects
for insert
to authenticated
with check (
    bucket_id = 'agent-photos'
);


create policy "leaders update agent photos"
on storage.objects
for update
to authenticated
using (
    bucket_id = 'agent-photos'
)
with check (
    bucket_id = 'agent-photos'
);


create policy "leaders delete agent photos"
on storage.objects
for delete
to authenticated
using (
    bucket_id = 'agent-photos'
);


create policy "leaders read agent photos"
on storage.objects
for select
to authenticated
using (
    bucket_id = 'agent-photos'
);
