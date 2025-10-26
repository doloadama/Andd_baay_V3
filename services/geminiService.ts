import { GoogleGenAI, Modality } from "@google/genai";

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  console.warn("Gemini API key not found. Please set the API_KEY environment variable.");
}

export const ai = new GoogleGenAI({ apiKey: API_KEY! });

export const generateDescription = async (prompt: string): Promise<string> => {
  if (!API_KEY) return "API Key not configured. Please check your environment variables.";
  try {
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
    });
    return response.text;
  } catch (error) {
    console.error("Error generating description:", error);
    return "Failed to generate description. Please try again.";
  }
};

export const getMarketInsights = async (query: string): Promise<string> => {
    if (!API_KEY) return "API Key not configured. Please check your environment variables.";
    try {
        const prompt = `As an agricultural market analyst, provide insights on the following topic: "${query}". Focus on trends, pricing, and potential opportunities for farmers in West Africa.`;
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
              tools: [{googleSearch: {}}]
            }
        });
        return response.text;
    } catch (error) {
        console.error("Error getting market insights:", error);
        return "Failed to get market insights. Please try again.";
    }
};

export const editImage = async (base64Data: string, mimeType: string, prompt: string): Promise<string | null> => {
  if (!API_KEY) {
    console.error("API Key not configured.");
    return null;
  }
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          {
            inlineData: {
              data: base64Data,
              mimeType: mimeType,
            },
          },
          {
            text: prompt,
          },
        ],
      },
      config: {
          responseModalities: [Modality.IMAGE],
      },
    });

    for (const part of response.candidates[0].content.parts) {
      if (part.inlineData) {
        return part.inlineData.data;
      }
    }
    return null;
  } catch (error) {
    console.error("Error editing image:", error);
    return null;
  }
};
