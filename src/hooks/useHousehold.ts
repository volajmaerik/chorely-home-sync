import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from './use-toast';

interface Household {
  id: string;
  name: string;
  admin_id: string;
  invite_code: string;
  created_at: string;
  updated_at: string;
}

interface HouseholdMember {
  id: string;
  user_id: string;
  username: string;
  display_name: string;
  profile_image_url: string | null;
}

export const useHousehold = () => {
  const { user } = useAuth();
  const [household, setHousehold] = useState<Household | null>(null);
  const [members, setMembers] = useState<HouseholdMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  const fetchHousehold = async () => {
    if (!user) return;

    try {
      // Get user's profile to find household
      const { data: profile } = await supabase
        .from('profiles')
        .select('household_id')
        .eq('user_id', user.id)
        .single();

      if (!profile?.household_id) {
        setLoading(false);
        return;
      }

      // Get household details
      const { data: householdData } = await supabase
        .from('households')
        .select('*')
        .eq('id', profile.household_id)
        .single();

      if (householdData) {
        setHousehold(householdData);
        setIsAdmin(householdData.admin_id === user.id);

        // Get household members
        const { data: membersData } = await supabase
          .from('profiles')
          .select('id, user_id, username, display_name, profile_image_url')
          .eq('household_id', profile.household_id);

        setMembers(membersData || []);
      }
    } catch (error) {
      console.error('Error fetching household:', error);
    } finally {
      setLoading(false);
    }
  };

  const createHousehold = async (name: string) => {
    if (!user) return { error: 'Not authenticated' };

    try {
      // Create household
      const { data: householdData, error: householdError } = await supabase
        .from('households')
        .insert({
          name,
          admin_id: user.id,
          invite_code: Math.random().toString(36).substring(2, 8).toUpperCase()
        })
        .select()
        .single();

      if (householdError) throw householdError;

      // Update user profile with household_id
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ household_id: householdData.id })
        .eq('user_id', user.id);

      if (profileError) throw profileError;

      // Create initial leaderboard season
      await supabase
        .from('leaderboard_seasons')
        .insert({
          household_id: householdData.id,
          end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days
          prize_pool: 'Bragging rights and a treat!'
        });

      toast({
        title: 'Household created!',
        description: `${name} has been created successfully.`
      });

      await fetchHousehold();
      return { error: null };
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Failed to create household',
        description: error.message
      });
      return { error: error.message };
    }
  };

  const joinHousehold = async (inviteCode: string) => {
    if (!user) return { error: 'Not authenticated' };

    try {
      // Find household by invite code
      const { data: householdData, error: householdError } = await supabase
        .from('households')
        .select('*')
        .eq('invite_code', inviteCode.toUpperCase())
        .single();

      if (householdError || !householdData) {
        throw new Error('Invalid invite code');
      }

      // Update user profile with household_id
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ household_id: householdData.id })
        .eq('user_id', user.id);

      if (profileError) throw profileError;

      toast({
        title: 'Joined household!',
        description: `Welcome to ${householdData.name}!`
      });

      await fetchHousehold();
      return { error: null };
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Failed to join household',
        description: error.message
      });
      return { error: error.message };
    }
  };

  useEffect(() => {
    if (user) {
      fetchHousehold();
    }
  }, [user]);

  return {
    household,
    members,
    loading,
    isAdmin,
    createHousehold,
    joinHousehold,
    refetch: fetchHousehold
  };
};