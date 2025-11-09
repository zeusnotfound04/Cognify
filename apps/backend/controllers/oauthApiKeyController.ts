import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth';
import { apiKeyService } from '../services/apiKeyService';

// Get all OAuth API keys for a user
export const getOAuthApiKeys = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const apiKeys = await apiKeyService.getUserApiKeys(userId);
    
    // Only return OAuth-related keys
    const oauthKeys = apiKeys.filter(key => 
      ['slack', 'notion', 'google'].includes(key.provider) &&
      ['client_id', 'client_secret'].includes(key.keyType)
    );

    res.json({ apiKeys: oauthKeys });
  } catch (error) {
    console.error('Error fetching OAuth API keys:', error);
    res.status(500).json({ error: 'Failed to fetch API keys' });
  }
};

// Create or update an OAuth API key
export const createOAuthApiKey = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { provider, keyType, keyValue, description } = req.body;

    // Validate provider
    if (!['slack', 'notion', 'google'].includes(provider)) {
      return res.status(400).json({ error: 'Invalid provider' });
    }

    // Validate keyType
    if (!['client_id', 'client_secret'].includes(keyType)) {
      return res.status(400).json({ error: 'Invalid key type' });
    }

    // Validate keyValue
    if (!keyValue || typeof keyValue !== 'string' || !keyValue.trim()) {
      return res.status(400).json({ error: 'Key value is required' });
    }

    const apiKey = await apiKeyService.createApiKey(userId, {
      provider,
      keyType,
      keyValue: keyValue.trim(),
      description
    });

    res.json({ 
      message: 'API key saved successfully',
      apiKey: {
        id: apiKey.id,
        provider: apiKey.provider,
        keyType: apiKey.keyType,
        description: apiKey.description,
        isActive: apiKey.isActive,
        createdAt: apiKey.createdAt,
        updatedAt: apiKey.updatedAt
      }
    });
  } catch (error) {
    console.error('Error creating OAuth API key:', error);
    res.status(500).json({ error: 'Failed to save API key' });
  }
};

// Update an OAuth API key
export const updateOAuthApiKey = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { provider, keyType } = req.params;
    const { keyValue, description, isActive } = req.body;

    // Validate provider
    if (!provider || !['slack', 'notion', 'google'].includes(provider)) {
      return res.status(400).json({ error: 'Invalid provider' });
    }

    // Validate keyType
    if (!keyType || !['client_id', 'client_secret'].includes(keyType)) {
      return res.status(400).json({ error: 'Invalid key type' });
    }

    const updateData: any = {};
    if (keyValue !== undefined) updateData.keyValue = keyValue.trim();
    if (description !== undefined) updateData.description = description;
    if (isActive !== undefined) updateData.isActive = isActive;

    const apiKey = await apiKeyService.updateApiKey(userId, provider, keyType, updateData);

    res.json({ 
      message: 'API key updated successfully',
      apiKey: {
        id: apiKey.id,
        provider: apiKey.provider,
        keyType: apiKey.keyType,
        description: apiKey.description,
        isActive: apiKey.isActive,
        createdAt: apiKey.createdAt,
        updatedAt: apiKey.updatedAt
      }
    });
  } catch (error) {
    console.error('Error updating OAuth API key:', error);
    res.status(500).json({ error: 'Failed to update API key' });
  }
};

// Delete an OAuth API key
export const deleteOAuthApiKey = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { provider, keyType } = req.params;

    // Validate provider
    if (!provider || !['slack', 'notion', 'google'].includes(provider)) {
      return res.status(400).json({ error: 'Invalid provider' });
    }

    // Validate keyType
    if (!keyType || !['client_id', 'client_secret'].includes(keyType)) {
      return res.status(400).json({ error: 'Invalid key type' });
    }

    await apiKeyService.deleteApiKey(userId, provider, keyType);

    res.json({ message: 'API key deleted successfully' });
  } catch (error) {
    console.error('Error deleting OAuth API key:', error);
    res.status(500).json({ error: 'Failed to delete API key' });
  }
};

// Check if provider is ready for OAuth
export const checkProviderReadiness = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { provider } = req.params;

    // Validate provider
    if (!provider || !['slack', 'notion', 'google'].includes(provider)) {
      return res.status(400).json({ error: 'Invalid provider' });
    }

    const isReady = await apiKeyService.hasCompleteProviderConfig(userId, provider);

    res.json({ 
      provider,
      isReady,
      message: isReady 
        ? `${provider} is ready for OAuth` 
        : `${provider} requires API key configuration`
    });
  } catch (error) {
    console.error('Error checking provider readiness:', error);
    res.status(500).json({ error: 'Failed to check provider readiness' });
  }
};

// Get all ready providers
export const getReadyProviders = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const readyProviders = await apiKeyService.getReadyProviders(userId);

    res.json({ 
      readyProviders,
      total: readyProviders.length
    });
  } catch (error) {
    console.error('Error getting ready providers:', error);
    res.status(500).json({ error: 'Failed to get ready providers' });
  }
};