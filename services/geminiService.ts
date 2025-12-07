import { GoogleGenAI } from "@google/genai";
import { FormData, MindMapResult } from "../types";

// =========================================================================================
// ⚠️ DEPLOYMENT INSTRUCTIONS:
// If the app says "API Key is missing" on Netlify/Vercel:
// 1. Get your API Key from Google AI Studio (https://aistudio.google.com/).
// 2. Paste your key inside the empty quotes below.
//    Example: const API_KEY = "AIzaSyB_RQkwhGIVyfI2DbO0yCklWSEyU7ZV_hg";
// =========================================================================================

const API_KEY = process.env.API_KEY || "AIzaSyB_RQkwhGIVyfI2DbO0yCklWSEyU7ZV_hg"; 

export const generateMindMap = async (data: FormData): Promise<MindMapResult> => {
  
  // Validation to help you debug deployment
  if (!API_KEY || API_KEY.length < 10) {
    throw new Error("API Key is missing. Please open 'services/geminiService.ts' and paste your API Key in the API_KEY variable at the top of the file.");
  }

  const ai = new GoogleGenAI({ apiKey: API_KEY });
  const model = "gemini-2.5-flash"; // Fastest model
  
  const prompt = `
    You are a CBSE exam expert. 
    Task: Create a visual mind map SVG and a ULTRA-SHORT revision summary for:
    - Class: ${data.selectedClass}
    - Subject: ${data.selectedSubject}
    - Chapter: ${data.selectedChapter}
    - Custom Focus: ${data.customInstructions || "Exam keywords only"}

    PERFORMANCE RULES (STRICT):
    1. KEEP IT SHORT. Do not write paragraphs.
    2. Focus ONLY on exam-critical keywords, formulas, and definitions.
    3. Exclude introductions, conclusions, or filler text.

    OUTPUT FORMAT 1: SVG DIAGRAM
    === START_SVG ===
    (Generate valid SVG. ViewBox "0 0 800 600".
     - Layout: Central node -> 4-6 Branch nodes -> Leaf nodes.
     - Style: Professional, minimal. Use rounded rects.
     - Colors: Use soft Red (#fee2e2) for Center, soft Yellow (#fef3c7) for Branches. 
     - Text: Readable black text.
     - NO OVERLAPPING NODES. Keep it clean.)
    === END_SVG ===

    OUTPUT FORMAT 2: SUMMARY NOTES
    === START_TEXT ===
    # ${data.selectedChapter} (Exam Notes)

    ## 1. Key Concepts
    * [Keyword]: [Very short definition]
    * [Keyword]: [Very short definition]

    ## 2. Formulas/Facts
    * [Formula/Fact 1]
    * [Formula/Fact 2]

    ## 3. Important Questions
    1. [Question 1]
    2. [Question 2]
    3. [Question 3]
    === END_TEXT ===
  `;

  try {
    const response = await ai.models.generateContent({
      model: model,
      contents: prompt,
      config: {
        temperature: 0.5, // Lower temperature for more focused/faster output
      }
    });

    const text = response.text || "";

    // Parse logic
    const svgMatch = text.match(/=== START_SVG ===([\s\S]*?)=== END_SVG ===/);
    const textMatch = text.match(/=== START_TEXT ===([\s\S]*?)=== END_TEXT ===/);

    const svg = svgMatch ? svgMatch[1].trim() : "";
    const markdown = textMatch ? textMatch[1].trim() : text; 

    if (!svg && !markdown) {
      throw new Error("AI generated empty content.");
    }

    return { svg, markdown };

  } catch (error: any) {
    console.error("Gemini API Error:", error);
    
    // Pass through our specific API key error so the user sees it in the UI
    if (error.message.includes("API Key")) {
        throw error;
    }
    
    // Handle generic network or API errors
    throw new Error("Failed to generate. Please check connection.");
  }
};
