import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useHousehold } from '@/hooks/useHousehold';
import { useChores } from '@/hooks/useChores';
import { useLeaderboard } from '@/hooks/useLeaderboard';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, Users, Settings, Trophy, Copy, Check, X } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

const Admin = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { household, members, isAdmin, loading } = useHousehold();
  const { suggestions, approveSuggestion, rejectSuggestion } = useChores(household?.id || null);
  const { createNewSeason, currentSeason } = useLeaderboard(household?.id || null);
  
  const [showNewSeasonDialog, setShowNewSeasonDialog] = useState(false);
  const [newSeasonDays, setNewSeasonDays] = useState(30);
  const [newSeasonPrize, setNewSeasonPrize] = useState('');
  const [copiedInvite, setCopiedInvite] = useState(false);

  const pendingSuggestions = suggestions.filter(s => s.status === 'pending');

  // Show loading while checking admin status
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center">
          <h1 className="text-2xl font-semibold text-foreground">Loading...</h1>
        </div>
      </div>
    );
  }

  // Redirect if not admin - but only after loading is complete
  if (!loading && !isAdmin) {
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
                <h1 className="text-2xl font-bold text-foreground">Access Denied</h1>
              </div>
            </div>
          </div>
        </header>
        <main className="container mx-auto px-4 py-6">
          <Card>
            <CardContent className="text-center py-12">
              <h2 className="text-lg font-semibold text-foreground mb-2">Admin Access Required</h2>
              <p className="text-muted-foreground mb-4">
                You need to be a household admin to access this page.
              </p>
              <Button onClick={() => navigate('/')}>
                Return to Dashboard
              </Button>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  const handleApprove = (suggestion: any) => {
    approveSuggestion(
      suggestion.id,
      suggestion.name,
      suggestion.description,
      suggestion.suggested_points
    );
  };

  const handleCopyInviteCode = () => {
    if (household?.invite_code) {
      navigator.clipboard.writeText(household.invite_code);
      setCopiedInvite(true);
      toast({
        title: 'Invite code copied!',
        description: 'Share this code with new members.'
      });
      setTimeout(() => setCopiedInvite(false), 2000);
    }
  };

  const handleCreateSeason = async (e: React.FormEvent) => {
    e.preventDefault();
    await createNewSeason(newSeasonDays, newSeasonPrize);
    setShowNewSeasonDialog(false);
    setNewSeasonDays(30);
    setNewSeasonPrize('');
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-gradient-to-r from-background via-muted/30 to-background border-b border-border/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => navigate('/')} className="text-foreground hover:bg-accent">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Admin Dashboard</h1>
              <p className="text-sm text-muted-foreground">{household?.name}</p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        <Tabs defaultValue="suggestions" className="space-y-6">
          <TabsList>
            <TabsTrigger value="suggestions">Chore Suggestions</TabsTrigger>
            <TabsTrigger value="members">Members</TabsTrigger>
            <TabsTrigger value="seasons">Leaderboard</TabsTrigger>
          </TabsList>

          {/* Chore Suggestions Tab */}
          <TabsContent value="suggestions">
            <Card>
              <CardHeader>
                <CardTitle>Pending Chore Suggestions</CardTitle>
                <CardDescription>
                  Review and approve chore suggestions from household members
                </CardDescription>
              </CardHeader>
              <CardContent>
                {pendingSuggestions.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">No pending suggestions</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {pendingSuggestions.map((suggestion) => (
                      <div key={suggestion.id} className="border border-border rounded-lg p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className="font-medium text-foreground">{suggestion.name}</h3>
                            {suggestion.description && (
                              <p className="text-sm text-muted-foreground mt-1">
                                {suggestion.description}
                              </p>
                            )}
                            <div className="flex gap-2 mt-2">
                              <Badge variant="secondary">
                                {suggestion.suggested_points} points
                              </Badge>
                              <Badge variant="outline">
                                By {suggestion.profiles.username}
                              </Badge>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => rejectSuggestion(suggestion.id)}
                            >
                              <X className="h-4 w-4 mr-2" />
                              Reject
                            </Button>
                            <Button
                              size="sm"
                              onClick={() => handleApprove(suggestion)}
                            >
                              <Check className="h-4 w-4 mr-2" />
                              Approve
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Members Tab */}
          <TabsContent value="members">
            <div className="space-y-6">
              {/* Invite Code */}
              <Card>
                <CardHeader>
                  <CardTitle>Invite New Members</CardTitle>
                  <CardDescription>
                    Share this invite code with new household members
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2">
                    <Input
                      value={household?.invite_code || ''}
                      readOnly
                      className="font-mono text-lg"
                    />
                    <Button
                      variant="outline"
                      onClick={handleCopyInviteCode}
                      className={copiedInvite ? 'text-green-600' : ''}
                    >
                      {copiedInvite ? (
                        <Check className="h-4 w-4" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Current Members */}
              <Card>
                <CardHeader>
                  <CardTitle>Household Members</CardTitle>
                  <CardDescription>
                    Current members of your household
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {members.map((member) => (
                      <div key={member.id} className="flex items-center justify-between p-3 border border-border rounded-lg">
                        <div>
                          <p className="font-medium text-foreground">
                            {member.display_name || member.username}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {member.user_id === household?.admin_id ? 'Admin' : 'Member'}
                          </p>
                        </div>
                        {member.user_id === household?.admin_id && (
                          <Badge variant="default">Admin</Badge>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Seasons Tab */}
          <TabsContent value="seasons">
            <div className="space-y-6">
              {/* Current Season */}
              <Card>
                <CardHeader>
                  <CardTitle>Current Season</CardTitle>
                  <CardDescription>
                    Manage leaderboard seasons and competition settings
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {currentSeason ? (
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Status:</span>
                        <Badge variant="default">Active</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Ends:</span>
                        <span className="text-sm">
                          {new Date(currentSeason.end_date).toLocaleDateString()}
                        </span>
                      </div>
                      {currentSeason.prize_pool && (
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Prize:</span>
                          <span className="text-sm">{currentSeason.prize_pool}</span>
                        </div>
                      )}
                    </div>
                  ) : (
                    <p className="text-muted-foreground">No active season</p>
                  )}
                </CardContent>
              </Card>

              {/* Create New Season */}
              <Card>
                <CardHeader>
                  <CardTitle>Season Management</CardTitle>
                  <CardDescription>
                    Start a new competitive season
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Dialog open={showNewSeasonDialog} onOpenChange={setShowNewSeasonDialog}>
                    <DialogTrigger asChild>
                      <Button>
                        <Trophy className="h-4 w-4 mr-2" />
                        Start New Season
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Create New Season</DialogTitle>
                        <DialogDescription>
                          This will end the current season and start a new one.
                        </DialogDescription>
                      </DialogHeader>
                      <form onSubmit={handleCreateSeason} className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="season-days">Duration (Days)</Label>
                          <Input
                            id="season-days"
                            type="number"
                            min="1"
                            max="365"
                            value={newSeasonDays}
                            onChange={(e) => setNewSeasonDays(parseInt(e.target.value) || 30)}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="season-prize">Prize Pool (Optional)</Label>
                          <Textarea
                            id="season-prize"
                            placeholder="e.g., Winner gets to choose next week's dinner!"
                            value={newSeasonPrize}
                            onChange={(e) => setNewSeasonPrize(e.target.value)}
                          />
                        </div>
                        <DialogFooter>
                          <Button type="button" variant="outline" onClick={() => setShowNewSeasonDialog(false)}>
                            Cancel
                          </Button>
                          <Button type="submit">
                            Start Season
                          </Button>
                        </DialogFooter>
                      </form>
                    </DialogContent>
                  </Dialog>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Admin;