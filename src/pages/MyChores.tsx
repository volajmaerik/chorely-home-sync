import { useAuth } from '@/hooks/useAuth';
import { useHousehold } from '@/hooks/useHousehold';
import { useChores } from '@/hooks/useChores';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ChoreCard } from '@/components/ChoreCard';
import { Link } from 'react-router-dom';
import { CheckSquare, Clock, Target, Trophy } from 'lucide-react';

const MyChores = () => {
  const { user } = useAuth();
  const { household } = useHousehold();
  const { chores, loading, completeChore } = useChores(household?.id || null);

  const myChores = chores.filter(chore => 
    chore.claimed_by === user?.id || chore.completed_by === user?.id
  );

  const inProgressChores = myChores.filter(chore => chore.status === 'claimed');
  const completedChores = myChores.filter(chore => chore.status === 'completed');

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center animate-pulse">
          <div className="w-16 h-16 bg-primary/20 rounded-full mx-auto mb-4 animate-bounce"></div>
          <h2 className="text-xl font-medium text-foreground">Loading your chores...</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground">My Chores</h1>
        <p className="text-muted-foreground">Track your progress and complete tasks to earn points</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Clock className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-lg font-bold text-blue-600">{inProgressChores.length}</p>
                <p className="text-xs text-muted-foreground">In Progress</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckSquare className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-lg font-bold text-green-600">{completedChores.length}</p>
                <p className="text-xs text-muted-foreground">Completed</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-2 sm:col-span-1">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                <Trophy className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-lg font-bold text-primary">{myChores.length}</p>
                <p className="text-xs text-muted-foreground">Total Chores</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* In Progress Chores */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
            <Clock className="h-5 w-5 text-blue-600" />
            In Progress
          </h2>
          {inProgressChores.length > 0 && (
            <Badge variant="outline">{inProgressChores.length} active</Badge>
          )}
        </div>
        
        {inProgressChores.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <Target className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">No chores in progress</h3>
              <p className="text-muted-foreground mb-4">
                Claim some chores from the household list to get started!
              </p>
              <Link to="/chores">
                <Button>
                  <Target className="h-4 w-4 mr-2" />
                  Browse Available Chores
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {inProgressChores.map((chore) => (
              <ChoreCard
                key={chore.id}
                chore={chore}
                onComplete={completeChore}
              />
            ))}
          </div>
        )}
      </div>

      {/* Completed Chores */}
      {completedChores.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
              <CheckSquare className="h-5 w-5 text-green-600" />
              Recently Completed
            </h2>
            <Badge variant="outline" className="bg-green-50 border-green-200">
              {completedChores.length} done
            </Badge>
          </div>
          
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {completedChores.slice(0, 6).map((chore) => (
              <ChoreCard key={chore.id} chore={chore} />
            ))}
          </div>
          
          {completedChores.length > 6 && (
            <div className="text-center">
              <Button variant="ghost">
                View {completedChores.length - 6} more completed chores
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Empty state */}
      {myChores.length === 0 && (
        <Card>
          <CardContent className="text-center py-16">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckSquare className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-xl font-medium text-foreground mb-2">No chores yet</h3>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              Start by claiming some chores from the household list. Complete them to earn points and climb the leaderboard!
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link to="/chores">
                <Button className="w-full sm:w-auto">
                  <Target className="h-4 w-4 mr-2" />
                  Browse Available Chores
                </Button>
              </Link>
              <Link to="/leaderboard">
                <Button variant="outline" className="w-full sm:w-auto">
                  <Trophy className="h-4 w-4 mr-2" />
                  View Leaderboard
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default MyChores;