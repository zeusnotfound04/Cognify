'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Separator } from '@/components/ui/separator'
import GoogleOAuthManager from '@/components/GoogleOAuthManager'
import DataSyncManager from '@/components/DataSyncManager'
import ImportContextButton from '@/components/ImportContextButton'
import { useAuth } from '@/contexts/AuthContext'
import { 
  Slack, 
  Calendar, 
  FileText, 
  HardDrive,
  CheckCircle,
  AlertCircle,
  ExternalLink,
  Unlink,
  ArrowLeft,
  Brain,
  MessageSquare,
  Plug,
  Settings
} from 'lucide-react'
import Link from 'next/link'

interface Integration {
  id: string
  provider: string
  isActive: boolean
  connectedAt: string
  scopes: string
  teamName?: string
  workspaceName?: string
}

const integrationConfigs = [
  {
    key: 'notion',
    name: 'Notion',
    description: 'Integrate with Notion to access your databases, pages, and content',
    icon: FileText,
    color: 'bg-gray-800',
    benefits: [
      'Access database content',
      'Read and analyze pages',
      'Extract structured data',
      'Search across workspaces'
    ]
  },
  {
    key: 'googleDrive',
    name: 'Google Drive',
    description: 'Connect Google Drive to access your documents and files',
    icon: HardDrive,
    color: 'bg-blue-500',
    benefits: [
      'Access document content',
      'Search through files',
      'Read metadata and sharing info',
      'Analyze document structures'
    ]
  },
  {
    key: 'googleCalendar',
    name: 'Google Calendar',
    description: 'Integrate with Google Calendar to access your events and schedules',
    icon: Calendar,
    color: 'bg-green-500',
    benefits: [
      'Access calendar events',
      'Read meeting details',
      'Analyze scheduling patterns',
      'Get attendee information'
    ]
  }
]

export default function IntegrationsPage() {
  const { user } = useAuth()
  const [integrations, setIntegrations] = useState<Integration[]>([])
  const [loading, setLoading] = useState(true)
  const [connecting, setConnecting] = useState<string | null>(null)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

  useEffect(() => {
    fetchIntegrations()
    
    // Check for OAuth callback results
    const urlParams = new URLSearchParams(window.location.search)
    const success = urlParams.get('success')
    const error = urlParams.get('error')
    
    if (success) {
      setMessage({ type: 'success', text: getSuccessMessage(success) })
      // Clean URL
      window.history.replaceState({}, '', '/dashboard/integrations')
    } else if (error) {
      setMessage({ type: 'error', text: getErrorMessage(error) })
      // Clean URL
      window.history.replaceState({}, '', '/dashboard/integrations')
    }
  }, [])

  const fetchIntegrations = async () => {
    try {
      const response = await fetch('http://localhost:8888/integrations', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        setIntegrations(data.integrations || [])
      }
    } catch (error) {
      console.error('Failed to fetch integrations:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleConnect = async (provider: string) => {
    try {
      setConnecting(provider)
      
      // Get OAuth URL from backend
      const response = await fetch(`http://localhost:8888/oauth/initiate/${provider}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        console.error('OAuth initiation failed:', errorData)
        
        // Handle specific errors
        if (errorData.error?.includes('No API keys configured')) {
          setMessage({ 
            type: 'error', 
            text: `Please configure your ${provider} API keys first. Go to OAuth Keys to set up your credentials.` 
          })
        } else {
          setMessage({ 
            type: 'error', 
            text: errorData.error || 'Failed to start connection process' 
          })
        }
        setConnecting(null)
        return
      }
      
      const data = await response.json()
      window.location.href = data.authUrl
    } catch (error) {
      console.error('Failed to initiate OAuth:', error)
      setMessage({ type: 'error', text: 'Failed to start connection process' })
      setConnecting(null)
    }
  }

  const handleDisconnect = async (provider: string) => {
    try {
      const response = await fetch(`http://localhost:8888/integrations/${provider}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      })
      
      if (response.ok) {
        setMessage({ type: 'success', text: `${provider} disconnected successfully` })
        fetchIntegrations()
      } else {
        throw new Error('Failed to disconnect')
      }
    } catch (error) {
      console.error('Failed to disconnect:', error)
      setMessage({ type: 'error', text: 'Failed to disconnect integration' })
    }
  }

  const getSuccessMessage = (success: string) => {
    const messages: Record<string, string> = {
      slack_connected: 'Slack workspace connected successfully!',
      notion_connected: 'Notion workspace connected successfully!',
      google_drive_connected: 'Google Drive connected successfully!',
      google_calendar_connected: 'Google Calendar connected successfully!'
    }
    return messages[success] || 'Integration connected successfully!'
  }

  const getErrorMessage = (error: string) => {
    const messages: Record<string, string> = {
      access_denied: 'Access was denied. Please try again and grant the necessary permissions.',
      no_code: 'No authorization code received. Please try again.',
      connection_failed: 'Failed to establish connection. Please try again.',
      user_not_found: 'User not found. Please log in again.'
    }
    return messages[error] || 'An error occurred during the connection process.'
  }

  const isConnected = (provider: string) => {
    return integrations.find(i => i.provider === provider && i.isActive)
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Navigation Header */}
      <div className="mb-6">
        <nav className="flex items-center justify-between">
          <Link href="/dashboard">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>
          
          <div className="flex items-center space-x-2">
            <Link href="/dashboard">
              <Button variant="ghost" size="sm">
                <Brain className="h-4 w-4 mr-2" />
                Dashboard
              </Button>
            </Link>
            <Link href="/chat">
              <Button variant="ghost" size="sm">
                <MessageSquare className="h-4 w-4 mr-2" />
                Chat
              </Button>
            </Link>
            <Button variant="ghost" size="sm" className="bg-muted">
              <Plug className="h-4 w-4 mr-2" />
              Integrations
            </Button>
          </div>
        </nav>
      </div>

      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Integrations</h1>
        <p className="text-muted-foreground">
          Connect your favorite tools and services to enhance your AI experience
        </p>
      </div>

      {message && (
        <Alert className={`mb-6 ${message.type === 'error' ? 'border-red-500' : 'border-green-500'}`}>
          {message.type === 'error' ? (
            <AlertCircle className="h-4 w-4" />
          ) : (
            <CheckCircle className="h-4 w-4" />
          )}
          <AlertDescription>
            {message.text}
            {message.type === 'error' && message.text.includes('API keys') && (
              <div className="mt-2">
                <Link href="/dashboard/oauth-keys">
                  <Button variant="outline" size="sm">
                    <Settings className="h-4 w-4 mr-2" />
                    Configure OAuth Keys
                  </Button>
                </Link>
              </div>
            )}
          </AlertDescription>
        </Alert>
      )}

      {/* Google OAuth Integration Section */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Google Services Integration</CardTitle>
          <CardDescription>
            Connect your Google account to access Drive files and Calendar events with comprehensive permissions.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <GoogleOAuthManager />
            <ImportContextButton />
          </div>
        </CardContent>
      </Card>

      <Separator className="my-8" />

      {/* Data Sync Management Section */}
      <DataSyncManager />

      <Separator className="my-8" />

      {/* OAuth Configuration Section */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            OAuth Configuration
          </CardTitle>
          <CardDescription>
            Configure your OAuth API keys for third-party integrations before connecting.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-2">
                Set up your OAuth credentials (Client ID and Client Secret) for Google, Slack, and Notion integrations.
              </p>
              <p className="text-sm text-muted-foreground">
                These are required before you can connect any integrations.
              </p>
            </div>
            <Link href="/dashboard/oauth-keys">
              <Button>
                <Settings className="h-4 w-4 mr-2" />
                Configure OAuth Keys
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      <Separator className="my-8" />

      <div className="mb-4">
        <h2 className="text-xl font-semibold mb-2">Other Integrations</h2>
        <p className="text-muted-foreground text-sm">
          Additional services and tools to expand Cognify's capabilities.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {integrationConfigs.map((config) => {
          const integration = isConnected(config.key)
          const Icon = config.icon
          
          return (
            <Card key={config.key} className="relative">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${config.color} text-white`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        {config.name}
                        {integration && (
                          <Badge variant="secondary" className="text-green-600">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Connected
                          </Badge>
                        )}
                      </CardTitle>
                      <CardDescription>{config.description}</CardDescription>
                    </div>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">Benefits:</h4>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      {config.benefits.map((benefit, index) => (
                        <li key={index} className="flex items-center gap-2">
                          <div className="w-1 h-1 bg-current rounded-full" />
                          {benefit}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {integration && (
                    <>
                      <Separator />
                      <div className="text-sm space-y-2">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Connected:</span>
                          <span>{new Date(integration.connectedAt).toLocaleDateString()}</span>
                        </div>
                        {integration.teamName && (
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Team:</span>
                            <span>{integration.teamName}</span>
                          </div>
                        )}
                        {integration.workspaceName && (
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Workspace:</span>
                            <span>{integration.workspaceName}</span>
                          </div>
                        )}
                      </div>
                    </>
                  )}

                  <div className="flex gap-2 pt-2">
                    {integration ? (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDisconnect(config.key)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Unlink className="h-4 w-4 mr-1" />
                        Disconnect
                      </Button>
                    ) : (
                      <Button
                        onClick={() => handleConnect(config.key)}
                        disabled={connecting === config.key || loading}
                        size="sm"
                      >
                        <ExternalLink className="h-4 w-4 mr-1" />
                        {connecting === config.key ? 'Connecting...' : 'Connect'}
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

     
    </div>
  )
}