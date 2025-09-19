import { useState } from 'react';
import { useHousehold } from '@/hooks/useHousehold';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from '@/hooks/use-toast';
import { Copy, Users, Share2, QrCode, UserPlus } from 'lucide-react';

interface InvitePromptProps {
  className?: string;
}

export const InvitePrompt = ({ className }: InvitePromptProps) => {
  const { household, members } = useHousehold();
  const [copied, setCopied] = useState(false);

  const copyInviteCode = async () => {
    if (!household?.invite_code) return;
    
    try {
      await navigator.clipboard.writeText(household.invite_code);
      setCopied(true);
      toast({
        title: 'Invite code copied!',
        description: 'Share this code with your roommates to invite them.',
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Failed to copy',
        description: 'Please copy the code manually.',
      });
    }
  };

  const shareInvite = async () => {
    if (!household) return;
    
    const shareData = {
      title: `Join ${household.name} on Chorely!`,
      text: `Hey! I'm inviting you to join our household "${household.name}" on Chorely. Use invite code: ${household.invite_code}`,
      url: window.location.origin,
    };

    try {
      if (navigator.share && navigator.canShare(shareData)) {
        await navigator.share(shareData);
      } else {
        // Fallback to copying
        await navigator.clipboard.writeText(
          `Join ${household.name} on Chorely! Use invite code: ${household.invite_code} at ${window.location.origin}`
        );
        toast({
          title: 'Invite message copied!',
          description: 'Share this message with your roommates.',
        });
      }
    } catch (error) {
      console.error('Share failed:', error);
    }
  };

  if (!household) return null;

  return (
    <Card className={`bg-gradient-to-br from-primary/5 to-secondary/5 border-primary/20 ${className}`}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <UserPlus className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg">Invite Your Squad! 🏠</CardTitle>
          </div>
          <Badge variant="secondary" className="bg-primary/10">
            {members.length} member{members.length !== 1 ? 's' : ''}
          </Badge>
        </div>
        <CardDescription>
          More roommates = more fun! Get your squad on Chorely and turn chores into a game.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1">
            <div className="flex items-center gap-2 p-3 bg-background/50 rounded-lg border">
              <QrCode className="h-4 w-4 text-muted-foreground" />
              <span className="font-mono text-lg font-semibold tracking-widest">
                {household.invite_code}
              </span>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={copyInviteCode}
              className="flex-shrink-0"
            >
              <Copy className="h-4 w-4 mr-1" />
              {copied ? 'Copied!' : 'Copy'}
            </Button>
            <Button
              size="sm"
              onClick={shareInvite}
              className="flex-shrink-0"
            >
              <Share2 className="h-4 w-4 mr-1" />
              Share
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 pt-2">
          <div className="text-center p-3 bg-background/30 rounded-lg">
            <div className="text-2xl font-bold text-primary">🎯</div>
            <p className="text-xs text-muted-foreground mt-1">Turn chores into competitions</p>
          </div>
          <div className="text-center p-3 bg-background/30 rounded-lg">
            <div className="text-2xl font-bold text-primary">🏆</div>
            <p className="text-xs text-muted-foreground mt-1">Leaderboards & rewards</p>
          </div>
        </div>

        <Dialog>
          <DialogTrigger asChild>
            <Button variant="ghost" className="w-full text-sm text-muted-foreground hover:text-primary">
              Why should I invite roommates? →
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Why Invite Your Roommates?</DialogTitle>
              <DialogDescription className="space-y-3 pt-2">
                <div className="space-y-2">
                  <p className="font-medium">🔥 Make chores actually fun:</p>
                  <p className="text-sm">Turn cleaning into friendly competition with points, rankings, and rewards!</p>
                </div>
                <div className="space-y-2">
                  <p className="font-medium">⚡ Better accountability:</p>
                  <p className="text-sm">Everyone can see who's doing what - no more mystery dishes in the sink!</p>
                </div>
                <div className="space-y-2">
                  <p className="font-medium">🎉 Social features:</p>
                  <p className="text-sm">Rate each other's work, suggest new chores, and celebrate wins together!</p>
                </div>
              </DialogDescription>
            </DialogHeader>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
};