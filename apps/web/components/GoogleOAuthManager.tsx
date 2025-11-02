"use client";

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Calendar, 
  HardDrive, 
  CheckCircle, 
  AlertCircle, 
  RefreshCw, 
  ExternalLink,
  Trash2,
  Shield,
  Clock
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

interface Integration {
  id: string;
  provider: string;
  isActive: boolean;
  createdAt: string;
  scopes?: string;
  teamName?: string;
  workspaceName?: string;
  expiresAt?: string;
}

interface TestResult {
  drive?: {
    accessible: boolean;
    status: number;
    data?: any;
    error?: string;
  };
  calendar?: {
    accessible: boolean;
    status: number;
    data?: any;
    error?: string;
  };
}

const GoogleOAuthManager = () => {
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [loading, setLoading] = useState(true);
  const [connecting, setConnecting] = useState(false);
  const [testing, setTesting] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [testResults, setTestResults] = useState<TestResult | null>(null);

  const googleIntegration = integrations.find(i => i.provider === 'google');

  useEffect(() => {
    fetchIntegrations();
  }, []);

  const fetchIntegrations = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch('http://localhost:8888/integrations', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setIntegrations(data.integrations);
      }
    } catch (error) {
      console.error('Failed to fetch integrations:', error);
      toast.error('Failed to load integrations');
    } finally {
      setLoading(false);
    }
  };

  const initiateGoogleOAuth = async () => {
    try {
      setConnecting(true);
      const token = localStorage.getItem('auth_token');
      
      const response = await fetch('http://localhost:8888/oauth/initiate/google', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      console.log('OAuth initiation response:', response);
      
      if (response.ok) {
        const data = await response.json();
        window.location.href = data.authUrl;
      } else {
        throw new Error('Failed to initiate OAuth');
      }
    } catch (error) {
      console.error('OAuth initiation failed:', error);
      toast.error('Failed to connect to Google');
      setConnecting(false);
    }
  };

  const disconnectGoogle = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      
      const response = await fetch('http://localhost:8888/integrations/google', {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        toast.success('Google account disconnected');
        fetchIntegrations();
        setTestResults(null);
      } else {
        throw new Error('Failed to disconnect');
      }
    } catch (error) {
      console.error('Disconnect failed:', error);
      toast.error('Failed to disconnect Google account');
    }
  };

  const refreshTokens = async () => {
    try {
      setRefreshing(true);
      const token = localStorage.getItem('auth_token');
      
      const response = await fetch('http://localhost:8888/integrations/google/refresh', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        toast.success('Tokens refreshed successfully');
        fetchIntegrations();
      } else {
        throw new Error('Failed to refresh tokens');
      }
    } catch (error) {
      console.error('Token refresh failed:', error);
      toast.error('Failed to refresh tokens');
    } finally {
      setRefreshing(false);
    }
  };

  const testGoogleAccess = async () => {
    try {
      setTesting(true);
      const token = localStorage.getItem('auth_token');
      
      const response = await fetch('http://localhost:8888/integrations/google/test', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setTestResults(data.results);
        toast.success('API access test completed');
      } else {
        throw new Error('Failed to test access');
      }
    } catch (error) {
      console.error('Access test failed:', error);
      toast.error('Failed to test API access');
    } finally {
      setTesting(false);
    }
  };

  const getStatusBadge = (isConnected: boolean, expiresAt?: string) => {
    if (!isConnected) {
      return <Badge variant="secondary">Not Connected</Badge>;
    }
    
    if (expiresAt && new Date(expiresAt) < new Date()) {
      return <Badge variant="destructive">Expired</Badge>;
    }
    
    return <Badge variant="default" className="bg-green-500">Connected</Badge>;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center p-6">
          <RefreshCw className="h-6 w-6 animate-spin" />
          <span className="ml-2">Loading integrations...</span>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Google OAuth Integration
          </CardTitle>
          <CardDescription>
            Connect your Google account to access Drive files and Calendar events.
            This enables Cognify to analyze your documents and schedule.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center">
                  <span className="text-white text-sm font-bold">G</span>
                </div>
                <div>
                  <p className="font-medium">Google Account</p>
                  <p className="text-sm text-muted-foreground">
                    Drive & Calendar Integration
                  </p>
                </div>
              </div>
              {getStatusBadge(!!googleIntegration, googleIntegration?.expiresAt)}
            </div>
            
            <div className="flex gap-2">
              {googleIntegration ? (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={testGoogleAccess}
                    disabled={testing}
                  >
                    {testing ? (
                      <RefreshCw className="h-4 w-4 animate-spin" />
                    ) : (
                      <ExternalLink className="h-4 w-4" />
                    )}
                    Test Access
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={refreshTokens}
                    disabled={refreshing}
                  >
                    {refreshing ? (
                      <RefreshCw className="h-4 w-4 animate-spin" />
                    ) : (
                      <RefreshCw className="h-4 w-4" />
                    )}
                    Refresh
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={disconnectGoogle}
                  >
                    <Trash2 className="h-4 w-4" />
                    Disconnect
                  </Button>
                </>
              ) : (
                <Button
                  onClick={initiateGoogleOAuth}
                  disabled={connecting}
                  className="bg-blue-500 hover:bg-blue-600"
                >
                  {connecting ? (
                    <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <Shield className="h-4 w-4 mr-2" />
                  )}
                  Connect Google
                </Button>
              )}
            </div>
          </div>

          {googleIntegration && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="space-y-3"
            >
              <Separator />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="font-medium text-muted-foreground">Connected</p>
                  <p>{formatDate(googleIntegration.createdAt)}</p>
                </div>
                {googleIntegration.expiresAt && (
                  <div>
                    <p className="font-medium text-muted-foreground">Expires</p>
                    <p className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {formatDate(googleIntegration.expiresAt)}
                    </p>
                  </div>
                )}
              </div>

              <div>
                <p className="font-medium text-muted-foreground mb-2">Granted Permissions</p>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline">
                    <HardDrive className="h-3 w-3 mr-1" />
                    Google Drive
                  </Badge>
                  <Badge variant="outline">
                    <Calendar className="h-3 w-3 mr-1" />
                    Google Calendar
                  </Badge>
                  <Badge variant="outline">Profile Access</Badge>
                </div>
              </div>
            </motion.div>
          )}
        </CardContent>
      </Card>

      <AnimatePresence>
        {testResults && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ExternalLink className="h-5 w-5" />
                  API Access Test Results
                </CardTitle>
                <CardDescription>
                  Verification of Google Drive and Calendar API access
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card className="p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <HardDrive className="h-4 w-4" />
                      <span className="font-medium">Google Drive</span>
                      {testResults.drive?.accessible ? (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      ) : (
                        <AlertCircle className="h-4 w-4 text-red-500" />
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Status: {testResults.drive?.accessible ? 'Accessible' : 'Failed'}
                    </p>
                    {testResults.drive?.data?.user && (
                      <p className="text-sm">
                        User: {testResults.drive.data.user.displayName}
                      </p>
                    )}
                    {testResults.drive?.error && (
                      <p className="text-sm text-red-500">
                        Error: {testResults.drive.error}
                      </p>
                    )}
                  </Card>

                  <Card className="p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <Calendar className="h-4 w-4" />
                      <span className="font-medium">Google Calendar</span>
                      {testResults.calendar?.accessible ? (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      ) : (
                        <AlertCircle className="h-4 w-4 text-red-500" />
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Status: {testResults.calendar?.accessible ? 'Accessible' : 'Failed'}
                    </p>
                    {testResults.calendar?.data?.items && (
                      <p className="text-sm">
                        Calendars: {testResults.calendar.data.items.length} found
                      </p>
                    )}
                    {testResults.calendar?.error && (
                      <p className="text-sm text-red-500">
                        Error: {testResults.calendar.error}
                      </p>
                    )}
                  </Card>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default GoogleOAuthManager;