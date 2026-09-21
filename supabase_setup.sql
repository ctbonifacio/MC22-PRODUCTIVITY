-- MC22 shared database + photo storage setup
create extension if not exists pgcrypto;

create table if not exists public.agents (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  photo_url text,
  talk_target numeric not null default 1320,
  talk_actual numeric not null default 0,
  rpc_target numeric not null default 66,
  rpc_actual numeric not null default 0,
  nptp_target numeric not null default 66,
  nptp_actual numeric not null default 0,
  npayment_target numeric not null default 44,
  npayment_actual numeric not null default 0,
  message text default '',
  accent text not null default '#1478c9',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.agents enable row level security;

create policy "leaders can read agents"
on public.agents for select
to authenticated
using (true);

create policy "leaders can add agents"
on public.agents for insert
to authenticated
with check (true);

create policy "leaders can update agents"
on public.agents for update
to authenticated
using (true)
with check (true);

create policy "leaders can delete agents"
on public.agents for delete
to authenticated
using (true);

-- Create the bucket in Storage UI with:
-- Name: agent-photos
-- Public bucket: ON
--
-- Then add these Storage policies:
create policy "leaders can upload agent photos"
on storage.objects for insert
to authenticated
with check (bucket_id = 'agent-photos');

create policy "leaders can update agent photos"
on storage.objects for update
to authenticated
using (bucket_id = 'agent-photos')
with check (bucket_id = 'agent-photos');

create policy "leaders can delete agent photos"
on storage.objects for delete
to authenticated
using (bucket_id = 'agent-photos');

create policy "leaders can read agent photos"
on storage.objects for select
to authenticated
using (bucket_id = 'agent-photos');

-- Sample agents
insert into public.agents (name,talk_target,talk_actual,rpc_target,rpc_actual,nptp_target,nptp_actual,npayment_target,npayment_actual,message,accent)
select 'Cynthia Cancino',1320,343,66,0,66,0,44,0,'KEEP GOING! 💗','#14a765'
where not exists (select 1 from public.agents);
insert into public.agents (name,talk_target,rpc_target,nptp_target,npayment_target,message,accent)
select 'Samantha Nicole Canales',1320,66,66,44,'YOU GOT THIS! 💙','#1782c4'
where not exists (select 1 from public.agents where name='Samantha Nicole Canales');
insert into public.agents (name,talk_target,rpc_target,nptp_target,npayment_target,message,accent)
select 'Sharmine Galsim',1320,66,66,44,'MAKE IT HAPPEN! 💜','#7040c0'
where not exists (select 1 from public.agents where name='Sharmine Galsim');