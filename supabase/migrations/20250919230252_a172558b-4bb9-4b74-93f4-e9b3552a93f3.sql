-- Fix infinite recursion in profiles RLS policies

-- First, drop the problematic policies
DROP POLICY IF EXISTS "Users can view household member profiles" ON public.profiles;
DROP POLICY IF EXISTS "Household admins can view member profiles" ON public.profiles;

-- Create a security definer function to get user's household ID
-- This function runs with elevated privileges and bypasses RLS
CREATE OR REPLACE FUNCTION public.get_user_household_id(user_uuid UUID)
RETURNS UUID AS $$
  SELECT household_id FROM public.profiles WHERE user_id = user_uuid;
$$ LANGUAGE SQL SECURITY DEFINER STABLE SET search_path = public;

-- Create new safe policies using the security definer function
CREATE POLICY "Users can view household member profiles" 
ON public.profiles 
FOR SELECT 
USING (
  auth.uid() IS NOT NULL 
  AND household_id IS NOT NULL 
  AND household_id = public.get_user_household_id(auth.uid())
);

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

-- Also fix any similar issues in other table policies that might reference profiles
-- Update chores policies to use the security definer function
DROP POLICY IF EXISTS "Household members can view chores" ON public.chores;
DROP POLICY IF EXISTS "Household members can update chores" ON public.chores;

CREATE POLICY "Household members can view chores" 
ON public.chores 
FOR SELECT 
USING (
  household_id = public.get_user_household_id(auth.uid())
);

CREATE POLICY "Household members can update chores" 
ON public.chores 
FOR UPDATE 
USING (
  household_id = public.get_user_household_id(auth.uid())
);

-- Fix chore suggestions policies
DROP POLICY IF EXISTS "Household members can view suggestions" ON public.chore_suggestions;
DROP POLICY IF EXISTS "Household members can create suggestions" ON public.chore_suggestions;

CREATE POLICY "Household members can view suggestions" 
ON public.chore_suggestions 
FOR SELECT 
USING (
  household_id = public.get_user_household_id(auth.uid())
);

CREATE POLICY "Household members can create suggestions" 
ON public.chore_suggestions 
FOR INSERT 
WITH CHECK (
  household_id = public.get_user_household_id(auth.uid())
  AND auth.uid() = suggested_by
);

-- Fix evaluations policies  
DROP POLICY IF EXISTS "Household members can view evaluations" ON public.evaluations;
DROP POLICY IF EXISTS "Household members can create evaluations" ON public.evaluations;

CREATE POLICY "Household members can view evaluations" 
ON public.evaluations 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.chores
    WHERE chores.id = evaluations.chore_id
    AND chores.household_id = public.get_user_household_id(auth.uid())
  )
);

CREATE POLICY "Household members can create evaluations" 
ON public.evaluations 
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.chores
    WHERE chores.id = chore_id
    AND chores.household_id = public.get_user_household_id(auth.uid())
  )
  AND auth.uid() = evaluator_id
);

-- Fix leaderboard seasons policies
DROP POLICY IF EXISTS "Household members can view seasons" ON public.leaderboard_seasons;

CREATE POLICY "Household members can view seasons" 
ON public.leaderboard_seasons 
FOR SELECT 
USING (
  household_id = public.get_user_household_id(auth.uid())
);

-- Fix user points policies
DROP POLICY IF EXISTS "Household members can view user points" ON public.user_points;

CREATE POLICY "Household members can view user points" 
ON public.user_points 
FOR SELECT 
USING (
  household_id = public.get_user_household_id(auth.uid())
);