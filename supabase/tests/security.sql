\set ON_ERROR_STOP on
create or replace function pg_temp.assert_true(value boolean, message text) returns void language plpgsql as $$ begin if not coalesce(value, false) then raise exception 'assertion failed: %', message; end if; end $$;
create or replace function pg_temp.expect_error(statement text, expected_state text, expected_fragment text) returns void language plpgsql as $$
declare actual_state text; actual_message text;
begin
  begin
    execute statement;
  exception when others then
    get stacked diagnostics actual_state = returned_sqlstate, actual_message = message_text;
    if actual_state = expected_state and position(expected_fragment in actual_message) > 0 then return; end if;
    raise exception 'unexpected error: expected [%] containing [%], got [%] [%]', expected_state, expected_fragment, actual_state, actual_message;
  end;
  raise exception 'expected error [%] containing [%], but statement succeeded', expected_state, expected_fragment;
end $$;

insert into auth.users(id,email,email_confirmed_at) values
 ('00000000-0000-0000-0000-000000000001','owner@example.com',now()),
 ('00000000-0000-0000-0000-000000000002','editor@example.com',now()),
 ('00000000-0000-0000-0000-000000000003','viewer@example.com',now()),
 ('00000000-0000-0000-0000-000000000004','member@example.com',now()),
 ('00000000-0000-0000-0000-000000000005','other@example.com',now()),
 ('00000000-0000-0000-0000-000000000006','unconfirmed@example.com',null),
 ('00000000-0000-0000-0000-000000000007','anon@example.com',now()),
 ('00000000-0000-0000-0000-000000000008','joiner@example.com',now()),
 ('00000000-0000-0000-0000-000000000009','second@example.com',now()),
 ('00000000-0000-0000-0000-000000000011','author@example.com',now()),
 ('00000000-0000-0000-0000-000000000012','replacement@example.com',now()),
 ('00000000-0000-0000-0000-000000000013','delete-owner@example.com',now());
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
select pg_temp.expect_error($q$delete from public.trip_members where trip_id='10000000-0000-0000-0000-000000000001' and user_id='00000000-0000-0000-0000-000000000001'$q$,'P0001','Trip owner membership must remain organizer');
select pg_temp.expect_error($q$update public.trip_members set role='viewer' where trip_id='10000000-0000-0000-0000-000000000001' and user_id='00000000-0000-0000-0000-000000000001'$q$,'P0001','Trip owner membership must remain organizer');

set role authenticated;
select set_config('request.jwt.claim.sub','00000000-0000-0000-0000-000000000002',false);
delete from public.trips where id='10000000-0000-0000-0000-000000000001';
reset role;
select pg_temp.assert_true(exists(select 1 from public.trips where id='10000000-0000-0000-0000-000000000001'),'co-organizer/editor cannot delete trip');

insert into public.trips(id,owner_id,title) values ('10000000-0000-0000-0000-000000000002','00000000-0000-0000-0000-000000000005','Other trip');
insert into public.places(id,trip_id,created_by,name) values ('30000000-0000-0000-0000-000000000002','10000000-0000-0000-0000-000000000002','00000000-0000-0000-0000-000000000005','Other place');
select pg_temp.expect_error($q$insert into public.trip_clips(trip_id,created_by,place_id,source,source_url) values ('10000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-000000000001','30000000-0000-0000-0000-000000000002','web','https://example.test')$q$,'23503','clips_place_same_trip');
select pg_temp.expect_error($q$insert into public.expenses(trip_id,created_by,paid_by_participant_id,description,amount_minor,currency) values ('10000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-000000000001',(select id from public.trip_participants where trip_id='10000000-0000-0000-0000-000000000002'),'bad',100,'USD')$q$,'23503','expense_payer_same_trip');
update public.trip_participants set status='removed',removed_at=now() where id='20000000-0000-0000-0000-000000000003';
set role authenticated;
select set_config('request.jwt.claim.sub','00000000-0000-0000-0000-000000000001',false);
select pg_temp.assert_true(exists(select 1 from public.trip_participants where id='20000000-0000-0000-0000-000000000003'),'authorized member reads removed participant history');
reset role;

select pg_temp.assert_true(not exists(select 1 from pg_proc where pronamespace='public'::regnamespace and proname in ('is_user_trip_member','is_expense_participant')),'probing helpers removed');
select pg_temp.assert_true(exists(select 1 from pg_policies where schemaname='public' and tablename='trips' and policyname='trips_select_members'),'RLS policies installed');
select pg_temp.assert_true(exists(select 1 from pg_trigger where tgname='trip_members_protect_owner'),'owner trigger installed');

-- Every rejection uses a fresh token so each assertion proves one condition.
insert into public.trip_invitations(id,trip_id,token_hash,role,invited_email,invited_by,expires_at,max_uses,use_count,revoked_at) values
 ('40000000-0000-0000-0000-000000000001','10000000-0000-0000-0000-000000000001',extensions.digest(convert_to('mismatch','UTF8'),'sha256'),'member','other@example.com','00000000-0000-0000-0000-000000000001',now()+interval '1 day',1,0,null),
 ('40000000-0000-0000-0000-000000000002','10000000-0000-0000-0000-000000000001',extensions.digest(convert_to('expired','UTF8'),'sha256'),'member',null,'00000000-0000-0000-0000-000000000001',now()-interval '1 day',1,0,null),
 ('40000000-0000-0000-0000-000000000003','10000000-0000-0000-0000-000000000001',extensions.digest(convert_to('revoked','UTF8'),'sha256'),'member',null,'00000000-0000-0000-0000-000000000001',now()+interval '1 day',1,0,now()),
 ('40000000-0000-0000-0000-000000000004','10000000-0000-0000-0000-000000000001',extensions.digest(convert_to('exhausted','UTF8'),'sha256'),'member',null,'00000000-0000-0000-0000-000000000001',now()+interval '1 day',1,1,null),
 ('40000000-0000-0000-0000-000000000005','10000000-0000-0000-0000-000000000001',extensions.digest(convert_to('anonymous','UTF8'),'sha256'),'member',null,'00000000-0000-0000-0000-000000000001',now()+interval '1 day',1,0,null),
 ('40000000-0000-0000-0000-000000000006','10000000-0000-0000-0000-000000000001',extensions.digest(convert_to('unconfirmed','UTF8'),'sha256'),'member',null,'00000000-0000-0000-0000-000000000001',now()+interval '1 day',1,0,null),
 ('40000000-0000-0000-0000-000000000007','10000000-0000-0000-0000-000000000001',extensions.digest(convert_to('already','UTF8'),'sha256'),'member',null,'00000000-0000-0000-0000-000000000001',now()+interval '1 day',1,0,null),
 ('40000000-0000-0000-0000-000000000008','10000000-0000-0000-0000-000000000001',extensions.digest(convert_to('redeem','UTF8'),'sha256'),'member',null,'00000000-0000-0000-0000-000000000001',now()+interval '1 day',1,0,null);
set role authenticated;
select set_config('request.jwt.claim.sub','00000000-0000-0000-0000-000000000001',false);
select pg_temp.expect_error($q$select public.accept_trip_invitation('mismatch')$q$,'P0001','Invitation is for a different email address');
select pg_temp.expect_error($q$select public.accept_trip_invitation('expired')$q$,'P0001','Invitation is invalid, expired, revoked, or fully used');
select pg_temp.expect_error($q$select public.accept_trip_invitation('revoked')$q$,'P0001','Invitation is invalid, expired, revoked, or fully used');
select pg_temp.expect_error($q$select public.accept_trip_invitation('exhausted')$q$,'P0001','Invitation is invalid, expired, revoked, or fully used');
select pg_temp.expect_error($q$select public.accept_trip_invitation('already')$q$,'P0001','Already a trip member');
reset role;
select pg_temp.assert_true((select use_count=0 from public.trip_invitations where id='40000000-0000-0000-0000-000000000007'),'existing member does not consume invitation');
set role authenticated;
select set_config('request.jwt.claim.sub','00000000-0000-0000-0000-000000000007',false);
select pg_temp.expect_error($q$select public.accept_trip_invitation('anonymous')$q$,'P0001','A confirmed, non-anonymous account is required');
select set_config('request.jwt.claim.sub','00000000-0000-0000-0000-000000000006',false);
select pg_temp.expect_error($q$select public.accept_trip_invitation('unconfirmed')$q$,'P0001','A confirmed, non-anonymous account is required');
select set_config('request.jwt.claim.sub','00000000-0000-0000-0000-000000000008',false);
select public.accept_trip_invitation('redeem');
reset role;
select pg_temp.assert_true((select use_count=1 from public.trip_invitations where id='40000000-0000-0000-0000-000000000008'),'successful new member consumes one use');
set role authenticated;
select set_config('request.jwt.claim.sub','00000000-0000-0000-0000-000000000009',false);
select pg_temp.expect_error($q$select public.accept_trip_invitation('redeem')$q$,'P0001','Invitation is invalid, expired, revoked, or fully used');
reset role;

-- An authenticated organizer cannot rewrite membership or participant identity.
set role authenticated;
select set_config('request.jwt.claim.sub','00000000-0000-0000-0000-000000000002',false);
select pg_temp.expect_error($q$update public.trip_members set user_id='00000000-0000-0000-0000-000000000012' where trip_id='10000000-0000-0000-0000-000000000001' and user_id='00000000-0000-0000-0000-000000000003'$q$,'P0001','Membership identity is immutable');
select pg_temp.expect_error($q$update public.trip_participants set user_id='00000000-0000-0000-0000-000000000012' where id='20000000-0000-0000-0000-000000000003'$q$,'P0001','participant user_id is immutable');
select pg_temp.expect_error($q$update public.places set created_by=null where id='30000000-0000-0000-0000-000000000001'$q$,'P0001','created_by is immutable');
reset role;

-- Account deletion nulls provenance and participant linkage but preserves history.
insert into public.trip_members(trip_id,user_id,role) values ('10000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-000000000011','member');
insert into public.trip_participants(id,trip_id,user_id,display_name) values ('20000000-0000-0000-0000-000000000011','10000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-000000000011','Author');
insert into public.travel_segments(id,trip_id,participant_id,created_by,kind,departure_place,arrival_place,departs_at,departure_time_zone,arrival_time_zone) values ('50000000-0000-0000-0000-000000000001','10000000-0000-0000-0000-000000000001','20000000-0000-0000-0000-000000000011','00000000-0000-0000-0000-000000000011','flight','A','B',now(),'UTC','UTC');
insert into public.accommodations(id,trip_id,created_by,name,time_zone) values ('51000000-0000-0000-0000-000000000001','10000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-000000000011','Stay','UTC');
insert into public.places(id,trip_id,created_by,name) values ('52000000-0000-0000-0000-000000000001','10000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-000000000011','Place');
insert into public.trip_clips(id,trip_id,created_by,source,source_url) values ('53000000-0000-0000-0000-000000000001','10000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-000000000011','web','https://author.example');
insert into public.itinerary_items(id,trip_id,created_by,title,starts_at,time_zone) values ('54000000-0000-0000-0000-000000000001','10000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-000000000011','Plan',now(),'UTC');
insert into public.expenses(id,trip_id,created_by,paid_by_participant_id,description,amount_minor,currency) values ('55000000-0000-0000-0000-000000000001','10000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-000000000011','20000000-0000-0000-0000-000000000011','Expense',100,'USD');
delete from auth.users where id='00000000-0000-0000-0000-000000000011';
select pg_temp.assert_true(not exists(select 1 from auth.users where id='00000000-0000-0000-0000-000000000011'),'non-owner account deletion succeeds');
select pg_temp.assert_true((select bool_and(created_by is null) from (select created_by from public.travel_segments where id='50000000-0000-0000-0000-000000000001' union all select created_by from public.accommodations where id='51000000-0000-0000-0000-000000000001' union all select created_by from public.places where id='52000000-0000-0000-0000-000000000001' union all select created_by from public.trip_clips where id='53000000-0000-0000-0000-000000000001' union all select created_by from public.itinerary_items where id='54000000-0000-0000-0000-000000000001' union all select created_by from public.expenses where id='55000000-0000-0000-0000-000000000001') rows),'all authored rows survive with null provenance');
select pg_temp.assert_true((select user_id is null from public.trip_participants where id='20000000-0000-0000-0000-000000000011'),'account deletion nulls participant link');

-- Anonymous receives neither table access nor helper execution despite bootstrap grants.
set role anon;
select pg_temp.expect_error($q$select * from public.trips$q$,'42501','permission denied');
select pg_temp.expect_error($q$select public.is_trip_member('10000000-0000-0000-0000-000000000001')$q$,'42501','permission denied');
reset role;

-- Unfiltered viewer writes and removed-member writes affect no content rows.
insert into public.trip_members(trip_id,user_id,role) values ('10000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-000000000012','viewer');
insert into public.places(id,trip_id,created_by,name) values ('52000000-0000-0000-0000-000000000012','10000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-000000000012','Viewer row');
set role authenticated;
select set_config('request.jwt.claim.sub','00000000-0000-0000-0000-000000000012',false);
with changed as (update public.places set notes='forbidden' returning id) select pg_temp.assert_true(count(*)=0,'viewer unfiltered update affects zero rows') from changed;
with changed as (delete from public.places returning id) select pg_temp.assert_true(count(*)=0,'viewer unfiltered delete affects zero rows') from changed;
select set_config('request.jwt.claim.sub','00000000-0000-0000-0000-000000000004',false);
with changed as (update public.places set notes='forbidden' returning id) select pg_temp.assert_true(count(*)=0,'removed member unfiltered update affects zero rows') from changed;
with changed as (delete from public.places returning id) select pg_temp.assert_true(count(*)=0,'removed member unfiltered delete affects zero rows') from changed;
reset role;

-- A contributor can create and update their own content while active.
insert into public.trip_members(trip_id,user_id,role) values ('10000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-000000000004','member');
set role authenticated;
select set_config('request.jwt.claim.sub','00000000-0000-0000-0000-000000000004',false);
insert into public.places(id,trip_id,created_by,name) values ('52000000-0000-0000-0000-000000000004','10000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-000000000004','Contributor row');
update public.places set notes='allowed' where id='52000000-0000-0000-0000-000000000004';
reset role;
select pg_temp.assert_true((select notes='allowed' from public.places where id='52000000-0000-0000-0000-000000000004'),'contributor insert and update succeed');

-- Split identity is immutable even when every proposed identifier would otherwise resolve.
insert into public.expense_splits(trip_id,expense_id,participant_id,share_minor) values ('10000000-0000-0000-0000-000000000001','55000000-0000-0000-0000-000000000001','20000000-0000-0000-0000-000000000011',100);
set role authenticated;
select set_config('request.jwt.claim.sub','00000000-0000-0000-0000-000000000002',false);
select pg_temp.expect_error($q$update public.expense_splits set participant_id='20000000-0000-0000-0000-000000000003' where expense_id='55000000-0000-0000-0000-000000000001'$q$,'P0001','expense split identity is immutable');
select pg_temp.expect_error($q$update public.expense_splits set expense_id='00000000-0000-0000-0000-000000000099' where expense_id='55000000-0000-0000-0000-000000000001'$q$,'P0001','expense split identity is immutable');
select pg_temp.expect_error($q$update public.expense_splits set trip_id='10000000-0000-0000-0000-000000000002' where expense_id='55000000-0000-0000-0000-000000000001'$q$,'P0001','expense split identity is immutable');
reset role;

-- Owner deletion cascades through a populated trip, including ledger rows.
insert into public.trips(id,owner_id,title) values ('10000000-0000-0000-0000-000000000013','00000000-0000-0000-0000-000000000013','Delete me');
insert into public.travel_segments(id,trip_id,participant_id,created_by,kind,departure_place,arrival_place,departs_at,departure_time_zone,arrival_time_zone) select '50000000-0000-0000-0000-000000000013',t.id,(select p.id from public.trip_participants p where p.trip_id=t.id),t.owner_id,'flight','A','B',now(),'UTC','UTC' from public.trips t where t.id='10000000-0000-0000-0000-000000000013';
insert into public.expenses(id,trip_id,created_by,paid_by_participant_id,description,amount_minor,currency) select '55000000-0000-0000-0000-000000000013',t.id,t.owner_id,(select p.id from public.trip_participants p where p.trip_id=t.id),'Delete expense',100,'USD' from public.trips t where t.id='10000000-0000-0000-0000-000000000013';
insert into public.expense_splits(trip_id,expense_id,participant_id,share_minor) select trip_id,id,paid_by_participant_id,100 from public.expenses where id='55000000-0000-0000-0000-000000000013';
set role authenticated;
select set_config('request.jwt.claim.sub','00000000-0000-0000-0000-000000000013',false);
delete from public.trips where id='10000000-0000-0000-0000-000000000013';
reset role;
select pg_temp.assert_true(not exists(select 1 from public.trips where id='10000000-0000-0000-0000-000000000013'),'owner deletes populated trip');
