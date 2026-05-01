import { GoogleGenAI } from "@google/genai";

const getApiKey = () => {
  if (typeof process !== 'undefined' && process.env.GEMINI_API_KEY) {
    return process.env.GEMINI_API_KEY;
  }
  try {
    // @ts-ignore
    return import.meta.env.VITE_GEMINI_API_KEY || "";
  } catch (e) {
    return "";
  }
};

const API_KEY = getApiKey();

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
  messages: (ChatMessage & { fileInfo?: any })[];
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
- If the user sends an image or PDF, analyze it and provide helpful brotherly advice.
- Keep answers concise but very helpful. 
- Start with "Ram Ram bhai!" if appropriate.`;

const ai = new GoogleGenAI({ apiKey: API_KEY });

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

export async function* sendMessageStream(history: ChatMessage[], currentMessage: MessagePart[], aiModel: string = "gemini-3-flash-preview") {
  if (!API_KEY) {
    yield "Bhai, API key missing hai. Settings check karle ek baar! 🔑";
    return;
  }

  try {
    const historyForAPI = history.map(msg => ({
      role: msg.role === 'model' ? 'model' : 'user',
      parts: msg.parts.map(p => {
        if (p.text) return { text: p.text };
        if (p.inlineData) return { inlineData: p.inlineData };
        return { text: "" };
      })
    })).filter(msg => msg.parts.length > 0);

    const mergedHistory: any[] = [];
    for (const msg of historyForAPI) {
      if (mergedHistory.length > 0 && mergedHistory[mergedHistory.length - 1].role === msg.role) {
        mergedHistory[mergedHistory.length - 1].parts.push(...msg.parts);
      } else {
        mergedHistory.push({ ...msg });
      }
    }

    if (mergedHistory.length > 0 && mergedHistory[0].role === 'model') {
      mergedHistory.shift();
    }

    const finalHistory = mergedHistory.slice(-10);
    if (finalHistory.length > 0 && finalHistory[0].role === 'model') {
      finalHistory.shift();
    }

    const messageParts = currentMessage.map(p => {
      if (p.text) return { text: p.text };
      if (p.inlineData) return { inlineData: p.inlineData };
      return null;
    }).filter(p => p !== null) as any[];

    if (messageParts.length === 0) return;

    const streamResponse = await ai.models.generateContentStream({
      model: aiModel,
      contents: [...finalHistory, { role: 'user', parts: messageParts }],
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        temperature: 0.7,
        topP: 0.95,
        topK: 40,
      }
    });

    for await (const chunk of streamResponse) {
      if (chunk.text) {
        yield chunk.text;
      }
    }
  } catch (error: any) {
    console.error("CXN AI Error Details:", error);
    
    const errorMsg = error?.message || "";
    
    if (errorMsg.includes('Safety')) {
      yield "Bhai, ye topic thoda sensitive hai, rules ke hisab se main ispe baat nahi kar sakta. Kuch aur puchle! 🙏";
    } else if (errorMsg.includes('API key')) {
      yield "Bhai, API Key ka chakkar lag raha hai. Check kar tune `VITE_GEMINI_API_KEY` sahi se dala hai ya nahi! 🔑";
    } else if (errorMsg.includes('fetch') || errorMsg.includes('Network')) {
      yield "Bhai, network ya CORS ka locha hai. Check kar ki kya tera platform Gemini API ko allow kar raha hai! 🌐";
    } else {
      yield `Bhai, server side technical locha: ${errorMsg.slice(0, 50)}... Thodi der mein try kar! 🙏`;
    }
  }
}

export async function generateImage(prompt: string): Promise<string | null> {
  console.log("Image generation requested for:", prompt);
  return null;
}

export async function speakText(text: string): Promise<string | null> {
  if (!window.speechSynthesis) return null;
  
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'hi-IN';
  utterance.rate = 1.0;
  utterance.pitch = 1.0;
  
  window.speechSynthesis.speak(utterance);
  return "STT_ACTIVE";
}
