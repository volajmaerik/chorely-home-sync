import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from './use-toast';

interface Chore {
  id: string;
  name: string;
  description: string | null;
  base_points: number;
  status: 'available' | 'claimed' | 'completed' | 'archived';
  claimed_by: string | null;
  completed_by: string | null;
  completed_at: string | null;
  average_rating: number | null;
  final_points_awarded: number | null;
  created_at: string;
  household_id: string;
}

interface ChoreSuggestion {
  id: string;
  name: string;
  description: string | null;
  suggested_by: string;
  suggested_points: number;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  profiles: {
    username: string;
  };
}

export const useChores = (householdId: string | null) => {
  const { user } = useAuth();
  const [chores, setChores] = useState<Chore[]>([]);
  const [suggestions, setSuggestions] = useState<ChoreSuggestion[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchChores = async () => {
    if (!householdId) return;

    try {
      const { data, error } = await supabase
        .from('chores')
        .select('*')
        .eq('household_id', householdId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setChores(data || []);
    } catch (error) {
      console.error('Error fetching chores:', error);
    }
  };

  const fetchSuggestions = async () => {
    if (!householdId) return;

    try {
      const { data, error } = await supabase
        .from('chore_suggestions')
        .select(`
          id,
          name,
          description,
          suggested_by,
          suggested_points,
          status,
          created_at
        `)
        .eq('household_id', householdId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Fetch user profiles separately
      const suggestions = data || [];
      const userIds = [...new Set(suggestions.map(s => s.suggested_by))];
      
      if (userIds.length > 0) {
        const { data: profiles } = await supabase
          .from('profiles')
          .select('user_id, username')
          .in('user_id', userIds);

        const suggestionsWithProfiles = suggestions.map(suggestion => {
          const profile = profiles?.find(p => p.user_id === suggestion.suggested_by);
          return {
            ...suggestion,
            profiles: {
              username: profile?.username || 'Unknown User'
            }
          };
        });

        setSuggestions(suggestionsWithProfiles);
      } else {
        setSuggestions([]);
      }
    } catch (error) {
      console.error('Error fetching suggestions:', error);
    }
  };

  const claimChore = async (choreId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('chores')
        .update({
          status: 'claimed',
          claimed_by: user.id
        })
        .eq('id', choreId)
        .eq('status', 'available');

      if (error) throw error;

      toast({
        title: 'Chore claimed!',
        description: 'You have successfully claimed this chore.'
      });

      await fetchChores();
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Failed to claim chore',
        description: error.message
      });
    }
  };

  const completeChore = async (choreId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('chores')
        .update({
          status: 'completed',
          completed_by: user.id,
          completed_at: new Date().toISOString()
        })
        .eq('id', choreId)
        .eq('claimed_by', user.id);

      if (error) throw error;

      toast({
        title: 'Chore completed!',
        description: 'Great job! Your chore is now awaiting evaluation.'
      });

      await fetchChores();
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Failed to complete chore',
        description: error.message
      });
    }
  };

  const suggestChore = async (name: string, description: string, points: number) => {
    if (!user || !householdId) return;

    try {
      const { error } = await supabase
        .from('chore_suggestions')
        .insert({
          household_id: householdId,
          name,
          description,
          suggested_by: user.id,
          suggested_points: points
        });

      if (error) throw error;

      toast({
        title: 'Chore suggested!',
        description: 'Your chore suggestion has been submitted for approval.'
      });

      await fetchSuggestions();
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Failed to suggest chore',
        description: error.message
      });
    }
  };

  const approveSuggestion = async (suggestionId: string, name: string, description: string, points: number) => {
    if (!householdId) return;

    try {
      // Create the chore
      const { error: choreError } = await supabase
        .from('chores')
        .insert({
          household_id: householdId,
          name,
          description,
          base_points: points
        });

      if (choreError) throw choreError;

      // Update suggestion status
      const { error: suggestionError } = await supabase
        .from('chore_suggestions')
        .update({ status: 'approved' })
        .eq('id', suggestionId);

      if (suggestionError) throw suggestionError;

      toast({
        title: 'Chore approved!',
        description: 'The chore has been added and is now available.'
      });

      await Promise.all([fetchChores(), fetchSuggestions()]);
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Failed to approve chore',
        description: error.message
      });
    }
  };

  const rejectSuggestion = async (suggestionId: string) => {
    try {
      const { error } = await supabase
        .from('chore_suggestions')
        .update({ status: 'rejected' })
        .eq('id', suggestionId);

      if (error) throw error;

      toast({
        title: 'Chore rejected',
        description: 'The chore suggestion has been rejected.'
      });

      await fetchSuggestions();
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Failed to reject chore',
        description: error.message
      });
    }
  };

  useEffect(() => {
    if (householdId) {
      Promise.all([fetchChores(), fetchSuggestions()]).finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [householdId]);

  return {
    chores,
    suggestions,
    loading,
    claimChore,
    completeChore,
    suggestChore,
    approveSuggestion,
    rejectSuggestion,
    refetch: () => Promise.all([fetchChores(), fetchSuggestions()])
  };
};