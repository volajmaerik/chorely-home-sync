import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Home, Users } from 'lucide-react';

interface HouseholdSetupProps {
  onCreateHousehold: (name: string) => Promise<{ error: string | null }>;
  onJoinHousehold: (code: string) => Promise<{ error: string | null }>;
  loading?: boolean;
}

export const HouseholdSetup = ({ onCreateHousehold, onJoinHousehold, loading }: HouseholdSetupProps) => {
  const [householdName, setHouseholdName] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [isJoining, setIsJoining] = useState(false);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!householdName.trim()) return;

    setIsCreating(true);
    const result = await onCreateHousehold(householdName.trim());
    setIsCreating(false);

    if (!result.error) {
      setHouseholdName('');
    }
  };

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteCode.trim()) return;

    setIsJoining(true);
    const result = await onJoinHousehold(inviteCode.trim());
    setIsJoining(false);

    if (!result.error) {
      setInviteCode('');
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center">
          <h1 className="text-2xl font-semibold text-foreground">Loading...</h1>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-2">
            <Home className="h-6 w-6 text-primary" />
            Join Chorely
          </CardTitle>
          <CardDescription>
            Create a new household or join an existing one to start managing chores together
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="create" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="create">Create</TabsTrigger>
              <TabsTrigger value="join">Join</TabsTrigger>
            </TabsList>
            
            <TabsContent value="create">
              <form onSubmit={handleCreate} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="household-name">Household Name</Label>
                  <Input
                    id="household-name"
                    placeholder="e.g., The Smith House"
                    value={householdName}
                    onChange={(e) => setHouseholdName(e.target.value)}
                    required
                  />
                </div>
                <Button 
                  type="submit" 
                  className="w-full"
                  disabled={isCreating || !householdName.trim()}
                >
                  {isCreating ? 'Creating...' : 'Create Household'}
                </Button>
              </form>
            </TabsContent>
            
            <TabsContent value="join">
              <form onSubmit={handleJoin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="invite-code">Invite Code</Label>
                  <Input
                    id="invite-code"
                    placeholder="Enter 6-character code"
                    value={inviteCode}
                    onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                    maxLength={6}
                    required
                  />
                </div>
                <Button 
                  type="submit" 
                  className="w-full"
                  disabled={isJoining || !inviteCode.trim()}
                >
                  <Users className="h-4 w-4 mr-2" />
                  {isJoining ? 'Joining...' : 'Join Household'}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};