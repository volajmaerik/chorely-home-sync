-- Create household_memberships table for multiple households per user
CREATE TABLE public.household_memberships (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  household_id UUID NOT NULL REFERENCES public.households(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('admin', 'member')),
  joined_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, household_id)
);

-- Enable RLS
ALTER TABLE public.household_memberships ENABLE ROW LEVEL SECURITY;

-- RLS Policies for household_memberships
CREATE POLICY "Users can view their own memberships"
ON public.household_memberships
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can join households"
ON public.household_memberships
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can manage memberships"
ON public.household_memberships
FOR ALL
USING (EXISTS (
  SELECT 1 FROM public.households h
  WHERE h.id = household_id AND h.admin_id = auth.uid()
));

-- Add current_household_id to profiles for active household selection
ALTER TABLE public.profiles ADD COLUMN current_household_id UUID REFERENCES public.households(id);

-- Update existing household relationships to use new membership table
INSERT INTO public.household_memberships (user_id, household_id, role)
SELECT 
  p.user_id, 
  p.household_id,
  CASE 
    WHEN h.admin_id = p.user_id THEN 'admin'
    ELSE 'member'
  END as role
FROM public.profiles p
JOIN public.households h ON p.household_id = h.id
WHERE p.household_id IS NOT NULL;

-- Update current_household_id to match existing household_id
UPDATE public.profiles 
SET current_household_id = household_id 
WHERE household_id IS NOT NULL;

-- Update get_user_household_id function to use current_household_id
CREATE OR REPLACE FUNCTION public.get_user_household_id(user_uuid uuid)
RETURNS uuid
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT current_household_id FROM public.profiles WHERE user_id = user_uuid;
$$;

-- Create function to check if user belongs to any household (not just current)
CREATE OR REPLACE FUNCTION public.user_belongs_to_any_household(household_uuid uuid, user_uuid uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.household_memberships 
    WHERE user_id = user_uuid AND household_id = household_uuid
  );
$$;