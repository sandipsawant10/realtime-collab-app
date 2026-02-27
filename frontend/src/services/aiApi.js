import axios from "axios";

const url = `${import.meta.env.VITE_API_URL}/ai/generate-content`;

const axiosInstance = axios.create({
  baseURL: url,
  headers: {
    "Content-Type": "application/json",
  },
});

const generateAI = async (documentId, instruction, fullText, selectedText) => {
  const token = localStorage.getItem("token");
  const response = await axiosInstance.post(
    "",
    { documentId, instruction, fullText, selectedText },
    token ? { headers: { Authorization: `Bearer ${token}` } } : undefined,
  );

  return response.data?.content || "";
};

const improveGrammar = async (text) => {
  const token = localStorage.getItem("token");
  const grammarUrl = `${import.meta.env.VITE_API_URL}/ai/improve-grammar`;

  const response = await axios.post(
    grammarUrl,
    { text },
    token ? { headers: { Authorization: `Bearer ${token}` } } : undefined,
  );

  return response.data?.improvedText || "";
};

export { generateAI, improveGrammar };
