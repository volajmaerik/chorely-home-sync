import { useAuth } from '@/hooks/useAuth';
import { useHousehold } from '@/hooks/useHousehold';
import { useLeaderboard } from '@/hooks/useLeaderboard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Trophy, Crown, Medal, Award, Target, TrendingUp } from 'lucide-react';

const Leaderboard = () => {
  const { user } = useAuth();
  const { household } = useHousehold();
  const { leaderboard, currentSeason, userRank, loading } = useLeaderboard(household?.id || null);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center animate-pulse">
          <div className="w-16 h-16 bg-primary/20 rounded-full mx-auto mb-4 animate-bounce"></div>
          <h2 className="text-xl font-medium text-foreground">Loading leaderboard...</h2>
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
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground flex items-center gap-3">
          <Trophy className="h-8 w-8 text-yellow-500" />
          Leaderboard
        </h1>
        <p className="text-muted-foreground">See who's leading the household this season</p>
      </div>

      {/* Season Info */}
      {currentSeason && (
        <Card className="bg-gradient-to-r from-primary/5 to-secondary/5 border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              Current Season
            </CardTitle>
            {currentSeason.prize_pool && (
              <CardDescription className="text-base font-medium">
                🏆 Prize: {currentSeason.prize_pool}
              </CardDescription>
            )}
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between text-sm">
                <span>Season Progress</span>
                <span className="font-medium">{daysLeft} days remaining</span>
              </div>
              <Progress 
                value={Math.max(0, Math.min(100, 100 - (daysLeft / 30) * 100))} 
                className="w-full h-3" 
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Started: {new Date(currentSeason.start_date).toLocaleDateString()}</span>
                <span>Ends: {new Date(currentSeason.end_date).toLocaleDateString()}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* User's Current Rank */}
      {userRank && (
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="pt-6">
            <div className="flex items-center justify-center gap-8">
              <div className="text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  {getRankIcon(userRank)}
                  <p className="text-sm text-muted-foreground">Your Rank</p>
                </div>
                <p className="text-4xl font-bold text-foreground">#{userRank}</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-muted-foreground mb-2">Your Points</p>
                <p className="text-4xl font-bold text-primary">
                  {leaderboard.find(entry => entry.user_id === user?.id)?.points || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Rankings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Crown className="h-5 w-5 text-yellow-500" />
            Rankings
          </CardTitle>
          <CardDescription>
            Current standings for this season
          </CardDescription>
        </CardHeader>
        <CardContent>
          {leaderboard.length === 0 ? (
            <div className="text-center py-16">
              <Trophy className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-medium text-foreground mb-2">No rankings yet</h3>
              <p className="text-muted-foreground mb-6">
                No one has earned points yet this season. Start claiming chores to get on the board!
              </p>
              <Link to="/chores">
                <Button>
                  <Target className="h-4 w-4 mr-2" />
                  Browse Chores
                </Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {leaderboard.map((entry, index) => {
                const rank = index + 1;
                const isCurrentUser = entry.user_id === user?.id;
                
                return (
                  <div
                    key={entry.user_id}
                    className={`flex items-center gap-4 p-4 rounded-lg transition-all ${
                      isCurrentUser 
                        ? 'ring-2 ring-primary/30 bg-primary/10 shadow-md' 
                        : 'bg-muted/30 hover:bg-muted/50 border'
                    }`}
                  >
                    {/* Rank */}
                    <div className={`flex items-center justify-center w-12 h-12 rounded-full text-white font-bold ${getRankColor(rank)}`}>
                      {rank <= 3 ? getRankIcon(rank) : rank}
                    </div>

                    {/* Avatar and Name */}
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <Avatar className="w-10 h-10">
                        <AvatarImage src={entry.profiles.profile_image_url || undefined} />
                        <AvatarFallback>
                          {(entry.profiles.display_name || entry.profiles.username).charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <p className="font-semibold text-foreground truncate">
                            {entry.profiles.display_name || entry.profiles.username}
                          </p>
                          {isCurrentUser && (
                            <Badge variant="default" className="text-xs bg-primary">
                              You
                            </Badge>
                          )}
                        </div>
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
                      <div className="hidden sm:flex flex-col items-center">
                        {rank === 1 && <Badge className="bg-yellow-100 text-yellow-800 border-yellow-300">🏆 Champion</Badge>}
                        {rank === 2 && <Badge className="bg-gray-100 text-gray-800 border-gray-300">🥈 Runner-up</Badge>}
                        {rank === 3 && <Badge className="bg-amber-100 text-amber-800 border-amber-300">🥉 Third Place</Badge>}
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
        <Card className="bg-gradient-to-r from-secondary/5 to-primary/5 border-secondary/20">
          <CardContent className="text-center py-8">
            <Trophy className="h-12 w-12 text-primary mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Want to climb the rankings?</h3>
            <p className="text-muted-foreground mb-6">
              Complete more chores and get better ratings to earn more points!
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link to="/chores">
                <Button className="w-full sm:w-auto">
                  <Target className="h-4 w-4 mr-2" />
                  Browse Available Chores
                </Button>
              </Link>
              <Link to="/my-chores">
                <Button variant="outline" className="w-full sm:w-auto">
                  View My Chores
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Leaderboard;