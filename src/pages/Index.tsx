import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useHousehold } from '@/hooks/useHousehold';
import { useChores } from '@/hooks/useChores';
import { useLeaderboard } from '@/hooks/useLeaderboard';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { HouseholdSetup } from '@/components/HouseholdSetup';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/AppSidebar';
import { 
  Home, 
  Trophy, 
  CheckCircle2, 
  Clock, 
  Users, 
  Star,
  List,
  TrendingUp,
  Menu
} from 'lucide-react';

const Index = () => {
  const { user, loading: authLoading, signOut } = useAuth();
  const navigate = useNavigate();
  const { household, loading: householdLoading, createHousehold, joinHousehold, isAdmin } = useHousehold();
  const { chores } = useChores(household?.id || null);
  const { leaderboard, currentSeason, userRank } = useLeaderboard(household?.id || null);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center">
          <h1 className="text-2xl font-semibold text-foreground">Loading...</h1>
        </div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect to auth
  }

  // Show household setup if user doesn't have a household
  if (!householdLoading && !household) {
    return (
      <HouseholdSetup
        onCreateHousehold={createHousehold}
        onJoinHousehold={joinHousehold}
        loading={householdLoading}
      />
    );
  }

  if (householdLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center">
          <h1 className="text-2xl font-semibold text-foreground">Loading household...</h1>
        </div>
      </div>
    );
  }

  const availableChores = chores.filter(c => c.status === 'available');
  const myChores = chores.filter(c => c.claimed_by === user.id || c.completed_by === user.id);
  const completedChores = chores.filter(c => c.status === 'completed');
  const userPoints = leaderboard.find(entry => entry.user_id === user.id)?.points || 0;

  const daysLeft = currentSeason 
    ? Math.ceil((new Date(currentSeason.end_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
    : 0;

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        
        <div className="flex-1 flex flex-col">
          <header className="bg-gradient-to-r from-background via-muted/30 to-background border-b border-border/50 backdrop-blur-sm">
            <div className="container mx-auto px-4 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <SidebarTrigger className="text-foreground hover:bg-accent" />
                <div>
                  <h1 className="text-xl font-bold text-foreground">Chorely Dashboard</h1>
                  <p className="text-sm text-muted-foreground">{household?.name}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <Button variant="outline" onClick={signOut} className="text-foreground border-border hover:bg-accent">
                  Sign Out
                </Button>
              </div>
            </div>
          </header>

          <main className="container mx-auto px-4 py-6 space-y-6 flex-1">
            {/* Quick Stats */}
            <div className="grid gap-4 md:grid-cols-4">
              <Card className="card-elevated">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-foreground">Your Points</CardTitle>
                  <Trophy className="h-4 w-4 text-primary" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-foreground">{userPoints}</div>
                  <p className="text-xs text-muted-foreground">
                    Rank #{userRank || '-'} in household
                  </p>
                </CardContent>
              </Card>

              <Card className="card-elevated">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-foreground">Available Chores</CardTitle>
                  <CheckCircle2 className="h-4 w-4 text-success" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-foreground">{availableChores.length}</div>
                  <p className="text-xs text-muted-foreground">
                    Ready to claim
                  </p>
                </CardContent>
              </Card>

              <Card className="card-elevated">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-foreground">My Chores</CardTitle>
                  <Clock className="h-4 w-4 text-primary" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-foreground">{myChores.length}</div>
                  <p className="text-xs text-muted-foreground">
                    In progress or completed
                  </p>
                </CardContent>
              </Card>

              <Card className="card-elevated">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-foreground">Season Ends</CardTitle>
                  <TrendingUp className="h-4 w-4 text-primary" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-foreground">{daysLeft}</div>
                  <p className="text-xs text-muted-foreground">
                    Days remaining
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Main Content Grid */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {/* Available Chores */}
              <Card className="card-elevated">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-foreground">Available Chores</CardTitle>
                    <Button variant="ghost" size="sm" onClick={() => navigate('/chores')} className="button-enhanced">
                      <List className="h-4 w-4 mr-2" />
                      View All
                    </Button>
                  </div>
                  <CardDescription>
                    Chores ready to be claimed
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  {availableChores.slice(0, 3).map((chore) => (
                    <div key={chore.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg border">
                      <div>
                        <p className="font-medium text-foreground">{chore.name}</p>
                        <Badge variant="secondary" className="text-xs">
                          {chore.base_points} points
                        </Badge>
                      </div>
                      <Button size="sm" onClick={() => navigate('/chores')} className="button-enhanced">
                        Claim
                      </Button>
                    </div>
                  ))}
                  {availableChores.length === 0 && (
                    <p className="text-muted-foreground text-center py-4">
                      No chores available right now
                    </p>
                  )}
                </CardContent>
              </Card>

              {/* Current Leaderboard */}
              <Card className="card-elevated">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-foreground">Leaderboard</CardTitle>
                    <Button variant="ghost" size="sm" onClick={() => navigate('/leaderboard')} className="button-enhanced">
                      <Trophy className="h-4 w-4 mr-2" />
                      View Full
                    </Button>
                  </div>
                  <CardDescription>
                    Current season rankings
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  {leaderboard.slice(0, 3).map((entry, index) => (
                    <div key={entry.user_id} className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg border">
                      <div className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-sm font-bold">
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-foreground">
                          {entry.profiles.display_name || entry.profiles.username}
                          {entry.user_id === user.id && ' (You)'}
                        </p>
                        <p className="text-sm text-muted-foreground">{entry.points} points</p>
                      </div>
                      {index === 0 && <Trophy className="h-4 w-4 text-yellow-500" />}
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card className="card-elevated">
                <CardHeader>
                  <CardTitle className="text-foreground">Quick Actions</CardTitle>
                  <CardDescription>
                    Common tasks and navigation
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button 
                    variant="outline" 
                    className="w-full justify-start button-enhanced text-foreground" 
                    onClick={() => navigate('/chores')}
                  >
                    <List className="h-4 w-4 mr-2" />
                    Browse All Chores
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    className="w-full justify-start button-enhanced text-foreground" 
                    onClick={() => navigate('/my-chores')}
                  >
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    My Chores
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    className="w-full justify-start button-enhanced text-foreground" 
                    onClick={() => navigate('/evaluations')}
                  >
                    <Star className="h-4 w-4 mr-2" />
                    Rate Completed Chores
                  </Button>

                  {completedChores.filter(c => !c.average_rating).length > 0 && (
                    <Badge variant="destructive" className="w-full">
                      {completedChores.filter(c => !c.average_rating).length} chores awaiting evaluation
                    </Badge>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Season Progress */}
            {currentSeason && (
              <Card>
                <CardHeader>
                  <CardTitle>Current Season</CardTitle>
                  <CardDescription>
                    {currentSeason.prize_pool && `Prize: ${currentSeason.prize_pool}`}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
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
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default Index;
