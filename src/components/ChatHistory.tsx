import React, { useState, useEffect } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card } from "@/components/ui/card";
import { MessageSquare, Trash2, Calendar } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";

interface ChatSession {
  id: string;
  title: string;
  created_at: string;
  message_count: number;
  last_message_preview: string;
}

interface ChatHistoryProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId?: string;
}

export default function ChatHistory({ open, onOpenChange, userId }: ChatHistoryProps) {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (open && userId) {
      loadChatSessions();
    }
  }, [open, userId]);

  const loadChatSessions = async () => {
    if (!userId) return;
    
    setLoading(true);
    try {
      // This would typically fetch from a chat_sessions table
      // For now, we'll show a placeholder structure
      const mockSessions: ChatSession[] = [
        {
          id: '1',
          title: 'Business Plan Discussion',
          created_at: new Date().toISOString(),
          message_count: 15,
          last_message_preview: 'Thanks for the advice on market validation...'
        },
        {
          id: '2',
          title: 'Funding Strategy',
          created_at: new Date(Date.now() - 86400000).toISOString(),
          message_count: 8,
          last_message_preview: 'What are the best approaches for Series A...'
        }
      ];
      setSessions(mockSessions);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load chat history",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const deleteSession = async (sessionId: string) => {
    try {
      // This would typically delete from the database
      setSessions(prev => prev.filter(s => s.id !== sessionId));
      toast({
        title: "Session deleted",
        description: "Chat session has been removed",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete session",
        variant: "destructive",
      });
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
      return `${Math.floor(diffInHours)} hours ago`;
    } else if (diffInHours < 168) {
      return `${Math.floor(diffInHours / 24)} days ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-md">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Chat History
          </SheetTitle>
        </SheetHeader>
        
        <div className="mt-6">
          {!userId ? (
            <Card className="p-6 text-center">
              <div className="text-muted-foreground">
                <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="font-medium mb-2">Sign in to view history</p>
                <p className="text-sm">Your chat history will be saved when you sign in</p>
              </div>
            </Card>
          ) : (
            <ScrollArea className="h-[calc(100vh-120px)]">
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : sessions.length === 0 ? (
                <Card className="p-6 text-center">
                  <div className="text-muted-foreground">
                    <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p className="font-medium mb-2">No chat history yet</p>
                    <p className="text-sm">Start a conversation to see your history here</p>
                  </div>
                </Card>
              ) : (
                <div className="space-y-3">
                  {sessions.map((session) => (
                    <Card key={session.id} className="p-4 hover:bg-accent/50 transition-colors cursor-pointer group">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-medium text-sm truncate">{session.title}</h3>
                            <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded">
                              {session.message_count} msgs
                            </span>
                          </div>
                          <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
                            {session.last_message_preview}
                          </p>
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Calendar className="h-3 w-3" />
                            {formatDate(session.created_at)}
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteSession(session.id);
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </ScrollArea>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}