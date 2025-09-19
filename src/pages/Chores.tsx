import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useHousehold } from '@/hooks/useHousehold';
import { useChores } from '@/hooks/useChores';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ChoreCard } from '@/components/ChoreCard';
import { InvitePrompt } from '@/components/InvitePrompt';
import { toast } from '@/hooks/use-toast';
import { Plus, Filter, Search, Target, CheckSquare, Clock, Lightbulb } from 'lucide-react';

const Chores = () => {
  const { user } = useAuth();
  const { household, members } = useHousehold();
  const { chores, claimChore, completeChore, suggestChore, loading } = useChores(household?.id || null);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTab, setSelectedTab] = useState('available');
  
  // Suggestion dialog states
  const [showSuggestionDialog, setShowSuggestionDialog] = useState(false);
  const [suggestionName, setSuggestionName] = useState('');
  const [suggestionDescription, setSuggestionDescription] = useState('');
  const [suggestionPoints, setSuggestionPoints] = useState(10);
  const [submittingSuggestion, setSubmittingSuggestion] = useState(false);

  // Filter chores
  const availableChores = chores.filter(chore => chore.status === 'available');
  const claimedChores = chores.filter(chore => chore.status === 'claimed');
  const completedChores = chores.filter(chore => chore.status === 'completed');
  const myChores = chores.filter(chore => 
    chore.claimed_by === user?.id || chore.completed_by === user?.id
  );

  // Search functionality
  const filterChores = (choresList: any[]) => {
    if (!searchTerm) return choresList;
    return choresList.filter(chore => 
      chore.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      chore.description?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  const handleSuggestChore = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!suggestionName.trim()) return;

    setSubmittingSuggestion(true);
    try {
      await suggestChore(suggestionName.trim(), suggestionDescription.trim(), suggestionPoints);
      
      // Reset form
      setSuggestionName('');
      setSuggestionDescription('');
      setSuggestionPoints(10);
      setShowSuggestionDialog(false);
      
      toast({
        title: 'Chore suggested!',
        description: 'Your suggestion has been submitted for review.',
      });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Failed to suggest chore',
        description: 'Please try again.',
      });
    } finally {
      setSubmittingSuggestion(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center animate-pulse">
          <div className="w-16 h-16 bg-primary/20 rounded-full mx-auto mb-4 animate-bounce" role="status" aria-label="Loading"></div>
          <h2 className="text-xl font-medium text-foreground">Loading chores...</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-page-enter">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Chores</h1>
          <p className="text-muted-foreground">Manage household tasks and earn points</p>
        </div>
        
        <Dialog open={showSuggestionDialog} onOpenChange={setShowSuggestionDialog}>
          <DialogTrigger asChild>
            <Button className="w-full sm:w-auto bg-primary hover:bg-primary/90 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
              <Plus className="h-4 w-4 mr-2" />
              Suggest Chore
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md" role="dialog" aria-labelledby="suggest-chore-title">
            <form onSubmit={handleSuggestChore}>
              <DialogHeader>
                <DialogTitle id="suggest-chore-title" className="flex items-center gap-2">
                  <Lightbulb className="h-5 w-5" />
                  Suggest a New Chore
                </DialogTitle>
                <DialogDescription>
                  Suggest a chore for your household. Admins will review and approve it.
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="chore-name">Chore Name *</Label>
                  <Input
                    id="chore-name"
                    placeholder="e.g., Clean the bathroom"
                    value={suggestionName}
                    onChange={(e) => setSuggestionName(e.target.value)}
                    required
                    aria-describedby="chore-name-desc"
                  />
                  <p id="chore-name-desc" className="sr-only">Enter a descriptive name for the chore</p>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="chore-description">Description</Label>
                  <Textarea
                    id="chore-description"
                    placeholder="Describe what needs to be done..."
                    value={suggestionDescription}
                    onChange={(e) => setSuggestionDescription(e.target.value)}
                    rows={3}
                    aria-describedby="chore-desc-desc"
                  />
                  <p id="chore-desc-desc" className="sr-only">Provide additional details about the chore</p>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="chore-points">Suggested Points</Label>
                  <Input
                    id="chore-points"
                    type="number"
                    min="1"
                    max="100"
                    value={suggestionPoints}
                    onChange={(e) => setSuggestionPoints(parseInt(e.target.value) || 10)}
                    aria-describedby="points-desc"
                  />
                  <p id="points-desc" className="text-xs text-muted-foreground">
                    Points reflect the effort and time required (1-100)
                  </p>
                </div>
              </div>
              
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setShowSuggestionDialog(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={submittingSuggestion || !suggestionName.trim()}>
                  {submittingSuggestion ? 'Suggesting...' : 'Suggest Chore'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search and Stats */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" aria-hidden="true" />
            <Input
              placeholder="Search chores..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 focus-visible:ring-2 focus-visible:ring-ring"
              aria-label="Search chores by name or description"
            />
          </div>
          <Button variant="outline" size="sm" className="w-full sm:w-auto focus-visible:ring-2 focus-visible:ring-ring" aria-label="Open filters">
            <Filter className="h-4 w-4 mr-2" />
            Filters
          </Button>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Card className="hover-scale">
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Target className="h-4 w-4 text-green-600" aria-hidden="true" />
                <div>
                  <p className="text-sm font-medium text-foreground" role="text">{availableChores.length}</p>
                  <p className="text-xs text-muted-foreground">Available</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="hover-scale">
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-blue-600" aria-hidden="true" />
                <div>
                  <p className="text-sm font-medium text-foreground" role="text">{claimedChores.length}</p>
                  <p className="text-xs text-muted-foreground">In Progress</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="hover-scale">
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <CheckSquare className="h-4 w-4 text-purple-600" aria-hidden="true" />
                <div>
                  <p className="text-sm font-medium text-foreground" role="text">{completedChores.length}</p>
                  <p className="text-xs text-muted-foreground">Completed</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="hover-scale">
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <div className="h-4 w-4 bg-primary rounded-full" aria-hidden="true" />
                <div>
                  <p className="text-sm font-medium text-foreground" role="text">{myChores.length}</p>
                  <p className="text-xs text-muted-foreground">My Chores</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Invite Prompt - Show if less than 3 members */}
      {members.length < 3 && (
        <InvitePrompt />
      )}

      {/* Chores Tabs */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4" role="tablist" aria-label="Chore categories">
          <TabsTrigger value="available" className="text-xs sm:text-sm" role="tab">
            Available ({availableChores.length})
          </TabsTrigger>
          <TabsTrigger value="claimed" className="text-xs sm:text-sm" role="tab">
            In Progress ({claimedChores.length})
          </TabsTrigger>
          <TabsTrigger value="completed" className="text-xs sm:text-sm" role="tab">
            Completed ({completedChores.length})
          </TabsTrigger>
          <TabsTrigger value="mine" className="text-xs sm:text-sm" role="tab">
            Mine ({myChores.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="available" className="space-y-4" role="tabpanel">
          {filterChores(availableChores).length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <Target className="h-12 w-12 text-muted-foreground mx-auto mb-4" aria-hidden="true" />
                <h3 className="text-lg font-medium text-foreground mb-2">No available chores</h3>
                <p className="text-muted-foreground mb-4">
                  All chores are currently claimed or completed. Great job team!
                </p>
                <Button onClick={() => setShowSuggestionDialog(true)} className="focus-visible:ring-2 focus-visible:ring-ring">
                  <Plus className="h-4 w-4 mr-2" />
                  Suggest New Chore
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3" role="list" aria-label="Available chores">
              {filterChores(availableChores).map((chore) => (
                <div key={chore.id} role="listitem">
                  <ChoreCard
                    chore={chore}
                    onClaim={claimChore}
                    showClaimButton
                  />
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="claimed" className="space-y-4" role="tabpanel">
          {filterChores(claimedChores).length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" aria-hidden="true" />
                <h3 className="text-lg font-medium text-foreground mb-2">No chores in progress</h3>
                <p className="text-muted-foreground">
                  No household members are currently working on chores.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3" role="list" aria-label="Chores in progress">
              {filterChores(claimedChores).map((chore) => (
                <div key={chore.id} role="listitem">
                  <ChoreCard
                    chore={chore}
                    onComplete={chore.claimed_by === user?.id ? completeChore : undefined}
                  />
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="completed" className="space-y-4" role="tabpanel">
          {filterChores(completedChores).length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <CheckSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" aria-hidden="true" />
                <h3 className="text-lg font-medium text-foreground mb-2">No completed chores</h3>
                <p className="text-muted-foreground">
                  No chores have been completed yet this season.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3" role="list" aria-label="Completed chores">
              {filterChores(completedChores).map((chore) => (
                <div key={chore.id} role="listitem">
                  <ChoreCard chore={chore} />
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="mine" className="space-y-4" role="tabpanel">
          {filterChores(myChores).length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckSquare className="h-6 w-6 text-primary" aria-hidden="true" />
                </div>
                <h3 className="text-lg font-medium text-foreground mb-2">No chores yet</h3>
                <p className="text-muted-foreground mb-4">
                  You haven't claimed any chores yet. Start earning points!
                </p>
                <Button onClick={() => setSelectedTab('available')} className="focus-visible:ring-2 focus-visible:ring-ring">
                  Browse Available Chores
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3" role="list" aria-label="My chores">
              {filterChores(myChores).map((chore) => (
                <div key={chore.id} role="listitem">
                  <ChoreCard
                    chore={chore}
                    onComplete={chore.status === 'claimed' ? completeChore : undefined}
                  />
                </div>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Chores;