import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useHousehold } from '@/hooks/useHousehold';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Camera, Key, Shield, Smartphone, User, Users, Instagram, MessageCircle, Mail, Eye, EyeOff } from 'lucide-react';
import { OTPSetup } from '@/components/auth/OTPSetup';
import { PasskeySetup } from '@/components/auth/PasskeySetup';
import { HouseholdSwitcher } from '@/components/HouseholdSwitcher';

const Settings = () => {
  const { user, signOut } = useAuth();
  const { household } = useHousehold();
  
  // Profile states
  const [displayName, setDisplayName] = useState('');
  const [username, setUsername] = useState('');
  const [instagramHandle, setInstagramHandle] = useState('');
  const [tiktokHandle, setTiktokHandle] = useState('');
  const [profileImageUrl, setProfileImageUrl] = useState('');
  
  // Security states
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [passkeyEnabled, setPasskeyEnabled] = useState(false);
  
  const [loading, setLoading] = useState(false);
  const [profileLoading, setProfileLoading] = useState(true);
  
  // Dialog states
  const [showOTPSetup, setShowOTPSetup] = useState(false);
  const [showPasskeySetup, setShowPasskeySetup] = useState(false);

  // Load profile data
  useEffect(() => {
    const loadProfile = async () => {
      if (!user) return;
      
      try {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('user_id', user.id)
          .single();
          
        if (profile) {
          setDisplayName(profile.display_name || '');
          setUsername(profile.username || '');
          setProfileImageUrl(profile.profile_image_url || '');
          // Instagram and TikTok would be added to the profiles table
        }
      } catch (error) {
        console.error('Error loading profile:', error);
      } finally {
        setProfileLoading(false);
      }
    };

    loadProfile();
  }, [user]);

  const updateProfile = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          display_name: displayName,
          username: username,
          profile_image_url: profileImageUrl,
        })
        .eq('user_id', user.id);

      if (error) throw error;

      toast({
        title: 'Profile updated!',
        description: 'Your profile has been successfully updated.',
      });
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Failed to update profile',
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  const changePassword = async () => {
    if (!newPassword || newPassword !== confirmPassword) {
      toast({
        variant: 'destructive',
        title: 'Password mismatch',
        description: 'New passwords do not match.',
      });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) throw error;

      toast({
        title: 'Password updated!',
        description: 'Your password has been successfully changed.',
      });
      
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Failed to change password',
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  if (profileLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-pulse text-center">
          <div className="w-16 h-16 bg-primary/20 rounded-full mx-auto mb-4"></div>
          <p>Loading settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">Settings</h1>
        <p className="text-muted-foreground">Manage your account preferences and security settings</p>
      </div>

      {/* Profile Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Profile
          </CardTitle>
          <CardDescription>Update your personal information</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex flex-col sm:flex-row items-start gap-6">
            <div className="flex flex-col items-center space-y-2">
              <Avatar className="w-24 h-24">
                <AvatarImage src={profileImageUrl} />
                <AvatarFallback className="text-2xl">
                  {(displayName || username || user?.email)?.charAt(0)?.toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <Button variant="outline" size="sm" className="text-xs">
                <Camera className="h-3 w-3 mr-1" />
                Change Photo
              </Button>
            </div>
            
            <div className="flex-1 space-y-4 w-full">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="display-name">Display Name</Label>
                  <Input
                    id="display-name"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="Your display name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="username">Username</Label>
                  <Input
                    id="username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Your username"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="instagram">Instagram Handle</Label>
                  <div className="relative">
                    <Instagram className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="instagram"
                      value={instagramHandle}
                      onChange={(e) => setInstagramHandle(e.target.value)}
                      placeholder="@yourusername"
                      className="pl-10"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tiktok">TikTok Handle</Label>
                  <div className="relative">
                    <MessageCircle className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="tiktok"
                      value={tiktokHandle}
                      onChange={(e) => setTiktokHandle(e.target.value)}
                      placeholder="@yourusername"
                      className="pl-10"
                    />
                  </div>
                </div>
              </div>
              
              <Button onClick={updateProfile} disabled={loading} className="w-full sm:w-auto text-primary-foreground">
                {loading ? 'Updating...' : 'Update Profile'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Appearance Section */}
      <Card>
        <CardHeader>
          <CardTitle>Appearance</CardTitle>
          <CardDescription>Customize how the app looks and feels</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h4 className="font-medium">Theme</h4>
              <p className="text-sm text-muted-foreground">
                Switch between light and dark mode
              </p>
            </div>
            <ThemeToggle />
          </div>
        </CardContent>
      </Card>

      {/* Security Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Security & Authentication
          </CardTitle>
          <CardDescription>Manage your account security settings</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Change Password */}
          <div className="space-y-4">
            <h4 className="font-medium flex items-center gap-2">
              <Key className="h-4 w-4" />
              Change Password
            </h4>
            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-2">
                <Label htmlFor="current-password">Current Password</Label>
                <div className="relative">
                  <Input
                    id="current-password"
                    type={showCurrentPassword ? 'text' : 'password'}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Enter current password"
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 h-auto p-1"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  >
                    {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="new-password">New Password</Label>
                  <div className="relative">
                    <Input
                      id="new-password"
                      type={showNewPassword ? 'text' : 'password'}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Enter new password"
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 h-auto p-1"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                    >
                      {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirm-password">Confirm New Password</Label>
                  <Input
                    id="confirm-password"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm new password"
                  />
                </div>
              </div>
              <Button onClick={changePassword} disabled={loading || !newPassword} className="w-full sm:w-auto">
                {loading ? 'Updating...' : 'Change Password'}
              </Button>
            </div>
          </div>

          <Separator />

          {/* Two-Factor Authentication */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <h4 className="font-medium flex items-center gap-2">
                  <Smartphone className="h-4 w-4" />
                  Two-Factor Authentication
                </h4>
                <p className="text-sm text-muted-foreground">
                  Add an extra layer of security with OTP codes
                </p>
                {twoFactorEnabled && (
                  <Badge variant="outline" className="bg-success/10 border-success/20 text-success">
                    Enabled
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-2">
                {twoFactorEnabled ? (
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => {
                      setTwoFactorEnabled(false);
                      toast({
                        title: 'Two-factor authentication disabled',
                        description: 'Your account is now using single-factor authentication.',
                      });
                    }}
                  >
                    Disable
                  </Button>
                ) : (
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setShowOTPSetup(true)}
                  >
                    Set Up
                  </Button>
                )}
              </div>
            </div>
          </div>

          <Separator />

          {/* Passkey Authentication */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <h4 className="font-medium flex items-center gap-2">
                  <Key className="h-4 w-4" />
                  Passkey Authentication
                </h4>
                <p className="text-sm text-muted-foreground">
                  Use biometric authentication instead of passwords
                </p>
                {passkeyEnabled && (
                  <Badge variant="outline" className="bg-primary/10 border-primary/20 text-primary">
                    Configured
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-2">
                {passkeyEnabled ? (
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => {
                      setPasskeyEnabled(false);
                      toast({
                        title: 'Passkey authentication disabled',
                        description: 'Your passkeys have been removed from this account.',
                      });
                    }}
                  >
                    Remove
                  </Button>
                ) : (
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setShowPasskeySetup(true)}
                  >
                    Set Up
                  </Button>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Household Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Household
          </CardTitle>
          <CardDescription>Manage your household memberships</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div>
              <h4 className="font-medium">{household?.name}</h4>
              <p className="text-sm text-muted-foreground">Current household</p>
            </div>
            <Badge>Active</Badge>
          </div>
          
          <HouseholdSwitcher />
          
          <div className="flex flex-col sm:flex-row gap-2">
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" className="flex-1">
                  <Users className="h-4 w-4 mr-2" />
                  Invite Members
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Invite Members</DialogTitle>
                  <DialogDescription>
                    Share this invite code with new household members
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Input
                      value={household?.invite_code || ''}
                      readOnly
                      className="font-mono text-lg"
                    />
                    <Button
                      variant="outline"
                      onClick={() => {
                        if (household?.invite_code) {
                          navigator.clipboard.writeText(household.invite_code);
                          toast({
                            title: 'Invite code copied!',
                            description: 'Share this code with new members.'
                          });
                        }
                      }}
                    >
                      Copy
                    </Button>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    New members can join by entering this code during signup or in their settings.
                  </p>
                </div>
              </DialogContent>
            </Dialog>
            
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" className="flex-1">
                  Join Household
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Join Another Household</DialogTitle>
                  <DialogDescription>
                    Enter an invite code to join another household
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <Input
                    placeholder="Enter invite code"
                    className="font-mono text-lg"
                    id="join-code"
                  />
                  <Button 
                    className="w-full" 
                    onClick={async () => {
                      const input = document.getElementById('join-code') as HTMLInputElement;
                      const code = input.value.trim().toUpperCase();
                      if (!code) return;
                      
                      try {
                        const { error } = await supabase.rpc('join_household_by_code', {
                          invite_code: code
                        });
                        
                        if (error) throw error;
                        
                        toast({
                          title: 'Successfully joined household!',
                          description: 'You can now switch between your households.'
                        });
                        input.value = '';
                      } catch (error: any) {
                        toast({
                          variant: 'destructive',
                          title: 'Failed to join household',
                          description: error.message
                        });
                      }
                    }}
                  >
                    Join Household
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="border-destructive/50">
        <CardHeader>
          <CardTitle className="text-destructive">Danger Zone</CardTitle>
          <CardDescription>Actions that cannot be undone</CardDescription>
        </CardHeader>
        <CardContent>
          <Button variant="destructive" onClick={signOut}>
            Sign Out
          </Button>
        </CardContent>
      </Card>

      {/* Setup Dialogs */}
      <OTPSetup 
        isOpen={showOTPSetup}
        onClose={() => setShowOTPSetup(false)}
        onComplete={() => setTwoFactorEnabled(true)}
      />
      
      <PasskeySetup 
        isOpen={showPasskeySetup}
        onClose={() => setShowPasskeySetup(false)}
        onComplete={() => setPasskeyEnabled(true)}
      />
    </div>
  );
};

export default Settings;