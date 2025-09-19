import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Cookie, Shield, Eye, BarChart } from 'lucide-react';

interface CookiePreferences {
  essential: boolean;
  analytics: boolean;
  marketing: boolean;
}

export const CookieConsent = () => {
  const [showConsent, setShowConsent] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [preferences, setPreferences] = useState<CookiePreferences>({
    essential: true,
    analytics: false,
    marketing: false,
  });

  useEffect(() => {
    const consentGiven = localStorage.getItem('cookie-consent');
    if (!consentGiven) {
      // Show consent after a short delay for better UX
      const timer = setTimeout(() => setShowConsent(true), 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAcceptAll = () => {
    const newPreferences = {
      essential: true,
      analytics: true,
      marketing: true,
    };
    savePreferences(newPreferences);
  };

  const handleAcceptSelected = () => {
    savePreferences(preferences);
  };

  const handleRejectAll = () => {
    const newPreferences = {
      essential: true,
      analytics: false,
      marketing: false,
    };
    savePreferences(newPreferences);
  };

  const savePreferences = (prefs: CookiePreferences) => {
    localStorage.setItem('cookie-consent', JSON.stringify(prefs));
    localStorage.setItem('cookie-consent-date', new Date().toISOString());
    setShowConsent(false);
    setShowDetails(false);
  };

  if (!showConsent) return null;

  return (
    <div 
      className="fixed bottom-4 left-4 right-4 z-50 animate-fade-in"
      role="banner"
      aria-label="Cookie consent"
    >
      <Card className="max-w-md mx-auto border-primary/20 bg-card/95 backdrop-blur-sm shadow-xl">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-2">
            <Cookie className="h-5 w-5 text-primary" aria-hidden="true" />
            <CardTitle className="text-lg">Cookie Preferences</CardTitle>
          </div>
          <CardDescription className="text-sm">
            We use cookies to enhance your experience and improve our services. 
            Your privacy matters to us.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-2">
            <Button 
              onClick={handleAcceptAll}
              className="flex-1 bg-primary hover:bg-primary/90 focus-visible:ring-2 focus-visible:ring-ring"
            >
              Accept All
            </Button>
            <Button 
              variant="outline" 
              onClick={handleRejectAll}
              className="flex-1 focus-visible:ring-2 focus-visible:ring-ring"
            >
              Reject All
            </Button>
          </div>
          
          <Dialog open={showDetails} onOpenChange={setShowDetails}>
            <DialogTrigger asChild>
              <Button 
                variant="ghost" 
                className="w-full text-sm focus-visible:ring-2 focus-visible:ring-ring"
              >
                Customize Settings
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-lg" role="dialog" aria-labelledby="cookie-settings-title">
              <DialogHeader>
                <DialogTitle id="cookie-settings-title">Cookie Settings</DialogTitle>
                <DialogDescription>
                  Choose which cookies you're comfortable with. Essential cookies are required for the app to function.
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-6">
                {/* Essential Cookies */}
                <div className="flex items-start justify-between space-x-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Shield className="h-4 w-4 text-green-600" aria-hidden="true" />
                      <Label className="font-medium">Essential Cookies</Label>
                      <Badge variant="secondary" className="text-xs">Required</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Necessary for login, security, and core app functionality. Cannot be disabled.
                    </p>
                  </div>
                  <Switch 
                    checked={true} 
                    disabled 
                    aria-label="Essential cookies (required)"
                  />
                </div>

                {/* Analytics Cookies */}
                <div className="flex items-start justify-between space-x-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <BarChart className="h-4 w-4 text-blue-600" aria-hidden="true" />
                      <Label className="font-medium">Analytics Cookies</Label>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Help us understand usage patterns to improve the app experience.
                    </p>
                  </div>
                  <Switch 
                    checked={preferences.analytics}
                    onCheckedChange={(checked) => 
                      setPreferences(prev => ({ ...prev, analytics: checked }))
                    }
                    aria-label="Analytics cookies"
                  />
                </div>

                {/* Marketing Cookies */}
                <div className="flex items-start justify-between space-x-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Eye className="h-4 w-4 text-purple-600" aria-hidden="true" />
                      <Label className="font-medium">Marketing Cookies</Label>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Used to show relevant content and measure campaign effectiveness.
                    </p>
                  </div>
                  <Switch 
                    checked={preferences.marketing}
                    onCheckedChange={(checked) => 
                      setPreferences(prev => ({ ...prev, marketing: checked }))
                    }
                    aria-label="Marketing cookies"
                  />
                </div>
              </div>

              <div className="flex justify-between pt-4">
                <Button variant="outline" onClick={() => setShowDetails(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAcceptSelected} className="focus-visible:ring-2 focus-visible:ring-ring">
                  Save Preferences
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          <p className="text-xs text-muted-foreground text-center">
            By continuing, you agree to our{' '}
            <button className="underline hover:no-underline focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 rounded">
              Privacy Policy
            </button>{' '}
            and{' '}
            <button className="underline hover:no-underline focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 rounded">
              Terms of Service
            </button>
          </p>
        </CardContent>
      </Card>
    </div>
  );
};