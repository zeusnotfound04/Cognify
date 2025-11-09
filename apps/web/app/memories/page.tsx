'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Loader2, LogOut, Brain, User, ArrowLeft, Search, Filter, Plus } from 'lucide-react';
import Link from 'next/link';
import { MemoryNetwork } from '@/components/MemoryNetwork';
import { motion } from 'framer-motion';

interface Memory {
  id: string;
  title: string;
  content: string;
  type: 'conversation' | 'document' | 'integration' | 'note';
  source: string;
  timestamp: Date;
  connections: string[];
  tags: string[];
  embedding?: number[];
}

export default function MemoriesPage() {
  const { isAuthenticated, loading, user, logout } = useAuth();
  const router = useRouter();
  const [memories, setMemories] = useState<Memory[]>([]);
  const [selectedMemory, setSelectedMemory] = useState<Memory | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('all');

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, loading, router]);

  useEffect(() => {
    // Fetch memories from API
    fetchMemories();
  }, []);

  const fetchMemories = async () => {
    try {
      const response = await fetch('/api/memories');
      const data = await response.json();
      
      if (response.ok && data.memories) {
        const formattedMemories = data.memories.map((memory: any) => ({
          ...memory,
          timestamp: new Date(memory.timestamp)
        }));
        setMemories(formattedMemories);
      } else {
        console.error('Failed to fetch memories:', data.error);
        // Fall back to mock data if API fails
        setMemories([]);
      }
    } catch (error) {
      console.error('Error fetching memories:', error);
      // Fall back to mock data if API fails
      setMemories([]);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const filteredMemories = memories.filter(memory => {
    const matchesSearch = memory.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         memory.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         memory.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesFilter = filterType === 'all' || memory.type === filterType;
    return matchesSearch && matchesFilter;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="flex flex-col items-center space-y-6">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full blur opacity-20 animate-pulse"></div>
            <div className="relative bg-gray-900/80 backdrop-blur-sm p-4 rounded-full border border-gray-800 shadow-lg">
              <Loader2 className="h-8 w-8 animate-spin text-blue-400" />
            </div>
          </div>
          <div className="text-center">
            <p className="text-gray-300 font-medium">Loading your memories...</p>
            <p className="text-sm text-gray-500 mt-1">Please wait a moment</p>
          </div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="h-screen bg-[#0a0a0a] flex flex-col overflow-hidden">
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
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-blue-600 rounded-xl blur opacity-20"></div>
                  <div className="relative bg-gradient-to-r from-purple-500 to-blue-600 p-2 rounded-xl">
                    <Brain className="h-8 w-8 text-white" />
                  </div>
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-white font-heading tracking-tight">
                    Memory Network
                  </h1>
                  <p className="text-sm text-gray-400 font-sans font-medium tracking-wide">Connected Knowledge Graph</p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3 px-4 py-2 bg-gray-800/60 backdrop-blur-sm rounded-full border border-gray-700">
                <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-blue-600 rounded-full flex items-center justify-center">
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

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Controls Sidebar */}
        <div className="w-80 bg-gray-900/50 border-r border-gray-800 flex flex-col backdrop-blur-sm">
          <div className="p-6 border-b border-gray-800">
            <h2 className="text-white font-semibold text-lg font-heading tracking-tight mb-4">Memory Explorer</h2>
            
            {/* Search */}
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search memories..."
                className="w-full bg-gray-800/50 text-white placeholder-gray-400 border border-gray-700 rounded-lg pl-10 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all font-sans"
              />
            </div>

            {/* Filter */}
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="w-full bg-gray-800/50 text-white border border-gray-700 rounded-lg pl-10 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all font-sans appearance-none"
              >
                <option value="all">All Types</option>
                <option value="conversation">Conversations</option>
                <option value="document">Documents</option>
                <option value="integration">Integrations</option>
                <option value="note">Notes</option>
              </select>
            </div>
          </div>

          {/* Memory List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {filteredMemories.map((memory) => (
              <motion.div
                key={memory.id}
                className={`p-4 rounded-lg border cursor-pointer transition-all duration-200 ${
                  selectedMemory?.id === memory.id
                    ? 'bg-purple-600/20 border-purple-500/50'
                    : 'bg-gray-800/30 border-gray-700 hover:bg-gray-800/50 hover:border-gray-600'
                }`}
                onClick={() => setSelectedMemory(memory)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="flex items-start justify-between mb-2">
                  <h3 className="text-white text-sm font-medium font-sans truncate">{memory.title}</h3>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    memory.type === 'conversation' ? 'bg-blue-600/20 text-blue-300' :
                    memory.type === 'document' ? 'bg-green-600/20 text-green-300' :
                    memory.type === 'integration' ? 'bg-yellow-600/20 text-yellow-300' :
                    'bg-purple-600/20 text-purple-300'
                  }`}>
                    {memory.type}
                  </span>
                </div>
                <p className="text-gray-400 text-xs line-clamp-2 mb-2">{memory.content}</p>
                <div className="flex items-center justify-between">
                  <span className="text-gray-500 text-xs font-mono">{memory.source}</span>
                  <span className="text-gray-500 text-xs font-mono">
                    {memory.timestamp.toLocaleDateString()}
                  </span>
                </div>
                <div className="flex flex-wrap gap-1 mt-2">
                  {memory.tags.slice(0, 3).map((tag) => (
                    <span key={tag} className="text-xs bg-gray-700/50 text-gray-300 px-2 py-1 rounded">
                      {tag}
                    </span>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>

          <div className="p-4 border-t border-gray-800">
            <Button className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white border-0 font-sans font-medium tracking-wide">
              <Plus className="h-4 w-4 mr-2" />
              Add Memory
            </Button>
          </div>
        </div>

        {/* Memory Network Visualization */}
        <div className="flex-1 relative">
          <MemoryNetwork 
            memories={filteredMemories}
            selectedMemory={selectedMemory}
            onMemorySelect={setSelectedMemory}
          />
          
          {/* Memory Details Panel */}
          {selectedMemory && (
            <motion.div
              className="absolute top-4 right-4 w-96 bg-gray-900/95 backdrop-blur-xl border border-gray-700 rounded-lg p-6"
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="flex items-start justify-between mb-4">
                <h3 className="text-white text-lg font-semibold font-heading">{selectedMemory.title}</h3>
                <span className={`text-xs px-3 py-1 rounded-full ${
                  selectedMemory.type === 'conversation' ? 'bg-blue-600/20 text-blue-300' :
                  selectedMemory.type === 'document' ? 'bg-green-600/20 text-green-300' :
                  selectedMemory.type === 'integration' ? 'bg-yellow-600/20 text-yellow-300' :
                  'bg-purple-600/20 text-purple-300'
                }`}>
                  {selectedMemory.type}
                </span>
              </div>
              
              <p className="text-gray-300 text-sm leading-relaxed mb-4 font-sans">{selectedMemory.content}</p>
              
              <div className="space-y-3">
                <div>
                  <span className="text-gray-400 text-xs font-mono">Source:</span>
                  <span className="text-white text-sm ml-2 font-sans">{selectedMemory.source}</span>
                </div>
                <div>
                  <span className="text-gray-400 text-xs font-mono">Created:</span>
                  <span className="text-white text-sm ml-2 font-mono">{selectedMemory.timestamp.toLocaleString()}</span>
                </div>
                <div>
                  <span className="text-gray-400 text-xs font-mono">Connections:</span>
                  <span className="text-purple-300 text-sm ml-2 font-mono">{selectedMemory.connections.length} linked</span>
                </div>
                <div>
                  <span className="text-gray-400 text-xs font-mono">Tags:</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {selectedMemory.tags.map((tag) => (
                      <span key={tag} className="text-xs bg-gray-700/50 text-gray-300 px-2 py-1 rounded font-sans">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}