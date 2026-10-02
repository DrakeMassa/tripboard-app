begin;

update public.travel_segments
set
  departure_time_zone = case upper(trim(departure_place))
    when 'ILM' then 'America/New_York'
    when 'CLT' then 'America/New_York'
    when 'STL' then 'America/Chicago'
    when 'MCI' then 'America/Chicago'
    else departure_time_zone
  end,
  arrival_time_zone = case upper(trim(arrival_place))
    when 'ILM' then 'America/New_York'
    when 'CLT' then 'America/New_York'
    when 'STL' then 'America/Chicago'
    when 'MCI' then 'America/Chicago'
    else arrival_time_zone
  end
where upper(trim(departure_place)) in ('ILM', 'CLT', 'STL', 'MCI')
   or upper(trim(arrival_place)) in ('ILM', 'CLT', 'STL', 'MCI');

commit;
