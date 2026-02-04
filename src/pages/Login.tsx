import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Loader2, Package, Shield, UserCog, Users } from 'lucide-react';
import { toast } from 'sonner';
import type { AppRole } from '@/types/inventory';

const Login: React.FC = () => {
  const { signIn, signUp } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [loginData, setLoginData] = useState({ email: '', password: '' });
  const [signupData, setSignupData] = useState({ 
    email: '', 
    password: '', 
    fullName: '',
    role: 'secretary' as AppRole
  });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    const { error } = await signIn(loginData.email, loginData.password);
    
    if (error) {
      toast.error(error.message);
    } else {
      toast.success('Welcome back!');
    }
    
    setIsLoading(false);
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    const { error } = await signUp(
      signupData.email, 
      signupData.password, 
      signupData.fullName,
      signupData.role
    );
    
    if (error) {
      toast.error(error.message);
    } else {
      toast.success(`Account created as ${signupData.role}! Please check your email to verify.`);
    }
    
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-primary/10 p-4">
      <div className="w-full max-w-md space-y-6">
        <Card className="shadow-xl">
          <CardHeader className="text-center space-y-4">
            <div className="mx-auto w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center">
              <Package className="w-8 h-8 text-primary" />
            </div>
            <div>
              <CardTitle className="text-2xl font-bold">RTB Inventory System</CardTitle>
              <CardDescription className="text-base mt-2">
                Rwanda TVET Board - Inventory Management
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="login" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="login">Login</TabsTrigger>
                <TabsTrigger value="signup">Sign Up</TabsTrigger>
              </TabsList>
              
              <TabsContent value="login">
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="login-email">Email</Label>
                    <Input
                      id="login-email"
                      type="email"
                      placeholder="you@rtb.gov.rw"
                      value={loginData.email}
                      onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="login-password">Password</Label>
                    <Input
                      id="login-password"
                      type="password"
                      placeholder="Enter your password"
                      value={loginData.password}
                      onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Signing in...
                      </>
                    ) : (
                      'Sign In'
                    )}
                  </Button>
                </form>
              </TabsContent>
              
              <TabsContent value="signup">
                <form onSubmit={handleSignup} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signup-name">Full Name</Label>
                    <Input
                      id="signup-name"
                      type="text"
                      placeholder="John Doe"
                      value={signupData.fullName}
                      onChange={(e) => setSignupData({ ...signupData, fullName: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-email">Email</Label>
                    <Input
                      id="signup-email"
                      type="email"
                      placeholder="you@rtb.gov.rw"
                      value={signupData.email}
                      onChange={(e) => setSignupData({ ...signupData, email: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-password">Password</Label>
                    <Input
                      id="signup-password"
                      type="password"
                      placeholder="Create a password"
                      value={signupData.password}
                      onChange={(e) => setSignupData({ ...signupData, password: e.target.value })}
                      required
                      minLength={6}
                    />
                  </div>
                  
                  {/* Role Selection */}
                  <div className="space-y-3">
                    <Label>Register as</Label>
                    <RadioGroup 
                      value={signupData.role} 
                      onValueChange={(value) => setSignupData({ ...signupData, role: value as AppRole })}
                      className="space-y-2"
                    >
                      <div className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-accent/50 transition-colors">
                        <RadioGroupItem value="admin" id="role-admin" />
                        <Label htmlFor="role-admin" className="flex items-center gap-2 cursor-pointer flex-1">
                          <Shield className="w-4 h-4 text-primary" />
                          <div>
                            <p className="font-medium">Administrator</p>
                            <p className="text-xs text-muted-foreground">Full system access & user management</p>
                          </div>
                        </Label>
                      </div>
                      <div className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-accent/50 transition-colors">
                        <RadioGroupItem value="secretary" id="role-secretary" />
                        <Label htmlFor="role-secretary" className="flex items-center gap-2 cursor-pointer flex-1">
                          <UserCog className="w-4 h-4 text-primary" />
                          <div>
                            <p className="font-medium">Secretary</p>
                            <p className="text-xs text-muted-foreground">Manage inventory, stock & distributions</p>
                          </div>
                        </Label>
                      </div>
                      <div className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-accent/50 transition-colors">
                        <RadioGroupItem value="department_head" id="role-dept" />
                        <Label htmlFor="role-dept" className="flex items-center gap-2 cursor-pointer flex-1">
                          <Users className="w-4 h-4 text-muted-foreground" />
                          <div>
                            <p className="font-medium">Department Head</p>
                            <p className="text-xs text-muted-foreground">View department distributions only</p>
                          </div>
                        </Label>
                      </div>
                    </RadioGroup>
                  </div>

                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Creating account...
                      </>
                    ) : (
                      'Create Account'
                    )}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Login;