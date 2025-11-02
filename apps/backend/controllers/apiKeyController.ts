import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth';
import { apiKeyService, CreateApiKeyData, UpdateApiKeyData } from '../services/apiKeyService';

// Get all API keys for the authenticated user
export const getUserApiKeys = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const apiKeys = await apiKeyService.getUserApiKeys(userId);
    res.json({ apiKeys });
  } catch (error) {
    console.error('Error fetching API keys:', error);
    res.status(500).json({ error: 'Failed to fetch API keys' });
  }
};

// Create or update an API key
export const createApiKey = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { provider, keyType, keyValue, description } = req.body;

    if (!provider || !keyType || !keyValue) {
      return res.status(400).json({ 
        error: 'Missing required fields: provider, keyType, keyValue' 
      });
    }

    // Validate provider and keyType
    const validProviders = ['slack', 'notion', 'google'];
    const validKeyTypes = ['client_id', 'client_secret', 'verification_token'];

    if (!validProviders.includes(provider)) {
      return res.status(400).json({ 
        error: `Invalid provider. Must be one of: ${validProviders.join(', ')}` 
      });
    }

    if (!validKeyTypes.includes(keyType)) {
      return res.status(400).json({ 
        error: `Invalid keyType. Must be one of: ${validKeyTypes.join(', ')}` 
      });
    }

    const createData: CreateApiKeyData = {
      provider,
      keyType,
      keyValue,
      description
    };

    const apiKey = await apiKeyService.createApiKey(userId, createData);
    
    res.status(201).json({ 
      message: 'API key created successfully',
      apiKey 
    });
  } catch (error) {
    console.error('Error creating API key:', error);
    res.status(500).json({ error: 'Failed to create API key' });
  }
};

// Update an API key
export const updateApiKey = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { provider, keyType } = req.params;
    const { keyValue, description, isActive } = req.body;

    if (!provider || !keyType) {
      return res.status(400).json({ 
        error: 'Missing required parameters: provider, keyType' 
      });
    }

    const updateData: UpdateApiKeyData = {};
    if (keyValue !== undefined) updateData.keyValue = keyValue;
    if (description !== undefined) updateData.description = description;
    if (isActive !== undefined) updateData.isActive = isActive;

    const apiKey = await apiKeyService.updateApiKey(userId, provider, keyType, updateData);
    
    res.json({ 
      message: 'API key updated successfully',
      apiKey 
    });
  } catch (error) {
    console.error('Error updating API key:', error);
    if (error instanceof Error && error.message.includes('Record to update not found')) {
      return res.status(404).json({ error: 'API key not found' });
    }
    res.status(500).json({ error: 'Failed to update API key' });
  }
};

// Delete an API key
export const deleteApiKey = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { provider, keyType } = req.params;

    if (!provider || !keyType) {
      return res.status(400).json({ 
        error: 'Missing required parameters: provider, keyType' 
      });
    }

    await apiKeyService.deleteApiKey(userId, provider, keyType);
    
    res.json({ message: 'API key deleted successfully' });
  } catch (error) {
    console.error('Error deleting API key:', error);
    if (error instanceof Error && error.message.includes('Record to delete does not exist')) {
      return res.status(404).json({ error: 'API key not found' });
    }
    res.status(500).json({ error: 'Failed to delete API key' });
  }
};

// Get provider configuration status (without revealing actual keys)
export const getProviderStatus = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const readyProviders = await apiKeyService.getReadyProviders(userId);
    
    const providerStatus = {
      slack: {
        ready: readyProviders.includes('slack'),
        requiresKeys: ['client_id', 'client_secret']
      },
      notion: {
        ready: readyProviders.includes('notion'),
        requiresKeys: ['client_id', 'client_secret']
      },
      google: {
        ready: readyProviders.includes('google'),
        requiresKeys: ['client_id', 'client_secret']
      }
    };

    res.json({ 
      providerStatus,
      readyProviders 
    });
  } catch (error) {
    console.error('Error fetching provider status:', error);
    res.status(500).json({ error: 'Failed to fetch provider status' });
  }
};

// Get setup instructions for each provider
export const getSetupInstructions = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const instructions = {
      slack: {
        title: 'Slack OAuth Setup',
        steps: [
          'Go to https://api.slack.com/apps',
          'Create a new app or select an existing one',
          'Go to "OAuth & Permissions"',
          'Add redirect URL: http://localhost:8888/oauth/callback/slack',
          'Copy "Client ID" and "Client Secret"',
          'Add these to your API key configuration'
        ],
        requiredKeys: ['client_id', 'client_secret'],
        redirectUrl: 'http://localhost:8888/oauth/callback/slack'
      },
      notion: {
        title: 'Notion Integration Setup',
        steps: [
          'Go to https://www.notion.so/my-integrations',
          'Create a new integration',
          'Set integration type to "Public integration"',
          'Add redirect URL: http://localhost:8888/oauth/callback/notion',
          'Copy "OAuth client ID" and "OAuth client secret"',
          'Add these to your API key configuration'
        ],
        requiredKeys: ['client_id', 'client_secret'],
        redirectUrl: 'http://localhost:8888/oauth/callback/notion'
      },
      google: {
        title: 'Google OAuth Setup',
        steps: [
          'Go to https://console.cloud.google.com/',
          'Create a project or select an existing one',
          'Enable Google Drive API and Google Calendar API',
          'Go to "Credentials" > "Create Credentials" > "OAuth client ID"',
          'Add redirect URL: http://localhost:8888/oauth/callback/google',
          'Copy "Client ID" and "Client Secret"',
          'Add these to your API key configuration'
        ],
        requiredKeys: ['client_id', 'client_secret'],
        redirectUrl: 'http://localhost:8888/oauth/callback/google'
      }
    };

    res.json({ instructions });
  } catch (error) {
    console.error('Error fetching setup instructions:', error);
    res.status(500).json({ error: 'Failed to fetch setup instructions' });
  }
};