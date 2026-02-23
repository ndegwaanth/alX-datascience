CREATE TABLE admin_login (
    id SERIAL PRIMARY KEY,
    email VARCHAR(254) UNIQUE NOT NULL,
    password VARCHAR(128) NOT NULL
);
INSERT INTO admin_login (email, password) VALUES ('admin@example.com', 'securepassword123');

SELECT * FROM admin_login;

CREATE TABLE user_login (
    id SERIAL PRIMARY KEY,
    email VARCHAR(254) UNIQUE NOT NULL,
    password VARCHAR(128) NOT NULL
);

INSERT INTO user_login (email, password) VALUES 
('user@example.com', 'userpassword123'),
('donkamau@gmail.com', 'donkamau123'),
('mary@gmail.com', 'marypassword123');

SELECT * FROM user_login;


CREATE TABLE user_signup (
    id SERIAL PRIMARY KEY,
    first_name VARCHAR(30) NOT NULL,
    last_name VARCHAR(30) NOT NULL,
    residence VARCHAR(50) NOT NULL,
    phone_number VARCHAR(15) UNIQUE NOT NULL,
    email VARCHAR(254) UNIQUE NOT NULL,
    password VARCHAR(128) NOT NULL
);

INSERT INTO user_signup (first_name, last_name, residence, phone_number, email, password) VALUES 
('John', 'Doe', 'Nairobi', '0712345678', 'john.doe@example.com', 'johnpassword123'),
('Jane', 'Smith', 'Mombasa', '0723456789', 'jane.smith@example.com', 'janepassword123'),
('Mary', 'Johnson', 'Kisumu', '0734567890', 'mary.johnson@example.com', 'marypassword123');

SELECT * FROM user_signup;