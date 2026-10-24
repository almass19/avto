-- Researched weak points per brand + model + generation + engine + gearbox.
-- Server-only, like report_cache: RLS on, no policies, no anon/authenticated grants.

create table public.model_cards (
  card_key text primary key,
  vehicle jsonb not null,
  status text not null check (status in ('researching', 'ready', 'failed')),
  card jsonb,
  sources jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.model_cards enable row level security;
revoke all on public.model_cards from anon, authenticated;

-- Atomically takes the research job for p_key. Returns false when another
-- request is already researching it or the existing card is still good, so
-- concurrent checks of the same car never pay for research twice.
create function public.claim_model_card_research(p_key text, p_vehicle jsonb)
returns boolean
language plpgsql
security invoker
set search_path = ''
as $$
declare
  claimed boolean;
begin
  insert into public.model_cards as mc (card_key, vehicle, status)
  values (p_key, p_vehicle, 'researching')
  on conflict (card_key) do update
    set status = 'researching', vehicle = excluded.vehicle, updated_at = now()
    where (mc.status = 'researching' and mc.updated_at < now() - interval '10 minutes')
       or (mc.status = 'failed' and mc.updated_at < now() - interval '1 day')
       or (mc.status = 'ready' and mc.updated_at < now() - interval '180 days')
  returning true into claimed;

  return coalesce(claimed, false);
end;
$$;

revoke execute on function public.claim_model_card_research(text, jsonb) from public, anon, authenticated;
grant execute on function public.claim_model_card_research(text, jsonb) to service_role;
