-- Update user_credits table to support new pricing plans
-- Run this in the Supabase SQL Editor

-- 1. Drop the old check constraint
ALTER TABLE user_credits DROP CONSTRAINT IF EXISTS user_credits_plan_check;

-- 2. Add new check constraint with all plan types
ALTER TABLE user_credits ADD CONSTRAINT user_credits_plan_check 
  CHECK (plan IN ('hobby', 'professional', 'max', 'starter', 'pro', 'unlimited', 'lifetime'));

-- 3. (Optional) Rename old plans to new ones if needed
-- UPDATE user_credits SET plan = 'starter' WHERE plan = 'hobby';
-- UPDATE user_credits SET plan = 'pro' WHERE plan = 'professional';
-- UPDATE user_credits SET plan = 'unlimited' WHERE plan = 'max';
