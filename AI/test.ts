/**
 * Test script for Echo AI Digital Twin
 *
 * Usage:
 *   1. Make sure you have your BACKBOARD_API_KEY in .env.local
 *   2. Run: npm run ai:test
 */

import * as dotenv from "dotenv";
import * as path from "path";
import { EchoService } from "./echo-service";
import * as fs from "fs/promises";

// Load environment variables
dotenv.config({ path: path.join(__dirname, "../.env.local") });

async function main() {
  console.log("🚀 Echo AI Digital Twin - Test Script\n");

  // Check for API key
  const apiKey = process.env.BACKBOARD_API_KEY;
  if (!apiKey) {
    console.error("❌ Error: BACKBOARD_API_KEY not found in .env.local");
    process.exit(1);
  }

  // Array to store all Q&A for the output file
  const testResults: Array<{ question: string; response: string }> = [];

  try {
    // Initialize Echo service
    const echo = new EchoService({ apiKey });

    // Step 1: Load personality quiz
    console.log("📋 Step 1: Loading personality quiz...");
    const personalityPath = path.join(__dirname, "examples/personality-quiz.txt");
    const personalityText = await fs.readFile(personalityPath, "utf-8");

    // Initialize with personality
    await echo.initialize(personalityText);

    // Step 2: Upload diary entries
    console.log("\n📝 Step 2: Uploading diary entries...");
    const diaryPath = path.join(__dirname, "examples/diary-entries.txt");
    await echo.uploadDiaryEntriesFromFile(diaryPath);

    // Step 3: Ask questions!
    console.log("\n💬 Step 3: Testing queries...\n");
    console.log("=" .repeat(60));

    // Helper function to ask and store
    async function askAndStore(question: string) {
      console.log(`\n❓ Question: ${question}`);
      const response = await echo.ask(question);
      console.log(`💬 Response: ${response}\n`);
      testResults.push({ question, response });
    }

    // Question 1 - Test emotional personality
    await askAndStore("What do you think about family relationships and forgiveness?");

    // Question 2 - Test empathy and emotional connection
    await askAndStore("What do you think about working with vulnerable people, like children in shelters?");

    // Question 3 - THE KEY TEST: Animals & Climate (should reflect emotional diary views)
    await askAndStore("What do you think about animals and climate change?");

    // Question 4 - Test emotional vs logical decision-making
    await askAndStore("What do you think about making decisions based on feelings versus logic?");

    // Question 5 - Test if it references specific diary content
    await askAndStore("Tell me about a recent experience that moved you emotionally.");

    // Question 6 - Test consistency of emotional worldview
    await askAndStore("What do you think the world needs most right now?");

    console.log("=" .repeat(60));

    // Save IDs for future use
    const { assistantId, threadId } = echo.getIds();
    console.log("\n📌 Save these IDs to resume this session later:");
    console.log(`   Assistant ID: ${assistantId}`);
    console.log(`   Thread ID: ${threadId}`);

    // Step 4: Save results to file
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-").slice(0, -5);
    const outputPath = path.join(__dirname, `test-results-${timestamp}.txt`);

    // Clean format for text-to-speech (ElevenLabs)
    let outputContent = "";

    // Add each Q&A in a natural conversational format
    testResults.forEach((qa, index) => {
      outputContent += `${qa.question}\n\n`;
      outputContent += `${qa.response}\n\n`;

      // Add a natural pause between Q&A pairs (but not after the last one)
      if (index < testResults.length - 1) {
        outputContent += `\n`;
      }
    });

    // Write to file
    await fs.writeFile(outputPath, outputContent, "utf-8");

    console.log(`\n📄 Results saved to: ${outputPath}`);
    console.log("\n✅ Test completed successfully!");

  } catch (error) {
    console.error("\n❌ Test failed:", error);
    process.exit(1);
  }
}

// Run the test
main();
