import Document from "../models/document.model.js";
import {
  generateAIContent,
  generateImprovedGrammar,
  generateAIContentForDocument,
} from "../utils/aiClient.js";

const generateContent = async (req, res) => {
  try {
    const { documentId, instruction, selectedText, fullText } = req.body;

    if (!instruction || !documentId) {
      return res
        .status(400)
        .json({ error: "Instruction and documentId are required" });
    }

    const document = await Document.findById(documentId);
    if (!document) {
      return res.status(404).json({ error: "Document not found" });
    }

    if (
      document.owner.toString() !== req.user._id.toString() &&
      !document.collaborators.includes(req.user._id)
    ) {
      return res
        .status(403)
        .json({ error: "You do not have access to this document" });
    }

    const content = await generateAIContent(
      instruction,
      selectedText,
      fullText,
    );

    return res.json({ content });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const improveGrammar = async (req, res) => {
  try {
    const { text } = req.body;

    if (!text) {
      return res.status(400).json({ error: "Text is required" });
    }

    const improvedText = await generateImprovedGrammar(text);

    return res.json({ improvedText });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const generateContentForDocument = async (req, res) => {
  try {
    const { documentId, goal } = req.body;

    if (!documentId || !goal) {
      return res
        .status(400)
        .json({ error: "Document ID and goal are required" });
    }

    const document = await Document.findById(documentId);
    if (!document) {
      return res.status(404).json({ error: "Document not found" });
    }

    if (
      document.owner.toString() !== req.user._id.toString() &&
      !document.collaborators.includes(req.user._id)
    ) {
      return res
        .status(403)
        .json({ error: "You do not have access to this document" });
    }

    const content = await generateAIContentForDocument(documentId, goal);

    return res.json({ content });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export { generateContent, improveGrammar, generateContentForDocument };
