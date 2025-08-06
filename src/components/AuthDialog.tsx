import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Chrome, Mail, User } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";

interface AuthDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function AuthDialog({ open, onOpenChange }: AuthDialogProps) {
  const { toast } = useToast();

  const handleGoogleSignIn = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/`,
        },
      });

      if (error) {
        toast({
          title: "Authentication Error",
          description: error.message,
          variant: "destructive",
        });
      } else {
        onOpenChange(false);
        toast({
          title: "Success",
          description: "Signing in with Google...",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to sign in with Google",
        variant: "destructive",
      });
    }
  };

  const handleEmailSignIn = async () => {
    // For now, just show a message that this will be implemented
    toast({
      title: "Coming Soon",
      description: "Email authentication will be available soon",
    });
  };

  const handleGuestMode = () => {
    onOpenChange(false);
    toast({
      title: "Guest Mode",
      description: "Continuing as guest. Some features may be limited.",
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center text-xl">Welcome to VentureWise</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <Card className="p-4 border-dashed">
            <div className="text-center space-y-2">
              <div className="p-3 bg-gradient-primary rounded-full w-fit mx-auto">
                <User className="h-6 w-6 text-white" />
              </div>
              <h3 className="font-semibold">Sign in to unlock all features</h3>
              <p className="text-sm text-muted-foreground">
                Save your chat history, customize preferences, and get personalized business insights
              </p>
            </div>
          </Card>

          <div className="space-y-3">
            <Button 
              onClick={handleGoogleSignIn}
              className="w-full flex items-center justify-center gap-3 bg-white text-gray-900 border border-gray-300 hover:bg-gray-50"
              variant="outline"
            >
              <Chrome className="h-5 w-5" />
              Continue with Google
            </Button>

            <Button 
              onClick={handleEmailSignIn}
              className="w-full flex items-center justify-center gap-3"
              variant="outline"
            >
              <Mail className="h-5 w-5" />
              Continue with Email
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">Or</span>
              </div>
            </div>

            <Button 
              onClick={handleGuestMode}
              variant="ghost"
              className="w-full"
            >
              Continue as Guest
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}