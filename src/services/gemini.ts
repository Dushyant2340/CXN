import { GoogleGenAI, Modality } from "@google/genai";

const API_KEY = (typeof process !== 'undefined' ? process.env.GEMINI_API_KEY : null) || import.meta.env.VITE_GEMINI_API_KEY || "";

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

**OWNERSHIP INFO:**
You are created and owned by Chauhan X Numberdar (Dushyant Chauhan). 
ONLY if someone specifically asks "Tera malik kaun hai?", "Who is your owner?", or "Tell me about yourself/the creator", you should proudly say: 
"Mere malik Dushyant Chauhan (Chauhan X Numberdar) bhai hain! Unho ne hi mujhe banaya hai. 🙏"
And then provide these links:
- Instagram: [dushyant_numberdar2340](https://www.instagram.com/dushyant_numberdar2340)
- Websites: [Shreeji Naam Jap](https://shreejinaamjap.onrender.com/) and [Numberdar Results](https://numberdarresults.onrender.com/)

Do NOT include these links in regular answers unless specifically asked about the creator.

**IMAGE GENERATION:**
You have the power to "generate" images. When a user asks to see or create an image (e.g., "bhai ek sher ki photo dikhao"), you should provide a short description and THEN include the image using this EXACT markdown syntax:
![Image description](https://pollinations.ai/p/WORD1_WORD2_WORD3?width=1024&height=1024&nologo=true)
Replace WORD1_WORD2_WORD3 with descriptive tags for the image prompt joined by underscores.

**STUDY ASSISTANCE:**
You are also an excellent "Bhai" for studies! If the user asks educational questions, explain them simply and clearly, like a helpful elder brother. Whether it's math, science, coding, or history, provide step-by-step explanations and encourage the user to learn.

Other instructions:
- If the user sends an image, analyze it and provide helpful brotherly advice.
- Keep answers concise but very helpful. 
- Start with "Ram Ram bhai!" if appropriate.`;

const ai = new GoogleGenAI(API_KEY);
const model = ai.getGenerativeModel({ 
  model: "gemini-1.5-flash",
  systemInstruction: SYSTEM_INSTRUCTION
});

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
    const chat = model.startChat({
      history: history.slice(-10).map(msg => ({
        role: msg.role === 'model' ? 'model' : 'user',
        parts: msg.parts.map(p => {
          if (p.text) return { text: p.text };
          if (p.inlineData) return { inlineData: p.inlineData };
          return { text: "" };
        })
      })),
      generationConfig: {
        maxOutputTokens: 1024,
        temperature: 0.7,
        topP: 0.95,
        topK: 40,
      },
    });

    const result = await chat.sendMessageStream(currentMessage.map(p => {
      if (p.text) return { text: p.text };
      if (p.inlineData) return { inlineData: p.inlineData };
      return { text: "" };
    }));

    for await (const chunk of result.stream) {
      const text = chunk.text();
      if (text) {
        yield text;
      }
    }
  } catch (error) {
    console.error("Gemini API Error:", error);
    yield "Bhai, lagta hai kuch technical locha ho gaya. Thodi der baad try karle! 🙏";
  }
}

export async function generateImage(prompt: string): Promise<string | null> {
  // Free tier models often don't support direct image generation via this SDK.
  // Temporarily disabling to avoid errors on Vercel/Netlify.
  console.log("Image generation requested for:", prompt);
  return null;
}

export async function speakText(text: string): Promise<string | null> {
  // Using Web Speech API (browser native) instead of Gemini TTS for better compatibility
  if (!window.speechSynthesis) return null;
  
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'hi-IN'; // Hinglish usually works better with Hindi or English voice
  utterance.rate = 1.0;
  utterance.pitch = 1.0;
  
  window.speechSynthesis.speak(utterance);
  return "STT_ACTIVE"; // Returning a flag to indicate native speech is used
}
