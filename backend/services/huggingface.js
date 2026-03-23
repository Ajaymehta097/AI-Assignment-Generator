// services/huggingface.js
const fetch = require("node-fetch");
require("dotenv").config();

const HF_API_TOKEN = process.env.HF_API_TOKEN;

// New HF router URL — use /v1/chat/completions with model:provider suffix
// ":cerebras" is a fast free provider. Other options: ":together", ":fireworks-ai"
const MODEL_ID = "meta-llama/Llama-3.1-8B-Instruct:cerebras";
const HF_INFERENCE_URL = "https://router.huggingface.co/v1/chat/completions";

async function generateAssignment(assignmentText, studentName, enrollmentNumber) {
  if (!HF_API_TOKEN) {
    throw new Error("HF_API_TOKEN is not set in .env file");
  }

  const requestBody = {
    model: MODEL_ID,
    messages: [
  {
    role: "system",
    content: `You are an expert academic assignment writer. Follow these rules strictly:

1. For each question use heading: ## Q1. [question title]
2. Write detailed THEORY first under the heading "### Theory"
3. If the question involves programming/code, add a section "### Code" with the code block
4. For code use triple backticks with language name: \`\`\`python or \`\`\`java etc.
5. After code, add "### Output" section showing expected output
6. For sub-sections use: ### [section name]
7. For bullet points use: - item
8. For numbered points use: 1. item
9. Leave blank line between sections
10. Do NOT write "Sure" or any intro — go straight to ## Q1.`
  },
  {
    role: "user",
    content: `Student Name: ${studentName}
Enrollment Number: ${enrollmentNumber}

Assignment Questions:
"""
${assignmentText}
"""

Write the complete assignment. For every question:
- First write full theory explanation
- Then write working code if applicable
- Then show expected output

Start directly with ## Q1.`
  }
],
    max_tokens: 2048,
    temperature: 0.7,
    stream: false,
  };

  console.log(`[HF] Calling: ${MODEL_ID}`);

  const response = await fetch(HF_INFERENCE_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${HF_API_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(requestBody),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    console.error("[HF] API Error:", response.status, errorBody);
    if (response.status === 401) throw new Error("Invalid Hugging Face API token.");
    if (response.status === 429) throw new Error("Rate limit hit. Please wait and try again.");
    throw new Error(`Hugging Face API returned ${response.status}: ${errorBody}`);
  }

  const data = await response.json();
  const generatedText = data?.choices?.[0]?.message?.content;

  if (!generatedText) {
    console.error("[HF] Unexpected response:", JSON.stringify(data));
    throw new Error("No generated text in Hugging Face API response");
  }

  console.log(`[HF] Generated ${generatedText.length} characters`);
  return generatedText.trim();
}

module.exports = { generateAssignment };