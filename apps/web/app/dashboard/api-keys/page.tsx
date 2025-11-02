'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useAuth } from '@/contexts/AuthContext'
import { Key, Copy, CheckCircle, ArrowLeft, Settings } from 'lucide-react'
import Link from 'next/link'

interface ApiKeyData {
  mcpApiKey: string
  instructions: {
    title: string
    description: string
    serverUrl: string
  }
}

export default function ApiKeysPage() {
  const { user } = useAuth()
  const [apiKeyData, setApiKeyData] = useState<ApiKeyData | null>(null)
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (user) {
      fetchApiKey()
    }
  }, [user])

  const fetchApiKey = async () => {
    try {
      setLoading(true)
      // Use the backend URL directly
      const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8888'
      const response = await fetch(`${backendUrl}/api-keys`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setApiKeyData(data)
      } else {
        console.error('API key fetch failed:', response.status, response.statusText)
      }
    } catch (error) {
      console.error('Error fetching API key:', error)
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error('Failed to copy:', error)
    }
  }

  const maskApiKey = (key: string) => {
    if (key.length <= 8) return key
    return `${key.substring(0, 8)}...${key.substring(key.length - 8)}`
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center h-96">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-sm text-gray-600">Loading...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Link href="/dashboard">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
            </Link>
          </div>
          
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Key className="h-6 w-6 text-blue-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900">Your MCP API Key</h1>
          </div>
          <p className="text-gray-600">
            Configure Cognify in your IDE with this API key
          </p>
        </div>

        {apiKeyData ? (
          <div className="space-y-6">
            <Card className="border shadow-sm">
              <CardHeader className="bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-t-lg">
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  API Configuration
                </CardTitle>
                <CardDescription className="text-blue-100">
                  Your personal MCP API key for IDE integration
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">
                      API Key
                    </label>
                    <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg border">
                      <code className="flex-1 text-sm font-mono text-gray-800 break-all">
                        {maskApiKey(apiKeyData.mcpApiKey)}
                      </code>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => copyToClipboard(apiKeyData.mcpApiKey)}
                        className="shrink-0"
                      >
                        {copied ? (
                          <>
                            <CheckCircle className="h-4 w-4 mr-2 text-green-600" />
                            Copied!
                          </>
                        ) : (
                          <>
                            <Copy className="h-4 w-4 mr-2" />
                            Copy
                          </>
                        )}
                      </Button>
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">
                      Server URL
                    </label>
                    <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg border">
                      <code className="flex-1 text-sm font-mono text-gray-800">
                        {apiKeyData.instructions.serverUrl}
                      </code>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => copyToClipboard(apiKeyData.instructions.serverUrl)}
                        className="shrink-0"
                      >
                        <Copy className="h-4 w-4 mr-2" />
                        Copy
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border shadow-sm">
              <CardHeader>
                <CardTitle>Setup Instructions</CardTitle>
                <CardDescription>
                  Configure Cognify in your IDE
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-6">
                  <div className="border rounded-lg p-4">
                    <h3 className="font-semibold text-gray-900 mb-2">Cursor IDE</h3>
                    <p className="text-sm text-gray-600 mb-3">
                      Add this to your MCP settings:
                    </p>
                    <div className="bg-gray-900 text-gray-100 p-4 rounded-lg text-sm overflow-x-auto">
                      <pre>{JSON.stringify({
                        mcpServers: {
                          cognify: {
                            command: "npx",
                            args: ["@cognify/mcp-client"],
                            env: {
                              COGNIFY_API_URL: apiKeyData.instructions.serverUrl,
                              COGNIFY_API_KEY: apiKeyData.mcpApiKey
                            }
                          }
                        }
                      }, null, 2)}</pre>
                    </div>
                  </div>

                  <div className="border rounded-lg p-4">
                    <h3 className="font-semibold text-gray-900 mb-2">Claude Desktop</h3>
                    <p className="text-sm text-gray-600 mb-3">
                      Add this to claude_desktop_config.json:
                    </p>
                    <div className="bg-gray-900 text-gray-100 p-4 rounded-lg text-sm overflow-x-auto">
                      <pre>{JSON.stringify({
                        mcpServers: {
                          cognify: {
                            command: "npx",
                            args: ["@cognify/mcp-client"],
                            env: {
                              COGNIFY_API_URL: apiKeyData.instructions.serverUrl,
                              COGNIFY_API_KEY: apiKeyData.mcpApiKey
                            }
                          }
                        }
                      }, null, 2)}</pre>
                    </div>
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h4 className="font-medium text-blue-900 mb-2">Security Notes</h4>
                    <ul className="text-sm text-blue-800 space-y-1">
                      <li>• Keep your API key secure and private</li>
                      <li>• This key provides access to your Cognify data</li>
                      <li>• Contact support if you believe your key is compromised</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          <Card className="border shadow-sm">
            <CardContent className="pt-6">
              <div className="text-center py-8">
                <Key className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No API Key Found</h3>
                <p className="text-gray-600">
                  Please contact support for assistance.
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
