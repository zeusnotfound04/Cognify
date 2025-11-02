import crypto from 'crypto';
import prisma from '../db/prisma';

// Encryption configuration
const ENCRYPTION_KEY = process.env.API_KEY_ENCRYPTION_KEY || 'your-32-char-encryption-key-here';
const ALGORITHM = 'aes-256-gcm';

// Encrypt API key value
function encryptApiKey(text: string): string {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(ALGORITHM, Buffer.from(ENCRYPTION_KEY.padEnd(32, '0').substring(0, 32)), iv);
  
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  
  const authTag = cipher.getAuthTag();
  return iv.toString('hex') + ':' + authTag.toString('hex') + ':' + encrypted;
}

// Decrypt API key value
function decryptApiKey(encryptedText: string): string {
  const textParts = encryptedText.split(':');
  const iv = Buffer.from(textParts.shift()!, 'hex');
  const authTag = Buffer.from(textParts.shift()!, 'hex');
  const encryptedData = textParts.join(':');
  
  const decipher = crypto.createDecipheriv(ALGORITHM, Buffer.from(ENCRYPTION_KEY.padEnd(32, '0').substring(0, 32)), iv);
  decipher.setAuthTag(authTag);
  
  let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  
  return decrypted;
}

export interface ApiKeyData {
  id: string;
  provider: string;
  keyType: string;
  description?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateApiKeyData {
  provider: string;
  keyType: string;
  keyValue: string;
  description?: string;
}

export interface UpdateApiKeyData {
  keyValue?: string;
  description?: string;
  isActive?: boolean;
}

export class ApiKeyService {
  // Create a new API key for a user
  async createApiKey(userId: string, data: CreateApiKeyData): Promise<ApiKeyData> {
    const encryptedValue = encryptApiKey(data.keyValue);
    
    const apiKey = await prisma.apiKey.upsert({
      where: {
        userId_provider_keyType: {
          userId,
          provider: data.provider,
          keyType: data.keyType
        }
      },
      update: {
        keyValue: encryptedValue,
        description: data.description,
        isActive: true,
        updatedAt: new Date()
      },
      create: {
        userId,
        provider: data.provider,
        keyType: data.keyType,
        keyValue: encryptedValue,
        description: data.description,
        isActive: true
      },
      select: {
        id: true,
        provider: true,
        keyType: true,
        description: true,
        isActive: true,
        createdAt: true,
        updatedAt: true
      }
    });

    return apiKey;
  }

  // Get all API keys for a user (without revealing the actual key values)
  async getUserApiKeys(userId: string): Promise<ApiKeyData[]> {
    const apiKeys = await prisma.apiKey.findMany({
      where: { userId },
      select: {
        id: true,
        provider: true,
        keyType: true,
        description: true,
        isActive: true,
        createdAt: true,
        updatedAt: true
      },
      orderBy: [
        { provider: 'asc' },
        { keyType: 'asc' }
      ]
    });

    return apiKeys;
  }

  // Get decrypted API key value for OAuth service
  async getApiKeyValue(userId: string, provider: string, keyType: string): Promise<string | null> {
    const apiKey = await prisma.apiKey.findUnique({
      where: {
        userId_provider_keyType: {
          userId,
          provider,
          keyType
        }
      },
      select: {
        keyValue: true,
        isActive: true
      }
    });

    if (!apiKey || !apiKey.isActive) {
      return null;
    }

    try {
      return decryptApiKey(apiKey.keyValue);
    } catch (error) {
      console.error('Failed to decrypt API key:', error);
      return null;
    }
  }

  // Update an API key
  async updateApiKey(userId: string, provider: string, keyType: string, data: UpdateApiKeyData): Promise<ApiKeyData> {
    const updateData: any = {
      updatedAt: new Date()
    };

    if (data.keyValue !== undefined) {
      updateData.keyValue = encryptApiKey(data.keyValue);
    }
    if (data.description !== undefined) {
      updateData.description = data.description;
    }
    if (data.isActive !== undefined) {
      updateData.isActive = data.isActive;
    }

    const apiKey = await prisma.apiKey.update({
      where: {
        userId_provider_keyType: {
          userId,
          provider,
          keyType
        }
      },
      data: updateData,
      select: {
        id: true,
        provider: true,
        keyType: true,
        description: true,
        isActive: true,
        createdAt: true,
        updatedAt: true
      }
    });

    return apiKey;
  }

  // Delete an API key
  async deleteApiKey(userId: string, provider: string, keyType: string): Promise<void> {
    await prisma.apiKey.delete({
      where: {
        userId_provider_keyType: {
          userId,
          provider,
          keyType
        }
      }
    });
  }

  // Get provider configuration for OAuth using user's API keys
  async getProviderConfig(userId: string, provider: string) {
    const [clientId, clientSecret] = await Promise.all([
      this.getApiKeyValue(userId, provider, 'client_id'),
      this.getApiKeyValue(userId, provider, 'client_secret')
    ]);

    if (!clientId || !clientSecret) {
      return null;
    }

    return {
      clientId,
      clientSecret
    };
  }

  // Check if user has complete configuration for a provider
  async hasCompleteProviderConfig(userId: string, provider: string): Promise<boolean> {
    const config = await this.getProviderConfig(userId, provider);
    return config !== null;
  }

  // Get provider configurations that are ready for OAuth
  async getReadyProviders(userId: string): Promise<string[]> {
    const providers = ['slack', 'notion', 'google'];
    const readyProviders: string[] = [];

    for (const provider of providers) {
      if (await this.hasCompleteProviderConfig(userId, provider)) {
        readyProviders.push(provider);
      }
    }

    return readyProviders;
  }
}

export const apiKeyService = new ApiKeyService();