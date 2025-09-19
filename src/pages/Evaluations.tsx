import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useHousehold } from '@/hooks/useHousehold';
import { useChores } from '@/hooks/useChores';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Star, CheckCircle } from 'lucide-react';

const Evaluations = () => {
  const { user } = useAuth();
  const { household } = useHousehold();
  const { chores, loading, refetch } = useChores(household?.id || null);
  
  const [selectedChore, setSelectedChore] = useState<any>(null);
  const [rating, setRating] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Get completed chores that haven't been evaluated yet by the current user
  // and were not completed by the current user
  const choresToEvaluate = chores.filter(chore => 
    chore.status === 'completed' && 
    chore.completed_by !== user?.id &&
    !chore.average_rating // This means no evaluations yet - in real app we'd check if current user evaluated
  );

  const handleEvaluate = async () => {
    if (!selectedChore || rating === 0) return;

    setSubmitting(true);
    try {
      const { error } = await supabase
        .from('evaluations')
        .insert({
          chore_id: selectedChore.id,
          rating,
          evaluator_id: user!.id
        });

      if (error) throw error;

      toast({
        title: 'Evaluation submitted!',
        description: 'Thank you for rating this chore.'
      });

      setSelectedChore(null);
      setRating(0);
      setFeedback('');
      await refetch();
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Failed to submit evaluation',
        description: error.message
      });
    } finally {
      setSubmitting(false);
    }
  };

  const getRatingText = (rating: number) => {
    switch (rating) {
      case 1: return 'Poor - Major issues';
      case 2: return 'Below Average - Some issues';
      case 3: return 'Average - Acceptable';
      case 4: return 'Good - Well done';
      case 5: return 'Excellent - Outstanding work';
      default: return 'Click to rate';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center animate-pulse">
          <div className="w-16 h-16 bg-primary/20 rounded-full mx-auto mb-4 animate-bounce" role="status" aria-label="Loading"></div>
          <h2 className="text-xl font-medium text-foreground">Loading evaluations...</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-page-enter">
      <div className="space-y-2">
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Evaluation Queue</h1>
        <p className="text-muted-foreground">Rate completed chores to help maintain quality standards</p>
      </div>

      <div className="flex items-center justify-between">
        <Badge variant="outline" className="bg-card" role="status">
          {choresToEvaluate.length} chores awaiting evaluation
        </Badge>
      </div>

      {choresToEvaluate.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <CheckCircle className="h-12 w-12 text-success mx-auto mb-4" aria-hidden="true" />
            <h3 className="text-lg font-medium text-foreground mb-2">All caught up!</h3>
            <p className="text-muted-foreground">
              No completed chores are waiting for evaluation.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3" role="list" aria-label="Chores to evaluate">
          {choresToEvaluate.map((chore) => (
            <Card key={chore.id} className="hover:shadow-md transition-shadow hover-scale" role="listitem">
              <CardHeader>
                <CardTitle className="text-lg">{chore.name}</CardTitle>
                {chore.description && (
                  <CardDescription>{chore.description}</CardDescription>
                )}
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Badge variant="secondary" className="bg-primary/10 text-primary-foreground">
                      {chore.base_points} points
                    </Badge>
                    <Badge variant="outline" className="bg-success/10 border-success/20 text-success-foreground">
                      Completed
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Completed on {new Date(chore.completed_at!).toLocaleDateString()}
                  </p>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button 
                        className="w-full focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                        onClick={() => setSelectedChore(chore)}
                        aria-describedby={`rate-chore-${chore.id}`}
                      >
                        <Star className="h-4 w-4 mr-2" />
                        Rate Chore
                      </Button>
                    </DialogTrigger>
                    <DialogContent role="dialog" aria-labelledby="rate-chore-title">
                      <DialogHeader>
                        <DialogTitle id="rate-chore-title">Rate: {chore.name}</DialogTitle>
                        <DialogDescription>
                          How well was this chore completed? Your rating helps maintain quality standards and determines the final points awarded.
                        </DialogDescription>
                      </DialogHeader>
                      
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label>Rating (1-5 stars) *</Label>
                          <div className="flex gap-1" role="radiogroup" aria-label="Rate this chore from 1 to 5 stars">
                            {Array.from({ length: 5 }, (_, i) => (
                              <button
                                key={i}
                                type="button"
                                role="radio"
                                aria-checked={i < rating}
                                aria-label={`${i + 1} star${i !== 0 ? 's' : ''}`}
                                onClick={() => setRating(i + 1)}
                                className={`p-1 rounded transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${
                                  i < rating
                                    ? 'text-yellow-400 hover:text-yellow-500'
                                    : 'text-muted-foreground hover:text-foreground'
                                }`}
                              >
                                <Star 
                                  className={`h-6 w-6 ${i < rating ? 'fill-current' : ''}`}
                                />
                              </button>
                            ))}
                          </div>
                          <p className="text-sm text-muted-foreground" role="status" aria-live="polite">
                            {getRatingText(rating)}
                          </p>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="feedback">Feedback (Optional)</Label>
                          <Textarea
                            id="feedback"
                            placeholder="Any additional comments..."
                            value={feedback}
                            onChange={(e) => setFeedback(e.target.value)}
                            className="focus-visible:ring-2 focus-visible:ring-ring"
                            aria-describedby="feedback-desc"
                          />
                          <p id="feedback-desc" className="text-xs text-muted-foreground">
                            Provide constructive feedback to help improve future performance
                          </p>
                        </div>
                      </div>

                      <DialogFooter>
                        <Button variant="outline" onClick={() => {
                          setSelectedChore(null);
                          setRating(0);
                          setFeedback('');
                        }}>
                          Cancel
                        </Button>
                        <Button 
                          onClick={handleEvaluate}
                          disabled={rating === 0 || submitting}
                          className="focus-visible:ring-2 focus-visible:ring-ring"
                        >
                          {submitting ? 'Submitting...' : 'Submit Rating'}
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default Evaluations;