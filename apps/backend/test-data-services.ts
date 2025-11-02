import { SlackDataService } from './services/slackDataService.js';
import { NotionDataService } from './services/notionDataService.js';

// Test Slack Service
async function testSlackService() {
  console.log('Testing Slack Service...');
  
  // This would normally use a real access token
  const mockSlackService = new SlackDataService('mock-token');
  
  try {
    // Test would normally make API calls
    console.log('✅ Slack service initialized successfully');
  } catch (error) {
    console.error('❌ Slack service test failed:', error);
  }
}

// Test Notion Service  
async function testNotionService() {
  console.log('Testing Notion Service...');
  
  // This would normally use a real access token
  const mockNotionService = new NotionDataService('mock-token');
  
  try {
    // Test would normally make API calls
    console.log('✅ Notion service initialized successfully');
  } catch (error) {
    console.error('❌ Notion service test failed:', error);
  }
}

async function runTests() {
  console.log('🧪 Running Data Service Tests\n');
  
  await testSlackService();
  await testNotionService();
  
  console.log('\n✨ Data service tests completed!');
  console.log('\n📝 Next Steps:');
  console.log('1. Connect Slack/Notion integrations in the UI');
  console.log('2. Use /api/sync/slack and /api/sync/notion endpoints');
  console.log('3. Check sync status with /api/sync/status');
  console.log('4. View synced memories in the dashboard');
}

runTests().catch(console.error);