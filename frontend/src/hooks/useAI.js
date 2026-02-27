import { useState } from "react";
import { generateAI, improveGrammar } from "../services/aiApi";

const useAI = (quillRef, documentId) => {
  const [aiPrompt, setAiPrompt] = useState("");
  const [aiResponse, setAiResponse] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [grammarLoading, setGrammarLoading] = useState(false);

  const handleGenerateAI = async () => {
    if (!aiPrompt.trim()) return;

    setAiLoading(true);
    setAiResponse("");

    const quill = quillRef.current;
    const range = quill.getSelection();
    const selectedText = range ? quill.getText(range.index, range.length) : "";
    const fullText = quill.getText();

    try {
      const response = await generateAI(
        documentId,
        aiPrompt,
        fullText,
        selectedText,
      );
      setAiResponse(response);
    } catch (error) {
      console.error("Error generating AI response:", error);
    } finally {
      setAiLoading(false);
    }
  };

  const handleImproveGrammar = async () => {
    const quill = quillRef.current;
    const range = quill.getSelection();

    if (!range || range.length === 0) {
      alert("Please select text to improve grammar");
      return;
    }

    const selectedText = quill.getText(range.index, range.length);

    if (!selectedText.trim()) {
      alert("Please select some text first");
      return;
    }

    setGrammarLoading(true);

    try {
      const improvedText = await improveGrammar(selectedText);

      // Replace selected text with improved version
      quill.deleteText(range.index, range.length);
      quill.insertText(range.index, improvedText);
      quill.setSelection(range.index + improvedText.length);
    } catch (error) {
      console.error("Error improving grammar:", error);
      alert("Failed to improve grammar. Please try again.");
    } finally {
      setGrammarLoading(false);
    }
  };

  return {
    aiPrompt,
    setAiPrompt,
    aiResponse,
    setAiResponse,
    aiLoading,
    grammarLoading,
    handleGenerateAI,
    handleImproveGrammar,
  };
};

export { useAI };
