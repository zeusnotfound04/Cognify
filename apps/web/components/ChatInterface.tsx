'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ThemeToggle } from '@/components/ThemeToggle';
import { toast } from 'sonner';
import { 
  Send, 
  Bot, 
  User, 
  Brain, 
  Clock, 
  Zap, 
  Settings, 
  Trash2,
  MessageSquare,
  Loader2,
  Sparkles,
  RotateCcw,
  Palette
} from 'lucide-react';
import { 
  useChatHistory, 
  useAvailableModels, 
  useSendMessage, 
  useClearChatHistory,
  type ChatMessage,
  type AvailableModel 
} from '../hooks/useChat';

export default function ChatInterface() {
  const [message, setMessage] = useState('');
  const [selectedModel, setSelectedModel] = useState('gemini-pro');
  const [useMemoryContext, setUseMemoryContext] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Queries
  const { data: chatHistory = [], isLoading: historyLoading } = useChatHistory();
  const { data: availableModels = [], isLoading: modelsLoading } = useAvailableModels();
  
  // Mutations
  const sendMessageMutation = useSendMessage();
  const clearHistoryMutation = useClearChatHistory();

  // Auto-resize textarea
  const adjustTextareaHeight = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${Math.min(textarea.scrollHeight, 200)}px`; // Max height of 200px
    }
  };

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory]);

  // Adjust textarea height when message changes
  useEffect(() => {
    adjustTextareaHeight();
  }, [message]);

  // Handle sending message
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || sendMessageMutation.isPending) return;

    const messageToSend = message.trim();
    setMessage('');

    try {
      await sendMessageMutation.mutateAsync({
        message: {
          query: messageToSend,
          model: selectedModel,
          useMemoryContext,
        },
        chatHistory,
      });
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  // Handle clear history
  const handleClearHistory = () => {
    if (chatHistory.length === 0) {
      toast.info('Chat history is already empty');
      return;
    }
    clearHistoryMutation.mutate();
  };

  // Get current model info
  const currentModel = availableModels.find(model => model.id === selectedModel);

  // Format timestamp
  const formatTime = (timestamp: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    }).format(timestamp);
  };

  return (
    <div className="h-full flex flex-col space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                AI Chat Assistant
              </CardTitle>
              <CardDescription>
                Chat with AI and leverage your memory context for better responses
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <ThemeToggle />
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowSettings(!showSettings)}
              >
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleClearHistory}
                disabled={clearHistoryMutation.isPending || chatHistory.length === 0}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Clear
              </Button>
            </div>
          </div>
        </CardHeader>

        {/* Settings Panel */}
        {showSettings && (
          <CardContent className="border-t bg-muted/30">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Model Selection */}
              <div className="space-y-2">
                <Label htmlFor="model-select">AI Model</Label>
                {modelsLoading ? (
                  <Skeleton className="h-10 w-full" />
                ) : (
                  <Select value={selectedModel} onValueChange={setSelectedModel}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a model" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableModels.map((model) => (
                        <SelectItem key={model.id} value={model.id}>
                          <div className="flex flex-col">
                            <span>{model.name}</span>
                            <span className="text-xs text-muted-foreground">
                              {model.description}
                            </span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>

              {/* Memory Context Toggle */}
              <div className="space-y-2">
                <Label>Memory Context</Label>
                <div className="flex items-center space-x-2">
                  <Button
                    variant={useMemoryContext ? "default" : "outline"}
                    size="sm"
                    onClick={() => setUseMemoryContext(true)}
                    disabled={!currentModel?.supportsMemory}
                  >
                    <Brain className="h-4 w-4 mr-2" />
                    Enabled
                  </Button>
                  <Button
                    variant={!useMemoryContext ? "default" : "outline"}
                    size="sm"
                    onClick={() => setUseMemoryContext(false)}
                  >
                    Disabled
                  </Button>
                </div>
              </div>

              {/* Model Info */}
              <div className="space-y-2">
                <Label>Current Model</Label>
                {currentModel && (
                  <div className="space-y-1">
                    <Badge variant="secondary">{currentModel.name}</Badge>
                    <p className="text-xs text-muted-foreground">
                      Max tokens: {currentModel.maxTokens.toLocaleString()}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Chat Messages */}
      <Card className="flex-1 flex flex-col">
        <CardContent className="flex-1 flex flex-col p-0">
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {historyLoading ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="flex gap-3">
                    <Skeleton className="h-8 w-8 rounded-full" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-4 w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
            ) : chatHistory.length === 0 ? (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center space-y-4">
                  <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                    <Sparkles className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">Start a conversation</h3>
                    <p className="text-muted-foreground">
                      Ask me anything! I can help with information from your memories.
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              chatHistory.map((msg) => (
                <div key={msg.id} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                  {/* Avatar */}
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                    msg.role === 'user' 
                      ? 'bg-primary text-primary-foreground' 
                      : 'bg-muted'
                  }`}>
                    {msg.role === 'user' ? (
                      <User className="h-4 w-4" />
                    ) : (
                      <Bot className="h-4 w-4" />
                    )}
                  </div>

                  {/* Message Content */}
                  <div className={`flex-1 space-y-2 max-w-[80%] ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                    <div className={`flex items-center gap-2 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                      <span className="font-medium text-sm">
                        {msg.role === 'user' ? 'You' : 'AI Assistant'}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {formatTime(msg.timestamp)}
                      </span>
                      {msg.model && (
                        <Badge variant="outline" className="text-xs">
                          {availableModels.find(m => m.id === msg.model)?.name || msg.model}
                        </Badge>
                      )}
                    </div>
                    
                    <div className={`p-4 rounded-2xl max-w-full break-words ${
                      msg.role === 'user'
                        ? 'bg-primary text-primary-foreground rounded-br-md'
                        : 'bg-muted rounded-bl-md'
                    }`}>
                      <p className="whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                    </div>

                    {/* Metadata for assistant messages */}
                    {msg.role === 'assistant' && msg.metadata && (
                      <div className="flex items-center gap-4 text-xs text-muted-foreground pl-1">
                        {msg.metadata.memoriesUsed && msg.metadata.memoriesUsed > 0 && (
                          <div className="flex items-center gap-1">
                            <Brain className="h-3 w-3" />
                            {msg.metadata.memoriesUsed} memories used
                          </div>
                        )}
                        {msg.metadata.responseTime && (
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {Math.round(msg.metadata.responseTime)}ms
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
            
            {/* Loading message */}
            {sendMessageMutation.isPending && (
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                  <Bot className="h-4 w-4" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-medium">AI Assistant</span>
                    <Loader2 className="h-3 w-3 animate-spin" />
                  </div>
                  <div className="bg-muted p-3 rounded-lg">
                    <p className="text-muted-foreground">Thinking...</p>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          <Separator />

          {/* Message Input */}
          <div className="p-6">
            <form onSubmit={handleSendMessage} className="space-y-4">
              <div className="flex gap-2">
                <Textarea
                  ref={textareaRef}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Ask me anything..."
                  className="min-h-[44px] max-h-[200px] resize-none overflow-y-auto leading-5"
                  style={{ height: 'auto' }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage(e);
                    }
                  }}
                  onInput={adjustTextareaHeight}
                />
                <Button 
                  type="submit" 
                  disabled={!message.trim() || sendMessageMutation.isPending}
                  className="self-end px-4 py-2 h-auto min-h-[44px]"
                >
                  {sendMessageMutation.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </Button>
              </div>
              
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <div className="flex items-center gap-4">
                  <span>Press Shift+Enter for new line</span>
                  {useMemoryContext && (
                    <Badge variant="secondary" className="text-xs">
                      <Brain className="h-3 w-3 mr-1" />
                      Memory context enabled
                    </Badge>
                  )}
                </div>
                <span>{message.length}/2000</span>
              </div>
            </form>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}