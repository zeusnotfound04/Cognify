'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { Search, Plus, Brain, Clock, RefreshCw } from 'lucide-react';
import { useMemories, useCreateMemory, useSearchMemories } from '@/hooks/useMemories';

interface Memory {
  id: string;
  content: string;
  metadata?: any;
  createdAt: string;
  similarity?: number;
}

export default function MemoryInterface() {
  const [searchQuery, setSearchQuery] = useState('');
  const [newMemory, setNewMemory] = useState('');
  const [searchResults, setSearchResults] = useState<Memory[]>([]);
  const [isSearchMode, setIsSearchMode] = useState(false);

  // TanStack Query hooks
  const { 
    data: memories = [], 
    isLoading: memoriesLoading, 
    error: memoriesError,
    refetch: refetchMemories 
  } = useMemories();

  const createMemoryMutation = useCreateMemory();
  const searchMemoryMutation = useSearchMemories();

  const addMemory = async () => {
    if (!newMemory.trim()) return;

    createMemoryMutation.mutate(
      {
        content: newMemory,
        metadata: { source: 'web-interface' }
      },
      {
        onSuccess: () => {
          setNewMemory('');
        }
      }
    );
  };

  const searchMemories = async () => {
    if (!searchQuery.trim()) return;

    searchMemoryMutation.mutate(
      {
        query: searchQuery,
        limit: 10
      },
      {
        onSuccess: (results) => {
          setSearchResults(results);
          setIsSearchMode(true);
        }
      }
    );
  };

  const showAllMemories = () => {
    setIsSearchMode(false);
    setSearchResults([]);
    setSearchQuery('');
  };

  const displayMemories = isSearchMode ? searchResults : memories;

  return (
    <div className="space-y-6">
      {/* Add Memory Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Store New Memory
          </CardTitle>
          <CardDescription>
            Add new information to your knowledge base
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="memory-content">Content</Label>
            <Textarea
              id="memory-content"
              placeholder="Enter the information you want to remember..."
              value={newMemory}
              onChange={(e) => setNewMemory(e.target.value)}
              className="min-h-[100px]"
              disabled={createMemoryMutation.isPending}
            />
          </div>
          <Button 
            onClick={addMemory} 
            disabled={createMemoryMutation.isPending || !newMemory.trim()}
            className="w-full"
          >
            {createMemoryMutation.isPending ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Storing...
              </>
            ) : (
              'Store Memory'
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Search Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Search Memories
          </CardTitle>
          <CardDescription>
            Find relevant information using semantic search
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="What are you looking for?"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && searchMemories()}
              disabled={searchMemoryMutation.isPending}
            />
            <Button 
              onClick={searchMemories}
              disabled={searchMemoryMutation.isPending || !searchQuery.trim()}
            >
              {searchMemoryMutation.isPending ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                'Search'
              )}
            </Button>
            {isSearchMode && (
              <Button variant="outline" onClick={showAllMemories}>
                Show All
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Results Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Brain className="h-5 w-5" />
              {isSearchMode ? 'Search Results' : 'Your Memories'}
            </div>
            {!isSearchMode && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => refetchMemories()}
                disabled={memoriesLoading}
              >
                <RefreshCw className={`h-4 w-4 ${memoriesLoading ? 'animate-spin' : ''}`} />
              </Button>
            )}
          </CardTitle>
          <CardDescription>
            {memoriesLoading ? (
              'Loading memories...'
            ) : displayMemories.length > 0 ? (
              `${displayMemories.length} ${isSearchMode ? 'search results' : 'memories'} found`
            ) : (
              isSearchMode ? 'No search results' : 'No memories yet'
            )}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {memoriesError && (
            <Alert className="mb-4 border-destructive">
              <AlertDescription className="text-destructive">
                Failed to load memories. Please try again.
              </AlertDescription>
            </Alert>
          )}

          {memoriesLoading ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/4" />
                </div>
              ))}
            </div>
          ) : displayMemories.length > 0 ? (
            <div className="space-y-4">
              {displayMemories.map((memory) => (
                <Card key={memory.id} className="border-l-4 border-l-blue-500 hover:shadow-md transition-shadow">
                  <CardContent className="pt-4">
                    <p className="text-sm leading-relaxed mb-3">{memory.content}</p>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {new Date(memory.createdAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </div>
                      {memory.similarity && (
                        <div className="flex items-center gap-1 text-green-600 font-medium">
                          <Search className="h-3 w-3" />
                          {Math.round(memory.similarity * 100)}% match
                        </div>
                      )}
                      {memory.metadata?.source && (
                        <span className="bg-muted px-2 py-1 rounded text-xs">
                          {memory.metadata.source}
                        </span>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Alert>
              <Brain className="h-4 w-4" />
              <AlertDescription>
                {isSearchMode 
                  ? `No memories found for "${searchQuery}". Try a different search term.`
                  : 'No memories found. Start by storing some information above.'
                }
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </div>
  );
}