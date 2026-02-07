import * as dotenv from "dotenv";
import * as path from "path";

dotenv.config({ path: path.join(__dirname, "../.env.local") });

const API_KEY = process.env.BACKBOARD_API_KEY!;
const BASE_URL = "https://app.backboard.io/api";

async function test() {
  console.log("🧪 Testing Form-Data Format\n");

  const threadId = "c7164b4c-de83-408e-ad6d-1fff701f8be0";

  // Try with FormData
  const formData = new FormData();
  formData.append("text", "Hello from form data test");
  formData.append("send_to_llm", "false");

  try {
    console.log("Testing with FormData (text field)...");
    const response = await fetch(`${BASE_URL}/threads/${threadId}/messages`, {
      method: "POST",
      headers: {
        "X-API-Key": API_KEY,
        // Don't set Content-Type - let fetch set it with boundary
      },
      body: formData,
    });

    console.log(`Status: ${response.status}`);

    if (response.ok) {
      const data = await response.json();
      console.log("✅ SUCCESS! FormData works!");
      console.log("Response:", JSON.stringify(data, null, 2));
    } else {
      const error = await response.text();
      console.log(`❌ Failed:`, error);
    }
  } catch (error) {
    console.error("Error:", error);
  }

  // Try with content field
  const formData2 = new FormData();
  formData2.append("content", "Hello from form data with content field");

  try {
    console.log("\nTesting with FormData (content field)...");
    const response = await fetch(`${BASE_URL}/threads/${threadId}/messages`, {
      method: "POST",
      headers: {
        "X-API-Key": API_KEY,
      },
      body: formData2,
    });

    console.log(`Status: ${response.status}`);

    if (response.ok) {
      const data = await response.json();
      console.log("✅ SUCCESS! FormData works!");
      console.log("Response:", JSON.stringify(data, null, 2));
    } else {
      const error = await response.text();
      console.log(`❌ Failed:`, error);
    }
  } catch (error) {
    console.error("Error:", error);
  }
}

test();
