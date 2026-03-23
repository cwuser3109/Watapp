create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  created_at timestamptz default now()
);

drop table if exists public.profiles cascade;


create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email);
  return new;
end;
$$;


create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();



