import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Mail, KeyRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";

const emailLoginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

const magicLinkSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

const forgotPasswordSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

export default function Login() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [forgotPasswordOpen, setForgotPasswordOpen] = useState(false);

  const emailPasswordForm = useForm<z.infer<typeof emailLoginSchema>>({
    resolver: zodResolver(emailLoginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const magicLinkForm = useForm<z.infer<typeof magicLinkSchema>>({
    resolver: zodResolver(magicLinkSchema),
    defaultValues: {
      email: "",
    },
  });

  const forgotPasswordForm = useForm<z.infer<typeof forgotPasswordSchema>>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

  const onEmailPasswordSubmit = async (values: z.infer<typeof emailLoginSchema>) => {
    try {
      setIsLoading(true);
      const { data: { session }, error: signInError } = await supabase.auth.signInWithPassword({
        email: values.email,
        password: values.password,
      });

      if (signInError) throw signInError;

      if (session) {
        // Check user role
        const { data: roleData, error: roleError } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', session.user.id)
          .single();

        if (roleError) throw roleError;

        // Redirect based on role
        if (roleData?.role === 'admin') {
          navigate('/admin/dashboard');
        } else {
          navigate('/user/dashboard');
        }

        toast({
          title: "Login successful",
          description: "Welcome back!",
        });
      }
    } catch (error: any) {
      console.error("Login error:", error);
      toast({
        variant: "destructive",
        title: "Login failed",
        description: error.message || "Please check your credentials and try again",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const onMagicLinkSubmit = async (values: z.infer<typeof magicLinkSchema>) => {
    try {
      setIsLoading(true);
      const { error } = await supabase.auth.signInWithOtp({
        email: values.email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) throw error;

      toast({
        title: "Magic link sent",
        description: "Please check your email for the login link",
      });
      
      magicLinkForm.reset();
    } catch (error: any) {
      console.error("Magic link error:", error);
      toast({
        variant: "destructive",
        title: "Failed to send magic link",
        description: error.message || "Please try again later",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const onForgotPasswordSubmit = async (values: z.infer<typeof forgotPasswordSchema>) => {
    try {
      setIsLoading(true);
      const { error } = await supabase.auth.resetPasswordForEmail(values.email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      });

      if (error) throw error;

      toast({
        title: "Reset link sent",
        description: "Please check your email for the password reset link",
      });
      
      setForgotPasswordOpen(false);
      forgotPasswordForm.reset();
    } catch (error: any) {
      console.error("Password reset error:", error);
      toast({
        variant: "destructive",
        title: "Failed to send reset link",
        description: error.message || "Please try again later",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleMicrosoftLogin = async () => {
    try {
      setIsLoading(true);
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'azure',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          // Instead of skipCreateUser, we'll handle the "User not found" error
          // in the error handling section
        },
      });

      if (error) {
        console.error("Microsoft login error:", error);
        toast({
          variant: "destructive",
          title: "Login failed",
          description: error.message === "User not found" 
            ? "This email is not registered in our system. Please contact your administrator."
            : "Failed to login with Microsoft. Please try again.",
        });
      }
    } catch (error: any) {
      console.error("Microsoft login error:", error);
      toast({
        variant: "destructive",
        title: "Login failed",
        description: "An unexpected error occurred. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">Welcome back</CardTitle>
          <CardDescription>Choose your preferred login method</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Tabs defaultValue="email" className="space-y-4">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="email">Email & Password</TabsTrigger>
              <TabsTrigger value="magic">Magic Link</TabsTrigger>
            </TabsList>

            <TabsContent value="email">
              <Form {...emailPasswordForm}>
                <form onSubmit={emailPasswordForm.handleSubmit(onEmailPasswordSubmit)} className="space-y-4">
                  <FormField
                    control={emailPasswordForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                            <Input className="pl-10" placeholder="Enter your email" {...field} />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={emailPasswordForm.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Password</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <KeyRound className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                            <Input className="pl-10" type="password" placeholder="Enter your password" {...field} />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? "Signing in..." : "Sign In"}
                  </Button>
                </form>
              </Form>
              <div className="mt-4 text-center">
                <Button 
                  variant="link" 
                  className="text-sm"
                  onClick={() => setForgotPasswordOpen(true)}
                >
                  Forgot your password?
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="magic">
              <Form {...magicLinkForm}>
                <form onSubmit={magicLinkForm.handleSubmit(onMagicLinkSubmit)} className="space-y-4">
                  <FormField
                    control={magicLinkForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                            <Input className="pl-10" placeholder="Enter your email" {...field} />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? "Sending..." : "Send Magic Link"}
                  </Button>
                </form>
              </Form>
            </TabsContent>
          </Tabs>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <Separator className="w-full" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                Or continue with
              </span>
            </div>
          </div>

          <Button
            variant="outline"
            className="w-full"
            onClick={handleMicrosoftLogin}
            disabled={isLoading}
          >
            <svg
              className="mr-2 h-4 w-4"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 48 48"
            >
              <path fill="#f35325" d="M6 6h17v17H6z"/>
              <path fill="#81bc06" d="M24 6h17v17H24z"/>
              <path fill="#05a6f0" d="M6 24h17v17H6z"/>
              <path fill="#ffba08" d="M24 24h17v17H24z"/>
            </svg>
            {isLoading ? "Signing in..." : "Sign in with Microsoft"}
          </Button>
        </CardContent>
      </Card>

      <Dialog open={forgotPasswordOpen} onOpenChange={setForgotPasswordOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reset your password</DialogTitle>
            <DialogDescription>
              Enter your email address and we'll send you a link to reset your password.
            </DialogDescription>
          </DialogHeader>
          <Form {...forgotPasswordForm}>
            <form onSubmit={forgotPasswordForm.handleSubmit(onForgotPasswordSubmit)} className="space-y-4">
              <FormField
                control={forgotPasswordForm.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input className="pl-10" placeholder="Enter your email" {...field} />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Sending..." : "Send Reset Link"}
              </Button>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}