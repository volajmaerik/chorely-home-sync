import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

interface LeaderboardEntry {
  user_id: string;
  points: number;
  profiles: {
    username: string;
    display_name: string;
    profile_image_url: string | null;
  };
}

interface Season {
  id: string;
  start_date: string;
  end_date: string;
  status: 'active' | 'completed';
  prize_pool: string | null;
  household_id: string;
}

export const useLeaderboard = (householdId: string | null) => {
  const { user } = useAuth();
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [currentSeason, setCurrentSeason] = useState<Season | null>(null);
  const [userRank, setUserRank] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchLeaderboard = async () => {
    if (!householdId) return;

    try {
      // Get current active season
      const { data: seasonData } = await supabase
        .from('leaderboard_seasons')
        .select('*')
        .eq('household_id', householdId)
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      setCurrentSeason(seasonData);

      if (!seasonData) return;

      // Get leaderboard for current season
      const { data: pointsData } = await supabase
        .from('user_points')
        .select('user_id, points')
        .eq('season_id', seasonData.id)
        .order('points', { ascending: false });

      if (pointsData && pointsData.length > 0) {
        // Get profiles for all users in leaderboard
        const userIds = pointsData.map(p => p.user_id);
        const { data: profilesData } = await supabase
          .from('profiles')
          .select('user_id, username, display_name, profile_image_url')
          .in('user_id', userIds);

        // Combine points with profiles
        const leaderboardData = pointsData.map(points => {
          const profile = profilesData?.find(p => p.user_id === points.user_id);
          return {
            user_id: points.user_id,
            points: points.points,
            profiles: {
              username: profile?.username || 'Unknown User',
              display_name: profile?.display_name || profile?.username || 'Unknown User',
              profile_image_url: profile?.profile_image_url || null
            }
          };
        });

        setLeaderboard(leaderboardData);
        
        // Find user's rank
        const userIndex = leaderboardData.findIndex(entry => entry.user_id === user?.id);
        setUserRank(userIndex !== -1 ? userIndex + 1 : null);
      } else {
        setLeaderboard([]);
        setUserRank(null);
      }
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const createNewSeason = async (durationDays: number, prizePool: string) => {
    if (!householdId) return;

    try {
      // End current season if exists
      if (currentSeason) {
        await supabase
          .from('leaderboard_seasons')
          .update({ status: 'completed' })
          .eq('id', currentSeason.id);
      }

      // Create new season
      const endDate = new Date(Date.now() + durationDays * 24 * 60 * 60 * 1000);
      
      const { error } = await supabase
        .from('leaderboard_seasons')
        .insert({
          household_id: householdId,
          end_date: endDate.toISOString(),
          prize_pool: prizePool
        });

      if (error) throw error;

      await fetchLeaderboard();
    } catch (error) {
      console.error('Error creating new season:', error);
    }
  };

  useEffect(() => {
    if (householdId) {
      fetchLeaderboard();
    }
  }, [householdId]);

  return {
    leaderboard,
    currentSeason,
    userRank,
    loading,
    createNewSeason,
    refetch: fetchLeaderboard
  };
};