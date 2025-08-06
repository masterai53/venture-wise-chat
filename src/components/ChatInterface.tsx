import React, { useState, useRef, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, Bot, User, Lightbulb, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

interface Message {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: Date;
}

const ENTREPRENEURSHIP_SYSTEM_PROMPT = `You are VentureWise, an expert AI assistant specializing in entrepreneurship and business management. You provide practical, actionable advice on:

- Business strategy and planning
- Startup guidance and funding
- Marketing and customer acquisition
- Financial management and investment
- Leadership and team building
- Product development and innovation
- Market analysis and competitive intelligence
- Operations and scaling
- Legal and regulatory considerations
- Digital transformation and technology adoption

Always provide specific, actionable insights tailored to entrepreneurs and business leaders. Focus on practical solutions, real-world examples, and strategic thinking.`;

export default function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: "Welcome to VentureWise! I'm your AI business advisor specializing in entrepreneurship and business management. How can I help you grow your venture today?",
      isUser: false,
      timestamp: new Date(),
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const scrollToBottom = () => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputValue,
      isUser: true,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer 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',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'anthropic/claude-3.5-sonnet',
          messages: [
            {
              role: 'system',
              content: ENTREPRENEURSHIP_SYSTEM_PROMPT
            },
            ...messages.slice(-10).map(msg => ({
              role: msg.isUser ? 'user' : 'assistant',
              content: msg.content
            })),
            {
              role: 'user',
              content: inputValue
            }
          ],
          temperature: 0.7,
          max_tokens: 1000,
        }),
      });

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`);
      }

      const data = await response.json();
      const aiResponse = data.choices[0]?.message?.content || 'Sorry, I encountered an error processing your request.';

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: aiResponse,
        isUser: false,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error calling AI API:', error);
      toast({
        title: "Error",
        description: "Failed to get AI response. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const formatMessage = (content: string) => {
    return content.split('\n').map((line, index) => (
      <span key={index}>
        {line}
        {index < content.split('\n').length - 1 && <br />}
      </span>
    ));
  };

  const suggestedQuestions = [
    "How do I validate my business idea?",
    "What's the best way to find investors?",
    "How do I build a strong team?",
    "What are key metrics I should track?"
  ];

  const handleSuggestedQuestion = (question: string) => {
    setInputValue(question);
  };

  return (
    <div className="flex flex-col h-screen bg-gradient-subtle">
      {/* Header */}
      <div className="border-b bg-card shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gradient-hero rounded-lg">
              <TrendingUp className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">VentureWise</h1>
              <p className="text-sm text-muted-foreground">Your AI Business Advisor</p>
            </div>
          </div>
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 max-w-4xl mx-auto w-full px-4 py-6">
        <ScrollArea ref={scrollAreaRef} className="h-full">
          <div className="space-y-6 pb-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={cn(
                  "flex items-start space-x-3",
                  message.isUser ? "justify-end" : "justify-start"
                )}
              >
                {!message.isUser && (
                  <div className="p-2 bg-gradient-primary rounded-full shadow-md">
                    <Bot className="h-4 w-4 text-white" />
                  </div>
                )}
                
                <Card className={cn(
                  "max-w-[80%] p-4 shadow-md",
                  message.isUser 
                    ? "bg-primary text-primary-foreground ml-12" 
                    : "bg-card border"
                )}>
                  <div className="text-sm leading-relaxed">
                    {formatMessage(message.content)}
                  </div>
                  <div className={cn(
                    "text-xs mt-2 opacity-70",
                    message.isUser ? "text-primary-foreground" : "text-muted-foreground"
                  )}>
                    {message.timestamp.toLocaleTimeString()}
                  </div>
                </Card>

                {message.isUser && (
                  <div className="p-2 bg-accent rounded-full shadow-md">
                    <User className="h-4 w-4 text-accent-foreground" />
                  </div>
                )}
              </div>
            ))}

            {isLoading && (
              <div className="flex items-start space-x-3">
                <div className="p-2 bg-gradient-primary rounded-full shadow-md">
                  <Bot className="h-4 w-4 text-white" />
                </div>
                <Card className="bg-card border p-4 shadow-md">
                  <div className="flex items-center space-x-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                    <span className="text-sm text-muted-foreground">VentureWise is thinking...</span>
                  </div>
                </Card>
              </div>
            )}
          </div>
        </ScrollArea>
      </div>

      {/* Suggested Questions (only show when chat is empty or minimal) */}
      {messages.length <= 1 && (
        <div className="max-w-4xl mx-auto w-full px-4 pb-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {suggestedQuestions.map((question, index) => (
              <Button
                key={index}
                variant="outline"
                className="justify-start text-left h-auto p-3 text-sm text-muted-foreground hover:text-foreground hover:bg-primary-muted border-dashed"
                onClick={() => handleSuggestedQuestion(question)}
              >
                <Lightbulb className="h-4 w-4 mr-2 flex-shrink-0" />
                {question}
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* Input Area */}
      <div className="border-t bg-card shadow-lg">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex space-x-3">
            <Input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask me anything about business strategy, startups, funding, or entrepreneurship..."
              className="flex-1 bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary"
              disabled={isLoading}
            />
            <Button 
              onClick={sendMessage}
              disabled={!inputValue.trim() || isLoading}
              className="bg-gradient-primary hover:shadow-glow transition-all duration-300"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-2 text-center">
            VentureWise specializes in entrepreneurship and business management advice
          </p>
        </div>
      </div>
    </div>
  );
}