'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Progress } from '@/components/ui/progress'
import { 
  RefreshCw, 
  CheckCircle, 
  AlertCircle, 
  Clock,
  Database,
  FileText,
  Users,
  Calendar,
  HardDrive,
  Slack
} from 'lucide-react'

interface SyncStatus {
  integrations: Array<{
    id: string
    provider: string
    lastUpdated: string
    connectedAt: string
  }>
  memories: {
    total: number
    bySource: Record<string, number>
  }
}

interface SyncResult {
  success: boolean
  synced: number
  details?: any
  error?: string
}

const providerIcons: Record<string, any> = {
  slack: Slack,
  notion: FileText,
  google: HardDrive
}

const providerColors: Record<string, string> = {
  slack: 'bg-purple-500',
  notion: 'bg-gray-800',
  google: 'bg-blue-500'
}

export default function DataSyncManager() {
  const [syncStatus, setSyncStatus] = useState<SyncStatus | null>(null)
  const [syncing, setSyncing] = useState<Record<string, boolean>>({})
  const [syncResults, setSyncResults] = useState<Record<string, SyncResult>>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchSyncStatus()
  }, [])

  const fetchSyncStatus = async () => {
    try {
      const response = await fetch('http://localhost:8888/sync/status', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        setSyncStatus(data)
      }
    } catch (error) {
      console.error('Failed to fetch sync status:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSync = async (provider: string) => {
    try {
      setSyncing(prev => ({ ...prev, [provider]: true }))
      
      const response = await fetch(`http://localhost:8888/sync/${provider}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      })
      
      const result = await response.json()
      setSyncResults(prev => ({ ...prev, [provider]: result }))
      
      if (result.success) {
        fetchSyncStatus()
      }
    } catch (error) {
      console.error(`Failed to sync ${provider}:`, error)
      setSyncResults(prev => ({ 
        ...prev, 
        [provider]: { 
          success: false, 
          synced: 0, 
          error: 'Sync failed' 
        } 
      }))
    } finally {
      setSyncing(prev => ({ ...prev, [provider]: false }))
    }
  }

  const getTimeSinceSync = (timestamp: string) => {
    const now = new Date()
    const lastSync = new Date(timestamp)
    const diffMs = now.getTime() - lastSync.getTime()
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    const diffDays = Math.floor(diffHours / 24)
    
    if (diffDays > 0) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`
    if (diffHours > 0) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`
    return 'Recently'
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <RefreshCw className="h-6 w-6 animate-spin" />
            <span className="ml-2">Loading sync status...</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!syncStatus || syncStatus.integrations.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Data Synchronization</CardTitle>
          <CardDescription>
            No active integrations found. Connect your services first to start syncing data.
          </CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Data Synchronization</CardTitle>
          <CardDescription>
            Sync data from your connected services to enhance AI context and search capabilities.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="text-center p-4 bg-muted rounded-lg">
              <Database className="h-8 w-8 mx-auto mb-2 text-blue-500" />
              <div className="text-2xl font-bold">{syncStatus.memories.total}</div>
              <div className="text-sm text-muted-foreground">Total Memories</div>
            </div>
            <div className="text-center p-4 bg-muted rounded-lg">
              <Users className="h-8 w-8 mx-auto mb-2 text-green-500" />
              <div className="text-2xl font-bold">{syncStatus.integrations.length}</div>
              <div className="text-sm text-muted-foreground">Active Integrations</div>
            </div>
            <div className="text-center p-4 bg-muted rounded-lg">
              <FileText className="h-8 w-8 mx-auto mb-2 text-purple-500" />
              <div className="text-2xl font-bold">
                {Object.keys(syncStatus.memories.bySource).length}
              </div>
              <div className="text-sm text-muted-foreground">Data Sources</div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Memory Distribution</h3>
            <div className="space-y-2">
              {Object.entries(syncStatus.memories.bySource).map(([source, count]) => {
                const percentage = (count / syncStatus.memories.total) * 100
                return (
                  <div key={source} className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="capitalize">{source}</span>
                      <span>{count} items ({percentage.toFixed(1)}%)</span>
                    </div>
                    <Progress value={percentage} className="h-2" />
                  </div>
                )
              })}
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {syncStatus.integrations.map((integration) => {
          const Icon = providerIcons[integration.provider] || Database
          const color = providerColors[integration.provider] || 'bg-gray-500'
          const isSyncing = syncing[integration.provider]
          const syncResult = syncResults[integration.provider]
          
          return (
            <Card key={integration.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${color} text-white`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <CardTitle className="capitalize">{integration.provider}</CardTitle>
                      <CardDescription>
                        Last synced: {getTimeSinceSync(integration.lastUpdated)}
                      </CardDescription>
                    </div>
                  </div>
                  <Button
                    onClick={() => handleSync(integration.provider)}
                    disabled={isSyncing}
                    size="sm"
                  >
                    {isSyncing ? (
                      <>
                        <RefreshCw className="h-4 w-4 mr-1 animate-spin" />
                        Syncing...
                      </>
                    ) : (
                      <>
                        <RefreshCw className="h-4 w-4 mr-1" />
                        Sync Now
                      </>
                    )}
                  </Button>
                </div>
              </CardHeader>
              
              <CardContent>
                <div className="space-y-4">
                  <div className="text-sm text-muted-foreground">
                    <div className="flex justify-between">
                      <span>Connected:</span>
                      <span>{new Date(integration.connectedAt).toLocaleDateString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Memories stored:</span>
                      <span>{syncStatus.memories.bySource[integration.provider] || 0}</span>
                    </div>
                  </div>

                  {syncResult && (
                    <Alert className={`${syncResult.success ? 'border-green-500' : 'border-red-500'}`}>
                      {syncResult.success ? (
                        <CheckCircle className="h-4 w-4" />
                      ) : (
                        <AlertCircle className="h-4 w-4" />
                      )}
                      <AlertDescription>
                        {syncResult.success ? (
                          `Successfully synced ${syncResult.synced} items`
                        ) : (
                          syncResult.error || 'Sync failed'
                        )}
                      </AlertDescription>
                    </Alert>
                  )}

                  {syncResult?.details && (
                    <div className="text-xs text-muted-foreground space-y-1">
                      {integration.provider === 'slack' && (
                        <>
                          <div>Channels: {syncResult.details.channels || 0}</div>
                          <div>Files: {syncResult.details.files || 0}</div>
                        </>
                      )}
                      {integration.provider === 'notion' && (
                        <>
                          <div>Databases: {syncResult.details.databases || 0}</div>
                          <div>Pages: {syncResult.details.pages || 0}</div>
                        </>
                      )}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Sync Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-muted-foreground space-y-2">
            <p>• Data synchronization helps improve AI responses by providing relevant context</p>
            <p>• Sync frequency depends on your usage and the amount of new data</p>
            <p>• All synced data is encrypted and stored securely</p>
            <p>• You can manually trigger syncs or they happen automatically in the background</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}