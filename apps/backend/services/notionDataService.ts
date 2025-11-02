import prisma from '../db/prisma';

export interface NotionPage {
  id: string;
  created_time: string;
  last_edited_time: string;
  cover?: {
    type: string;
    file?: { url: string };
    external?: { url: string };
  };
  icon?: {
    type: string;
    emoji?: string;
    file?: { url: string };
    external?: { url: string };
  };
  parent: {
    type: string;
    database_id?: string;
    page_id?: string;
  };
  archived: boolean;
  properties: Record<string, any>;
  url: string;
}

export interface NotionDatabase {
  id: string;
  created_time: string;
  last_edited_time: string;
  title: Array<{
    type: string;
    text: { content: string };
  }>;
  description: Array<{
    type: string;
    text: { content: string };
  }>;
  properties: Record<string, any>;
  parent: {
    type: string;
    page_id?: string;
  };
  url: string;
  archived: boolean;
}

export interface NotionBlock {
  id: string;
  type: string;
  created_time: string;
  last_edited_time: string;
  has_children: boolean;
  archived: boolean;
  [key: string]: any;
}

export class NotionDataService {
  private accessToken: string;
  private notionVersion = '2022-06-28';

  constructor(accessToken: string) {
    this.accessToken = accessToken;
  }

  private async makeNotionRequest(endpoint: string, options?: RequestInit): Promise<any> {
    const url = `https://api.notion.com/v1/${endpoint}`;
    
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${this.accessToken}`,
        'Notion-Version': this.notionVersion,
        'Content-Type': 'application/json',
        ...options?.headers
      },
      ...options
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({})) as any;
      throw new Error(`Notion API error: ${response.status} - ${errorData.message || response.statusText}`);
    }

    return await response.json();
  }

  async getDatabases(): Promise<NotionDatabase[]> {
    const data = await this.makeNotionRequest('search', {
      method: 'POST',
      body: JSON.stringify({
        filter: {
          value: 'database',
          property: 'object'
        },
        page_size: 100
      })
    });
    
    return (data as any).results || [];
  }

  async getPages(): Promise<NotionPage[]> {
    const data = await this.makeNotionRequest('search', {
      method: 'POST',
      body: JSON.stringify({
        filter: {
          value: 'page',
          property: 'object'
        },
        page_size: 100
      })
    });
    
    return (data as any).results || [];
  }

  async getPageContent(pageId: string): Promise<NotionBlock[]> {
    const data = await this.makeNotionRequest(`blocks/${pageId}/children`);
    return (data as any).results || [];
  }

  async getDatabasePages(databaseId: string): Promise<NotionPage[]> {
    const data = await this.makeNotionRequest(`databases/${databaseId}/query`, {
      method: 'POST',
      body: JSON.stringify({
        page_size: 100
      })
    });
    
    return (data as any).results || [];
  }

  private extractTextFromBlocks(blocks: NotionBlock[]): string {
    return blocks.map(block => {
      switch (block.type) {
        case 'paragraph':
          return this.extractRichText(block.paragraph?.rich_text || []);
        case 'heading_1':
          return this.extractRichText(block.heading_1?.rich_text || []);
        case 'heading_2':
          return this.extractRichText(block.heading_2?.rich_text || []);
        case 'heading_3':
          return this.extractRichText(block.heading_3?.rich_text || []);
        case 'bulleted_list_item':
          return '• ' + this.extractRichText(block.bulleted_list_item?.rich_text || []);
        case 'numbered_list_item':
          return '1. ' + this.extractRichText(block.numbered_list_item?.rich_text || []);
        case 'to_do':
          const checked = block.to_do?.checked ? '[x]' : '[ ]';
          return `${checked} ${this.extractRichText(block.to_do?.rich_text || [])}`;
        case 'quote':
          return '> ' + this.extractRichText(block.quote?.rich_text || []);
        case 'code':
          return '```\n' + this.extractRichText(block.code?.rich_text || []) + '\n```';
        default:
          return '';
      }
    }).filter(text => text.trim()).join('\n');
  }

  private extractRichText(richText: any[]): string {
    return richText.map(item => item.text?.content || '').join('');
  }

  private extractPageTitle(page: NotionPage): string {
    const titleProperty = Object.values(page.properties || {}).find(
      (prop: any) => prop.type === 'title'
    ) as any;
    
    if (titleProperty && titleProperty.title) {
      return this.extractRichText(titleProperty.title);
    }
    
    return 'Untitled';
  }

  private extractDatabaseTitle(database: NotionDatabase): string {
    return database.title.map(item => item.text?.content || '').join('') || 'Untitled Database';
  }

  async syncDatabases(userId: string) {
    try {
      const databases = await this.getDatabases();

      for (const database of databases) {
        const databaseMemoryId = `notion_database_${database.id}`;
        
        const existingMemory = await prisma.memory.findFirst({
          where: {
            userId,
            source: 'notion',
            metadata: {
              path: ['externalId'],
              equals: databaseMemoryId
            }
          }
        });

        const title = this.extractDatabaseTitle(database);
        const description = database.description?.map(item => item.text?.content || '').join('') || '';
        
        const memoryData = {
          userId,
          title: `Notion Database: ${title}`,
          content: description,
          source: 'notion',
          metadata: {
            platform: 'notion',
            type: 'database',
            databaseId: database.id,
            externalId: databaseMemoryId,
            properties: Object.keys(database.properties || {}),
            created: database.created_time,
            lastEdited: database.last_edited_time,
            url: database.url,
            archived: database.archived
          }
        };

        if (existingMemory) {
          await prisma.memory.update({
            where: { id: existingMemory.id },
            data: {
              title: memoryData.title,
              content: memoryData.content,
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

      return { success: true, synced: databases.length };
    } catch (error) {
      console.error('Error syncing Notion databases:', error);
      return { success: false, error };
    }
  }

  async syncPages(userId: string) {
    try {
      const pages = await this.getPages();

      for (const page of pages) {
        const pageMemoryId = `notion_page_${page.id}`;
        
        const existingMemory = await prisma.memory.findFirst({
          where: {
            userId,
            source: 'notion',
            metadata: {
              path: ['externalId'],
              equals: pageMemoryId
            }
          }
        });

        const title = this.extractPageTitle(page);
        const blocks = await this.getPageContent(page.id);
        const content = this.extractTextFromBlocks(blocks);
        
        const memoryData = {
          userId,
          title: `Notion Page: ${title}`,
          content,
          source: 'notion',
          metadata: {
            platform: 'notion',
            type: 'page',
            pageId: page.id,
            externalId: pageMemoryId,
            created: page.created_time,
            lastEdited: page.last_edited_time,
            url: page.url,
            archived: page.archived,
            hasChildren: blocks.some(block => block.has_children),
            blockCount: blocks.length
          }
        };

        if (existingMemory) {
          await prisma.memory.update({
            where: { id: existingMemory.id },
            data: {
              title: memoryData.title,
              content: memoryData.content,
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

      return { success: true, synced: pages.length };
    } catch (error) {
      console.error('Error syncing Notion pages:', error);
      return { success: false, error };
    }
  }

  async syncDatabasePages(userId: string, databaseId: string) {
    try {
      const pages = await this.getDatabasePages(databaseId);

      for (const page of pages) {
        const pageMemoryId = `notion_dbpage_${page.id}`;
        
        const existingMemory = await prisma.memory.findFirst({
          where: {
            userId,
            source: 'notion',
            metadata: {
              path: ['externalId'],
              equals: pageMemoryId
            }
          }
        });

        const title = this.extractPageTitle(page);
        const blocks = await this.getPageContent(page.id);
        const content = this.extractTextFromBlocks(blocks);
        
        const memoryData = {
          userId,
          title: `Notion DB Page: ${title}`,
          content,
          source: 'notion',
          metadata: {
            platform: 'notion',
            type: 'database_page',
            pageId: page.id,
            databaseId,
            externalId: pageMemoryId,
            properties: page.properties,
            created: page.created_time,
            lastEdited: page.last_edited_time,
            url: page.url,
            archived: page.archived,
            blockCount: blocks.length
          }
        };

        if (existingMemory) {
          await prisma.memory.update({
            where: { id: existingMemory.id },
            data: {
              title: memoryData.title,
              content: memoryData.content,
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

      return { success: true, synced: pages.length };
    } catch (error) {
      console.error('Error syncing Notion database pages:', error);
      return { success: false, error };
    }
  }

  async syncAll(userId: string) {
    try {
      const [databasesResult, pagesResult] = await Promise.all([
        this.syncDatabases(userId),
        this.syncPages(userId)
      ]);

      const totalSynced = (databasesResult.synced || 0) + (pagesResult.synced || 0);
      
      return {
        success: databasesResult.success && pagesResult.success,
        synced: totalSynced,
        databases: databasesResult.synced || 0,
        pages: pagesResult.synced || 0
      };
    } catch (error) {
      console.error('Error syncing all Notion content:', error);
      return { success: false, error };
    }
  }
}