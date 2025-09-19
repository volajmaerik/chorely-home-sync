import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';

const Index = () => {
  const { user, loading, signOut } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center">
          <h1 className="text-2xl font-semibold text-foreground">Loading...</h1>
        </div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect to auth
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-foreground">Chorely</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">
              Welcome, {user.email}
            </span>
            <Button variant="outline" onClick={signOut}>
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-foreground mb-4">
            Welcome to Chorely!
          </h2>
          <p className="text-xl text-muted-foreground mb-8">
            Your gamified household chore management system
          </p>
          
          <div className="grid gap-6 md:grid-cols-3 max-w-4xl mx-auto">
            <div className="bg-card p-6 rounded-lg border border-border">
              <h3 className="text-lg font-semibold text-foreground mb-2">
                Create Household
              </h3>
              <p className="text-muted-foreground">
                Start a new household and invite your roommates
              </p>
            </div>
            
            <div className="bg-card p-6 rounded-lg border border-border">
              <h3 className="text-lg font-semibold text-foreground mb-2">
                Join Household
              </h3>
              <p className="text-muted-foreground">
                Use an invite code to join an existing household
              </p>
            </div>
            
            <div className="bg-card p-6 rounded-lg border border-border">
              <h3 className="text-lg font-semibold text-foreground mb-2">
                Manage Chores
              </h3>
              <p className="text-muted-foreground">
                Track and complete household chores for points
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;
