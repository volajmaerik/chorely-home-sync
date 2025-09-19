import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useHousehold } from '@/hooks/useHousehold';
import { useLeaderboard } from '@/hooks/useLeaderboard';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ArrowLeft, Trophy, Crown, Medal, Award } from 'lucide-react';

const Leaderboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { household } = useHousehold();
  const { leaderboard, currentSeason, userRank, loading } = useLeaderboard(household?.id || null);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center">
          <h1 className="text-2xl font-semibold text-foreground">Loading leaderboard...</h1>
        </div>
      </div>
    );
  }

  const daysLeft = currentSeason 
    ? Math.ceil((new Date(currentSeason.end_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
    : 0;

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1: return <Crown className="h-5 w-5 text-yellow-500" />;
      case 2: return <Medal className="h-5 w-5 text-gray-400" />;
      case 3: return <Award className="h-5 w-5 text-amber-600" />;
      default: return null;
    }
  };

  const getRankColor = (rank: number) => {
    switch (rank) {
      case 1: return 'bg-gradient-to-r from-yellow-400 to-yellow-600';
      case 2: return 'bg-gradient-to-r from-gray-300 to-gray-500';
      case 3: return 'bg-gradient-to-r from-amber-400 to-amber-600';
      default: return 'bg-muted';
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => navigate('/')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Leaderboard</h1>
              <p className="text-sm text-muted-foreground">{household?.name}</p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        <div className="space-y-6">
          {/* Season Info */}
          {currentSeason && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="h-5 w-5 text-primary" />
                  Current Season
                </CardTitle>
                <CardDescription>
                  {currentSeason.prize_pool && `Prize: ${currentSeason.prize_pool}`}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span>Season Progress</span>
                    <span>{daysLeft} days remaining</span>
                  </div>
                  <Progress 
                    value={Math.max(0, Math.min(100, 100 - (daysLeft / 30) * 100))} 
                    className="w-full" 
                  />
                  <p className="text-xs text-muted-foreground">
                    Season ends on {new Date(currentSeason.end_date).toLocaleDateString()}
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* User's Current Rank */}
          {userRank && (
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-center gap-4">
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground">Your Rank</p>
                    <p className="text-3xl font-bold text-foreground">#{userRank}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground">Your Points</p>
                    <p className="text-3xl font-bold text-primary">
                      {leaderboard.find(entry => entry.user_id === user?.id)?.points || 0}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Leaderboard */}
          <Card>
            <CardHeader>
              <CardTitle>Rankings</CardTitle>
              <CardDescription>
                Current standings for this season
              </CardDescription>
            </CardHeader>
            <CardContent>
              {leaderboard.length === 0 ? (
                <div className="text-center py-12">
                  <Trophy className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">
                    No one has earned points yet this season. Start claiming chores to get on the board!
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {leaderboard.map((entry, index) => {
                    const rank = index + 1;
                    const isCurrentUser = entry.user_id === user?.id;
                    
                    return (
                      <div
                        key={entry.user_id}
                        className={`flex items-center gap-4 p-4 rounded-lg transition-all ${
                          isCurrentUser 
                            ? 'ring-2 ring-primary/20 bg-primary/5' 
                            : 'bg-muted/50 hover:bg-muted'
                        }`}
                      >
                        {/* Rank */}
                        <div className={`flex items-center justify-center w-12 h-12 rounded-full text-white font-bold ${getRankColor(rank)}`}>
                          {rank <= 3 ? getRankIcon(rank) : rank}
                        </div>

                        {/* Avatar and Name */}
                        <div className="flex items-center gap-3 flex-1">
                          <Avatar>
                            <AvatarImage src={entry.profiles.profile_image_url || undefined} />
                            <AvatarFallback>
                              {(entry.profiles.display_name || entry.profiles.username).charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium text-foreground">
                              {entry.profiles.display_name || entry.profiles.username}
                              {isCurrentUser && (
                                <Badge variant="outline" className="ml-2 text-xs">
                                  You
                                </Badge>
                              )}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              Rank #{rank}
                            </p>
                          </div>
                        </div>

                        {/* Points */}
                        <div className="text-right">
                          <p className="text-2xl font-bold text-foreground">{entry.points}</p>
                          <p className="text-sm text-muted-foreground">points</p>
                        </div>

                        {/* Special badges for top 3 */}
                        {rank <= 3 && (
                          <div className="flex flex-col items-center">
                            {rank === 1 && <Badge className="bg-yellow-100 text-yellow-800 border-yellow-300">Champion</Badge>}
                            {rank === 2 && <Badge className="bg-gray-100 text-gray-800 border-gray-300">Runner-up</Badge>}
                            {rank === 3 && <Badge className="bg-amber-100 text-amber-800 border-amber-300">Third Place</Badge>}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Call to Action */}
          {leaderboard.length > 0 && (
            <Card>
              <CardContent className="text-center py-8">
                <p className="text-muted-foreground mb-4">
                  Want to climb the rankings? 
                </p>
                <Button onClick={() => navigate('/chores')}>
                  Browse Available Chores
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
};

export default Leaderboard;