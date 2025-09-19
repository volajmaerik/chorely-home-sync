import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useHousehold } from '@/hooks/useHousehold';
import { useChores } from '@/hooks/useChores';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ChoreCard } from '@/components/ChoreCard';
import { ArrowLeft } from 'lucide-react';

const MyChores = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { household } = useHousehold();
  const { chores, loading, completeChore } = useChores(household?.id || null);

  const myChores = chores.filter(chore => 
    chore.claimed_by === user?.id || chore.completed_by === user?.id
  );

  const inProgressChores = myChores.filter(chore => chore.status === 'claimed');
  const completedChores = myChores.filter(chore => chore.status === 'completed');

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center">
          <h1 className="text-2xl font-semibold text-foreground">Loading your chores...</h1>
        </div>
      </div>
    );
  }

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
              <h1 className="text-2xl font-bold text-foreground">My Chores</h1>
              <p className="text-sm text-muted-foreground">{household?.name}</p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        <div className="space-y-6">
          {/* Stats */}
          <div className="flex gap-4">
            <Badge variant="outline">{inProgressChores.length} In Progress</Badge>
            <Badge variant="default">{completedChores.length} Completed</Badge>
          </div>

          {/* In Progress Chores */}
          <div>
            <h2 className="text-lg font-semibold text-foreground mb-4">In Progress</h2>
            {inProgressChores.length === 0 ? (
              <Card>
                <CardContent className="text-center py-12">
                  <p className="text-muted-foreground">
                    No chores in progress. 
                    <Button variant="link" className="p-1" onClick={() => navigate('/chores')}>
                      Claim some chores
                    </Button>
                    to get started!
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
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
            <div>
              <h2 className="text-lg font-semibold text-foreground mb-4">Recently Completed</h2>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {completedChores.slice(0, 6).map((chore) => (
                  <ChoreCard key={chore.id} chore={chore} />
                ))}
              </div>
            </div>
          )}

          {/* Empty state */}
          {myChores.length === 0 && (
            <Card>
              <CardContent className="text-center py-12">
                <h3 className="text-lg font-medium text-foreground mb-2">No chores yet</h3>
                <p className="text-muted-foreground mb-4">
                  Start by claiming some chores from the household list.
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

export default MyChores;