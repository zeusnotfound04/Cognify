import { apiKeyService } from './apiKeyService';

// OAuth Configuration for Third-Party Integrations
// Now uses user-specific API keys instead of environment variables

export const OAUTH_CONFIG = {
  // Base URL for your backend (update for production)
  BASE_URL: process.env.BACKEND_URL || 'http://localhost:8888',
  
  // Slack OAuth Configuration Template
  slack: {
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

  // Notion OAuth Configuration Template
  notion: {
    scope: 'read_content',
    redirectUri: (process.env.BACKEND_URL || 'http://localhost:8888') + '/oauth/callback/notion',
    authUrl: 'https://api.notion.com/v1/oauth/authorize',
    tokenUrl: 'https://api.notion.com/v1/oauth/token'
  },

  // Google OAuth Configuration Template
  google: {
    scope: [
      // User profile information
      'https://www.googleapis.com/auth/userinfo.profile',
      'https://www.googleapis.com/auth/userinfo.email',
      'openid',
      
      // Google Drive scopes - comprehensive access
      'https://www.googleapis.com/auth/drive.readonly',
      'https://www.googleapis.com/auth/drive.file',
      'https://www.googleapis.com/auth/drive.metadata.readonly',
      'https://www.googleapis.com/auth/drive.photos.readonly',
      'https://www.googleapis.com/auth/drive.activity.readonly',
      
      // Google Calendar scopes - comprehensive access
      'https://www.googleapis.com/auth/calendar.readonly',
      'https://www.googleapis.com/auth/calendar.events.readonly',
      'https://www.googleapis.com/auth/calendar.calendarlist.readonly',
      'https://www.googleapis.com/auth/calendar.settings.readonly',
      
      // Gmail scopes for email integration (optional - uncomment if needed)
      // 'https://www.googleapis.com/auth/gmail.readonly',
      // 'https://www.googleapis.com/auth/gmail.metadata',
    ].join(' '),
    redirectUri: (process.env.BACKEND_URL || 'http://localhost:8888') + '/oauth/callback/google',
    authUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
    tokenUrl: 'https://oauth2.googleapis.com/token',
    revokeUrl: 'https://oauth2.googleapis.com/revoke',
    userInfoUrl: 'https://www.googleapis.com/oauth2/v2/userinfo'
  }
} as const

// Types for OAuth configuration
type OAuthProviderConfig = {
  scope: string
  redirectUri: string
  authUrl: string
  tokenUrl: string
  revokeUrl?: string
  userInfoUrl?: string
}

type OAuthProviderConfigWithCredentials = OAuthProviderConfig & {
  clientId: string
  clientSecret: string
}

// Helper function to get authorization URL with user-specific credentials
export async function getAuthUrl(provider: keyof typeof OAUTH_CONFIG, userId: string, state?: string) {
  console.log(`Getting auth URL for provider ${provider}, userId: ${userId}`);
  
  const config = OAUTH_CONFIG[provider] as OAuthProviderConfig
  if (!config) {
    console.log(`No configuration found for provider: ${provider}`);
    throw new Error(`Unknown provider: ${provider}`)
  }

  // Get user-specific API keys
  const providerConfig = await apiKeyService.getProviderConfig(userId, provider);
  if (!providerConfig) {
    console.log(`No API keys configured for provider ${provider}, userId: ${userId}`);
    throw new Error(`No API keys configured for provider: ${provider}. Please configure your API keys first.`)
  }

  console.log(`Found API keys for ${provider}, generating auth URL`);

  const params = new URLSearchParams({
    client_id: providerConfig.clientId,
    redirect_uri: config.redirectUri,
    scope: config.scope,
    response_type: 'code',
    access_type: 'offline', // For Google APIs
    prompt: 'consent', // For Google APIs
    ...(state && { state })
  })

  const authUrl = `${config.authUrl}?${params.toString()}`;
  console.log(`Generated auth URL: ${authUrl.substring(0, 100)}...`);
  
  return authUrl;
}

// Helper function to exchange code for tokens with user-specific credentials
export async function exchangeCodeForTokens(
  provider: keyof typeof OAUTH_CONFIG,
  userId: string,
  code: string
) {
  console.log(`Starting token exchange for provider: ${provider}, userId: ${userId}`);
  
  const config = OAUTH_CONFIG[provider] as OAuthProviderConfig
  if (!config) {
    console.log(`Missing configuration for provider ${provider}`);
    throw new Error(`Unknown provider: ${provider}`)
  }

  // Get user-specific API keys
  const providerConfig = await apiKeyService.getProviderConfig(userId, provider);
  if (!providerConfig) {
    console.log(`No API keys configured for provider ${provider}, userId: ${userId}`);
    throw new Error(`No API keys configured for provider: ${provider}. Please configure your API keys first.`)
  }

  console.log(`Token exchange config for ${provider}:`, {
    tokenUrl: config.tokenUrl,
    redirectUri: config.redirectUri,
    hasClientId: !!providerConfig.clientId,
    hasClientSecret: !!providerConfig.clientSecret
  });

  const body = new URLSearchParams({
    client_id: providerConfig.clientId,
    client_secret: providerConfig.clientSecret,
    code,
    redirect_uri: config.redirectUri,
    grant_type: 'authorization_code'
  })

  console.log(`Making token exchange request to: ${config.tokenUrl}`);
  console.log(`Request body parameters:`, {
    client_id: providerConfig.clientId,
    client_secret: providerConfig.clientSecret.substring(0, 10) + '...',
    code: code.substring(0, 10) + '...',
    redirect_uri: config.redirectUri,
    grant_type: 'authorization_code'
  });

  const response = await fetch(config.tokenUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Accept': 'application/json'
    },
    body: body.toString()
  })

  console.log(`Token exchange response status: ${response.status} ${response.statusText}`);

  if (!response.ok) {
    const errorText = await response.text()
    console.log(`Token exchange failed with response:`, errorText);
    throw new Error(`Token exchange failed: ${response.statusText} - ${errorText}`)
  }

  const tokenData = await response.json() as OAuthTokens;
  console.log(`Token exchange successful for ${provider}:`, {
    hasAccessToken: !!tokenData.access_token,
    hasRefreshToken: !!tokenData.refresh_token,
    tokenType: tokenData.token_type,
    scope: tokenData.scope,
    expiresIn: tokenData.expires_in,
    teamName: tokenData.team?.name,
    workspaceName: tokenData.workspace_name
  });

  return tokenData;
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

// Types for Google user information
export interface GoogleUserInfo {
  id: string
  email: string
  verified_email: boolean
  name: string
  given_name: string
  family_name: string
  picture: string
  locale: string
}

// Helper function to refresh Google OAuth tokens
export async function refreshGoogleToken(userId: string, refreshToken: string): Promise<OAuthTokens> {
  const config = OAUTH_CONFIG.google
  
  // Get user-specific API keys
  const providerConfig = await apiKeyService.getProviderConfig(userId, 'google');
  if (!providerConfig) {
    throw new Error('Google API keys not configured. Please configure your API keys first.')
  }

  const body = new URLSearchParams({
    client_id: providerConfig.clientId,
    client_secret: providerConfig.clientSecret,
    refresh_token: refreshToken,
    grant_type: 'refresh_token'
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
    throw new Error(`Token refresh failed: ${response.statusText} - ${errorText}`)
  }

  return (await response.json()) as OAuthTokens
}

// Helper function to get Google user information
export async function getGoogleUserInfo(accessToken: string): Promise<GoogleUserInfo> {
  const config = OAUTH_CONFIG.google
  if (!config.userInfoUrl) {
    throw new Error('Google user info URL not configured')
  }

  const response = await fetch(config.userInfoUrl, {
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Accept': 'application/json'
    }
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`Failed to get user info: ${response.statusText} - ${errorText}`)
  }

  return (await response.json()) as GoogleUserInfo
}

// Helper function to revoke Google OAuth tokens
export async function revokeGoogleToken(accessToken: string): Promise<void> {
  const config = OAUTH_CONFIG.google
  if (!config.revokeUrl) {
    throw new Error('Google revoke URL not configured')
  }

  const response = await fetch(`${config.revokeUrl}?token=${accessToken}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    }
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`Token revocation failed: ${response.statusText} - ${errorText}`)
  }
}