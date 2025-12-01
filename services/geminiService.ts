
import { GoogleGenAI, Modality, Type } from "@google/genai";
import { decodeBase64, decodeAudioData } from "./audioUtils";
import { NarratorProfile, IdentityProfile, EmotionalTone, AppSettings } from "../types";

// Helper to initialize GoogleGenAI with the correct key
const getGenAI = (settings?: AppSettings) => {
  const apiKey = settings?.geminiApiKey || process.env.API_KEY;
  if (!apiKey) {
    throw new Error("Gemini API Key not found. Please check your settings.");
  }
  return new GoogleGenAI({ apiKey });
};

// Helper for Local Model generation
const generateTextLocal = async (
  prompt: string, 
  settings: AppSettings
): Promise<{ title: string; story: string }> => {
  try {
    const response = await fetch(`${settings.localModelUrl}/chat/completions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: settings.localModelName,
        messages: [
          { role: 'system', content: 'You are a creative writing assistant specialized in fiction. You must output JSON.' },
          { role: 'user', content: prompt }
        ],
        stream: false,
        response_format: { type: "json_object" } 
      })
    });

    if (!response.ok) {
      throw new Error(`Local model error: ${response.statusText}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    
    if (!content) throw new Error("Empty response from local model");

    try {
      return JSON.parse(content);
    } catch (e) {
      console.warn("Local model output validation failed, attempting manual extraction", e);
      return {
        title: "Local Model Story",
        story: content
      };
    }
  } catch (error) {
    console.error("Local model generation failed:", error);
    throw error;
  }
};

// 1. Generate the Story Text
export const generateStoryText = async (
  userInput: string, 
  narrator: NarratorProfile, 
  identity: IdentityProfile,
  emotion: EmotionalTone,
  settings: AppSettings
): Promise<{ title: string; story: string }> => {
  
  // Construct a specialized system prompt for Adult Romance/Erotica
  const prompt = `
    你現在是文壇頂尖的「成人羅曼史 (Adult Romance)」與「情慾文學 (Erotica)」作家，同時也是一位金牌廣播劇編劇。
    你的專長是將平淡的文字，轉化為極具張力、畫面感強烈且令人臉紅心跳的精品小說片段。

    請根據用戶提供的素材，創作一段適合製作成「沉浸式有聲書」的腳本。

    =============== 創作參數 ===============
    1. 【核心風格】：${narrator.name}
       ${narrator.textStylePrompt}

    2. 【敘事視角】：${identity.name}
       ${identity.promptInstruction}

    3. 【情緒慾望光譜】：${emotion.name}
       ${emotion.promptInstruction}
       關鍵字參考：${emotion.keywords.join('、')}

    =============== 大師級寫作法則 (必須遵守) ===============
    1. **慢鏡頭法則 (The Slow-Motion Rule)**：
       不要流水帳。在親密互動或情緒高潮時，請將時間流速放慢 10 倍。
       不要只寫「他吻了她」。要寫他在靠近時的鼻息、嘴唇相觸前的停頓、舌尖試探的溫度、以及分開時牽連的銀絲。
       *每一個動作都要伴隨著至少兩個感官細節。*

    2. **感官沉浸 (Sensory Immersion)**：
       你的文字必須有聲音、有溫度、有氣味。
       - 視覺：光影在皮膚上的流動、眼神的焦距變化。
       - 聽覺：布料摩擦的聲音、壓抑的喘息、水聲、心跳聲。
       - 觸覺：粗糙或細膩的皮膚質感、冷熱交替、痛覺與快感的模糊邊界。
       - 嗅覺：費洛蒙的味道、沐浴乳的香氣、汗水的鹹味。

    3. **Show, Don't Tell**：
       不要直接寫「他們很興奮」或「他很生氣」。
       要寫「他的指節因為用力而泛白」、「她的腳趾蜷縮抓緊了床單」。
       透過肢體語言與微表情來傳達慾望的濃度。

    4. **適合有聲演繹**：
       這是給聽眾「聽」的故事。句式要有長短節奏變化，模擬真實的呼吸與心跳頻率。
       適當使用破折號 (——) 與省略號 (...) 來表現喘息或猶豫。

    =============== 輸出格式 ===============
    請嚴格輸出純 JSON 格式，不要包含任何 Markdown 代碼塊標記 (如 \`\`\`json)：
    {
      "title": "一個極具吸引力、唯美且符合情慾氛圍的小說標題",
      "story": "完整的故事內容。請使用 \\n 進行換行分段。長度約 500-800 字。"
    }

    =============== 用戶原始素材 ===============
    "${userInput}"
  `;

  // Check if using local model
  if (settings.useLocalModel) {
    return generateTextLocal(prompt, settings);
  }

  // Use Gemini
  const ai = getGenAI(settings);
  const model = "gemini-2.5-flash"; 

  const response = await ai.models.generateContent({
    model,
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING, description: "Romantic or sensual title" },
          story: { type: Type.STRING, description: "The narrated story text" }
        },
        required: ["title", "story"]
      },
      // Higher temperature for more creativity in fiction
      temperature: 1.2, 
      topP: 0.95,
      topK: 64,
    }
  });

  const text = response.text;
  if (!text) throw new Error("No text generated");
  
  return JSON.parse(text);
};

// 2. Generate the Cover Image
export const generateStoryImage = async (
  storySummary: string, 
  narrator: NarratorProfile,
  settings: AppSettings
): Promise<string> => {
  const ai = getGenAI(settings);
  const model = "gemini-2.5-flash-image";
  
  // Create a safer prompt for image generation to avoid policy blocks on adult content
  const prompt = `
    Design a tasteful, artistic, and atmospheric romance novel cover art based on this story excerpt: 
    "${storySummary.slice(0, 200)}..."
    
    Art Style:
    ${narrator.imageStylePrompt}
    
    Important Constraints: 
    - NO NUDITY. NO EXPLICIT SEXUAL ACTS. Keep it PG-13 visually but emotionally R-rated.
    - Focus on "Mood" and "Suggestion" rather than explicit action.
    - Use symbolic elements: entangled hands, shadows, silk sheets, spilled wine, moonlight, close-up of lips or eyes.
    - Cinematic lighting is key. 
    - High quality, 8k resolution, photorealistic or highly detailed artistic style.
    - No text/typography on the image.
  `;

  const response = await ai.models.generateContent({
    model,
    contents: prompt,
  });

  for (const part of response.candidates?.[0]?.content?.parts || []) {
    if (part.inlineData) {
      return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
    }
  }
  
  throw new Error("No image generated");
};

// 3. Generate the Narration Audio
export const generateStoryAudio = async (
  text: string, 
  narrator: NarratorProfile, 
  identity: IdentityProfile,
  settings: AppSettings
): Promise<AudioBuffer> => {
  const ai = getGenAI(settings);
  const model = "gemini-2.5-flash-preview-tts";
  
  const selectedVoiceName = identity.gender === 'male' ? narrator.maleVoice : narrator.femaleVoice;

  const response = await ai.models.generateContent({
    model,
    contents: [{ parts: [{ text: text }] }],
    config: {
      responseModalities: [Modality.AUDIO],
      speechConfig: {
        voiceConfig: {
          prebuiltVoiceConfig: { 
            voiceName: selectedVoiceName 
          },
        },
      },
    },
  });

  const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
  
  if (!base64Audio) {
    throw new Error("No audio generated");
  }

  const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
  
  const audioBuffer = await decodeAudioData(
    decodeBase64(base64Audio),
    audioContext,
    24000,
    1
  );

  return audioBuffer;
};
