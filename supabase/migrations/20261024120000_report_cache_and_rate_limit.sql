-- Server-only tables: the app talks to them with the secret key (service_role).
-- RLS is on with no policies and anon/authenticated have no grants, so the
-- Data API exposes nothing to the browser.

create table public.report_cache (
  cache_key text primary key,
  listing_url text not null,
  result jsonb not null,
  created_at timestamptz not null default now()
);

alter table public.report_cache enable row level security;
revoke all on public.report_cache from anon, authenticated;

create table public.rate_limit_hits (
  id bigint generated always as identity primary key,
  key text not null,
  hit_at timestamptz not null default now()
);

create index rate_limit_hits_key_hit_at_idx on public.rate_limit_hits (key, hit_at);

alter table public.rate_limit_hits enable row level security;
revoke all on public.rate_limit_hits from anon, authenticated;

-- Records a hit for p_key and returns true when the key is over the limit.
-- The advisory lock serialises concurrent requests for the same key.
-- Old rows are not deleted here; prune them separately (e.g. a pg_cron job).
create function public.check_rate_limit(p_key text, p_window_seconds int, p_max int)
returns boolean
language plpgsql
security invoker
set search_path = ''
as $$
declare
  recent_count int;
begin
  perform pg_advisory_xact_lock(hashtext(p_key));

  select count(*) into recent_count
  from public.rate_limit_hits
  where key = p_key and hit_at >= now() - make_interval(secs => p_window_seconds);

  if recent_count >= p_max then
    return true;
  end if;

  insert into public.rate_limit_hits (key) values (p_key);
  return false;
end;
$$;

revoke execute on function public.check_rate_limit(text, int, int) from public, anon, authenticated;
grant execute on function public.check_rate_limit(text, int, int) to service_role;
