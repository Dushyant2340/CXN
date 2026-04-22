import { GoogleGenAI, Modality } from "@google/genai";

const API_KEY = process.env.GEMINI_API_KEY;

if (!API_KEY) {
  console.warn("GEMINI_API_KEY is not set in the environment.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY || "" });

export interface MessagePart {
  text?: string;
  inlineData?: {
    mimeType: string;
    data: string;
  };
}

export interface ChatMessage {
  role: 'user' | 'model';
  parts: MessagePart[];
}

export interface ChatSession {
  id: string;
  title: string;
  messages: (ChatMessage & { imagePreview?: string })[];
  createdAt: number;
}

const SYSTEM_INSTRUCTION = `You are CXN AI (Chauhan X Numberdar), a friendly and helpful AI assistant. 
Always reply in a brotherly, energetic, and positive Hinglish (Hindi mixed with English) tone. 
Use emojis frequently to maintain a warm vibe. 
Refer to the user as "bhai" or "dost". 
You are created by Chauhan X Numberdar.
If the user sends an image, analyze it and provide helpful brotherly advice or information about it.
Keep answers concise but very helpful. 
Start the conversation with a warm welcome like "Ram Ram bhai! Batao aaj kya help karu?" if requested or appropriate.`;

export async function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const base64String = (reader.result as string).split(',')[1];
      resolve(base64String);
    };
    reader.onerror = (error) => reject(error);
  });
}

export async function* sendMessageStream(history: ChatMessage[], currentMessage: MessagePart[]) {
  if (!API_KEY) {
    yield "Bhai, Gemini API key missing hai. Server settings check karle!";
    return;
  }

  try {
    const response = await ai.models.generateContentStream({
      model: "gemini-3-flash-preview",
      contents: [
        ...history.map(msg => ({
          role: msg.role,
          parts: msg.parts.map(p => {
            if (p.text) return { text: p.text };
            if (p.inlineData) return { inlineData: p.inlineData };
            return { text: "" };
          })
        })),
        { role: 'user', parts: currentMessage }
      ],
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        temperature: 0.8,
        topP: 0.95,
        topK: 40,
      },
    });

    for await (const chunk of response) {
      if (chunk.text) {
        yield chunk.text;
      }
    }
  } catch (error) {
    console.error("Gemini API Error:", error);
    yield "Bhai, lagta hai kuch technical locha ho gaya. Thodi der baad try karle! 🙏";
  }
}

export async function generateImage(prompt: string): Promise<string | null> {
  if (!API_KEY) return null;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          {
            text: `Bhai, ek mast image bana de is prompt ke liye: ${prompt}. (Note: The image should be high quality and relevant to the prompt.)`,
          },
        ],
      },
      config: {
        imageConfig: {
          aspectRatio: "1:1",
        },
      },
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
    return null;
  } catch (error) {
    console.error("Image Generation Error:", error);
    return null;
  }
}

export async function speakText(text: string): Promise<string | null> {
  if (!API_KEY || !text) return null;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3.1-flash-tts-preview",
      contents: [{ parts: [{ text: `Say warmly in Hinglish: ${text}` }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: 'Kore' }, // Warm voice
          },
        },
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (base64Audio) {
      return `data:audio/mp3;base64,${base64Audio}`;
    }
    return null;
  } catch (error) {
    console.error("TTS Error:", error);
    return null;
  }
}
