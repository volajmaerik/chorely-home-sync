-- Fix infinite recursion in households RLS policies

-- Drop the problematic household policy that causes recursion
DROP POLICY IF EXISTS "Users can view households they belong to" ON public.households;

-- Create a security definer function to check if user belongs to a household
-- This bypasses RLS and prevents recursion
CREATE OR REPLACE FUNCTION public.user_belongs_to_household(household_uuid UUID, user_uuid UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = user_uuid AND household_id = household_uuid
  );
$$ LANGUAGE SQL SECURITY DEFINER STABLE SET search_path = public;

-- Create a safe policy for viewing households using the security definer function
CREATE POLICY "Users can view households they belong to" 
ON public.households 
FOR SELECT 
USING (
  -- User is admin of the household OR user belongs to the household
  admin_id = auth.uid() 
  OR public.user_belongs_to_household(id, auth.uid())
);

-- Also ensure the admin policies don't cause issues
-- Drop and recreate admin policies to be safe
DROP POLICY IF EXISTS "Admins can update their households" ON public.households;
DROP POLICY IF EXISTS "Users can create households" ON public.households;

CREATE POLICY "Admins can update their households" 
ON public.households 
FOR UPDATE 
USING (admin_id = auth.uid())
WITH CHECK (admin_id = auth.uid());

CREATE POLICY "Users can create households" 
ON public.households 
FOR INSERT 
WITH CHECK (admin_id = auth.uid());