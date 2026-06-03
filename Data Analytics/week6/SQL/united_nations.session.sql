use united_nations;

CREATE TABLE IF NOT EXISTS Access_to_Basic_Services (
    Region VARCHAR(255) NOT NULL,
    Sub_region VARCHAR(255) NOT NULL,
    Country_name VARCHAR(255) NOT NULL,
    Time_period VARCHAR(255) NOT NULL,
    Pct_managed_drinking_water_services NUMERIC(10,2) NOT NULL,
    Pct_managed_sanitation_services NUMERIC(10,2) NOT NULL,
    Est_population_in_millions NUMERIC(10,2) NOT NULL,
    Est_gdp_in_billions NUMERIC(10,2) NOT NULL,
    Land_area_in_sq_km NUMERIC(10,2) NOT NULL,
    Pct_unemployment_rate NUMERIC(10,2) NOT NULL
);

ALTER TABLE Access_to_Basic_Services
MODIFY COLUMN Est_population_in_millions NUMERIC(10,2) NULL,
MODIFY COLUMN Est_gdp_in_billions NUMERIC(10,2) NULL,
MODIFY COLUMN Land_area_in_sq_km NUMERIC(10,2) NULL,
MODIFY COLUMN Pct_unemployment_rate NUMERIC(10,2) NULL;

-- Load CSV data into the table
-- If needed, enable local infile in your MySQL session/server:
-- SET GLOBAL local_infile = 1;

select * from Access_to_Basic_Services;

TRUNCATE TABLE Access_to_Basic_Services;

SET GLOBAL local_infile = 1;

LOAD DATA LOCAL INFILE 'C:/Users/Anthony/Pictures/alx-datascience/week6/SQL/access_to_basic_services.csv'
INTO TABLE Access_to_Basic_Services
FIELDS TERMINATED BY ';'
LINES TERMINATED BY '\n'
IGNORE 1 ROWS
(
    Region,
    Sub_region,
    Country_name,
    Time_period,
    Pct_managed_drinking_water_services,
    Pct_managed_sanitation_services,
    Est_population_in_millions,
    Est_gdp_in_billions,
    Land_area_in_sq_km,
    Pct_unemployment_rate
);

SELECT COUNT(*) AS imported_rows FROM Access_to_Basic_Services;


select * from access_to_basic_services;

-- ALTER TABLE
-- (1) To add a column_
ALTER TABLE access_to_basic_services
ADD COLUMN Population_density_per_sq_km NUMERIC(10,2);

-- (2) To modify a column data type
ALTER TABLE access_to_basic_services
ALTER COLUMN Population_density_per_sq_km INTEGER;

-- (3) To drop a column
ALTER TABLE access_to_basic_services
DROP COLUMN Population_density_per_sq_km;

-- (4) To rename a column
ALTER TABLE access_to_basic_services
RENAME COLUMN Pct_unemployment_rate TO Unemployment_rate_pct;

-- (5) To rename a table
ALTER TABLE access_to_basic_services
RENAME TO basic_services_access;

-- (6) To add a primary key
ALTER TABLE basic_services_access
ADD COLUMN id SERIAL PRIMARY KEY;

-- (7) To add a foreign key
ALTER TABLE basic_services_access
ADD COLUMN region_id INTEGER,
ADD CONSTRAINT fk_region
FOREIGN KEY (region_id) REFERENCES regions(id);

-- ALTER DATABASE NAME
ALTER DATABASE united_nations
RENAME TO un_nations;

-- TRANCATE TABLE
TRUNCATE TABLE basic_services_access;


show tables;

select * from access_to_basic_services;

-- Update a record
update access_to_basic_services
set Country_name = 'Kenya'
where Country_name = 'Ethiopia';


select * from access_to_basic_services;

-- insert a new record
insert into access_to_basic_services
VALUES
('Africa', 'Eastern Africa', 'Kenya', '2015-2020',
 60.2, 30.5, 53.8, 95.5, 580367, 19.5);

 select * from access_to_basic_services;


 -- Delete a record
 delete from access_to_basic_services
 where Country_name = 'Kenya' and Pct_unemployment_rate = 19.5;

 select * from access_to_basic_services;


 create table IF NOT EXISTS regions (
    id SERIAL PRIMARY KEY,
    Region_name VARCHAR(255) NOT NULL
);
insert into regions (Region_name) VALUES
('Africa'),
('Asia'),
('Europe'),
('Americas'),
('Oceania');


select * from regions;


-- use delete without a where clause to remove a specific record
delete from regions;


describe regions;


-- use truncate to remove all records from a table
TRUNCATE table access_to_basic_services;
select * from access_to_basic_services;

describe access_to_basic_services;


-- select access_to_basic_services
select * from access_to_basic_services;


CREATE TABLE IF NOT EXISTS Water_Basic_Services (
    Region VARCHAR(255) NOT NULL,
    Sub_region VARCHAR(255) NOT NULL,
    Country_name VARCHAR(255) NOT NULL,
    Time_period VARCHAR(255) NOT NULL,
    Pct_managed_drinking_water_services NUMERIC(10,2) NOT NULL,
    Pct_managed_sanitation_services NUMERIC(10,2) NOT NULL,
    Est_population_in_millions NUMERIC(10,2) NOT NULL,
    Est_gdp_in_billions NUMERIC(10,2) NOT NULL,
    Land_area_in_sq_km NUMERIC(10,2) NOT NULL,
    Pct_unemployment_rate NUMERIC(10,2) NOT NULL
);

-- rename column names
ALTER TABLE water_basic_services
RENAME COLUMN Land_area_in_sq_km TO Land_area,
RENAME COLUMN Pct_unemployment_rate TO Pct_unemployment;

drop table water_basic_services;

ALTER TABLE Water_Basic_Services
MODIFY COLUMN Est_population_in_millions NUMERIC(10,2) NULL,
MODIFY COLUMN Est_gdp_in_billions NUMERIC(10,2) NULL,
MODIFY COLUMN Land_area NUMERIC(10,2) NULL,
MODIFY COLUMN Pct_unemployment NUMERIC(10,2) NULL;

ALTER TABLE Access_to_Basic_Services 
MODIFY Pct_managed_sanitation_services NUMERIC(10,2) NULL;

ALTER TABLE Access_to_Basic_Services 
MODIFY Est_population_in_millions NUMERIC(10,2) NULL;

ALTER TABLE Access_to_Basic_Services 
MODIFY Est_gdp_in_billions NUMERIC(10,2) NULL;

ALTER TABLE Access_to_Basic_Services 
MODIFY Land_area_in_sq_km NUMERIC(10,2) NULL;

ALTER TABLE Access_to_Basic_Services 
MODIFY Pct_unemployment_rate NUMERIC(10,2) NULL;

select * from water_basic_services;

-- count the number of records in the table
SELECT COUNT(*) AS total_records FROM water_basic_services;
