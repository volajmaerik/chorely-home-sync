import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Key, Smartphone, Check, X, Trash2, Plus } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface Passkey {
  id: string;
  name: string;
  createdAt: string;
  lastUsed?: string;
}

interface PasskeySetupProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
}

export const PasskeySetup = ({ isOpen, onClose, onComplete }: PasskeySetupProps) => {
  const [step, setStep] = useState<'list' | 'setup' | 'verify'>('list');
  const [passkeys, setPasskeys] = useState<Passkey[]>([]);
  const [newPasskeyName, setNewPasskeyName] = useState('');
  const [loading, setLoading] = useState(false);

  // Load existing passkeys
  useEffect(() => {
    if (isOpen) {
      loadPasskeys();
    }
  }, [isOpen]);

  const loadPasskeys = () => {
    // In a real implementation, this would fetch from your backend
    const savedPasskeys = JSON.parse(localStorage.getItem('userPasskeys') || '[]');
    setPasskeys(savedPasskeys);
  };

  const generatePasskey = () => {
    if (!newPasskeyName.trim()) {
      toast({
        variant: 'destructive',
        title: 'Please enter a name',
        description: 'Give your passkey a memorable name.'
      });
      return;
    }

    setStep('verify');
  };

  const handleSetup = async () => {
    setLoading(true);
    
    // Simulate passkey registration
    setTimeout(() => {
      const newPasskey: Passkey = {
        id: Math.random().toString(36).substr(2, 9),
        name: newPasskeyName,
        createdAt: new Date().toISOString(),
      };

      const updatedPasskeys = [...passkeys, newPasskey];
      setPasskeys(updatedPasskeys);
      localStorage.setItem('userPasskeys', JSON.stringify(updatedPasskeys));

      toast({
        title: 'Passkey registered!',
        description: 'Your biometric authentication is now active.',
      });
      
      setLoading(false);
      setStep('list');
      setNewPasskeyName('');
      onComplete();
    }, 2000);
  };

  const removePasskey = (id: string) => {
    const updatedPasskeys = passkeys.filter(pk => pk.id !== id);
    setPasskeys(updatedPasskeys);
    localStorage.setItem('userPasskeys', JSON.stringify(updatedPasskeys));
    
    toast({
      title: 'Passkey removed',
      description: 'The passkey has been deleted from your account.'
    });
  };

  const handleClose = () => {
    setStep('list');
    setNewPasskeyName('');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Key className="h-5 w-5" />
            Manage Passkeys
          </DialogTitle>
          <DialogDescription>
            {step === 'list' 
              ? 'View and manage your registered passkeys.'
              : step === 'setup'
              ? 'Set up a new passkey for biometric authentication.'
              : 'Complete the passkey registration process.'
            }
          </DialogDescription>
        </DialogHeader>

        {step === 'list' ? (
          <div className="space-y-4">
            {passkeys.length === 0 ? (
              <div className="text-center py-6">
                <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                  <Key className="w-8 h-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-medium mb-2">No Passkeys Configured</h3>
                <p className="text-sm text-muted-foreground">
                  Set up your first passkey for secure biometric authentication.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                <h4 className="font-medium">Your Passkeys</h4>
                {passkeys.map((passkey) => (
                  <Card key={passkey.id}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                            <Smartphone className="w-5 h-5 text-primary" />
                          </div>
                          <div>
                            <p className="font-medium">{passkey.name}</p>
                            <p className="text-sm text-muted-foreground">
                              Created {new Date(passkey.createdAt).toLocaleDateString()}
                            </p>
                            {passkey.lastUsed && (
                              <p className="text-xs text-muted-foreground">
                                Last used {new Date(passkey.lastUsed).toLocaleDateString()}
                              </p>
                            )}
                          </div>
                        </div>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => removePasskey(passkey.id)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        ) : step === 'setup' ? (
          <div className="space-y-4">
            <div className="text-center py-4">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Smartphone className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-lg font-medium mb-2">Set Up New Passkey</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Give your passkey a name and you'll be prompted to use your device's biometric authentication.
              </p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="passkey-name">Passkey Name</Label>
              <Input
                id="passkey-name"
                placeholder="e.g., iPhone Touch ID, Windows Hello"
                value={newPasskeyName}
                onChange={(e) => setNewPasskeyName(e.target.value)}
              />
            </div>

            <div className="bg-muted/50 rounded-lg p-4">
              <h4 className="font-medium mb-2">Benefits of Passkeys</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-success" />
                  More secure than passwords
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-success" />
                  Faster sign-in experience
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-success" />
                  Works across all your devices
                </li>
              </ul>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="text-center py-4">
              <div className="w-16 h-16 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Check className="w-8 h-8 text-success" />
              </div>
              <h3 className="text-lg font-medium mb-2">Registering Passkey</h3>
              <p className="text-sm text-muted-foreground">
                Please complete the biometric authentication on your device.
              </p>
            </div>
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            {step === 'list' ? 'Close' : 'Cancel'}
          </Button>
          {step === 'list' && (
            <Button onClick={() => setStep('setup')}>
              <Plus className="w-4 h-4 mr-2" />
              Add Passkey
            </Button>
          )}
          {step === 'setup' && (
            <Button onClick={generatePasskey}>
              <Key className="w-4 h-4 mr-2" />
              Create Passkey
            </Button>
          )}
          {step === 'verify' && (
            <Button onClick={handleSetup} disabled={loading}>
              {loading ? 'Registering...' : 'Complete Setup'}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};