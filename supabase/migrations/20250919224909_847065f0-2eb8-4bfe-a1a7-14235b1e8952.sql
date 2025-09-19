-- Fix critical security issue: Remove public access to all profiles
-- and implement proper household-based access control

-- Drop the overly permissive policy
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;

-- Create secure policies for profile access
-- 1. Users can always view their own profile
CREATE POLICY "Users can view their own profile" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() = user_id);

-- 2. Users can view profiles of other members in their household(s)
-- This requires checking if both users belong to the same household
CREATE POLICY "Users can view household member profiles" 
ON public.profiles 
FOR SELECT 
USING (
  auth.uid() IS NOT NULL 
  AND household_id IS NOT NULL 
  AND EXISTS (
    SELECT 1 FROM public.profiles current_user_profile
    WHERE current_user_profile.user_id = auth.uid()
    AND current_user_profile.household_id = profiles.household_id
  )
);

-- 3. Household admins can view all profiles in their managed households
CREATE POLICY "Household admins can view member profiles" 
ON public.profiles 
FOR SELECT 
USING (
  auth.uid() IS NOT NULL 
  AND household_id IS NOT NULL 
  AND EXISTS (
    SELECT 1 FROM public.households
    WHERE households.id = profiles.household_id
    AND households.admin_id = auth.uid()
  )
);