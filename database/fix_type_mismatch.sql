-- Quick Fix for Type Mismatch Error
-- Run this BEFORE running complete_migration.sql if you get the foreign key type error
-- This drops the problematic tables so they can be recreated with correct types

-- Drop artifacts table if it exists (will be recreated by migration)
DROP TABLE IF EXISTS artifacts CASCADE;

-- Drop agent_tasks table if it exists (will be recreated by migration)
DROP TABLE IF EXISTS agent_tasks CASCADE;

-- Note: This will delete any existing data in these tables
-- If you have important data, back it up first!




