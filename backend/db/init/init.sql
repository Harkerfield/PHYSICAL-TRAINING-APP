-- Enable PostGIS extension
CREATE EXTENSION IF NOT EXISTS postgis;

-- Create custom team and database with necessary permissions
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'postgres') THEN
        CREATE USER postgres WITH PASSWORD 'your_POSTGRES_password';
    END IF;
END
$$;

CREATE DATABASE your_POSTGRES_DB;
GRANT ALL PRIVILEGES ON DATABASE your_POSTGRES_DB TO postgres;

-- Connect to the custom database
\c your_POSTGRES_DB


-- Create locations table
CREATE TABLE locations (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    latitude FLOAT NOT NULL,
    longitude FLOAT NOT NULL,
    points INT NOT NULL,
    password VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert initial locations
INSERT INTO locations (name, latitude, longitude, points, password, created_at) VALUES
('Pillbox Hospital Cave', 26.336022930520848, 127.75814715499078, 10, 'pass', CURRENT_TIMESTAMP),
('18th Wing Quonset Hut', 26.332953338988236, 127.75674425898805, 15, 'pass', CURRENT_TIMESTAMP),
('The Abandoned Tennis Courts', 26.329636916428235, 127.75559574231694, 20, 'pass', CURRENT_TIMESTAMP),
('Ryukyu Ancient Tombs', 26.33559358519529, 127.76620718755586, 25, 'pass', CURRENT_TIMESTAMP),
('Shimosezu Ashibina Remains', 26.33789445219514, 127.76465865450513, 30, 'pass', CURRENT_TIMESTAMP),
('WWII Japanese Surrender Site', 26.348202231028804, 127.79051052224301, 30, 'pass', CURRENT_TIMESTAMP),
('WWII Japanese Aircraft Shelters', 26.357541642444193, 127.79337130993598, 30, 'pass', CURRENT_TIMESTAMP),
('Former 7th Infantry Division Cemetery', 26.3526995033053, 127.75276345110198, 30, 'pass', CURRENT_TIMESTAMP),
('Kadena Lookout Post Site', 26.32807994995945, 127.75364876563889, 30, 'pass', CURRENT_TIMESTAMP),
('Cool route behhind the 159 building', 26.342795875662425, 127.77760203884525, 30, 'pass', CURRENT_TIMESTAMP);

-- Create sessions table
CREATE TABLE sessions (
    sid VARCHAR NOT NULL COLLATE "default",
    sess JSON NOT NULL,
    expire TIMESTAMP(6) NOT NULL
)
WITH (OIDS=FALSE);

ALTER TABLE sessions ADD CONSTRAINT "session_pkey" PRIMARY KEY ("sid") NOT DEFERRABLE INITIALLY IMMEDIATE;

CREATE INDEX "IDX_sessions_expire" ON sessions ("expire");

-- Create teams table
CREATE TABLE teams (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    pin_code VARCHAR(10) NOT NULL,
    is_admin BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Add current_location field to teams table
ALTER TABLE teams ADD COLUMN current_location POINT;



-- Create files table
CREATE TABLE files (
    id SERIAL PRIMARY KEY,
    team_id INT REFERENCES teams(id),
    file_data BYTEA NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create points_transactions table
CREATE TABLE points_transactions (
    id SERIAL PRIMARY KEY,
    team_id INT REFERENCES teams(id),
    source VARCHAR(255) NOT NULL,
    points INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


-- Insert initial team
INSERT INTO teams (name, pin_code, is_admin) VALUES ('admin', 'admin', TRUE);
INSERT INTO teams (name, pin_code) VALUES
('alpha', 'alpha'),
('bravo', 'bravo'),
('charlie', 'charlie'),
('delta', 'delta'),
('echo', 'echo');
