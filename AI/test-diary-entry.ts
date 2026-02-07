import * as dotenv from "dotenv";
import * as path from "path";

dotenv.config({ path: path.join(__dirname, "../.env.local") });

const API_KEY = process.env.BACKBOARD_API_KEY!;
const BASE_URL = "https://app.backboard.io/api";

async function test() {
  console.log("🧪 Testing Diary Entry (without LLM)\n");

  const threadId = "c7164b4c-de83-408e-ad6d-1fff701f8be0";

  // Try with send_to_llm: false
  const formData = new FormData();
  formData.append("content", "Monday, Feb 3: Had a great day working on the new feature. Solved a tricky bug!");
  formData.append("send_to_llm", "false");

  try {
    console.log("Sending diary entry with send_to_llm=false...");
    const response = await fetch(`${BASE_URL}/threads/${threadId}/messages`, {
      method: "POST",
      headers: {
        "X-API-Key": API_KEY,
      },
      body: formData,
    });

    console.log(`Status: ${response.status}`);
    const data = await response.json();

    if (response.ok) {
      console.log("✅ SUCCESS!");
      console.log("Response:", JSON.stringify(data, null, 2));

      if (data.status === "COMPLETED" && data.content) {
        console.log("\n⚠️  Note: LLM was triggered even with send_to_llm=false");
      } else {
        console.log("\n✅ Diary entry added without triggering LLM");
      }
    } else {
      console.log(`❌ Failed:`, JSON.stringify(data, null, 2));
    }
  } catch (error) {
    console.error("Error:", error);
  }
}

test();
