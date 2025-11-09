'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { useAuth } from '@/contexts/AuthContext'
import { 
  Key, 
  ArrowLeft, 
  Save, 
  Eye, 
  EyeOff, 
  CheckCircle, 
  AlertCircle,
  ExternalLink,
  Settings
} from 'lucide-react'
import Link from 'next/link'

interface ApiKeyData {
  id: string
  provider: string
  keyType: string
  description?: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

interface ProviderConfig {
  name: string
  description: string
  docsUrl: string
  keys: {
    keyType: string
    label: string
    placeholder: string
    description: string
  }[]
}

const providerConfigs: Record<string, ProviderConfig> = {
  google: {
    name: 'Google OAuth',
    description: 'Configure Google OAuth for Drive and Calendar access',
    docsUrl: 'https://console.cloud.google.com/apis/credentials',
    keys: [
      {
        keyType: 'client_id',
        label: 'Client ID',
        placeholder: 'your-google-client-id.apps.googleusercontent.com',
        description: 'OAuth 2.0 Client ID from Google Cloud Console'
      },
      {
        keyType: 'client_secret',
        label: 'Client Secret',
        placeholder: 'GOCSPX-...',
        description: 'OAuth 2.0 Client Secret from Google Cloud Console'
      }
    ]
  },
  slack: {
    name: 'Slack OAuth',
    description: 'Configure Slack OAuth for workspace integration',
    docsUrl: 'https://api.slack.com/apps',
    keys: [
      {
        keyType: 'client_id',
        label: 'Client ID',
        placeholder: '1234567890.1234567890',
        description: 'App Client ID from Slack App settings'
      },
      {
        keyType: 'client_secret',
        label: 'Client Secret',
        placeholder: 'abcd1234...',
        description: 'App Client Secret from Slack App settings'
      }
    ]
  },
  notion: {
    name: 'Notion OAuth',
    description: 'Configure Notion OAuth for workspace access',
    docsUrl: 'https://www.notion.so/my-integrations',
    keys: [
      {
        keyType: 'client_id',
        label: 'Client ID',
        placeholder: 'abc-123-def',
        description: 'OAuth Client ID from Notion integration settings'
      },
      {
        keyType: 'client_secret',
        label: 'Client Secret',
        placeholder: 'secret_...',
        description: 'OAuth Client Secret from Notion integration settings'
      }
    ]
  }
}

export default function OAuthKeysPage() {
  const { user } = useAuth()
  const [apiKeys, setApiKeys] = useState<ApiKeyData[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState<string | null>(null)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
  const [keyValues, setKeyValues] = useState<Record<string, Record<string, string>>>({})
  const [showSecrets, setShowSecrets] = useState<Record<string, boolean>>({})

  useEffect(() => {
    if (user) {
      fetchApiKeys()
    }
  }, [user])

  const fetchApiKeys = async () => {
    try {
      setLoading(true)
      const response = await fetch('http://localhost:8888/oauth/api-keys', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setApiKeys(data.apiKeys || [])
      } else {
        console.error('Failed to fetch API keys:', response.statusText)
      }
    } catch (error) {
      console.error('Error fetching API keys:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSaveKey = async (provider: string, keyType: string) => {
    const value = keyValues[provider]?.[keyType]
    if (!value?.trim()) {
      setMessage({ type: 'error', text: 'Please enter a valid key value' })
      return
    }

    try {
      setSaving(`${provider}-${keyType}`)
      
      const response = await fetch('http://localhost:8888/oauth/api-keys', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          provider,
          keyType,
          keyValue: value.trim(),
          description: `${providerConfigs[provider]?.name} ${keyType}`
        })
      })

      if (response.ok) {
        setMessage({ type: 'success', text: `${keyType} saved successfully` })
        fetchApiKeys()
        // Clear the input
        setKeyValues(prev => ({
          ...prev,
          [provider]: {
            ...prev[provider],
            [keyType]: ''
          }
        }))
      } else {
        const errorData = await response.json()
        setMessage({ type: 'error', text: errorData.error || 'Failed to save API key' })
      }
    } catch (error) {
      console.error('Error saving API key:', error)
      setMessage({ type: 'error', text: 'Failed to save API key' })
    } finally {
      setSaving(null)
    }
  }

  const handleKeyChange = (provider: string, keyType: string, value: string) => {
    setKeyValues(prev => ({
      ...prev,
      [provider]: {
        ...prev[provider],
        [keyType]: value
      }
    }))
  }

  const toggleShowSecret = (key: string) => {
    setShowSecrets(prev => ({
      ...prev,
      [key]: !prev[key]
    }))
  }

  const hasKey = (provider: string, keyType: string) => {
    return apiKeys.some(key => key.provider === provider && key.keyType === keyType && key.isActive)
  }

  const isProviderConfigured = (provider: string) => {
    const config = providerConfigs[provider]
    return config?.keys.every(key => hasKey(provider, key.keyType)) || false
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Link href="/dashboard/integrations">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Integrations
              </Button>
            </Link>
          </div>
          
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Settings className="h-6 w-6 text-primary" />
            </div>
            <h1 className="text-3xl font-bold">OAuth API Keys</h1>
          </div>
          <p className="text-muted-foreground">
            Configure your OAuth credentials for third-party integrations
          </p>
        </div>

        {message && (
          <Alert className={`mb-6 ${message.type === 'error' ? 'border-destructive' : 'border-green-500'}`}>
            {message.type === 'error' ? (
              <AlertCircle className="h-4 w-4" />
            ) : (
              <CheckCircle className="h-4 w-4" />
            )}
            <AlertDescription>{message.text}</AlertDescription>
          </Alert>
        )}

        <Tabs defaultValue="google" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            {Object.entries(providerConfigs).map(([provider, config]) => (
              <TabsTrigger key={provider} value={provider} className="relative">
                {config.name}
                {isProviderConfigured(provider) && (
                  <CheckCircle className="h-4 w-4 ml-2 text-green-600" />
                )}
              </TabsTrigger>
            ))}
          </TabsList>

          {Object.entries(providerConfigs).map(([provider, config]) => (
            <TabsContent key={provider} value={provider}>
              <Card>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        {config.name}
                        {isProviderConfigured(provider) && (
                          <CheckCircle className="h-5 w-5 text-green-600" />
                        )}
                      </CardTitle>
                      <CardDescription>{config.description}</CardDescription>
                    </div>
                    <Button variant="outline" size="sm" asChild>
                      <a href={config.docsUrl} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Documentation
                      </a>
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  {config.keys.map((keyConfig) => {
                    const keyId = `${provider}-${keyConfig.keyType}`
                    const hasThisKey = hasKey(provider, keyConfig.keyType)
                    
                    return (
                      <div key={keyConfig.keyType} className="space-y-2">
                        <Label htmlFor={keyId}>{keyConfig.label}</Label>
                        <p className="text-sm text-muted-foreground">{keyConfig.description}</p>
                        
                        <div className="flex gap-2">
                          <div className="relative flex-1">
                            <Input
                              id={keyId}
                              type={showSecrets[keyId] ? 'text' : 'password'}
                              placeholder={keyConfig.placeholder}
                              value={keyValues[provider]?.[keyConfig.keyType] || ''}
                              onChange={(e) => handleKeyChange(provider, keyConfig.keyType, e.target.value)}
                              className="pr-10"
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="absolute right-0 top-0 h-full px-3"
                              onClick={() => toggleShowSecret(keyId)}
                            >
                              {showSecrets[keyId] ? (
                                <EyeOff className="h-4 w-4" />
                              ) : (
                                <Eye className="h-4 w-4" />
                              )}
                            </Button>
                          </div>
                          <Button
                            onClick={() => handleSaveKey(provider, keyConfig.keyType)}
                            disabled={saving === keyId || !keyValues[provider]?.[keyConfig.keyType]?.trim()}
                          >
                            {saving === keyId ? (
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-foreground" />
                            ) : (
                              <Save className="h-4 w-4 mr-2" />
                            )}
                            {hasThisKey ? 'Update' : 'Save'}
                          </Button>
                        </div>
                        
                        {hasThisKey && (
                          <div className="flex items-center gap-2 text-sm text-green-600">
                            <CheckCircle className="h-4 w-4" />
                            Configured and active
                          </div>
                        )}
                      </div>
                    )
                  })}

                  {isProviderConfigured(provider) && (
                    <Alert className="border-green-500 bg-green-50">
                      <CheckCircle className="h-4 w-4" />
                      <AlertDescription>
                        {config.name} is fully configured! You can now connect this integration.
                      </AlertDescription>
                    </Alert>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </div>
  )
}