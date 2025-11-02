'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../contexts/AuthContext';
import ChatInterface from '../../components/ChatInterface';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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
         <Chat
        autoResume={false}
        id={id}
        initialMessages={[]}
        initialVisibilityType="private"
        isReadonly={false}
        key={id}
      />
  );
}