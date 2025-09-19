import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useHousehold } from '@/hooks/useHousehold';
import { useChores } from '@/hooks/useChores';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { ChoreCard } from '@/components/ChoreCard';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/AppSidebar';
import { Plus, Filter } from 'lucide-react';

const Chores = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { household } = useHousehold();
  const { chores, loading, claimChore, completeChore, suggestChore } = useChores(household?.id || null);
  
  const [showSuggestDialog, setShowSuggestDialog] = useState(false);
  const [newChoreName, setNewChoreName] = useState('');
  const [newChoreDescription, setNewChoreDescription] = useState('');
  const [newChorePoints, setNewChorePoints] = useState(15);
  const [filter, setFilter] = useState<'all' | 'available' | 'claimed' | 'completed'>('all');

  const handleSuggestChore = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newChoreName.trim()) return;

    await suggestChore(newChoreName.trim(), newChoreDescription.trim(), newChorePoints);
    setShowSuggestDialog(false);
    setNewChoreName('');
    setNewChoreDescription('');
    setNewChorePoints(15);
  };

  const filteredChores = chores.filter(chore => {
    if (filter === 'all') return true;
    return chore.status === filter;
  });

  const availableChores = chores.filter(c => c.status === 'available');
  const claimedChores = chores.filter(c => c.status === 'claimed');
  const completedChores = chores.filter(c => c.status === 'completed');

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center">
          <h1 className="text-2xl font-semibold text-foreground">Loading chores...</h1>
        </div>
      </div>
    );
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        
        <div className="flex-1 flex flex-col">
          <header className="border-b border-border bg-card">
            <div className="container mx-auto px-4 py-4">
              <div className="flex items-center gap-4">
                <SidebarTrigger />
                <div>
                  <h1 className="text-2xl font-bold text-foreground">All Chores</h1>
                  <p className="text-sm text-muted-foreground">{household?.name}</p>
                </div>
              </div>
            </div>
          </header>

          <main className="container mx-auto px-4 py-6 flex-1">
            <div className="flex flex-col gap-6">
              {/* Header with stats and action button */}
              <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                <div className="flex gap-4">
                  <Badge variant="secondary">{availableChores.length} Available</Badge>
                  <Badge variant="outline">{claimedChores.length} In Progress</Badge>
                  <Badge variant="default">{completedChores.length} Completed</Badge>
                </div>
                
                <Dialog open={showSuggestDialog} onOpenChange={setShowSuggestDialog}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Suggest Chore
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Suggest a New Chore</DialogTitle>
                      <DialogDescription>
                        Suggest a new chore for your household. Admins will review and approve it.
                      </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleSuggestChore} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="chore-name">Chore Name</Label>
                        <Input
                          id="chore-name"
                          placeholder="e.g., Take out trash"
                          value={newChoreName}
                          onChange={(e) => setNewChoreName(e.target.value)}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="chore-description">Description (Optional)</Label>
                        <Textarea
                          id="chore-description"
                          placeholder="Detailed instructions..."
                          value={newChoreDescription}
                          onChange={(e) => setNewChoreDescription(e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="chore-points">Suggested Points</Label>
                        <Input
                          id="chore-points"
                          type="number"
                          min="1"
                          max="100"
                          value={newChorePoints}
                          onChange={(e) => setNewChorePoints(parseInt(e.target.value) || 15)}
                          required
                        />
                      </div>
                      <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => setShowSuggestDialog(false)}>
                          Cancel
                        </Button>
                        <Button type="submit">
                          Suggest Chore
                        </Button>
                      </DialogFooter>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>

              {/* Filter tabs */}
              <Tabs value={filter} onValueChange={(value) => setFilter(value as typeof filter)}>
                <TabsList>
                  <TabsTrigger value="all">All Chores</TabsTrigger>
                  <TabsTrigger value="available">Available</TabsTrigger>
                  <TabsTrigger value="claimed">In Progress</TabsTrigger>
                  <TabsTrigger value="completed">Completed</TabsTrigger>
                </TabsList>

                <TabsContent value={filter} className="mt-6">
                  {filteredChores.length === 0 ? (
                    <Card>
                      <CardContent className="text-center py-12">
                        <p className="text-muted-foreground">
                          {filter === 'all' 
                            ? 'No chores available. Suggest some new ones!' 
                            : `No ${filter} chores at the moment.`
                          }
                        </p>
                      </CardContent>
                    </Card>
                  ) : (
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                      {filteredChores.map((chore) => (
                        <ChoreCard
                          key={chore.id}
                          chore={chore}
                          onClaim={claimChore}
                          onComplete={completeChore}
                        />
                      ))}
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default Chores;