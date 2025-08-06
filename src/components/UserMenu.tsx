import React from 'react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User, History, Settings, LogOut, Moon, Sun, Monitor } from "lucide-react";
import { useTheme } from "next-themes";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";

interface UserMenuProps {
  user?: {
    email?: string;
    user_metadata?: {
      avatar_url?: string;
      full_name?: string;
    };
  } | null;
  onHistoryClick: () => void;
}

export default function UserMenu({ user, onHistoryClick }: UserMenuProps) {
  const { theme, setTheme } = useTheme();
  const { toast } = useToast();

  const handleSignOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        toast({
          title: "Error",
          description: "Failed to sign out",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Signed out",
          description: "You have been successfully signed out",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    }
  };

  const getInitials = (name?: string, email?: string) => {
    if (name) {
      return name.split(' ').map(n => n[0]).join('').toUpperCase();
    }
    if (email) {
      return email[0].toUpperCase();
    }
    return 'G';
  };

  const themeOptions = [
    { value: 'light', label: 'Light', icon: Sun },
    { value: 'dark', label: 'Dark', icon: Moon },
    { value: 'system', label: 'System', icon: Monitor },
  ];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-10 w-10 rounded-full">
          <Avatar className="h-10 w-10">
            <AvatarImage 
              src={user?.user_metadata?.avatar_url} 
              alt={user?.user_metadata?.full_name || user?.email || 'User'} 
            />
            <AvatarFallback className="bg-gradient-primary text-white">
              {getInitials(user?.user_metadata?.full_name, user?.email)}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent className="w-64" align="end" forceMount>
        {user && (
          <>
            <div className="flex flex-col space-y-1 p-2">
              <p className="text-sm font-medium leading-none">
                {user.user_metadata?.full_name || 'User'}
              </p>
              <p className="text-xs leading-none text-muted-foreground">
                {user.email}
              </p>
            </div>
            <DropdownMenuSeparator />
          </>
        )}
        
        <DropdownMenuItem onClick={onHistoryClick}>
          <History className="mr-2 h-4 w-4" />
          <span>Chat History</span>
        </DropdownMenuItem>
        
        <DropdownMenuSeparator />
        
        {/* Theme Selection */}
        <div className="px-2 py-1">
          <p className="text-xs font-medium text-muted-foreground mb-2">Theme</p>
          {themeOptions.map((option) => {
            const Icon = option.icon;
            return (
              <DropdownMenuItem
                key={option.value}
                onClick={() => setTheme(option.value)}
                className={`flex items-center justify-between ${
                  theme === option.value ? 'bg-primary/10' : ''
                }`}
              >
                <div className="flex items-center">
                  <Icon className="mr-2 h-4 w-4" />
                  <span>{option.label}</span>
                </div>
                {theme === option.value && (
                  <div className="h-2 w-2 rounded-full bg-primary" />
                )}
              </DropdownMenuItem>
            );
          })}
        </div>
        
        <DropdownMenuSeparator />
        
        <DropdownMenuItem>
          <Settings className="mr-2 h-4 w-4" />
          <span>Settings</span>
        </DropdownMenuItem>
        
        {user && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleSignOut}>
              <LogOut className="mr-2 h-4 w-4" />
              <span>Sign out</span>
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}