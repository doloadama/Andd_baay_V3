
import { GoogleGenAI, Modality } from "@google/genai";

// Per coding guidelines, the API key is assumed to be configured in the environment.
// Initialize the GoogleGenAI client directly.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });

export const generateDescription = async (prompt: string): Promise<string> => {
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
    // Fix: Added a missing opening curly brace to the catch block.
    } catch (error) {
        console.error("Error getting market insights:", error);
        return "Failed to get market insights. Please try again.";
    }
};

// Fix: Added the 'editImage' function to handle image editing requests using the Gemini API.
// This function was missing, causing an export error in 'ImageEditor.tsx'.
export const editImage = async (base64ImageData: string, mimeType: string, prompt: string): Promise<string | null> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          {
            inlineData: {
              data: base64ImageData,
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

    // Extract the base64 image data from the response
    for (const part of response.candidates[0].content.parts) {
      if (part.inlineData) {
        return part.inlineData.data;
      }
    }
    return null; // Return null if no image is found in the response
  } catch (error) {
    console.error("Error editing image:", error);
    return null;
  }
};
