use united_nations;

/* create table employees (
    id int primary key,
    name varchar(255) not null,
    position varchar(255) not null,
    department varchar(255) not null,
    salary decimal(10, 2) not null
);
*/
INSERT into employees VALUES(1, 'John Doe', 'Program Manager', 'Development', 75000.00);
INSERT into employees VALUES(2, 'Jane Smith', 'Data Analyst', 'Research', 65000.00);
INSERT into employees VALUES(3, 'Emily Davis', 'HR Specialist', 'Human Resources', 55000.00);
INSERT into employees VALUES(4, 'Michael Brown', 'Financial Analyst', 'Finance', 70000.00);

select * from employees;

use united_nations;

create table IF NOT EXISTS Access_to_Basic_Services (
    Region varchar(255) NOT NULL,
    Sub_region varchar(255) NOT NULL,
    Country_name varchar(255) NOT NULL,
    Time_period varchar(255) NOT NULL,
    Pct_managed_drinking_water_services numeric(10,2) NOT NULL,
    Pct_managed_sanitation_services numeric(10,2) NOT NULL,
    Est_population_in_millions numeric(10,2) NOT NULL,
    Est_gdp_in_billions numeric(10,2) NOT NULL,
    Land_area_in_sq_km numeric(10,2) NOT NULL,
    Pct_unemployment_rate numeric(10,2) NOT NULL,
);

insert into Access_to_Basic_Services (Region, Sub_region, Country_name, Time_period, Pct_managed_drinking_water_services, Pct_managed_sanitation_services, Est_population_in_millions, Est_gdp_in_billions, Land_area_in_sq_km, Pct_unemployment_rate)
values
('Africa', 'Eastern Africa', 'Ethiopia', '2015-2020', 57.5, 28.3, 109.2, 96.1, 1104300, 19.1),
('Asia', 'Southern Asia', 'India', '2015-2020', 88.2, 60.4, 1380.0, 2875.1, 3287263, 7.1),
('Europe', 'Western Europe', 'Germany', '2015-2020', 99.8, 98.5, 83.2, 3845.6, 3.2),
('Americas', 'Northern America', 'United States', '2015-2020', 99.9, 99.7, 331.0, 21433.2, 3.7),
('Oceania', 'Australia and New Zealand', 'Australia', '2015-2020', 100.0, 99.9, 25.4, 1392.7, 5.3);


/*
LOAD DATA LOCAL INFILE 'C:/Users/Anthony/Pictures/alx-datascience/week6/SQL/access_to_basic_services.csv'
INTO TABLE Access_to_Basic_Services
FIELDS TERMINATED BY ';'
LINES TERMINATED BY '\n'
IGNORE 1 LINES
(@Region, @Sub_region, @Country_name, @Time_period,
 @Pct_managed_drinking_water_services,
 @Pct_managed_sanitation_services,
 @Est_population_in_millions,
 @Est_gdp_in_billions,
 @Land_area,
 @Pct_unemployment)
SET
 Region = NULLIF(@Region, 'NULL'),
 Sub_region = NULLIF(@Sub_region, 'NULL'),
 Country_name = NULLIF(@Country_name, 'NULL'),
 Time_period = NULLIF(@Time_period, 'NULL'),
 Pct_managed_drinking_water_services = NULLIF(@Pct_managed_drinking_water_services, 'NULL'),
 Pct_managed_sanitation_services = NULLIF(@Pct_managed_sanitation_services, 'NULL'),
 Est_population_in_millions = NULLIF(@Est_population_in_millions, 'NULL'),
 Est_gdp_in_billions = NULLIF(@Est_gdp_in_billions, 'NULL'),
 Land_area_in_sq_km = NULLIF(@Land_area, 'NULL'),
 Pct_unemployment_rate = NULLIF(REPLACE(@Pct_unemployment, '\r', ''), 'NULL');

 */