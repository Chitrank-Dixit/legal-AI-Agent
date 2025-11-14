import { GoogleGenAI } from "@google/genai";

// It's assumed that process.env.API_KEY is available in the execution environment.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
const model = 'gemini-2.5-flash';

export async function askWithContext(context: string, query: string): Promise<string> {
  if (!context) {
    throw new Error("Context is empty. Please upload files first.");
  }
  if (!query) {
    throw new Error("Query is empty. Please enter a question.");
  }

  const prompt = `
You are a highly specialized legal assistant. Your purpose is to analyze the provided legal documents and formulate concise resolutions and remedies based strictly on the information contained within them.

**Instructions:**
1.  **Strictly Adhere to the Context:** Base your entire response on the text provided in the 'CONTEXT' section below. Do not use any external knowledge, personal opinions, or information not present in the documents.
2.  **Identify Relevant Information:** Carefully scan the context to find passages, clauses, or facts that directly address the user's question about legal remedies.
3.  **Formulate a Resolution:** Synthesize the identified information into a clear and concise resolution or answer. If the documents mention specific steps, remedies, or actions, present them clearly. Quote relevant sections when it adds clarity, but do not simply copy large blocks of text.
4.  **Handle Missing Information:** If a resolution or answer to the question cannot be found within the provided context, you MUST state: "Based on the provided documents, I cannot find a resolution for this question." Do not speculate or attempt to infer information that isn't explicitly stated.
5.  **Language:** Respond in the same language as the user's question.

--- CONTEXT START ---
${context}
--- CONTEXT END ---

User's Question: "${query}"

Legal Resolution:`;

  try {
    const response = await ai.models.generateContent({
      model: model,
      contents: prompt,
    });
    return response.text;
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    if (error instanceof Error) {
        return `An error occurred while communicating with the AI: ${error.message}`;
    }
    return "An unknown error occurred while communicating with the AI.";
  }
}

export async function summarizeChat(chatHistory: string, language: string): Promise<string> {
    if (!chatHistory) {
        throw new Error("Chat history is empty.");
    }

    const prompt = `
You are a summarization expert. Your task is to read the following chat conversation between a "User" and an "AI Assistant" and provide a brief, neutral summary. The summary should capture the main questions asked by the user and the key information or resolutions provided by the assistant.

**Instructions:**
1. Keep the summary concise (2-4 sentences is ideal).
2. Do not add any new information or your own opinions.
3. Base the summary strictly on the conversation provided.
4. Provide the summary in the following language: ${language}.

--- CHAT HISTORY START ---
${chatHistory}
--- CHAT HISTORY END ---

Summary:`;

    try {
        const response = await ai.models.generateContent({
            model: model,
            contents: prompt,
        });
        return response.text;
    } catch (error) {
        console.error("Error calling Gemini API for summarization:", error);
        if (error instanceof Error) {
            return `An error occurred while summarizing the chat: ${error.message}`;
        }
        return "An unknown error occurred while summarizing the chat.";
    }
}
