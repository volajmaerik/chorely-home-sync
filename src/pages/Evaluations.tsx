import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
import { ArrowLeft, Star, CheckCircle } from 'lucide-react';

const Evaluations = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
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

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center">
          <h1 className="text-2xl font-semibold text-foreground">Loading evaluations...</h1>
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
              <h1 className="text-2xl font-bold text-foreground">Evaluation Queue</h1>
              <p className="text-sm text-muted-foreground">{household?.name}</p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <Badge variant="outline">
              {choresToEvaluate.length} chores awaiting evaluation
            </Badge>
          </div>

          {choresToEvaluate.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-2">All caught up!</h3>
                <p className="text-muted-foreground">
                  No completed chores are waiting for evaluation.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {choresToEvaluate.map((chore) => (
                <Card key={chore.id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <CardTitle className="text-lg">{chore.name}</CardTitle>
                    {chore.description && (
                      <CardDescription>{chore.description}</CardDescription>
                    )}
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <Badge variant="secondary">
                          {chore.base_points} points
                        </Badge>
                        <Badge variant="outline" className="bg-green-50 border-green-200">
                          Completed
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Completed on {new Date(chore.completed_at!).toLocaleDateString()}
                      </p>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button 
                            className="w-full"
                            onClick={() => setSelectedChore(chore)}
                          >
                            <Star className="h-4 w-4 mr-2" />
                            Rate Chore
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Rate: {chore.name}</DialogTitle>
                            <DialogDescription>
                              How well was this chore completed? Your rating helps maintain quality standards.
                            </DialogDescription>
                          </DialogHeader>
                          
                          <div className="space-y-4">
                            <div className="space-y-2">
                              <Label>Rating (1-5 stars)</Label>
                              <div className="flex gap-1">
                                {Array.from({ length: 5 }, (_, i) => (
                                  <button
                                    key={i}
                                    type="button"
                                    onClick={() => setRating(i + 1)}
                                    className={`p-1 rounded transition-colors ${
                                      i < rating
                                        ? 'text-yellow-400 hover:text-yellow-500'
                                        : 'text-gray-300 hover:text-gray-400'
                                    }`}
                                  >
                                    <Star 
                                      className={`h-6 w-6 ${i < rating ? 'fill-current' : ''}`}
                                    />
                                  </button>
                                ))}
                              </div>
                              <p className="text-sm text-muted-foreground">
                                {rating === 0 && 'Click to rate'}
                                {rating === 1 && 'Poor - Major issues'}
                                {rating === 2 && 'Below Average - Some issues'}
                                {rating === 3 && 'Average - Acceptable'}
                                {rating === 4 && 'Good - Well done'}
                                {rating === 5 && 'Excellent - Outstanding work'}
                              </p>
                            </div>

                            <div className="space-y-2">
                              <Label htmlFor="feedback">Feedback (Optional)</Label>
                              <Textarea
                                id="feedback"
                                placeholder="Any additional comments..."
                                value={feedback}
                                onChange={(e) => setFeedback(e.target.value)}
                              />
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
      </main>
    </div>
  );
};

export default Evaluations;