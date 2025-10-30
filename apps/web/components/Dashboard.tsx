'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Memory, memoryAPI, chatAPI } from '../lib/api';
import { 
  LogOut, 
  Plus, 
  MessageSquare, 
  BookOpen, 
  User,
  Send,
  Loader2,
  Brain,
  Search,
  Clock,
  Sparkles,
  Menu,
  X
} from 'lucide-react';

const Dashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<'memories' | 'chat' | 'profile'>('memories');
  const [memories, setMemories] = useState<Memory[]>([]);
  const [memoriesLoading, setMemoriesLoading] = useState(false);
  const [newMemory, setNewMemory] = useState('');
  const [addingMemory, setAddingMemory] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  // Chat state
  const [chatQuery, setChatQuery] = useState('');
  const [chatResponse, setChatResponse] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const [chatHistory, setChatHistory] = useState<Array<{query: string, response: string, timestamp: Date}>>([]);

  useEffect(() => {
    if (activeTab === 'memories') {
      loadMemories();
    }
  }, [activeTab]);

  const loadMemories = async () => {
    setMemoriesLoading(true);
    try {
      const data = await memoryAPI.getUserMemories();
      setMemories(data);
    } catch (error) {
      console.error('Failed to load memories:', error);
    } finally {
      setMemoriesLoading(false);
    }
  };

  const handleAddMemory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMemory.trim()) return;

    setAddingMemory(true);
    try {
      const memory = await memoryAPI.createMemory(newMemory.trim());
      setMemories([memory, ...memories]);
      setNewMemory('');
    } catch (error) {
      console.error('Failed to add memory:', error);
    } finally {
      setAddingMemory(false);
    }
  };

  const handleChat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatQuery.trim()) return;

    const currentQuery = chatQuery.trim();
    setChatQuery('');
    setChatLoading(true);
    
    try {
      const response = await chatAPI.sendMessage(currentQuery);
      setChatResponse(response.answer);
      setChatHistory(prev => [...prev, {
        query: currentQuery,
        response: response.answer,
        timestamp: new Date()
      }]);
    } catch (error) {
      console.error('Chat failed:', error);
      setChatResponse('Sorry, I encountered an error while processing your request.');
    } finally {
      setChatLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground font-poppins">
      {/* Background Effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-20 w-96 h-96 bg-muted/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 left-20 w-80 h-80 bg-muted/15 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "2s" }} />
        <div className="absolute top-1/2 left-1/2 w-72 h-72 bg-muted/10 rounded-full blur-3xl animate-float" />
      </div>

      {/* Header */}
      <header className="relative z-10  border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="md:hidden p-2 rounded-lg hover:bg-muted transition-colors"
              >
                {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-primary text-primary-foreground rounded-lg premium-shadow">
                  <Brain className="w-6 h-6" />
                </div>
                <h1 className="text-2xl font-bold">Cognify</h1>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="hidden sm:block text-right">
                <p className="text-sm text-muted-foreground font-medium">Welcome back,</p>
                <p className="text-lg font-semibold">{user?.name || user?.email}</p>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 px-4 py-2 bg-destructive/10 hover:bg-destructive/20 border border-destructive/20 text-destructive hover:text-destructive/80 rounded-lg transition-all duration-300 font-medium"
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className={`fixed md:relative inset-y-0 left-0 z-50 w-64 bg-card/90 backdrop-blur-xl border-r border-border transform transition-transform duration-300 ease-in-out ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}>
          <div className="p-6 pt-20 md:pt-6">
            <nav className="space-y-2">
              {[
                { key: 'memories', label: 'Memories', icon: BookOpen, description: 'Store & organize' },
                { key: 'chat', label: 'AI Chat', icon: MessageSquare, description: 'Ask questions' },
                { key: 'profile', label: 'Profile', icon: User, description: 'Your account' },
              ].map(({ key, label, icon: Icon, description }) => (
                <button
                  key={key}
                  onClick={() => {
                    setActiveTab(key as any);
                    setSidebarOpen(false);
                  }}
                  className={`w-full flex items-center space-x-3 p-4 rounded-xl transition-all duration-300 group ${
                    activeTab === key
                      ? 'bg-primary text-primary-foreground border border-primary'
                      : 'hover:bg-muted text-muted-foreground hover:text-foreground border border-transparent'
                  }`}
                >
                  <Icon className={`h-5 w-5 ${activeTab === key ? 'text-primary-foreground' : 'text-muted-foreground group-hover:text-foreground'} transition-colors`} />
                  <div className="text-left">
                    <p className="font-semibold">{label}</p>
                    <p className="text-xs opacity-70">{description}</p>
                  </div>
                </button>
              ))}
            </nav>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 relative z-10">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {activeTab === 'memories' && (
              <div className="space-y-8">
                {/* Add Memory Card */}
                <div className=" rounded-2xl p-8 premium-shadow">
                  <div className="flex items-center space-x-3 mb-6">
                    <Sparkles className="w-6 h-6 text-foreground" />
                    <h2 className="text-2xl font-bold text-foreground">Capture New Memory</h2>
                  </div>
                  <form onSubmit={handleAddMemory} className="space-y-6">
                    <textarea
                      value={newMemory}
                      onChange={(e) => setNewMemory(e.target.value)}
                      className="w-full p-4 bg-muted/50 border border-border rounded-xl text-foreground placeholder-muted-foreground resize-none focus:outline-none focus:border-ring focus:ring-2 focus:ring-ring/20 transition-all duration-300 font-medium"
                      rows={4}
                      placeholder="What would you like to remember? Share your thoughts, ideas, or experiences..."
                      required
                    />
                    <button
                      type="submit"
                      disabled={addingMemory || !newMemory.trim()}
                      className="flex items-center space-x-3 px-6 py-3 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl font-semibold tracking-wide transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed premium-shadow"
                    >
                      {addingMemory ? (
                        <Loader2 className="h-5 w-5 animate-spin" />
                      ) : (
                        <Plus className="h-5 w-5" />
                      )}
                      <span>{addingMemory ? 'Saving Memory...' : 'Save Memory'}</span>
                    </button>
                  </form>
                </div>

                {/* Memories List */}
                <div className=" rounded-2xl overflow-hidden premium-shadow">
                  <div className="px-8 py-6 border-b border-border">
                    <div className="flex items-center justify-between">
                      <h2 className="text-2xl font-bold text-foreground">Your Memories</h2>
                      <span className="px-3 py-1 bg-muted text-foreground rounded-full text-sm font-medium">
                        {memories.length} memories
                      </span>
                    </div>
                  </div>
                  
                  {memoriesLoading ? (
                    <div className="p-12 text-center">
                      <Loader2 className="h-8 w-8 animate-spin mx-auto text-muted-foreground mb-4" />
                      <p className="text-muted-foreground font-medium">Loading your memories...</p>
                    </div>
                  ) : memories.length === 0 ? (
                    <div className="p-12 text-center">
                      <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground text-lg font-medium">No memories yet</p>
                      <p className="text-muted-foreground/70 mt-2">Start by adding your first memory above!</p>
                    </div>
                  ) : (
                    <div className="divide-y divide-border">
                      {memories.map((memory, index) => (
                        <div key={memory.id} className="p-8 hover:bg-muted/30 transition-colors duration-300">
                          <p className="text-foreground font-medium text-lg leading-relaxed mb-4">{memory.content}</p>
                          <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                            <div className="flex items-center space-x-2">
                              <Clock className="w-4 h-4" />
                              <span>{new Date(memory.createdAt).toLocaleDateString('en-US', { 
                                year: 'numeric', 
                                month: 'long', 
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}</span>
                            </div>
                            {memory.importance && (
                              <span className="px-2 py-1 bg-foreground/10 text-foreground rounded-md text-xs font-medium">
                                Important
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'chat' && (
              <div className="space-y-8">
                <div className=" rounded-2xl p-8 premium-shadow">
                  <div className="flex items-center space-x-3 mb-6">
                    <MessageSquare className="w-6 h-6 text-foreground" />
                    <h2 className="text-2xl font-bold text-foreground">AI Memory Assistant</h2>
                  </div>
                  
                  <form onSubmit={handleChat} className="space-y-6">
                    <div className="relative">
                      <input
                        type="text"
                        value={chatQuery}
                        onChange={(e) => setChatQuery(e.target.value)}
                        className="w-full p-4 pr-16 bg-muted/50 border border-border rounded-xl text-foreground placeholder-muted-foreground focus:outline-none focus:border-ring focus:ring-2 focus:ring-ring/20 transition-all duration-300 font-medium"
                        placeholder="Ask me anything about your memories..."
                        required
                        disabled={chatLoading}
                      />
                      <button
                        type="submit"
                        disabled={chatLoading || !chatQuery.trim()}
                        className="absolute right-2 top-1/2 transform -translate-y-1/2 p-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {chatLoading ? (
                          <Loader2 className="h-5 w-5 animate-spin" />
                        ) : (
                          <Send className="h-5 w-5" />
                        )}
                      </button>
                    </div>
                  </form>

                  {/* Current Response */}
                  {chatResponse && (
                    <div className="mt-8 p-6 bg-muted/30 border border-border rounded-xl">
                      <h3 className="text-lg font-semibold text-foreground mb-3 flex items-center space-x-2">
                        <Sparkles className="w-5 h-5" />
                        <span>AI Response</span>
                      </h3>
                      <p className="text-foreground leading-relaxed font-medium">{chatResponse}</p>
                    </div>
                  )}
                </div>

                {/* Chat History */}
                {chatHistory.length > 0 && (
                  <div className=" rounded-2xl overflow-hidden premium-shadow">
                    <div className="px-8 py-6 border-b border-border">
                      <h3 className="text-xl font-bold text-foreground">Recent Conversations</h3>
                    </div>
                    <div className="max-h-96 overflow-y-auto">
                      {chatHistory.slice().reverse().map((chat, index) => (
                        <div key={index} className="p-6 border-b border-border last:border-b-0">
                          <div className="space-y-4">
                            <div className="bg-muted/50 rounded-lg p-4">
                              <p className="text-foreground font-medium">{chat.query}</p>
                              <p className="text-xs text-muted-foreground mt-2">
                                {chat.timestamp.toLocaleTimeString()}
                              </p>
                            </div>
                            <div className="bg-muted/30 rounded-lg p-4 border border-border">
                              <p className="text-foreground">{chat.response}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'profile' && (
              <div className="space-y-8">
                <div className=" rounded-2xl p-8 premium-shadow">
                  <div className="flex items-center space-x-3 mb-8">
                    <User className="w-6 h-6 text-foreground" />
                    <h2 className="text-2xl font-bold text-foreground">Profile Information</h2>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-6">
                      <div>
                        <label className="block text-sm font-semibold text-muted-foreground mb-2 uppercase tracking-wide">
                          Email Address
                        </label>
                        <div className="p-4 bg-muted/50 border border-border rounded-xl">
                          <p className="text-foreground font-medium">{user?.email}</p>
                        </div>
                      </div>
                      
                      {user?.name && (
                        <div>
                          <label className="block text-sm font-semibold text-muted-foreground mb-2 uppercase tracking-wide">
                            Full Name
                          </label>
                          <div className="p-4 bg-muted/50 border border-border rounded-xl">
                            <p className="text-foreground font-medium">{user.name}</p>
                          </div>
                        </div>
                      )}
                      
                      {user?.username && (
                        <div>
                          <label className="block text-sm font-semibold text-muted-foreground mb-2 uppercase tracking-wide">
                            Username
                          </label>
                          <div className="p-4 bg-muted/50 border border-border rounded-xl">
                            <p className="text-foreground font-medium">@{user.username}</p>
                          </div>
                        </div>
                      )}
                    </div>
                    
                    <div className="space-y-6">
                      <div className="p-6 bg-muted/30 border border-border rounded-xl">
                        <h3 className="text-lg font-semibold text-foreground mb-4">Account Stats</h3>
                        <div className="space-y-3">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Total Memories:</span>
                            <span className="text-foreground font-semibold">{memories.length}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Conversations:</span>
                            <span className="text-foreground font-semibold">{chatHistory.length}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Member Since:</span>
                            <span className="text-foreground font-semibold">Today</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 md:hidden" 
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
};

export default Dashboard;