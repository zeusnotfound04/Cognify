'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Loader2, LogOut, Brain, User, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { Chat } from '@/components/chat';

export default function ChatPage() {
  const { isAuthenticated, loading, user, logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, loading, router]);

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="flex flex-col items-center space-y-6">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full blur opacity-20 animate-pulse"></div>
            <div className="relative bg-white/80 backdrop-blur-sm p-4 rounded-full border border-white/20 shadow-lg">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            </div>
          </div>
          <div className="text-center">
            <p className="text-slate-600 font-medium">Loading your chat experience...</p>
            <p className="text-sm text-slate-500 mt-1">Please wait a moment</p>
          </div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // Will redirect to login
  }

  return (
    <div className="h-screen bg-[#1a1a1a] flex flex-col">
      {/* Header */}
      <header className="backdrop-blur-xl bg-black/20 border-b border-gray-800 shadow-sm sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <Link href="/dashboard">
                <Button variant="ghost" size="sm" className="hover:bg-gray-800 text-gray-300 hover:text-white transition-colors">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Dashboard
                </Button>
              </Link>
              <div className="h-8 w-px bg-gradient-to-b from-gray-700 to-transparent" />
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl blur opacity-20"></div>
                  <div className="relative bg-gradient-to-r from-blue-500 to-purple-600 p-2 rounded-xl">
                    <Brain className="h-8 w-8 text-white" />
                  </div>
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-white font-heading tracking-tight">
                    Cognify Chat
                  </h1>
                  <p className="text-sm text-gray-400 font-sans font-medium tracking-wide">AI Assistant with Memory Context</p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3 px-4 py-2 bg-gray-800/60 backdrop-blur-sm rounded-full border border-gray-700">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                  <User className="h-4 w-4 text-white" />
                </div>
                <span className="text-sm font-medium text-gray-300">{user?.email}</span>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleLogout}
                className="bg-gray-800/60 backdrop-blur-sm border-gray-700 text-gray-300 hover:bg-red-900/20 hover:border-red-700 hover:text-red-400 transition-all duration-200"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Chat Interface with Sidebar */}
      <main className="flex-1 flex overflow-hidden">
        {/* Chat Sidebar */}
        <div className="w-80 bg-[#111111] border-r border-gray-800 flex flex-col">
          <div className="p-4 border-b border-gray-800">
            <h2 className="text-white font-semibold text-lg font-heading tracking-tight">Chat History</h2>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-2">
            {/* Sample chat history items */}
            <div className="p-3 rounded-lg bg-gray-800/50 hover:bg-gray-800 cursor-pointer transition-colors">
              <p className="text-white text-sm font-medium font-sans tracking-wide truncate">Next.js advantages discussion</p>
              <p className="text-gray-400 text-xs mt-1 font-mono tracking-wider">2 hours ago</p>
            </div>
            <div className="p-3 rounded-lg bg-gray-800/50 hover:bg-gray-800 cursor-pointer transition-colors">
              <p className="text-white text-sm font-medium font-sans tracking-wide truncate">Dijkstra's algorithm implementation</p>
              <p className="text-gray-400 text-xs mt-1 font-mono tracking-wider">1 day ago</p>
            </div>
            <div className="p-3 rounded-lg bg-gray-800/50 hover:bg-gray-800 cursor-pointer transition-colors">
              <p className="text-white text-sm font-medium font-sans tracking-wide truncate">Silicon Valley essay writing help</p>
              <p className="text-gray-400 text-xs mt-1 font-mono tracking-wider">3 days ago</p>
            </div>
          </div>
          <div className="p-4 border-t border-gray-800">
            <Button className="w-full bg-gray-800 hover:bg-gray-700 text-white border border-gray-700 font-sans font-medium tracking-wide">
              New Chat
            </Button>
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col">
          <Chat 
            id={`cognify-chat-${Date.now()}`}
            initialMessages={[]}
            initialChatModel="gemini-pro"
            initialVisibilityType="private"
            isReadonly={false}
            autoResume={false}
          />
        </div>
      </main>
    </div>
  );
}