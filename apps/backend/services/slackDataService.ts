import prisma from '../db/prisma';

export interface SlackChannel {
  id: string;
  name: string;
  is_channel: boolean;
  is_group: boolean;
  is_im: boolean;
  created: number;
  creator: string;
  is_archived: boolean;
  is_general: boolean;
  unlinked: number;
  name_normalized: string;
  is_shared: boolean;
  is_org_shared: boolean;
  is_member: boolean;
  is_private: boolean;
  is_mpim: boolean;
  topic: {
    value: string;
    creator: string;
    last_set: number;
  };
  purpose: {
    value: string;
    creator: string;
    last_set: number;
  };
  num_members?: number;
}

export interface SlackMessage {
  type: string;
  subtype?: string;
  ts: string;
  user?: string;
  text: string;
  blocks?: any[];
  attachments?: any[];
  files?: any[];
  thread_ts?: string;
  reply_count?: number;
  replies?: any[];
  reactions?: any[];
}

export interface SlackUser {
  id: string;
  team_id: string;
  name: string;
  deleted: boolean;
  color: string;
  real_name: string;
  tz: string;
  tz_label: string;
  tz_offset: number;
  profile: {
    title: string;
    phone: string;
    skype: string;
    real_name: string;
    real_name_normalized: string;
    display_name: string;
    display_name_normalized: string;
    fields: any;
    status_text: string;
    status_emoji: string;
    status_expiration: number;
    avatar_hash: string;
    email: string;
    first_name: string;
    last_name: string;
    image_24: string;
    image_32: string;
    image_48: string;
    image_72: string;
    image_192: string;
    image_512: string;
  };
  is_admin: boolean;
  is_owner: boolean;
  is_primary_owner: boolean;
  is_restricted: boolean;
  is_ultra_restricted: boolean;
  is_bot: boolean;
  updated: number;
  is_app_user: boolean;
}

export class SlackDataService {
  private accessToken: string;

  constructor(accessToken: string) {
    this.accessToken = accessToken;
  }

  private async makeSlackRequest(endpoint: string, params: Record<string, any> = {}) {
    const url = new URL(`https://slack.com/api/${endpoint}`);
    Object.keys(params).forEach(key => {
      if (params[key] !== undefined) {
        url.searchParams.append(key, params[key].toString());
      }
    });

    const response = await fetch(url.toString(), {
      headers: {
        'Authorization': `Bearer ${this.accessToken}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`Slack API error: ${response.statusText}`);
    }

    const data = await response.json() as any;
    
    if (!data.ok) {
      throw new Error(`Slack API error: ${data.error}`);
    }

    return data;
  }

  async getChannels(): Promise<SlackChannel[]> {
    const data = await this.makeSlackRequest('conversations.list', {
      types: 'public_channel,private_channel',
      exclude_archived: false,
      limit: 1000
    });
    
    return (data as any).channels || [];
  }

  async getChannelHistory(channelId: string, oldest?: string, limit: number = 1000): Promise<SlackMessage[]> {
    const params: any = {
      channel: channelId,
      limit,
      inclusive: true
    };
    
    if (oldest) {
      params.oldest = oldest;
    }

    const data = await this.makeSlackRequest('conversations.history', params);
    return (data as any).messages || [];
  }

  async getUsers(): Promise<SlackUser[]> {
    const data = await this.makeSlackRequest('users.list', {
      limit: 1000
    });
    
    return (data as any).members || [];
  }

  async getTeamInfo() {
    return await this.makeSlackRequest('team.info');
  }

  async getFiles(count: number = 1000) {
    return await this.makeSlackRequest('files.list', {
      count,
      types: 'all'
    });
  }

  async searchMessages(query: string, count: number = 100) {
    return await this.makeSlackRequest('search.messages', {
      query,
      count,
      sort: 'timestamp'
    });
  }

  async syncChannelData(userId: string, channelId: string, channelName: string) {
    try {
      const messages = await this.getChannelHistory(channelId);
      const users = await this.getUsers();
      const userMap = new Map(users.map(user => [user.id, user]));

      for (const message of messages) {
        if (message.type === 'message' && message.text) {
          const user = userMap.get(message.user || '');
          const memoryId = `slack_${channelId}_${message.ts}`;
          
          const existingMemory = await prisma.memory.findFirst({
            where: {
              userId,
              source: 'slack',
              metadata: {
                path: ['externalId'],
                equals: memoryId
              }
            }
          });

          const memoryData = {
            userId,
            title: `Slack message in #${channelName}`,
            content: message.text,
            source: 'slack',
            metadata: {
              platform: 'slack',
              channel: channelName,
              channelId,
              timestamp: message.ts,
              externalId: memoryId,
              user: user ? {
                id: user.id,
                name: user.real_name || user.name,
                email: user.profile?.email
              } : null,
              threadTs: message.thread_ts,
              reactions: message.reactions,
              files: message.files,
              attachments: message.attachments
            }
          };

          if (existingMemory) {
            await prisma.memory.update({
              where: { id: existingMemory.id },
              data: {
                content: message.text,
                metadata: memoryData.metadata,
                updatedAt: new Date()
              }
            });
          } else {
            await prisma.memory.create({
              data: memoryData
            });
          }
        }
      }

      return { success: true, messageCount: messages.length };
    } catch (error) {
      console.error('Error syncing Slack channel data:', error);
      throw error;
    }
  }

  async syncAllChannels(userId: string) {
    try {
      const channels = await this.getChannels();
      const results = [];

      for (const channel of channels) {
        if (!channel.is_archived && channel.is_member) {
          const result = await this.syncChannelData(userId, channel.id, channel.name);
          results.push({
            channelId: channel.id,
            channelName: channel.name,
            ...result
          });
        }
      }

      return results;
    } catch (error) {
      console.error('Error syncing all Slack channels:', error);
      throw error;
    }
  }

  async syncFiles(userId: string) {
    try {
      const filesData = await this.getFiles();
      const files = (filesData as any)?.files || [];

      for (const file of files) {
        if (file.mimetype && file.mimetype.startsWith('text/')) {
          const fileMemoryId = `slack_file_${file.id}`;
          
          const existingFileMemory = await prisma.memory.findFirst({
            where: {
              userId,
              source: 'slack',
              metadata: {
                path: ['externalId'],
                equals: fileMemoryId
              }
            }
          });

          const fileMemoryData = {
            userId,
            title: file.name,
            content: file.preview || file.preview_highlight || '',
            source: 'slack',
            metadata: {
              platform: 'slack',
              fileType: 'file',
              mimetype: file.mimetype,
              size: file.size,
              url: file.url_private,
              created: file.created,
              user: file.user,
              externalId: fileMemoryId
            }
          };

          if (existingFileMemory) {
            await prisma.memory.update({
              where: { id: existingFileMemory.id },
              data: {
                title: file.name,
                content: file.preview || file.preview_highlight || '',
                metadata: fileMemoryData.metadata,
                updatedAt: new Date()
              }
            });
          } else {
            await prisma.memory.create({
              data: fileMemoryData
            });
          }
        }
      }

      return { success: true, fileCount: files.length };
    } catch (error) {
      console.error('Error syncing Slack files:', error);
      throw error;
    }
  }
}