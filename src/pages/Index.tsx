import { useAuth } from '@/hooks/useAuth';
import { useHousehold } from '@/hooks/useHousehold';
import { useChores } from '@/hooks/useChores';
import { useLeaderboard } from '@/hooks/useLeaderboard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ChoreCard } from '@/components/ChoreCard';
import { InvitePrompt } from '@/components/InvitePrompt';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Link } from 'react-router-dom';
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { 
  Trophy, 
  CheckSquare, 
  Clock, 
  Calendar, 
  TrendingUp,
  Users,
  Star,
  Target,
  Zap,
  Crown,
  Plus,
  Sparkles,
  Gift,
  Calendar as CalendarIcon
} from 'lucide-react';

const Index = () => {
  const { user } = useAuth();
  const { household, members, isAdmin } = useHousehold();
  const { chores, claimChore, completeChore, loading: choresLoading } = useChores(household?.id || null);
  const { leaderboard, currentSeason, userRank, loading: leaderboardLoading } = useLeaderboard(household?.id || null);

  // Season creation states
  const [showSeasonDialog, setShowSeasonDialog] = useState(false);
  const [seasonEndDate, setSeasonEndDate] = useState('');
  const [seasonPrize, setSeasonPrize] = useState('');
  const [creatingeSeason, setCreatingSeason] = useState(false);

  // Filter chores for dashboard
  const availableChores = chores.filter(chore => chore.status === 'available');
  const myChores = chores.filter(chore => 
    chore.claimed_by === user?.id && chore.status === 'claimed'
  );
  const completedChores = chores.filter(chore => 
    chore.status === 'completed' && 
    chore.completed_by !== user?.id && 
    !chore.average_rating // Only show chores that need evaluation from others, not user's own
  );

  // Calculate user stats
  const userPoints = leaderboard.find(entry => entry.user_id === user?.id)?.points || 0;
  const daysLeft = currentSeason 
    ? Math.ceil((new Date(currentSeason.end_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
    : 0;

  const handleCreateSeason = async () => {
    if (!seasonEndDate) return;

    setCreatingSeason(true);
    try {
      const { error } = await supabase
        .from('leaderboard_seasons')
        .insert({
          household_id: household!.id,
          end_date: new Date(seasonEndDate).toISOString(),
          prize_pool: seasonPrize || 'Bragging rights and a treat!',
          status: 'active'
        });

      if (error) throw error;

      toast({
        title: 'New season created! 🎉',
        description: 'A fresh competition has begun!',
      });

      setSeasonEndDate('');
      setSeasonPrize('');
      setShowSeasonDialog(false);
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Failed to create season',
        description: error.message,
      });
    } finally {
      setCreatingSeason(false);
    }
  };

  if (choresLoading || leaderboardLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center animate-pulse">
          <div className="w-16 h-16 bg-primary/20 rounded-full mx-auto mb-4 animate-bounce"></div>
          <h2 className="text-xl font-medium text-foreground">Loading dashboard...</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Welcome Header */}
      <div className="space-y-2">
        <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
          Welcome back! 👋
        </h1>
        <p className="text-muted-foreground">Here's what's happening in {household?.name}</p>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <Card className="relative overflow-hidden hover-scale">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                <Trophy className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
              </div>
              <div>
                <p className="text-xs sm:text-sm text-muted-foreground">Your Points</p>
                <p className="text-lg sm:text-2xl font-bold text-primary">{userPoints}</p>
                {userRank && (
                  <p className="text-xs text-muted-foreground">Rank #{userRank}</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden hover-scale">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Target className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" />
              </div>
              <div>
                <p className="text-xs sm:text-sm text-muted-foreground">Available</p>
                <p className="text-lg sm:text-2xl font-bold text-green-600">{availableChores.length}</p>
                <p className="text-xs text-muted-foreground">chores</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden hover-scale">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <CheckSquare className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-xs sm:text-sm text-muted-foreground">In Progress</p>
                <p className="text-lg sm:text-2xl font-bold text-blue-600">{myChores.length}</p>
                <p className="text-xs text-muted-foreground">my chores</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden hover-scale">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Calendar className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-xs sm:text-sm text-muted-foreground">Season Ends</p>
                <p className="text-lg sm:text-2xl font-bold text-purple-600">{daysLeft || '—'}</p>
                <p className="text-xs text-muted-foreground">days left</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Invite Prompt - Show if less than 3 members */}
      {members.length < 3 && (
        <InvitePrompt />
      )}

      {/* Admin Action Prompts */}
      {isAdmin && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Create New Chores Prompt */}
          <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 border-blue-200 dark:border-blue-800 hover-scale">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-blue-700 dark:text-blue-300">
                <Sparkles className="h-5 w-5" />
                Keep the House Fresh! 
              </CardTitle>
              <CardDescription className="text-blue-600 dark:text-blue-400">
                Add new chores to keep everyone engaged and the house sparkling clean.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  💡 <strong>Pro tip:</strong> Regular new chores = active roommates!
                </p>
                <Link to="/admin">
                  <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                    <Plus className="h-4 w-4 mr-2" />
                    Add New Chores
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Create New Season Prompt */}
          {(!currentSeason || daysLeft < 7) && (
            <Card className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20 border-purple-200 dark:border-purple-800 hover-scale">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-purple-700 dark:text-purple-300">
                  <Gift className="h-5 w-5" />
                  {currentSeason ? 'Season Ending Soon!' : 'Start a New Season!'}
                </CardTitle>
                <CardDescription className="text-purple-600 dark:text-purple-400">
                  {currentSeason 
                    ? 'Keep the competition going with a fresh season and new prizes!'
                    : 'Launch a competitive season with prizes to motivate your household!'
                  }
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <p className="text-sm text-purple-700 dark:text-purple-300">
                    🏆 <strong>Boost engagement:</strong> Seasons with prizes = 3x more participation!
                  </p>
                  <Dialog open={showSeasonDialog} onOpenChange={setShowSeasonDialog}>
                    <DialogTrigger asChild>
                      <Button className="w-full bg-purple-600 hover:bg-purple-700 text-white">
                        <CalendarIcon className="h-4 w-4 mr-2" />
                        Create New Season
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Create New Season</DialogTitle>
                        <DialogDescription>
                          Set up a competitive period with prizes to motivate your household!
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="end-date">Season End Date</Label>
                          <Input
                            id="end-date"
                            type="date"
                            value={seasonEndDate}
                            onChange={(e) => setSeasonEndDate(e.target.value)}
                            min={new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0]}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="prize">Prize Pool</Label>
                          <Textarea
                            id="prize"
                            placeholder="e.g., Winner picks the next movie night, $50 gift card, etc."
                            value={seasonPrize}
                            onChange={(e) => setSeasonPrize(e.target.value)}
                            rows={3}
                          />
                        </div>
                      </div>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setShowSeasonDialog(false)}>
                          Cancel
                        </Button>
                        <Button onClick={handleCreateSeason} disabled={!seasonEndDate || creatingeSeason}>
                          {creatingeSeason ? 'Creating...' : 'Create Season'}
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {/* My Chores - In Progress */}
        <Card className="lg:col-span-2 xl:col-span-2 hover-scale">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5 text-primary" />
                  My Chores In Progress
                </CardTitle>
                <CardDescription>Complete these to earn points!</CardDescription>
              </div>
              <Link to="/my-chores">
                <Button variant="outline" size="sm" className="hover-scale">View All</Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {myChores.length === 0 ? (
              <div className="text-center py-8">
                <CheckSquare className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground mb-4">No chores in progress</p>
                <Link to="/chores">
                  <Button className="hover-scale">Browse Chores</Button>
                </Link>
              </div>
            ) : (
              <div className="grid gap-3">
                {myChores.slice(0, 3).map((chore) => (
                  <ChoreCard
                    key={chore.id}
                    chore={chore}
                    onComplete={completeChore}
                    compact
                  />
                ))}
                {myChores.length > 3 && (
                  <div className="text-center pt-3">
                    <Link to="/my-chores">
                      <Button variant="ghost" size="sm" className="hover-scale">
                        View {myChores.length - 3} more chores
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Available Chores */}
        <Card className="hover-scale">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-green-600" />
                  Available Chores
                </CardTitle>
                <CardDescription>Claim these to start earning!</CardDescription>
              </div>
              <Link to="/chores">
                <Button variant="outline" size="sm" className="hover-scale">View All</Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {availableChores.length === 0 ? (
              <div className="text-center py-6">
                <Target className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">All chores are claimed!</p>
                {isAdmin && (
                  <Link to="/admin" className="mt-3 inline-block">
                    <Button size="sm" className="hover-scale">
                      <Plus className="h-3 w-3 mr-1" />
                      Add More
                    </Button>
                  </Link>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                {availableChores.slice(0, 3).map((chore) => (
                  <div key={chore.id} className="border rounded-lg p-3 hover:bg-muted/50 transition-colors">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium truncate">{chore.name}</h4>
                        {chore.description && (
                          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                            {chore.description}
                          </p>
                        )}
                        <Badge variant="secondary" className="mt-2 text-xs">
                          {chore.base_points} pts
                        </Badge>
                      </div>
                      <Button
                        size="sm"
                        onClick={() => claimChore(chore.id)}
                        className="flex-shrink-0 hover-scale"
                      >
                        Claim
                      </Button>
                    </div>
                  </div>
                ))}
                {availableChores.length > 3 && (
                  <div className="text-center pt-2">
                    <Link to="/chores">
                      <Button variant="ghost" size="sm" className="hover-scale">
                        View {availableChores.length - 3} more
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Secondary Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Leaderboard */}
        <Card className="hover-scale">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Crown className="h-5 w-5 text-yellow-500" />
                Leaderboard
              </CardTitle>
              <Link to="/leaderboard">
                <Button variant="outline" size="sm" className="hover-scale">View Full</Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {leaderboard.length === 0 ? (
              <div className="text-center py-6">
                <Trophy className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">No rankings yet this season</p>
              </div>
            ) : (
              <div className="space-y-3">
                {leaderboard.slice(0, 3).map((entry, index) => {
                  const rank = index + 1;
                  return (
                    <div key={entry.user_id} className="flex items-center gap-3 hover:bg-muted/50 p-2 rounded-lg transition-colors">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-white ${
                        rank === 1 ? 'bg-yellow-500' : 
                        rank === 2 ? 'bg-gray-400' : 
                        rank === 3 ? 'bg-amber-600' : 'bg-muted'
                      }`}>
                        {rank}
                      </div>
                      <Avatar className="w-8 h-8">
                        <AvatarImage src={entry.profiles.profile_image_url || undefined} />
                        <AvatarFallback className="text-xs">
                          {(entry.profiles.display_name || entry.profiles.username).charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">
                          {entry.profiles.display_name || entry.profiles.username}
                          {entry.user_id === user?.id && (
                            <span className="text-primary ml-1">(You)</span>
                          )}
                        </p>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {entry.points} pts
                      </Badge>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Evaluations Needed */}
        {completedChores.length > 0 && (
          <Card className="hover-scale">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Star className="h-5 w-5 text-yellow-500" />
                  Rate Completed Chores
                </CardTitle>
                <Link to="/evaluations">
                  <Button variant="outline" size="sm" className="hover-scale">View All</Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {completedChores.slice(0, 2).map((chore) => (
                  <div key={chore.id} className="border rounded-lg p-3 hover:bg-muted/50 transition-colors">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <h4 className="font-medium text-sm">{chore.name}</h4>
                        <p className="text-xs text-muted-foreground mt-1">
                          Completed {new Date(chore.completed_at!).toLocaleDateString()}
                        </p>
                        <Badge variant="outline" className="mt-2 text-xs bg-green-50 border-green-200">
                          {chore.base_points} pts
                        </Badge>
                      </div>
                      <Link to="/evaluations">
                        <Button size="sm" variant="outline" className="hover-scale">
                          Rate
                        </Button>
                      </Link>
                    </div>
                  </div>
                ))}
                {completedChores.length > 2 && (
                  <div className="text-center pt-2">
                    <Link to="/evaluations">
                      <Button variant="ghost" size="sm" className="hover-scale">
                        View {completedChores.length - 2} more
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Season Progress */}
        {currentSeason && (
          <Card className={`hover-scale ${completedChores.length === 0 ? 'lg:col-span-2' : ''}`}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                Current Season
              </CardTitle>
              <CardDescription>
                {currentSeason.prize_pool && `🏆 Prize: ${currentSeason.prize_pool}`}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between text-sm">
                  <span>Season Progress</span>
                  <span className="font-medium">{daysLeft} days remaining</span>
                </div>
                <Progress 
                  value={Math.max(0, Math.min(100, 100 - (daysLeft / 30) * 100))} 
                  className="w-full h-2" 
                />
                <p className="text-xs text-muted-foreground">
                  Season ends on {new Date(currentSeason.end_date).toLocaleDateString()}
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Index;