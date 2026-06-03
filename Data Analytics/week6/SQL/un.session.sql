show databases;

use united_nations;

show tables;

select * from access_to_basic_services;

select * from access_to_basic_services
where Country_name = 'Kenya';

-- SELECT
-- FROM
-- WHERE
select Country_name, Region, Sub_region FROM access_to_basic_services
where Country_name = 'Kenya';

-- Liimit
select * from access_to_basic_services LIMIT 5;

-- Detecting duplicates
-- GROUP BY
-- HAVING
select Country_name, count(*) as duplicates_count FROM
access_to_basic_services
group by Country_name
having count(*) > 1;

-- seeing the actual duplicates
select * from access_to_basic_services
where Country_name in (
    select Country_name from access_to_basic_services
    group by Country_name
    having COUNT(*) > 1
)

-- remove the duplicates
create table no_duplicates_access_to_basic_services as
select distinct * from access_to_basic_services
where Country_name in (
    select Country_name from access_to_basic_services
    group by Country_name
    having COUNT(*) > 1
);

drop table no_duplicates_access_to_basic_services;

select * from no_duplicates_access_to_basic_services;

select Sub_region as continent
from access_to_basic_services;

select continent from access_to_basic_services;

-- select countries with the hihest pct_unemployment
select Country_name, pct_unemployment_rate
from access_to_basic_services
where pct_unemployment_rate > 5.0
order by Pct_unemployment_rate desc;


-- get the countries with est_gdp_in_billions greater than 400
select Country_name, est_gdp_in_billions
from access_to_basic_services
where est_gdp_in_billions > 400
order by est_gdp_in_billions desc;


-- get the countries with est_population_in_millions greater than 100
select Country_name, est_population_in_millions
from access_to_basic_services
where est_population_in_millions > 50 and est_population_in_millions < 100
order by est_population_in_millions desc;

-- est_pouplation less than a million
select Country_name, est_population_in_millions
from access_to_basic_services
where est_population_in_millions < 1
order by est_population_in_millions desc;

select * from access_to_basic_services;


-- IN
select Country_name, Est_population_in_millions, est_gdp_in_billions, pct_unemployment_rate
from access_to_basic_services
where Country_name in ('Kenya', 'Nigeria', 'South Africa')
order by est_population_in_millions desc;

-- between
select country_name, est_population_in_millions, est_gdp_in_billions, pct_unemployment_rate
FROM access_to_basic_services
WHERE est_population_in_millions BETWEEN 10 AND 20
ORDER BY est_population_in_millions desc;

-- GET EXACT COLUMNS THAT ARE NULL
select Country_name, est_population_in_millions, est_gdp_in_billions, pct_unemployment_rate
FROM access_to_basic_services
WHERE est_population_in_millions IS NULL OR est_gdp_in_billions IS NULL OR pct_unemployment_rate IS NULL
ORDER BY Country_name;

-- not between
select country_name, est_population_in_millions, est_gdp_in_billions, pct_unemployment_rate
FROM access_to_basic_services
WHERE est_population_in_millions NOT BETWEEN 10 AND 20
ORDER BY est_population_in_millions desc;

-- IS NOT NULL
select Country_name, est_population_in_millions, est_gdp_in_billions, pct_unemployment_rate
FROM access_to_basic_services
WHERE est_population_in_millions IS NOT NULL AND est_gdp_in_billions IS NOT NULL AND pct_unemployment_rate IS NOT NULL
ORDER BY Country_name;