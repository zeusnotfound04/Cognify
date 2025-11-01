// OAuth Configuration for Third-Party Integrations
// Environment variables should be set in your .env file

export const OAUTH_CONFIG = {
  // Base URL for your backend (update for production)
  BASE_URL: process.env.BACKEND_URL || 'http://localhost:8888',
  
  // Slack OAuth Configuration
  slack: {
    clientId: process.env.SLACK_CLIENT_ID,
    clientSecret: process.env.SLACK_CLIENT_SECRET,
    scope: [
      'channels:read',
      'channels:history', 
      'groups:read',
      'groups:history',
      'im:read',
      'im:history',
      'mpim:read',
      'mpim:history',
      'users:read',
      'team:read',
      'files:read',
      'search:read'
    ].join(','),
    redirectUri: (process.env.BACKEND_URL || 'http://localhost:8888') + '/oauth/callback/slack',
    authUrl: 'https://slack.com/oauth/v2/authorize',
    tokenUrl: 'https://slack.com/api/oauth.v2.access'
  },

  // Notion OAuth Configuration  
  notion: {
    clientId: process.env.NOTION_CLIENT_ID,
    clientSecret: process.env.NOTION_CLIENT_SECRET,
    scope: 'read_content',
    redirectUri: (process.env.BACKEND_URL || 'http://localhost:8888') + '/oauth/callback/notion',
    authUrl: 'https://api.notion.com/v1/oauth/authorize',
    tokenUrl: 'https://api.notion.com/v1/oauth/token'
  },

  // Google OAuth Configuration (shared for Drive and Calendar)
  google: {
    clientId: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    scope: [
      'https://www.googleapis.com/auth/drive.readonly',
      'https://www.googleapis.com/auth/drive.file',
      'https://www.googleapis.com/auth/drive.metadata.readonly',
      'https://www.googleapis.com/auth/calendar.readonly',
      'https://www.googleapis.com/auth/calendar.events.readonly'
    ].join(' '),
    redirectUri: (process.env.BACKEND_URL || 'http://localhost:8888') + '/oauth/callback/google',
    authUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
    tokenUrl: 'https://oauth2.googleapis.com/token'
  }
} as const

// Types for OAuth configuration
type OAuthProviderConfig = {
  clientId: string | undefined
  clientSecret: string | undefined
  scope: string
  redirectUri: string
  authUrl: string
  tokenUrl: string
}

// Helper function to get authorization URL
export function getAuthUrl(provider: keyof typeof OAUTH_CONFIG, state?: string) {
  const config = OAUTH_CONFIG[provider] as OAuthProviderConfig
  if (!config || !config.clientId) {
    throw new Error(`Unknown provider or missing configuration: ${provider}`)
  }

  const params = new URLSearchParams({
    client_id: config.clientId!,
    redirect_uri: config.redirectUri,
    scope: config.scope,
    response_type: 'code',
    access_type: 'offline', // For Google APIs
    prompt: 'consent', // For Google APIs
    ...(state && { state })
  })

  return `${config.authUrl}?${params.toString()}`
}

// Helper function to exchange code for tokens
export async function exchangeCodeForTokens(
  provider: keyof typeof OAUTH_CONFIG,
  code: string
) {
  const config = OAUTH_CONFIG[provider] as OAuthProviderConfig
  if (!config || !config.clientId || !config.clientSecret) {
    throw new Error(`Unknown provider or missing configuration: ${provider}`)
  }

  const body = new URLSearchParams({
    client_id: config.clientId!,
    client_secret: config.clientSecret!,
    code,
    redirect_uri: config.redirectUri,
    grant_type: 'authorization_code'
  })

  const response = await fetch(config.tokenUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Accept': 'application/json'
    },
    body: body.toString()
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`Token exchange failed: ${response.statusText} - ${errorText}`)
  }

  return await response.json()
}

// Types for OAuth tokens
export interface OAuthTokens {
  access_token: string
  refresh_token?: string
  token_type: string
  expires_in?: number
  scope?: string
  // Provider-specific fields
  team?: {
    id: string
    name: string
  } // Slack
  workspace_name?: string // Notion
  workspace_id?: string // Notion
}