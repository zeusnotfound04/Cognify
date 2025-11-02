import { Request, Response } from 'express';
import { 
  getAuthUrl, 
  exchangeCodeForTokens, 
  getGoogleUserInfo,
  refreshGoogleToken,
  revokeGoogleToken,
  OAuthTokens,
  GoogleUserInfo 
} from '../services/oauthService';
import { AuthenticatedRequest } from '../middleware/auth';
import prisma from '../db/prisma';

// Initiate OAuth flow
export const initiateOAuth = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { provider } = req.params;
    const userId = req.user?.id;

    console.log(`OAuth initiation requested - provider: ${provider}, userId: ${userId}`);

    if (!userId) {
      console.log(`OAuth initiation failed: No user ID`);
      return res.status(401).json({ error: 'Unauthorized' });
    }

    if (!provider || !['slack', 'notion', 'google'].includes(provider)) {
      console.log(`OAuth initiation failed: Invalid provider ${provider}`);
      return res.status(400).json({ error: 'Invalid provider' });
    }

    // Generate state parameter for security (includes user ID)
    const state = Buffer.from(JSON.stringify({ userId, timestamp: Date.now() })).toString('base64');
    console.log(`Generated state parameter for ${provider}: ${state.substring(0, 20)}...`);
    
    const authUrl = getAuthUrl(provider as any, userId, state);
    console.log(`Generated auth URL for ${provider}: ${authUrl.substring(0, 100)}...`);
    
    res.json({ authUrl });
  } catch (error) {
    console.error(`OAuth initiation error for provider ${req.params.provider}:`, error);
    console.error(`Error stack:`, error instanceof Error ? error.stack : 'No stack trace');
    res.status(500).json({ error: 'Failed to initiate OAuth flow' });
  }
};

// Handle OAuth callback
export const handleOAuthCallback = async (req: Request, res: Response) => {
  try {
    const { provider } = req.params;
    const { code, error, state } = req.query;

    console.log(`OAuth callback received for provider: ${provider}`);
    console.log(`Query parameters:`, { code: !!code, error, state: !!state });

    // Frontend redirect URL
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';

    if (error) {
      console.log(`OAuth error from provider: ${error}`);
      return res.redirect(`${frontendUrl}/dashboard/integrations?error=${encodeURIComponent(error as string)}`);
    }

    if (!code || !state) {
      console.log(`Missing required parameters - code: ${!!code}, state: ${!!state}`);
      return res.redirect(`${frontendUrl}/dashboard/integrations?error=missing_parameters`);
    }

    // Decode and validate state
    let stateData;
    try {
      stateData = JSON.parse(Buffer.from(state as string, 'base64').toString());
      console.log(`Decoded state data:`, stateData);
    } catch (err) {
      console.log(`Failed to decode state parameter:`, err);
      return res.redirect(`${frontendUrl}/dashboard/integrations?error=invalid_state`);
    }

    const { userId } = stateData;
    if (!userId) {
      console.log(`No userId found in state data`);
      return res.redirect(`${frontendUrl}/dashboard/integrations?error=missing_user_id`);
    }

    console.log(`Attempting to exchange code for tokens - provider: ${provider}, userId: ${userId}`);

    // Exchange code for tokens
    const tokens = await exchangeCodeForTokens(provider as any, userId, code as string) as OAuthTokens;
    console.log(`Token exchange successful for ${provider}:`, {
      hasAccessToken: !!tokens.access_token,
      hasRefreshToken: !!tokens.refresh_token,
      scope: tokens.scope,
      teamName: tokens.team?.name,
      workspaceName: tokens.workspace_name
    });

    // For Google OAuth, get additional user information
    let userInfo: GoogleUserInfo | null = null;
    if (provider === 'google') {
      try {
        userInfo = await getGoogleUserInfo(tokens.access_token);
        console.log(`Google user info retrieved:`, { email: userInfo.email, name: userInfo.name });
      } catch (error) {
        console.error('Failed to get Google user info:', error);
      }
    }

    // Determine the provider name for database storage
    let dbProvider = provider as string;
    if (provider === 'google') {
      // For Google, we'll store separate entries for Drive and Calendar
      // For now, let's store as 'google' and handle the scopes
      dbProvider = 'google';
    }

    console.log(`Storing integration in database - userId: ${userId}, provider: ${dbProvider}`);

    // Store the integration in database
    await prisma.integration.upsert({
      where: {
        userId_provider: {
          userId,
          provider: dbProvider
        }
      },
      update: {
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token,
        scopes: tokens.scope,
        teamId: tokens.team?.id,
        teamName: tokens.team?.name,
        workspaceId: tokens.workspace_id,
        workspaceName: tokens.workspace_name,
        expiresAt: tokens.expires_in 
          ? new Date(Date.now() + tokens.expires_in * 1000) 
          : null,
        isActive: true,
        updatedAt: new Date()
      },
      create: {
        userId,
        provider: dbProvider,
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token,
        scopes: tokens.scope,
        teamId: tokens.team?.id,
        teamName: tokens.team?.name,
        workspaceId: tokens.workspace_id,
        workspaceName: tokens.workspace_name,
        expiresAt: tokens.expires_in 
          ? new Date(Date.now() + tokens.expires_in * 1000) 
          : null,
        isActive: true
      }
    });

    console.log(`Integration stored successfully for ${provider}`);

    // Redirect back to frontend with success
    const successMessage = `${provider}_connected`;
    console.log(`Redirecting to frontend with success: ${successMessage}`);
    return res.redirect(`${frontendUrl}/dashboard/integrations?success=${successMessage}`);

  } catch (error) {
    console.error(`OAuth callback error for provider ${req.params.provider}:`, error);
    console.error(`Error stack:`, error instanceof Error ? error.stack : 'No stack trace');
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    return res.redirect(`${frontendUrl}/dashboard/integrations?error=connection_failed`);
  }
};

// Get all integrations for a user
export const getIntegrations = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const integrations = await prisma.integration.findMany({
      where: { userId },
      select: {
        id: true,
        provider: true,
        isActive: true,
        createdAt: true,
        scopes: true,
        teamName: true,
        workspaceName: true,
        expiresAt: true
      }
    });

    res.json({ integrations });
  } catch (error) {
    console.error('Error fetching integrations:', error);
    res.status(500).json({ error: 'Failed to fetch integrations' });
  }
};

// Delete an integration
export const deleteIntegration = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { provider } = req.params;

    const integration = await prisma.integration.findFirst({
      where: {
        userId,
        provider
      }
    });

    if (!integration) {
      return res.status(404).json({ error: 'Integration not found' });
    }

    await prisma.integration.delete({
      where: {
        id: integration.id
      }
    });

    res.json({ message: 'Integration disconnected successfully' });
  } catch (error) {
    console.error('Error deleting integration:', error);
    res.status(500).json({ error: 'Failed to disconnect integration' });
  }
};

// Get integration tokens (for internal API use)
export const getIntegrationTokens = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { provider } = req.params;

    const integration = await prisma.integration.findFirst({
      where: {
        userId,
        provider,
        isActive: true
      }
    });

    if (!integration) {
      return res.status(404).json({ error: 'Integration not found or inactive' });
    }

    // Check if token is expired
    if (integration.expiresAt && integration.expiresAt < new Date()) {
      return res.status(401).json({ error: 'Token expired, please reconnect' });
    }

    res.json({
      accessToken: integration.accessToken,
      refreshToken: integration.refreshToken,
      scopes: integration.scopes,
      expiresAt: integration.expiresAt
    });
  } catch (error) {
    console.error('Error fetching integration tokens:', error);
    res.status(500).json({ error: 'Failed to fetch integration tokens' });
  }
};

// Refresh OAuth tokens for Google
export const refreshOAuthTokens = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { provider } = req.params;

    if (provider !== 'google') {
      return res.status(400).json({ error: 'Token refresh only supported for Google OAuth' });
    }

    const integration = await prisma.integration.findFirst({
      where: {
        userId,
        provider,
        isActive: true
      }
    });

    if (!integration || !integration.refreshToken) {
      return res.status(404).json({ error: 'Integration not found or no refresh token available' });
    }

    // Refresh the tokens
    const newTokens = await refreshGoogleToken(userId, integration.refreshToken);

    // Update integration with new tokens
    await prisma.integration.update({
      where: { id: integration.id },
      data: {
        accessToken: newTokens.access_token,
        refreshToken: newTokens.refresh_token || integration.refreshToken,
        expiresAt: newTokens.expires_in 
          ? new Date(Date.now() + newTokens.expires_in * 1000) 
          : null,
        updatedAt: new Date()
      }
    });

    res.json({ 
      message: 'Tokens refreshed successfully',
      expiresAt: newTokens.expires_in 
        ? new Date(Date.now() + newTokens.expires_in * 1000) 
        : null
    });
  } catch (error) {
    console.error('Error refreshing OAuth tokens:', error);
    res.status(500).json({ error: 'Failed to refresh tokens' });
  }
};

// Test Google API access
export const testGoogleAccess = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const integration = await prisma.integration.findFirst({
      where: {
        userId,
        provider: 'google',
        isActive: true
      }
    });

    if (!integration) {
      return res.status(404).json({ error: 'Google integration not found' });
    }

    const results: any = {};

    // Test Drive access
    try {
      const driveResponse = await fetch('https://www.googleapis.com/drive/v3/about?fields=user,storageQuota', {
        headers: {
          'Authorization': `Bearer ${integration.accessToken}`,
          'Accept': 'application/json'
        }
      });
      
      results.drive = {
        accessible: driveResponse.ok,
        status: driveResponse.status,
        data: driveResponse.ok ? await driveResponse.json() : null
      };
    } catch (error) {
      results.drive = {
        accessible: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }

    // Test Calendar access
    try {
      const calendarResponse = await fetch('https://www.googleapis.com/calendar/v3/users/me/calendarList?maxResults=5', {
        headers: {
          'Authorization': `Bearer ${integration.accessToken}`,
          'Accept': 'application/json'
        }
      });
      
      results.calendar = {
        accessible: calendarResponse.ok,
        status: calendarResponse.status,
        data: calendarResponse.ok ? await calendarResponse.json() : null
      };
    } catch (error) {
      results.calendar = {
        accessible: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }

    res.json({ 
      message: 'Google API access test completed',
      results,
      scopes: integration.scopes
    });
  } catch (error) {
    console.error('Error testing Google access:', error);
    res.status(500).json({ error: 'Failed to test Google access' });
  }
};