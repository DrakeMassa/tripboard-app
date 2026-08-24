\set ON_ERROR_STOP on
create or replace function pg_temp.assert_true(value boolean, message text) returns void language plpgsql as $$ begin if not coalesce(value, false) then raise exception 'assertion failed: %', message; end if; end $$;
create or replace function pg_temp.expect_error(statement text, message text) returns void language plpgsql as $$ begin execute statement; raise exception 'expected error: %', message; exception when others then if sqlerrm like 'expected error:%' then raise; end if; end $$;

insert into auth.users(id,email,email_confirmed_at) values
 ('00000000-0000-0000-0000-000000000001','owner@example.com',now()),
 ('00000000-0000-0000-0000-000000000002','editor@example.com',now()),
 ('00000000-0000-0000-0000-000000000003','viewer@example.com',now()),
 ('00000000-0000-0000-0000-000000000004','member@example.com',now()),
 ('00000000-0000-0000-0000-000000000005','other@example.com',now()),
 ('00000000-0000-0000-0000-000000000006','unconfirmed@example.com',null),
 ('00000000-0000-0000-0000-000000000007','anon@example.com',now());
update auth.users set is_anonymous=true where id='00000000-0000-0000-0000-000000000007';

set role authenticated;
select set_config('request.jwt.claim.sub','00000000-0000-0000-0000-000000000001',false);
insert into public.trips(id,owner_id,title) values ('10000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-000000000001','RETURNING works') returning id \gset
reset role;
select pg_temp.assert_true(:'id'='10000000-0000-0000-0000-000000000001','owner INSERT RETURNING');

insert into public.trip_members values
 ('10000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-000000000002','editor',null,now()),
 ('10000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-000000000003','viewer',null,now()),
 ('10000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-000000000004','member',null,now());
insert into public.trip_participants(id,trip_id,user_id,display_name) values
 ('20000000-0000-0000-0000-000000000003','10000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-000000000003','Viewer'),
 ('20000000-0000-0000-0000-000000000004','10000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-000000000004','Member');
insert into public.places(id,trip_id,created_by,name) values
 ('30000000-0000-0000-0000-000000000001','10000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-000000000003','Authored by viewer'),
 ('30000000-0000-0000-0000-000000000003','10000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-000000000004','Authored by member');

set role authenticated;
select set_config('request.jwt.claim.sub','00000000-0000-0000-0000-000000000003',false);
with changed as (update public.places set notes='blocked' where id='30000000-0000-0000-0000-000000000001' returning id) select pg_temp.assert_true(count(*)=0,'viewer cannot update authored content') from changed;
with changed as (delete from public.places where id='30000000-0000-0000-0000-000000000001' returning id) select pg_temp.assert_true(count(*)=0,'viewer cannot delete authored content') from changed;
reset role;

delete from public.trip_members where trip_id='10000000-0000-0000-0000-000000000001' and user_id='00000000-0000-0000-0000-000000000004';
set role authenticated;
select set_config('request.jwt.claim.sub','00000000-0000-0000-0000-000000000004',false);
with changed as (update public.places set notes='blocked removed' where id='30000000-0000-0000-0000-000000000003' returning id) select pg_temp.assert_true(count(*)=0,'removed member cannot update') from changed;
reset role;

set role authenticated;
select set_config('request.jwt.claim.sub','00000000-0000-0000-0000-000000000002',false);
update public.places set notes='editor works' where id='30000000-0000-0000-0000-000000000001';
reset role;
update public.trip_members set role='organizer' where trip_id='10000000-0000-0000-0000-000000000001' and user_id='00000000-0000-0000-0000-000000000002';
set role authenticated;
select set_config('request.jwt.claim.sub','00000000-0000-0000-0000-000000000002',false);
update public.trip_members set role='member' where trip_id='10000000-0000-0000-0000-000000000001' and user_id='00000000-0000-0000-0000-000000000003';
reset role;
select pg_temp.assert_true((select role='member' from public.trip_members where trip_id='10000000-0000-0000-0000-000000000001' and user_id='00000000-0000-0000-0000-000000000003'),'organizer manages non-owner');
select pg_temp.assert_true((select notes='editor works' from public.places where id='30000000-0000-0000-0000-000000000001'),'editor update');
select pg_temp.expect_error($q$delete from public.trip_members where trip_id='10000000-0000-0000-0000-000000000001' and user_id='00000000-0000-0000-0000-000000000001'$q$,'owner membership delete');
select pg_temp.expect_error($q$update public.trip_members set role='viewer' where trip_id='10000000-0000-0000-0000-000000000001' and user_id='00000000-0000-0000-0000-000000000001'$q$,'owner demotion');

set role authenticated;
select set_config('request.jwt.claim.sub','00000000-0000-0000-0000-000000000002',false);
delete from public.trips where id='10000000-0000-0000-0000-000000000001';
reset role;
select pg_temp.assert_true(exists(select 1 from public.trips where id='10000000-0000-0000-0000-000000000001'),'co-organizer/editor cannot delete trip');

insert into public.trips(id,owner_id,title) values ('10000000-0000-0000-0000-000000000002','00000000-0000-0000-0000-000000000005','Other trip');
insert into public.places(id,trip_id,created_by,name) values ('30000000-0000-0000-0000-000000000002','10000000-0000-0000-0000-000000000002','00000000-0000-0000-0000-000000000005','Other place');
select pg_temp.expect_error($q$insert into public.trip_clips(trip_id,created_by,place_id,source,source_url) values ('10000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-000000000001','30000000-0000-0000-0000-000000000002','web','https://example.test')$q$,'cross-trip place');
select pg_temp.expect_error($q$insert into public.expenses(trip_id,created_by,paid_by_participant_id,description,amount_minor,currency) values ('10000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-000000000001',(select id from public.trip_participants where trip_id='10000000-0000-0000-0000-000000000002'),'bad',100,'USD')$q$,'cross-trip participant');
update public.trip_participants set status='removed',removed_at=now() where id='20000000-0000-0000-0000-000000000003';
set role authenticated;
select set_config('request.jwt.claim.sub','00000000-0000-0000-0000-000000000001',false);
select pg_temp.assert_true(exists(select 1 from public.trip_participants where id='20000000-0000-0000-0000-000000000003'),'authorized member reads removed participant history');
reset role;

select pg_temp.assert_true(not exists(select 1 from pg_proc where pronamespace='public'::regnamespace and proname in ('is_user_trip_member','is_expense_participant')),'probing helpers removed');
select pg_temp.assert_true(exists(select 1 from pg_policies where schemaname='public' and tablename='trips' and policyname='trips_select_members'),'RLS policies installed');
select pg_temp.assert_true(exists(select 1 from pg_trigger where tgname='trip_members_protect_owner'),'owner trigger installed');

-- Invitation checks call trusted auth.users; invalid-state checks all share the generic rejection path.
insert into public.trip_invitations(id,trip_id,token_hash,role,invited_email,invited_by,expires_at,max_uses,use_count) values
 ('40000000-0000-0000-0000-000000000001','10000000-0000-0000-0000-000000000001',extensions.digest(convert_to('mismatch','UTF8'),'sha256'),'member','other@example.com','00000000-0000-0000-0000-000000000001',now()+interval '1 day',1,0),
 ('40000000-0000-0000-0000-000000000002','10000000-0000-0000-0000-000000000001',extensions.digest(convert_to('expired','UTF8'),'sha256'),'member',null,'00000000-0000-0000-0000-000000000001',now()-interval '1 day',1,0),
 ('40000000-0000-0000-0000-000000000003','10000000-0000-0000-0000-000000000001',extensions.digest(convert_to('revoked','UTF8'),'sha256'),'member',null,'00000000-0000-0000-0000-000000000001',now()+interval '1 day',1,0),
 ('40000000-0000-0000-0000-000000000004','10000000-0000-0000-0000-000000000001',extensions.digest(convert_to('exhausted','UTF8'),'sha256'),'member',null,'00000000-0000-0000-0000-000000000001',now()+interval '1 day',1,1);
update public.trip_invitations set revoked_at=now() where id='40000000-0000-0000-0000-000000000003';
set role authenticated;
select set_config('request.jwt.claim.sub','00000000-0000-0000-0000-000000000001',false);
select pg_temp.expect_error($q$select public.accept_trip_invitation('mismatch')$q$,'mismatched invitation');
select pg_temp.expect_error($q$select public.accept_trip_invitation('expired')$q$,'expired invitation');
select pg_temp.expect_error($q$select public.accept_trip_invitation('revoked')$q$,'revoked invitation');
select pg_temp.expect_error($q$select public.accept_trip_invitation('exhausted')$q$,'exhausted invitation');
select set_config('request.jwt.claim.sub','00000000-0000-0000-0000-000000000007',false);
select pg_temp.expect_error($q$select public.accept_trip_invitation('mismatch')$q$,'anonymous invitation');
select set_config('request.jwt.claim.sub','00000000-0000-0000-0000-000000000006',false);
select pg_temp.expect_error($q$select public.accept_trip_invitation('mismatch')$q$,'unconfirmed invitation');
reset role;
