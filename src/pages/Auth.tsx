import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { Chrome, Mail, Shield, Sparkles, Check } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

const Auth = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [showOtpStep, setShowOtpStep] = useState(false);
  const [otp, setOtp] = useState('');
  const { user, signUp, signIn } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const result = await signUp(email, password, username);
    if (!result.error) {
      setShowOtpStep(true);
    }
    setLoading(false);
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await signIn(email, password);
    setLoading(false);
  };

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/`
      }
    });

    if (error) {
      toast({
        variant: "destructive",
        title: "Google sign in failed",
        description: error.message,
      });
    }
    setGoogleLoading(false);
  };

  const handleOtpVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    const { error } = await supabase.auth.verifyOtp({
      email,
      token: otp,
      type: 'signup'
    });

    if (error) {
      toast({
        variant: "destructive",
        title: "Verification failed",
        description: error.message,
      });
    } else {
      toast({
        title: "Account verified!",
        description: "You can now sign in to your account.",
      });
      setShowOtpStep(false);
    }
    setLoading(false);
  };

  if (showOtpStep) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted/20 p-4">
        <div className="absolute top-4 right-4">
          <ThemeToggle />
        </div>
        
        <div className="w-full max-w-md flex justify-center">
          <Card className="border-border/50 shadow-xl backdrop-blur-sm">
            <CardHeader className="text-center space-y-4">
              <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                <Mail className="w-6 h-6 text-primary" />
              </div>
              <div>
                <CardTitle className="text-2xl">Check your email</CardTitle>
                <CardDescription className="text-muted-foreground">
                  We sent a verification code to {email}
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleOtpVerification} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="otp">Verification Code</Label>
                  <Input
                    id="otp"
                    type="text"
                    placeholder="Enter 6-digit code"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    className="text-center text-lg tracking-widest"
                    maxLength={6}
                    required
                  />
                </div>
                <Button type="submit" className="w-full" disabled={loading || otp.length !== 6}>
                  {loading ? 'Verifying...' : 'Verify Account'}
                </Button>
                <Button 
                  type="button" 
                  variant="ghost" 
                  className="w-full" 
                  onClick={() => setShowOtpStep(false)}
                >
                  Back to sign up
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted/20 p-4 sm:p-6 md:p-8 lg:p-12">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>
      
      <div className="w-full max-w-md lg:max-w-lg xl:max-w-xl mx-auto">
        <div className="text-center mb-8 space-y-4">
          <div className="mx-auto w-16 h-16 lg:w-20 lg:h-20 bg-gradient-to-br from-primary to-primary/80 rounded-2xl flex items-center justify-center shadow-lg">
            <Sparkles className="w-8 h-8 lg:w-10 lg:h-10 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-4xl lg:text-5xl xl:text-6xl font-bold bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">
              Chorely
            </h1>
            <p className="text-muted-foreground mt-2 text-lg lg:text-xl">Gamified household management</p>
          </div>
        </div>

        <Tabs defaultValue="signin" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6 bg-muted/50">
            <TabsTrigger value="signin" className="data-[state=active]:bg-background">Sign In</TabsTrigger>
            <TabsTrigger value="signup" className="data-[state=active]:bg-background">Sign Up</TabsTrigger>
          </TabsList>

          <TabsContent value="signin" className="space-y-4">
            <Card className="border-border/50 shadow-xl backdrop-blur-sm">
              <CardHeader className="space-y-2">
                <CardTitle className="text-2xl">Welcome back</CardTitle>
                <CardDescription>Sign in to continue your chore journey</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button 
                  onClick={handleGoogleSignIn} 
                  variant="outline" 
                  className="w-full h-11 border-border/50 hover:bg-muted/50"
                  disabled={googleLoading}
                >
                  <Chrome className="mr-2 h-4 w-4" />
                  {googleLoading ? 'Connecting...' : 'Continue with Google'}
                </Button>
                
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-border/50" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">Or continue with email</span>
                  </div>
                </div>

                <form onSubmit={handleSignIn} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signin-email" className="text-sm font-medium">Email</Label>
                    <Input
                      id="signin-email"
                      type="email"
                      placeholder="name@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="h-11"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signin-password" className="text-sm font-medium">Password</Label>
                    <Input
                      id="signin-password"
                      type="password"
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="h-11"
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full h-11 bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary/80" disabled={loading}>
                    {loading ? 'Signing in...' : 'Sign In'}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="signup" className="space-y-4">
            <Card className="border-border/50 shadow-xl backdrop-blur-sm">
              <CardHeader className="space-y-2">
                <CardTitle className="text-2xl">Create account</CardTitle>
                <CardDescription>Join the gamified cleaning revolution</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button 
                  onClick={handleGoogleSignIn} 
                  variant="outline" 
                  className="w-full h-11 border-border/50 hover:bg-muted/50"
                  disabled={googleLoading}
                >
                  <Chrome className="mr-2 h-4 w-4" />
                  {googleLoading ? 'Connecting...' : 'Sign up with Google'}
                </Button>
                
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-border/50" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">Or create with email</span>
                  </div>
                </div>

                <form onSubmit={handleSignUp} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signup-username" className="text-sm font-medium">Username</Label>
                    <Input
                      id="signup-username"
                      type="text"
                      placeholder="Choose a unique username"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="h-11"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-email" className="text-sm font-medium">Email</Label>
                    <Input
                      id="signup-email"
                      type="email"
                      placeholder="name@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="h-11"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-password" className="text-sm font-medium">Password</Label>
                    <Input
                      id="signup-password"
                      type="password"
                      placeholder="Create a strong password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="h-11"
                      required
                      minLength={6}
                    />
                    <div className="flex items-center text-xs text-muted-foreground mt-1">
                      <Shield className="w-3 h-3 mr-1" />
                      Email verification required
                    </div>
                  </div>
                  <Button type="submit" className="w-full h-11 bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary/80" disabled={loading}>
                    {loading ? 'Creating account...' : 'Create Account'}
                  </Button>
                </form>

                <div className="text-xs text-muted-foreground space-y-2">
                  <div className="flex items-center">
                    <Check className="w-3 h-3 mr-2 text-success" />
                    Secure email verification
                  </div>
                  <div className="flex items-center">
                    <Check className="w-3 h-3 mr-2 text-success" />
                    Multiple household support
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Auth;