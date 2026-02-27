import dotenv from "dotenv";
import Document from "../models/document.model.js";

dotenv.config();

const AI_API_KEY = process.env.AI_API_KEY;
const url = "https://openrouter.ai/api/v1/chat/completions";

const callAI = async (prompt) => {
  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${AI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "openai/gpt-4o-mini",
        messages: [{ role: "user", content: prompt }],
      }),
    });
    if (!response.ok) {
      throw new Error("Failed to call AI");
    }

    const data = await response.json();
    if (!data) {
      throw new Error("No data returned from AI");
    }

    const content = data?.choices?.[0]?.message?.content;
    if (!content) {
      throw new Error("No content returned from AI");
    }
    return content;
  } catch (error) {
    console.error("Error calling AI:", error);
    throw error;
  }
};

const generateAIContent = async (instruction, selectedText, fullText) => {
  if (!instruction) {
    throw new Error("Instruction is required");
  }

  const trimmedText = (fullText || "").slice(0, 5000); // Limit to 5000 characters

  const prompt = `You are an AI writing assistant.

Here is the document content:

${trimmedText}

User instruction:
${instruction}

${selectedText ? `Selected text:\n${selectedText}` : ""}

Respond with improved or generated text only.
Do not explain.
`;

  const aiResponse = await callAI(prompt);
  return aiResponse;
};

const generateImprovedGrammar = async (text) => {
  if (!text) {
    throw new Error("Text is required for grammar improvement");
  }

  const prompt = `You are a grammar assistant. Improve the grammar of the following text while keeping the original meaning. Return only the improved text without any explanations or extra content.\n\nText: ${text}`;

  const aiResponse = await callAI(prompt);
  return aiResponse;
};

const generateAIContentForDocument = async (documentId, goal) => {
  if (!documentId || !goal) {
    throw new Error("Document ID and goal are required");
  }

  const document = await Document.findById(documentId);
  if (!document) {
    throw new Error("Document not found");
  }

  const prompt = `You are a document assistant. The current content of the document is:\n\n${document.content}\n\nBased on the following goal, generate additional content to enhance the document. Return only the new content without any headings, markdown, or extra text.\n\nGoal: ${goal}`;

  const aiResponse = await callAI(prompt);
  return aiResponse;
};

export {
  generateAIContent,
  generateImprovedGrammar,
  generateAIContentForDocument,
};
