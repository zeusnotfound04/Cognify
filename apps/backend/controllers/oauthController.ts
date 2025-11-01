import { Request, Response } from 'express';
import { getAuthUrl, exchangeCodeForTokens, OAuthTokens } from '../services/oauthService';
import { AuthenticatedRequest } from '../middleware/auth';
import prisma from '../db/prisma';

// Initiate OAuth flow
export const initiateOAuth = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { provider } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    if (!provider || !['slack', 'notion', 'google'].includes(provider)) {
      return res.status(400).json({ error: 'Invalid provider' });
    }

    // Generate state parameter for security (includes user ID)
    const state = Buffer.from(JSON.stringify({ userId, timestamp: Date.now() })).toString('base64');
    
    const authUrl = getAuthUrl(provider as any, state);
    
    res.json({ authUrl });
  } catch (error) {
    console.error('OAuth initiation error:', error);
    res.status(500).json({ error: 'Failed to initiate OAuth flow' });
  }
};

// Handle OAuth callback
export const handleOAuthCallback = async (req: Request, res: Response) => {
  try {
    const { provider } = req.params;
    const { code, error, state } = req.query;

    // Frontend redirect URL
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';

    if (error) {
      return res.redirect(`${frontendUrl}/dashboard/integrations?error=${encodeURIComponent(error as string)}`);
    }

    if (!code || !state) {
      return res.redirect(`${frontendUrl}/dashboard/integrations?error=missing_parameters`);
    }

    // Decode and validate state
    let stateData;
    try {
      stateData = JSON.parse(Buffer.from(state as string, 'base64').toString());
    } catch {
      return res.redirect(`${frontendUrl}/dashboard/integrations?error=invalid_state`);
    }

    const { userId } = stateData;
    if (!userId) {
      return res.redirect(`${frontendUrl}/dashboard/integrations?error=missing_user_id`);
    }

    // Exchange code for tokens
    const tokens = await exchangeCodeForTokens(provider as any, code as string) as OAuthTokens;

    // Determine the provider name for database storage
    let dbProvider = provider as string;
    if (provider === 'google') {
      // For Google, we'll store separate entries for Drive and Calendar
      // For now, let's store as 'google' and handle the scopes
      dbProvider = 'google';
    }

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

    // Redirect back to frontend with success
    const successMessage = `${provider}_connected`;
    return res.redirect(`${frontendUrl}/dashboard/integrations?success=${successMessage}`);

  } catch (error) {
    console.error('OAuth callback error:', error);
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