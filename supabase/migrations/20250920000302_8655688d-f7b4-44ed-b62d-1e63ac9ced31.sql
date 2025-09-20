-- Fix security issue: Remove overly permissive user_points policy
-- First, let's see what policies exist and remove them properly

-- Drop the insecure "System can manage user points" policy
DROP POLICY IF EXISTS "System can manage user points" ON public.user_points;

-- Drop any existing policies we might be creating
DROP POLICY IF EXISTS "Users can insert their own points through system functions" ON public.user_points;
DROP POLICY IF EXISTS "System functions can update user points" ON public.user_points;

-- Create secure policies
CREATE POLICY "Authenticated users can insert their own points" 
ON public.user_points 
FOR INSERT 
WITH CHECK (auth.uid() IS NOT NULL AND user_id = auth.uid());

CREATE POLICY "Authenticated users can update points via system" 
ON public.user_points 
FOR UPDATE 
USING (auth.uid() IS NOT NULL);

-- Keep the existing read policy as it's already secure
-- "Household members can view user points" remains unchanged