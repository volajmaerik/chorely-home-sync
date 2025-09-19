import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Smartphone, QrCode, Copy, CheckCircle } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface OTPSetupProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
}

export function OTPSetup({ isOpen, onClose, onComplete }: OTPSetupProps) {
  const [step, setStep] = useState<'qr' | 'verify'>('qr');
  const [verificationCode, setVerificationCode] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Mock secret key for demonstration
  const secretKey = 'JBSWY3DPEHPK3PXP';
  const qrCodeUrl = `otpauth://totp/Chorely?secret=${secretKey}&issuer=Chorely`;

  const copySecretKey = () => {
    navigator.clipboard.writeText(secretKey);
    toast({
      title: 'Secret key copied!',
      description: 'The secret key has been copied to your clipboard.',
    });
  };

  const verifyCode = async () => {
    if (!verificationCode || verificationCode.length !== 6) {
      toast({
        variant: 'destructive',
        title: 'Invalid code',
        description: 'Please enter a 6-digit verification code.',
      });
      return;
    }

    setLoading(true);
    try {
      // Mock verification - in real app, verify with backend
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Simulate successful verification
      if (verificationCode === '123456' || verificationCode.length === 6) {
        toast({
          title: 'OTP enabled successfully!',
          description: 'Two-factor authentication has been enabled for your account.',
        });
        onComplete();
        onClose();
      } else {
        throw new Error('Invalid verification code');
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Verification failed',
        description: 'The verification code is incorrect. Please try again.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Smartphone className="h-5 w-5" />
            Set up Two-Factor Authentication
          </DialogTitle>
          <DialogDescription>
            {step === 'qr' 
              ? 'Scan the QR code with your authenticator app or enter the secret key manually.'
              : 'Enter the 6-digit code from your authenticator app to complete setup.'
            }
          </DialogDescription>
        </DialogHeader>

        {step === 'qr' && (
          <div className="space-y-4">
            <div className="flex flex-col items-center space-y-4">
              <div className="p-4 bg-background border rounded-lg">
                <QrCode className="h-32 w-32 text-muted-foreground" />
                <p className="text-xs text-center mt-2 text-muted-foreground">QR Code</p>
              </div>
              
              <div className="text-center space-y-2">
                <p className="text-sm font-medium">Can't scan the code?</p>
                <p className="text-sm text-muted-foreground">Enter this secret key manually:</p>
                <div className="flex items-center gap-2 p-2 bg-muted rounded">
                  <code className="flex-1 text-sm font-mono">{secretKey}</code>
                  <Button variant="ghost" size="sm" onClick={copySecretKey}>
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium">Popular authenticator apps:</p>
              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary">Google Authenticator</Badge>
                <Badge variant="secondary">Authy</Badge>
                <Badge variant="secondary">1Password</Badge>
              </div>
            </div>
          </div>
        )}

        {step === 'verify' && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="verification-code">Verification Code</Label>
              <Input
                id="verification-code"
                placeholder="Enter 6-digit code"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                className="text-center text-lg tracking-widest"
                maxLength={6}
              />
              <p className="text-xs text-muted-foreground">
                Enter the 6-digit code from your authenticator app
              </p>
            </div>
          </div>
        )}

        <DialogFooter className="flex justify-between">
          {step === 'verify' && (
            <Button variant="outline" onClick={() => setStep('qr')}>
              Back
            </Button>
          )}
          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            {step === 'qr' ? (
              <Button onClick={() => setStep('verify')}>
                Continue
              </Button>
            ) : (
              <Button onClick={verifyCode} disabled={loading || verificationCode.length !== 6}>
                {loading ? 'Verifying...' : 'Verify & Enable'}
              </Button>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}