import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth';
import prisma from '../db/prisma';
import { SlackDataService } from '../services/slackDataService';
import { NotionDataService } from '../services/notionDataService';

export class DataSyncController {
  async syncSlackData(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const slackIntegration = await prisma.integration.findFirst({
        where: {
          userId,
          provider: 'slack',
          isActive: true
        }
      });

      if (!slackIntegration) {
        return res.status(404).json({ error: 'Slack integration not found or inactive' });
      }

      const slackService = new SlackDataService(slackIntegration.accessToken);
      
      const channelsResult = await slackService.syncAllChannels(userId);
      const filesResult = await slackService.syncFiles(userId);

      const channelCount = Array.isArray(channelsResult) ? channelsResult.length : 0;
      const fileCount = (filesResult as any)?.fileCount || 0;

      res.json({
        success: true,
        synced: channelCount + fileCount,
        details: {
          channels: channelCount,
          files: fileCount
        }
      });
    } catch (error) {
      console.error('Error syncing Slack data:', error);
      res.status(500).json({ error: 'Failed to sync Slack data' });
    }
  }

  async syncNotionData(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const notionIntegration = await prisma.integration.findFirst({
        where: {
          userId,
          provider: 'notion',
          isActive: true
        }
      });

      if (!notionIntegration) {
        return res.status(404).json({ error: 'Notion integration not found or inactive' });
      }

      const notionService = new NotionDataService(notionIntegration.accessToken);
      const result = await notionService.syncAll(userId);

      res.json(result);
    } catch (error) {
      console.error('Error syncing Notion data:', error);
      res.status(500).json({ error: 'Failed to sync Notion data' });
    }
  }

  async getSyncStatus(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const integrations = await prisma.integration.findMany({
        where: {
          userId,
          isActive: true
        },
        select: {
          id: true,
          provider: true,
          updatedAt: true,
          createdAt: true
        }
      });

      const memoryCount = await prisma.memory.count({
        where: { userId }
      });

      const memoryBySource = await prisma.memory.groupBy({
        by: ['source'],
        where: { userId },
        _count: {
          id: true
        }
      });

      res.json({
        integrations: integrations.map(integration => ({
          id: integration.id,
          provider: integration.provider,
          lastUpdated: integration.updatedAt,
          connectedAt: integration.createdAt
        })),
        memories: {
          total: memoryCount,
          bySource: memoryBySource.reduce((acc, item) => {
            if (item.source) {
              acc[item.source] = item._count.id;
            }
            return acc;
          }, {} as Record<string, number>)
        }
      });
    } catch (error) {
      console.error('Error getting sync status:', error);
      res.status(500).json({ error: 'Failed to get sync status' });
    }
  }
}

export const dataSyncController = new DataSyncController();