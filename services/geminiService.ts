import { GoogleGenAI } from "@google/genai";
import { FormData, MindMapResult } from "../types";

export const generateMindMap = async (data: FormData): Promise<MindMapResult> => {
  
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const model = "gemini-2.5-flash"; 
  
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
        temperature: 0.5,
      }
    });

    const text = response.text || "";

    const svgMatch = text.match(/=== START_SVG ===([\s\S]*?)=== END_SVG ===/);
    const textMatch = text.match(/=== START_TEXT ===([\s\S]*?)=== END_TEXT ===/);

    const svg = svgMatch ? svgMatch[1].trim() : "";
    const markdown = textMatch ? textMatch[1].trim() : text; 

    if (!svg && !markdown) {
      throw new Error("The AI responded, but generated empty content.");
    }

    return { svg, markdown };

  } catch (error: any) {
    console.error("RAW GEMINI ERROR:", error);
    
    let originalMessage = "Unknown Error";
    if (error instanceof Error) {
        originalMessage = error.message;
    } else if (typeof error === 'string') {
        originalMessage = error;
    } else {
        originalMessage = JSON.stringify(error);
    }

    // Throw the RAW message
    throw new Error(`DEBUG ERROR: ${originalMessage}`);
  }
};