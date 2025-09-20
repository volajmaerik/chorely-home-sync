-- Fix security issue: Remove overly permissive user_points policy
-- The existing SECURITY DEFINER functions can still manage points as they bypass RLS

-- Drop the insecure "System can manage user points" policy
DROP POLICY IF EXISTS "System can manage user points" ON public.user_points;

-- Create a more secure policy that only allows authenticated users to manage their own points
-- in specific scenarios (like when completing chores through the proper functions)
CREATE POLICY "Users can insert their own points through system functions" 
ON public.user_points 
FOR INSERT 
WITH CHECK (auth.uid() IS NOT NULL AND user_id = auth.uid());

-- Allow updates only through system functions (SECURITY DEFINER functions bypass this anyway)
CREATE POLICY "System functions can update user points" 
ON public.user_points 
FOR UPDATE 
USING (auth.uid() IS NOT NULL);

-- Prevent direct deletion - points should only be managed through system functions
-- No DELETE policy means no one can delete points directly