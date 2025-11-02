'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Import, 
  Calendar, 
  HardDrive, 
  FileText, 
  Slack as SlackIcon,
  CheckCircle,
  ExternalLink,
  Download
} from 'lucide-react'

const importOptions = [
  {
    id: 'google-calendar',
    provider: 'google',
    name: 'Google Calendar',
    description: 'Import events, meetings, and schedules',
    icon: Calendar,
    color: 'bg-green-500',
    benefits: [
      'Meeting notes and agendas',
      'Schedule context for AI',
      'Attendee information',
      'Event descriptions and locations'
    ],
    scope: 'calendar'
  },
  {
    id: 'google-drive',
    provider: 'google',
    name: 'Google Drive',
    description: 'Import documents, spreadsheets, and files',
    icon: HardDrive,
    color: 'bg-blue-500',
    benefits: [
      'Document content analysis',
      'File metadata and sharing',
      'Collaborative document context',
      'Version history insights'
    ],
    scope: 'drive'
  },
  {
    id: 'slack',
    provider: 'slack',
    name: 'Slack',
    description: 'Import workspace messages and channels',
    icon: SlackIcon,
    color: 'bg-purple-500',
    benefits: [
      'Team communication context',
      'Channel discussions',
      'Direct message insights',
      'File sharing history'
    ]
  },
  {
    id: 'notion',
    provider: 'notion',
    name: 'Notion',
    description: 'Import pages, databases, and knowledge',
    icon: FileText,
    color: 'bg-gray-800',
    benefits: [
      'Knowledge base content',
      'Project documentation',
      'Database structured data',
      'Personal notes and wikis'
    ]
  }
]

interface ImportContextButtonProps {
  onImportComplete?: () => void
  className?: string
  variant?: 'default' | 'outline' | 'secondary'
  size?: 'default' | 'sm' | 'lg'
}

export default function ImportContextButton({ 
  onImportComplete, 
  className,
  variant = 'default',
  size = 'default'
}: ImportContextButtonProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [connecting, setConnecting] = useState<string | null>(null)
  const [importStatus, setImportStatus] = useState<Record<string, 'idle' | 'connecting' | 'success' | 'error'>>({})

  const handleImport = async (option: typeof importOptions[0]) => {
    try {
      setConnecting(option.id)
      setImportStatus(prev => ({ ...prev, [option.id]: 'connecting' }))
      
      let authUrl: string
      
      if (option.provider === 'google') {
        // For Google services, we need to specify the scope
        const response = await fetch(`http://localhost:8888/oauth/initiate/google`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            scopes: option.scope === 'calendar' 
              ? ['https://www.googleapis.com/auth/calendar.readonly']
              : ['https://www.googleapis.com/auth/drive.readonly']
          })
        })
        
        if (!response.ok) {
          throw new Error('Failed to initiate Google OAuth')
        }
        
        const data = await response.json()
        authUrl = data.authUrl
      } else {
        // For Slack and Notion
        const response = await fetch(`http://localhost:8888/oauth/initiate/${option.provider}`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
          }
        })
        
        if (!response.ok) {
          throw new Error(`Failed to initiate ${option.provider} OAuth`)
        }
        
        const data = await response.json()
        authUrl = data.authUrl
      }
      
      // Store import context for after OAuth completion
      localStorage.setItem('import_context', JSON.stringify({
        optionId: option.id,
        provider: option.provider,
        scope: option.scope
      }))
      
      // Redirect to OAuth
      window.location.href = authUrl
      
    } catch (error) {
      console.error(`Failed to import from ${option.name}:`, error)
      setImportStatus(prev => ({ ...prev, [option.id]: 'error' }))
      setConnecting(null)
    }
  }

  const getStatusIcon = (optionId: string) => {
    const status = importStatus[optionId]
    switch (status) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'error':
        return <ExternalLink className="h-4 w-4 text-red-500" />
      case 'connecting':
        return <div className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
      default:
        return null
    }
  }

  return (
    <>
      <Button variant={variant} size={size} className={className} onClick={() => setIsOpen(true)}>
        <Import className="h-4 w-4 mr-2" />
        Import Context
      </Button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center p-6">
          <div className="absolute inset-0 bg-black/40" onClick={() => setIsOpen(false)} />
          <div className="relative max-w-4xl w-full max-h-[80vh] overflow-y-auto bg-background rounded-lg shadow-lg p-6">
            <div className="mb-4">
              <div className="flex items-center gap-2 text-lg font-semibold">
                <Download className="h-5 w-5" />
                Import Context from Your Apps
              </div>
              <p className="text-sm text-muted-foreground mt-1">Connect your favorite tools to import relevant context and enhance your AI experience. Choose from the platforms below to get started.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
          {importOptions.map((option) => {
            const Icon = option.icon
            const status = importStatus[option.id]
            const isConnecting = connecting === option.id
            
            return (
              <Card key={option.id} className="relative group hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${option.color} text-white`}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <div>
                        <CardTitle className="text-lg flex items-center gap-2">
                          {option.name}
                          {getStatusIcon(option.id)}
                        </CardTitle>
                        <CardDescription className="text-sm">
                          {option.description}
                        </CardDescription>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="pt-0">
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium text-sm mb-2">What you'll get:</h4>
                      <ul className="text-xs text-muted-foreground space-y-1">
                        {option.benefits.map((benefit, index) => (
                          <li key={index} className="flex items-center gap-2">
                            <div className="w-1 h-1 bg-current rounded-full" />
                            {benefit}
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    {status === 'success' && (
                      <div className="flex items-center gap-2 text-sm text-green-600 bg-green-50 p-2 rounded">
                        <CheckCircle className="h-4 w-4" />
                        Successfully imported context
                      </div>
                    )}
                    
                    {status === 'error' && (
                      <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 p-2 rounded">
                        <ExternalLink className="h-4 w-4" />
                        Import failed. Please try again.
                      </div>
                    )}
                    
                    <Button
                      onClick={() => handleImport(option)}
                      disabled={isConnecting || status === 'success'}
                      size="sm"
                      className="w-full"
                      variant={status === 'success' ? 'outline' : 'default'}
                    >
                      {isConnecting ? (
                        <>
                          <div className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
                          Connecting...
                        </>
                      ) : status === 'success' ? (
                        <>
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Connected
                        </>
                      ) : (
                        <>
                          <ExternalLink className="h-4 w-4 mr-2" />
                          Import from {option.name}
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )
          })}
            </div>

            <div className="mt-6 p-4 bg-muted rounded-lg">
          <h3 className="font-medium mb-2 flex items-center gap-2">
            <CheckCircle className="h-4 w-4" />
            Privacy & Security
          </h3>
          <div className="text-sm text-muted-foreground space-y-1">
            <p>• Your data is encrypted and securely stored</p>
            <p>• You can disconnect any integration at any time</p>
            <p>• We only access data you explicitly grant permission for</p>
            <p>• All connections use industry-standard OAuth protocols</p>
          </div>
        </div>
        
            <div className="flex justify-end gap-2 mt-4">
              <Button variant="outline" onClick={() => setIsOpen(false)}>
                Close
              </Button>
              <Button 
                variant="secondary" 
                onClick={() => {
                  setIsOpen(false)
                  onImportComplete?.()
                }}
              >
                Continue to Dashboard
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}