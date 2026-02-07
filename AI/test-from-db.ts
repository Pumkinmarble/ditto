/**
 * Test Echo AI with data from Supabase database
 *
 * Usage:
 *   1. Make sure you have BACKBOARD_API_KEY, SUPABASE_URL, and SUPABASE_SECRET_KEY in .env.local
 *   2. Update USER_ID with a valid user ID from your database
 *   3. Run: npm run ai:test-db
 */

import * as dotenv from 'dotenv';
import * as path from 'path';
import * as fs from 'fs/promises';
import { EchoFromDB } from './echo-from-db';

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env.local') });

async function main() {
  console.log('🚀 Echo AI Digital Twin - Database Test\n');

  // Check for required environment variables
  const backboardApiKey = process.env.BACKBOARD_API_KEY;
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SECRET_KEY;

  if (!backboardApiKey || !supabaseUrl || !supabaseServiceKey) {
    console.error('❌ Error: Missing required environment variables');
    console.error('   Required: BACKBOARD_API_KEY, NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SECRET_KEY');
    process.exit(1);
  }

  // User ID from Supabase database
  const userId = '7b00293f-e578-4f31-817b-3374994855d5';

  try {
    // Initialize Echo from database
    const echoFromDB = new EchoFromDB({
      backboardApiKey,
      supabaseUrl,
      supabaseServiceKey,
      userId,
      outputDir: path.join(__dirname, 'output'),
    });

    // Save data to files (optional, for debugging)
    console.log('💾 Saving personality and diary data to files...');
    const { personalityPath, diaryPath } = await echoFromDB.saveToFiles();
    console.log(`✅ Saved to:`);
    console.log(`   - ${personalityPath}`);
    console.log(`   - ${diaryPath}\n`);

    // Initialize Echo service
    const { assistantId, threadId } = await echoFromDB.initialize();

    // Ask test questions
    console.log('💬 Testing queries...\n');
    console.log('='.repeat(60));

    const questions = [
      'Tell me about yourself - what are your core values?',
      'What do you think is most important in life?',
      'Can you share a recent experience that was meaningful to you?',
    ];

    const testResults: Array<{ question: string; response: string }> = [];

    for (const question of questions) {
      console.log(`\n❓ Question: ${question}`);
      const response = await echoFromDB.ask(question);
      console.log(`💬 Response: ${response}\n`);
      testResults.push({ question, response });
    }

    console.log('='.repeat(60));

    // Save results to file
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
    const outputPath = path.join(__dirname, 'output', `test-results-${timestamp}.txt`);

    let outputContent = `ECHO AI TEST RESULTS\n`;
    outputContent += `Generated: ${new Date().toISOString()}\n`;
    outputContent += `User ID: ${userId}\n`;
    outputContent += `Assistant ID: ${assistantId}\n`;
    outputContent += `Thread ID: ${threadId}\n`;
    outputContent += `\n${'='.repeat(60)}\n\n`;

    testResults.forEach((qa, index) => {
      outputContent += `Q${index + 1}: ${qa.question}\n\n`;
      outputContent += `${qa.response}\n\n`;
      if (index < testResults.length - 1) {
        outputContent += `${'-'.repeat(60)}\n\n`;
      }
    });

    await fs.writeFile(outputPath, outputContent, 'utf-8');

    console.log(`\n📄 Results saved to: ${outputPath}`);
    console.log('\n✅ Test completed successfully!');
    console.log('\n📌 Save these IDs to resume this session later:');
    console.log(`   Assistant ID: ${assistantId}`);
    console.log(`   Thread ID: ${threadId}`);

  } catch (error) {
    console.error('\n❌ Test failed:', error);
    process.exit(1);
  }
}

// Run the test
main();
