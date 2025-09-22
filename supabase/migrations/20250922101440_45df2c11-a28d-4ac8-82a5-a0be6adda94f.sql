-- 1. Smazání všech uživatelů kromě specifikovaných
delete from auth.users 
where email not in ('jsvec.jr@gmail.com','jan.svec@tul.cz');

-- 2. Smazání profilů orphaned uživatelů
delete from public.user_profiles 
where user_id not in (select id from auth.users);

-- 3. Smazání rezervací orphaned uživatelů (zachovat guest rezervace s user_id NULL)
delete from public.reservations 
where user_id is not null 
and user_id not in (select id from auth.users);

-- 4. Vytvoření chybějícího profilu pro majitele
insert into public.user_profiles (user_id, full_name, phone, app_role)
select 
  u.id,
  u.raw_user_meta_data->>'name',
  u.raw_user_meta_data->>'phone',
  'owner'
from auth.users u
where u.email = 'jsvec.jr@gmail.com'
and not exists (
  select 1 from public.user_profiles p where p.user_id = u.id
);

-- 5. Aktualizace role pro hráče na member (pokud není)
update public.user_profiles 
set app_role = 'member'
where user_id = (select id from auth.users where email = 'jan.svec@tul.cz')
and app_role != 'member';

-- 6. Aktualizace meta dat v auth.users pro správné role
update auth.users
set raw_user_meta_data = raw_user_meta_data || jsonb_build_object('app_role', 'owner')
where email = 'jsvec.jr@gmail.com';

update auth.users  
set raw_user_meta_data = raw_user_meta_data || jsonb_build_object('app_role', 'member')
where email = 'jan.svec@tul.cz';