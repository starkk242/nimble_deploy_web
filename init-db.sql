-- Initialize the Nimble Deploy database
-- This script runs when the PostgreSQL container starts for the first time

-- Create the database if it doesn't exist
SELECT 'CREATE DATABASE nimble_deploy'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'nimble_deploy')\gexec

-- Connect to the nimble_deploy database
\c nimble_deploy;

-- Create extensions if needed
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Grant necessary permissions
GRANT ALL PRIVILEGES ON DATABASE nimble_deploy TO nimble_user;
GRANT ALL ON SCHEMA public TO nimble_user;