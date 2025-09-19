-- Create comprehensive database schema for Chorely gamification system

-- Create enum for chore status
CREATE TYPE chore_status AS ENUM ('available', 'claimed', 'completed', 'archived');

-- Create enum for suggestion status  
CREATE TYPE suggestion_status AS ENUM ('pending', 'approved', 'rejected');

-- Create enum for season status
CREATE TYPE season_status AS ENUM ('active', 'completed');

-- Create chores table
CREATE TABLE public.chores (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  household_id UUID NOT NULL REFERENCES public.households(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  base_points INTEGER NOT NULL DEFAULT 10,
  status chore_status NOT NULL DEFAULT 'available',
  claimed_by UUID NULL,
  completed_by UUID NULL,
  completed_at TIMESTAMP WITH TIME ZONE NULL,
  average_rating DECIMAL(3,2) NULL,
  final_points_awarded INTEGER NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create chore suggestions table
CREATE TABLE public.chore_suggestions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  household_id UUID NOT NULL REFERENCES public.households(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  suggested_by UUID NOT NULL,
  suggested_points INTEGER NOT NULL DEFAULT 10,
  status suggestion_status NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create evaluations table
CREATE TABLE public.evaluations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  chore_id UUID NOT NULL REFERENCES public.chores(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  evaluator_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create leaderboard seasons table
CREATE TABLE public.leaderboard_seasons (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  household_id UUID NOT NULL REFERENCES public.households(id) ON DELETE CASCADE,
  start_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  end_date TIMESTAMP WITH TIME ZONE NOT NULL,
  status season_status NOT NULL DEFAULT 'active',
  prize_pool TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user points table for tracking current season points
CREATE TABLE public.user_points (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  household_id UUID NOT NULL REFERENCES public.households(id) ON DELETE CASCADE,
  season_id UUID NOT NULL REFERENCES public.leaderboard_seasons(id) ON DELETE CASCADE,
  points INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, season_id)
);

-- Enable RLS on all new tables
ALTER TABLE public.chores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chore_suggestions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.evaluations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leaderboard_seasons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_points ENABLE ROW LEVEL SECURITY;

-- RLS Policies for chores
CREATE POLICY "Household members can view chores" 
ON public.chores 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.user_id = auth.uid()
    AND profiles.household_id = chores.household_id
  )
);

CREATE POLICY "Household members can update chores" 
ON public.chores 
FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.user_id = auth.uid()
    AND profiles.household_id = chores.household_id
  )
);

CREATE POLICY "Household admins can insert chores" 
ON public.chores 
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.households
    WHERE households.id = household_id
    AND households.admin_id = auth.uid()
  )
);

-- RLS Policies for chore suggestions
CREATE POLICY "Household members can view suggestions" 
ON public.chore_suggestions 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.user_id = auth.uid()
    AND profiles.household_id = chore_suggestions.household_id
  )
);

CREATE POLICY "Household members can create suggestions" 
ON public.chore_suggestions 
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.user_id = auth.uid()
    AND profiles.household_id = household_id
  )
  AND auth.uid() = suggested_by
);

CREATE POLICY "Household admins can update suggestions" 
ON public.chore_suggestions 
FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM public.households
    WHERE households.id = household_id
    AND households.admin_id = auth.uid()
  )
);

-- RLS Policies for evaluations
CREATE POLICY "Household members can view evaluations" 
ON public.evaluations 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.chores
    JOIN public.profiles ON profiles.household_id = chores.household_id
    WHERE chores.id = evaluations.chore_id
    AND profiles.user_id = auth.uid()
  )
);

CREATE POLICY "Household members can create evaluations" 
ON public.evaluations 
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.chores
    JOIN public.profiles ON profiles.household_id = chores.household_id
    WHERE chores.id = chore_id
    AND profiles.user_id = auth.uid()
  )
  AND auth.uid() = evaluator_id
);

-- RLS Policies for leaderboard seasons
CREATE POLICY "Household members can view seasons" 
ON public.leaderboard_seasons 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.user_id = auth.uid()
    AND profiles.household_id = leaderboard_seasons.household_id
  )
);

CREATE POLICY "Household admins can manage seasons" 
ON public.leaderboard_seasons 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.households
    WHERE households.id = household_id
    AND households.admin_id = auth.uid()
  )
);

-- RLS Policies for user points
CREATE POLICY "Household members can view user points" 
ON public.user_points 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.user_id = auth.uid()
    AND profiles.household_id = user_points.household_id
  )
);

CREATE POLICY "System can manage user points" 
ON public.user_points 
FOR ALL 
USING (true)
WITH CHECK (true);

-- Add triggers for updated_at columns
CREATE TRIGGER update_chores_updated_at
BEFORE UPDATE ON public.chores
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_chore_suggestions_updated_at
BEFORE UPDATE ON public.chore_suggestions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_leaderboard_seasons_updated_at
BEFORE UPDATE ON public.leaderboard_seasons
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_user_points_updated_at
BEFORE UPDATE ON public.user_points
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Function to calculate and award points after evaluation
CREATE OR REPLACE FUNCTION public.calculate_chore_points()
RETURNS TRIGGER AS $$
DECLARE
  avg_rating DECIMAL(3,2);
  base_points INTEGER;
  bonus_points INTEGER;
  total_points INTEGER;
  chore_user_id UUID;
  chore_household_id UUID;
  current_season_id UUID;
BEGIN
  -- Get chore details
  SELECT c.base_points, c.completed_by, c.household_id
  INTO base_points, chore_user_id, chore_household_id
  FROM public.chores c
  WHERE c.id = NEW.chore_id;

  -- Calculate average rating for this chore
  SELECT AVG(rating::DECIMAL) INTO avg_rating
  FROM public.evaluations
  WHERE chore_id = NEW.chore_id;

  -- Calculate bonus/penalty based on rating
  IF avg_rating >= 4.5 THEN
    bonus_points := ROUND(base_points * 0.5); -- 50% bonus
  ELSIF avg_rating >= 4.0 THEN
    bonus_points := ROUND(base_points * 0.25); -- 25% bonus
  ELSIF avg_rating >= 3.0 THEN
    bonus_points := 0; -- No bonus/penalty
  ELSIF avg_rating >= 2.0 THEN
    bonus_points := -ROUND(base_points * 0.25); -- 25% penalty
  ELSE
    bonus_points := -ROUND(base_points * 0.5); -- 50% penalty
  END IF;

  total_points := base_points + bonus_points;

  -- Update chore with final rating and points
  UPDATE public.chores
  SET average_rating = avg_rating,
      final_points_awarded = total_points,
      updated_at = now()
  WHERE id = NEW.chore_id;

  -- Get current active season
  SELECT id INTO current_season_id
  FROM public.leaderboard_seasons
  WHERE household_id = chore_household_id
  AND status = 'active'
  ORDER BY created_at DESC
  LIMIT 1;

  -- Award points to chore performer
  IF current_season_id IS NOT NULL THEN
    INSERT INTO public.user_points (user_id, household_id, season_id, points)
    VALUES (chore_user_id, chore_household_id, current_season_id, total_points)
    ON CONFLICT (user_id, season_id)
    DO UPDATE SET points = user_points.points + total_points,
                  updated_at = now();

    -- Award small points to evaluator for participation (2 points)
    INSERT INTO public.user_points (user_id, household_id, season_id, points)
    VALUES (NEW.evaluator_id, chore_household_id, current_season_id, 2)
    ON CONFLICT (user_id, season_id)
    DO UPDATE SET points = user_points.points + 2,
                  updated_at = now();
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Trigger to calculate points after each evaluation
CREATE TRIGGER calculate_points_after_evaluation
AFTER INSERT ON public.evaluations
FOR EACH ROW
EXECUTE FUNCTION public.calculate_chore_points();