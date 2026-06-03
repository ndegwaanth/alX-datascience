show databases;
use md_water_services;

show tables;

-- get the first 10 for each table
SELECT * FROM data_dictionary;
SELECT COUNT(*) FROM data_dictionary;

-- 1. What is the population of Maji Ndogo? 
/* Hint: Start by searching the data_dictionary table for the word 'population'.*/
SELECT column_name, description 
FROM data_dictionary
WHERE description LIKE '%population%';

-- 2. What is the population of Maji Ndogo?
SELECT name, pop_n
FROM global_water_access
WHERE name = 'Maji Ndogo';

-- EMPLOYEE
SELECT * FROM employee;
SELECT COUNT(*) FROM employee;

-- 1. What is the address of Bello Azibo?
SELECT address 
FROM employee 
WHERE employee_name = 'Bello Azibo';

-- 2. What is the name and phone number of our Microbiologist?
SELECT employee_name, phone_number 
FROM employee 
WHERE position = 'Micro Biologist';

-- 3. Which SQL query returns records of employees who are Civil Engineers residing in Dahabu or living on an avenue?
select * from employee
where position = 'Civil Engineer' and (town_name = 'Dahabu' or address like '%Avenue%');

/*
4. Create a query to identify potentially suspicious field workers based on an anonymous tip. This is the description we are given:

The employee’s phone number contained the digits 86 or 11. 
The employee’s last name started with either an A or an M. 
The employee was a Field Surveyor.
Which option is correct?
*/
SELECT *
FROM employee
WHERE position = 'Field Surveyor'
AND (phone_number LIKE '%86%' OR phone_number LIKE '%11%')
AND (
      SUBSTRING_INDEX(employee_name, ' ', -1) LIKE 'A%'
   OR SUBSTRING_INDEX(employee_name, ' ', -1) LIKE 'M%'
);

-- backup of the employee table
CREATE TABLE employee_backup LIKE employee;

INSERT INTO employee_backup
SELECT * FROM employee;

select * from employee
where employee_name = 'Bello Azibo';

/*
You have been given a task to correct the phone number for the employee named 'Bello Azibo'. The correct number is +99643864786. Write the SQL query to accomplish this. Note: Running these queries on the employee table may create issues later, so use the knowledge you have learned to avoid that.
*/
UPDATE employee_backup
SET phone_number = '+99643864786'
WHERE employee_name = 'Bello Azibo';

select * from employee_backup
where employee_name = 'Bello Azibo';

describe employee_backup;

-- GLOBAL WATER ACCESS
SELECT * FROM global_water_access;
SELECT COUNT(*) FROM global_water_access;

-- LOCATION
SELECT * FROM location;
SELECT COUNT(*) FROM location;

-- unique location types
SELECT DISTINCT location_type FROM location;

SELECT * FROM visits LIMIT 10;
SELECT COUNT(*) FROM visits;

-- WATER QUALITY
SELECT * FROM water_quality;
SELECT COUNT(*) FROM water_quality;

-- identify the records with a quality score of 10, visited more than once?

SELECT *
FROM water_quality
WHERE subjective_quality_score = 10 AND visit_count > 1;

SELECT * FROM water_quality WHERE visit_count >= 2 AND subjective_quality_score = 10

-- WATER SOURCE
SELECT * FROM water_source;
SELECT COUNT(*) FROM water_source;

--1. What are the different types of water sources available in the database?
select DISTINCT type_of_water_source from water_source;

-- 2.What is the source_id of the water source shared by the most number of people? Hint: Use a comparison operator to find the maximum number of people sharing a water source and then retrieve the corresponding source_id.
SELECT source_id, number_of_people_served
FROM water_source
WHERE number_of_people_served = (
    SELECT MAX(number_of_people_served) 
    FROM water_source
);


-- WELL POLLUTION
SELECT * FROM well_pollution;
SELECT COUNT(*) FROM well_pollution;

-- 1. retun the number of records in the well_pollution table where the description contains the word 'Clean' and the biological contamination level is less than 0.01.
SELECT COUNT(*)
FROM well_pollution
WHERE (description LIKE 'Clean_%' OR results = 'Clean') AND biological < 0.01;


-- 2. How many rows of data are returned for the following query?
SELECT COUNT(*) 
FROM well_pollution
WHERE description
IN ('Parasite: Cryptosporidium', 'biologically contaminated')
OR (results = 'Clean' AND biological > 0.01);