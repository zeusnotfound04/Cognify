import { Request, Response } from 'express';
import prisma from '../db/prisma';

// Get all integrations for a user
export const getIntegrations = async (req: Request, res: Response) => {
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

// Create or update an integration
export const createIntegration = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const {
      provider,
      accessToken,
      refreshToken,
      scopes,
      teamId,
      teamName,
      workspaceId,
      workspaceName,
      expiresAt,
      isActive = true
    } = req.body;

    if (!provider || !accessToken) {
      return res.status(400).json({ error: 'Provider and access token are required' });
    }

    const integration = await prisma.integration.upsert({
      where: {
        userId_provider: {
          userId,
          provider
        }
      },
      update: {
        accessToken,
        refreshToken,
        scopes,
        teamId,
        teamName,
        workspaceId,
        workspaceName,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
        isActive,
        updatedAt: new Date()
      },
      create: {
        userId,
        provider,
        accessToken,
        refreshToken,
        scopes,
        teamId,
        teamName,
        workspaceId,
        workspaceName,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
        isActive
      }
    });

    res.json({ 
      message: 'Integration saved successfully',
      integration: {
        id: integration.id,
        provider: integration.provider,
        isActive: integration.isActive,
        createdAt: integration.createdAt
      }
    });
  } catch (error) {
    console.error('Error creating integration:', error);
    res.status(500).json({ error: 'Failed to save integration' });
  }
};

// Delete an integration
export const deleteIntegration = async (req: Request, res: Response) => {
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

// Get a specific integration with tokens (for API calls)
export const getIntegrationTokens = async (req: Request, res: Response) => {
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
    console.error('Eplerror fetching integration tokens:', error);
    res.status(500).json({ error: 'Failed to fetch integration tokens' });
  }
};

// Refresh an expired token (for Google APIs)
export const refreshIntegrationToken = async (req: Request, res: Response) => {
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

    if (!integration || !integration.refreshToken) {
      return res.status(404).json({ error: 'Integration not found or no refresh token available' });
    }

    // Refresh token logic would go here based on the provider
    // For now, just return the current tokens
    res.json({
      accessToken: integration.accessToken,
      refreshToken: integration.refreshToken,
      scopes: integration.scopes,
      expiresAt: integration.expiresAt
    });
  } catch (error) {
    console.error('Error refreshing integration token:', error);
    res.status(500).json({ error: 'Failed to refresh token' });
  }
};