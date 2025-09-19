import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Key, Fingerprint, Smartphone, Laptop } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface PasskeySetupProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
}

export function PasskeySetup({ isOpen, onClose, onComplete }: PasskeySetupProps) {
  const [step, setStep] = useState<'intro' | 'create' | 'verify'>('intro');
  const [passkeyName, setPasskeyName] = useState('');
  const [loading, setLoading] = useState(false);

  const createPasskey = async () => {
    if (!passkeyName.trim()) {
      toast({
        variant: 'destructive',
        title: 'Name required',
        description: 'Please enter a name for your passkey.',
      });
      return;
    }

    setLoading(true);
    try {
      // Mock passkey creation - in real app, use WebAuthn API
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Simulate browser's passkey creation dialog
      const userConfirmed = window.confirm('Would you like to create a passkey using your device\'s biometric authentication?');
      
      if (userConfirmed) {
        setStep('verify');
        toast({
          title: 'Passkey created successfully!',
          description: `Your passkey "${passkeyName}" has been registered.`,
        });
      } else {
        throw new Error('Passkey creation was cancelled');
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Failed to create passkey',
        description: 'Please try again or check if your device supports passkeys.',
      });
    } finally {
      setLoading(false);
    }
  };

  const completeSetup = () => {
    onComplete();
    onClose();
    toast({
      title: 'Passkey authentication enabled!',
      description: 'You can now sign in using your passkey.',
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Key className="h-5 w-5" />
            Set up Passkey Authentication
          </DialogTitle>
          <DialogDescription>
            {step === 'intro' && 'Use your device\'s biometric authentication or security key to sign in.'}
            {step === 'create' && 'Give your passkey a name and create it using your device\'s authentication.'}
            {step === 'verify' && 'Your passkey has been created successfully!'}
          </DialogDescription>
        </DialogHeader>

        {step === 'intro' && (
          <div className="space-y-4">
            <div className="text-center space-y-4">
              <div className="flex justify-center gap-4">
                <div className="flex flex-col items-center space-y-2">
                  <div className="p-3 bg-primary/10 rounded-full">
                    <Fingerprint className="h-6 w-6 text-primary" />
                  </div>
                  <p className="text-xs text-center">Biometric</p>
                </div>
                <div className="flex flex-col items-center space-y-2">
                  <div className="p-3 bg-primary/10 rounded-full">
                    <Smartphone className="h-6 w-6 text-primary" />
                  </div>
                  <p className="text-xs text-center">Phone</p>
                </div>
                <div className="flex flex-col items-center space-y-2">
                  <div className="p-3 bg-primary/10 rounded-full">
                    <Laptop className="h-6 w-6 text-primary" />
                  </div>
                  <p className="text-xs text-center">Computer</p>
                </div>
              </div>
              
              <div className="space-y-2">
                <h4 className="font-medium">What are passkeys?</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• More secure than passwords</li>
                  <li>• Use your device's built-in authentication</li>
                  <li>• No need to remember complex passwords</li>
                  <li>• Resistant to phishing attacks</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {step === 'create' && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="passkey-name">Passkey Name</Label>
              <Input
                id="passkey-name"
                placeholder="e.g., My iPhone, Work Laptop"
                value={passkeyName}
                onChange={(e) => setPasskeyName(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Give your passkey a memorable name to identify this device
              </p>
            </div>
            
            <div className="p-3 bg-muted rounded-lg">
              <p className="text-sm">
                When you click "Create Passkey", your browser will ask you to authenticate using:
              </p>
              <ul className="text-sm mt-2 space-y-1">
                <li>• Face ID, Touch ID, or Windows Hello</li>
                <li>• Your device PIN or password</li>
                <li>• A security key (if available)</li>
              </ul>
            </div>
          </div>
        )}

        {step === 'verify' && (
          <div className="space-y-4">
            <div className="text-center space-y-4">
              <div className="flex justify-center">
                <div className="p-4 bg-success/10 rounded-full">
                  <Fingerprint className="h-8 w-8 text-success" />
                </div>
              </div>
              
              <div className="space-y-2">
                <h4 className="font-medium text-success">Passkey Created Successfully!</h4>
                <p className="text-sm text-muted-foreground">
                  Your passkey "{passkeyName}" has been registered and is ready to use.
                </p>
              </div>
              
              <Badge variant="outline" className="bg-success/10 border-success/20 text-success">
                Authentication Enabled
              </Badge>
            </div>
          </div>
        )}

        <DialogFooter>
          {step === 'create' && (
            <Button variant="outline" onClick={() => setStep('intro')}>
              Back
            </Button>
          )}
          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose}>
              {step === 'verify' ? 'Close' : 'Cancel'}
            </Button>
            {step === 'intro' && (
              <Button onClick={() => setStep('create')}>
                Get Started
              </Button>
            )}
            {step === 'create' && (
              <Button onClick={createPasskey} disabled={loading || !passkeyName.trim()}>
                {loading ? 'Creating...' : 'Create Passkey'}
              </Button>
            )}
            {step === 'verify' && (
              <Button onClick={completeSetup}>
                Complete Setup
              </Button>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}