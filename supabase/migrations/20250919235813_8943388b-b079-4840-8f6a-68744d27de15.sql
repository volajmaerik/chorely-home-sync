-- Create function to join household by invite code
CREATE OR REPLACE FUNCTION public.join_household_by_code(invite_code TEXT)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  household_record RECORD;
  user_id UUID;
BEGIN
  -- Get the current user ID
  user_id := auth.uid();
  
  IF user_id IS NULL THEN
    RAISE EXCEPTION 'User must be authenticated';
  END IF;
  
  -- Find household by invite code
  SELECT id, name INTO household_record
  FROM public.households
  WHERE households.invite_code = join_household_by_code.invite_code;
  
  IF household_record.id IS NULL THEN
    RAISE EXCEPTION 'Invalid invite code';
  END IF;
  
  -- Check if user is already a member
  IF EXISTS (
    SELECT 1 FROM public.household_memberships
    WHERE household_memberships.user_id = join_household_by_code.user_id
    AND household_memberships.household_id = household_record.id
  ) THEN
    RAISE EXCEPTION 'User is already a member of this household';
  END IF;
  
  -- Add user to household
  INSERT INTO public.household_memberships (user_id, household_id, role)
  VALUES (user_id, household_record.id, 'member');
  
END;
$$;