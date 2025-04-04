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
    team_members JSON DEFAULT '[]'::json,
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

-- Create team_locations table
CREATE TABLE team_locations (
    id SERIAL PRIMARY KEY,
    team_id INT REFERENCES teams(id),
    latitude FLOAT NOT NULL,
    longitude FLOAT NOT NULL,
    recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create media table
CREATE TABLE media (
    id SERIAL PRIMARY KEY,
    team_location_id INT REFERENCES team_locations(id),
    media_type VARCHAR(50) NOT NULL, -- e.g., 'picture' or 'video'
    content BYTEA NOT NULL,
    event_description TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


-- Add random_events table
CREATE TABLE random_events (
    id SERIAL PRIMARY KEY,
    type VARCHAR(50) NOT NULL,
    description VARCHAR(255) NOT NULL,
    points INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert initial random events
INSERT INTO random_events (type, description, points) VALUES
('workout', 'Do 20 push-ups', 10),
('workout', 'Run in place for 1 minute', 5),
('workout', 'Do 30 jumping jacks', 8),
('workout', 'Hold a plank for 1 minute', 12),
('workout', 'Do 15 burpees', 15),
('workout', 'Do 10 squats', 7),
('workout', 'Do 20 lunges (10 per leg)', 10),
('workout', 'Do 15 sit-ups', 8),
('workout', 'Do 10 mountain climbers', 6),
('workout', 'Hold a wall sit for 30 seconds', 10),
('workout', 'Do 10 tricep dips', 8),
('workout', 'Do 20 high knees', 5),
('workout', 'Do 10 side lunges (5 per leg)', 7),
('workout', 'Do 15 calf raises', 6),
('workout', 'Do 10 push-ups with claps', 12),
('workout', 'Do 20 arm circles', 5),
('workout', 'Hold a side plank for 30 seconds (each side)', 10),
('workout', 'Do 10 reverse crunches', 8),
('workout', 'Do 15 leg raises', 9),
('workout', 'Do 10 superman stretches', 7),
('workout', 'Do 20 toe touches', 6),
('workout', 'Do 10 frog jumps', 10),
('workout', 'Do 15 Russian twists', 8),
('workout', 'Do 10 donkey kicks (each leg)', 7),
('workout', 'Do 10 shoulder taps', 6),
('workout', 'Do 15 side leg raises (each leg)', 8),
('workout', 'Do 10 bicycle crunches', 7),
('workout', 'Do 20 skater jumps', 9),
('workout', 'Do 10 plank shoulder taps', 8),
('workout', 'Do 15 glute bridges', 7),
('workout', 'Do 10 inchworms', 10),
('workout', 'Do 20 crab walks', 8),
('workout', 'Do 10 bear crawls', 9),
('workout', 'Do 15 side shuffles', 6),
('workout', 'Do 10 squat jumps', 10),
('workout', 'Do 20 alternating punches', 5),
('workout', 'Do 10 star jumps', 8),
('workout', 'Do 15 heel touches', 7),
('workout', 'Do 10 V-ups', 9),
('workout', 'Do 20 step-ups (10 per leg)', 10),
('workout', 'Do 10 burpee tuck jumps', 12),
('workout', 'Do 15 alternating lunges', 8),
('workout', 'Do 10 side planks with hip dips (each side)', 10),
('workout', 'Do 20 jumping jacks with arm raises', 6),
('workout', 'Do 10 squat pulses', 7),
('workout', 'Do 15 alternating toe touches', 8),
('workout', 'Do 10 push-ups with shoulder taps', 9),
('workout', 'Do 20 alternating leg raises', 7),
('workout', 'Do 10 plank jacks', 8),
('workout', 'Do 15 side lunges with a twist', 9),
('picture', 'Take a picture of your team doing jumping jacks', 15),
('video', 'Record a video of your team doing 10 push-ups together', 20),
('picture', 'Take a picture of your team holding a plank', 15),
('video', 'Record a video of your team running in place for 1 minute', 20),
('picture', 'Take a picture of your team doing a group high-five', 10),
('video', 'Record a video of your team doing 15 burpees together', 25),
('picture', 'Take a picture of your team forming a human pyramid', 20),
('video', 'Record a video of your team doing 20 squats in sync', 25),
('picture', 'Take a picture of your team doing yoga poses', 15),
('video', 'Record a video of your team doing a relay race', 30),
('picture', 'Take a picture of your team doing a group stretch', 10),
('video', 'Record a video of your team doing 10 jumping jacks together', 15),
('picture', 'Take a picture of your team doing a funny workout pose', 10),
('video', 'Record a video of your team doing a dance workout', 20),
('picture', 'Take a picture of your team doing a wall sit', 15),
('video', 'Record a video of your team doing 10 lunges together', 20),
('picture', 'Take a picture of your team doing a group plank', 15),
('video', 'Record a video of your team doing a group cheer after a workout', 10),
('picture', 'Take a picture of your team doing a group stretch circle', 10),
('video', 'Record a video of your team doing a group push-up challenge', 25);

-- Add settings table
CREATE TABLE settings (
    id SERIAL PRIMARY KEY,
    key VARCHAR(255) UNIQUE NOT NULL,
    value VARCHAR(255) NOT NULL
);

-- Insert default random event frequency (in milliseconds)
INSERT INTO settings (key, value) VALUES ('random_event_frequency', '300000'); -- Default: 5 minutes
-- Add countdown timer to the settings table
INSERT INTO settings (key, value) VALUES ('countdown_timer', '2025-04-02T07:30:00');

-- Insert initial team
INSERT INTO teams (name, pin_code, is_admin, team_members) VALUES ('admin', 'admin', TRUE, '[{"id": 1, "firstName": "Joseph", "lastName": "H."}]');
INSERT INTO teams (name, pin_code, team_members) VALUES
('alpha', 'alpha', '[{"id": 1, "firstName": "Alpha", "lastName": "One"}, {"id": 2, "firstName": "Alpha", "lastName": "Two"}]'),
('bravo', 'bravo', '[{"id": 1, "firstName": "Bravo", "lastName": "One"}, {"id": 2, "firstName": "Bravo", "lastName": "Two"}]'),
('charlie', 'charlie', '[{"id": 1, "firstName": "Charlie", "lastName": "One"}, {"id": 2, "firstName": "Charlie", "lastName": "Two"}]'),
('delta', 'delta', '[{"id": 1, "firstName": "Delta", "lastName": "One"}, {"id": 2, "firstName": "Delta", "lastName": "Two"}]'),
('echo', 'echo', '[{"id": 1, "firstName": "Echo", "lastName": "One"}, {"id": 2, "firstName": "Echo", "lastName": "Two"}]');

