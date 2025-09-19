import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Star, Clock, CheckCircle } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

interface ChoreCardProps {
  chore: {
    id: string;
    name: string;
    description: string | null;
    base_points: number;
    status: 'available' | 'claimed' | 'completed' | 'archived';
    claimed_by: string | null;
    completed_by: string | null;
    average_rating: number | null;
    final_points_awarded: number | null;
  };
  onClaim?: (choreId: string) => void;
  onComplete?: (choreId: string) => void;
  showClaimButton?: boolean;
  compact?: boolean;
}

export const ChoreCard = ({ chore, onClaim, onComplete, showClaimButton, compact }: ChoreCardProps) => {
  const { user } = useAuth();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available': return 'bg-green-500';
      case 'claimed': return 'bg-yellow-500';
      case 'completed': return 'bg-blue-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'available': return null;
      case 'claimed': return <Clock className="h-4 w-4" />;
      case 'completed': return <CheckCircle className="h-4 w-4" />;
      default: return null;
    }
  };

  const canClaim = chore.status === 'available';
  const canComplete = chore.status === 'claimed' && chore.claimed_by === user?.id;
  const isUserChore = chore.claimed_by === user?.id || chore.completed_by === user?.id;

  if (compact) {
    return (
      <div className={`border rounded-lg p-3 hover:bg-muted/50 transition-colors ${isUserChore ? 'ring-1 ring-primary/30 bg-primary/5' : ''}`}>
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <h4 className="font-medium truncate">{chore.name}</h4>
            {chore.description && (
              <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                {chore.description}
              </p>
            )}
            <div className="flex items-center gap-2 mt-2">
              <Badge variant="outline" className="text-xs">
                {chore.final_points_awarded || chore.base_points} pts
              </Badge>
              <Badge variant="secondary" className={`text-xs ${getStatusColor(chore.status)} text-white`}>
                <div className="flex items-center gap-1">
                  {getStatusIcon(chore.status)}
                  {chore.status}
                </div>
              </Badge>
            </div>
          </div>
          <div className="flex gap-1">
            {canClaim && onClaim && (
              <Button size="sm" onClick={() => onClaim(chore.id)} className="flex-shrink-0">
                Claim
              </Button>
            )}
            {canComplete && onComplete && (
              <Button size="sm" onClick={() => onComplete(chore.id)} variant="secondary" className="flex-shrink-0">
                Complete
              </Button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <Card className={`transition-all hover:shadow-md ${isUserChore ? 'ring-2 ring-primary/20' : ''}`}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">{chore.name}</CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className={`${getStatusColor(chore.status)} text-white`}>
              <div className="flex items-center gap-1">
                {getStatusIcon(chore.status)}
                {chore.status}
              </div>
            </Badge>
            <Badge variant="outline" className="font-bold">
              {chore.final_points_awarded || chore.base_points} pts
            </Badge>
          </div>
        </div>
        {chore.description && (
          <CardDescription>{chore.description}</CardDescription>
        )}
      </CardHeader>

      {chore.average_rating && (
        <CardContent>
          <div className="flex items-center gap-2">
            <div className="flex items-center">
              {Array.from({ length: 5 }, (_, i) => (
                <Star
                  key={i}
                  className={`h-4 w-4 ${
                    i < Math.round(chore.average_rating!) 
                      ? 'fill-yellow-400 text-yellow-400' 
                      : 'text-gray-300'
                  }`}
                />
              ))}
            </div>
            <span className="text-sm text-muted-foreground">
              {chore.average_rating.toFixed(1)} / 5.0
            </span>
          </div>
        </CardContent>
      )}

      <CardFooter className="flex justify-between">
        <div className="text-sm text-muted-foreground">
          {isUserChore && <Badge variant="outline">Your chore</Badge>}
        </div>
        <div className="flex gap-2">
          {canClaim && onClaim && (
            <Button onClick={() => onClaim(chore.id)} size="sm">
              Claim Chore
            </Button>
          )}
          {canComplete && onComplete && (
            <Button onClick={() => onComplete(chore.id)} size="sm" variant="secondary">
              Mark Complete
            </Button>
          )}
        </div>
      </CardFooter>
    </Card>
  );
};