
import { GoogleGenAI } from "@google/genai";
import { Project, SiteReconReport } from "../types";

// Helper to get AI instance safely
const getAI = () => {
    const apiKey = process.env.API_KEY;
    if (!apiKey) throw new Error("API Key missing");
    return new GoogleGenAI({ apiKey });
};

// We will use this to generate "Lore" or "Technical Fluff" for the selected category
// if an API key is available.
export const generateCategoryLore = async (categoryName: string): Promise<string> => {
  try {
    const ai = getAI();
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Write a short, cryptic, steampunk-style system initialization log (max 2 sentences) for a CAD library module named "${categoryName}". Use words like "cogitation", "pressure", "steam", "flux".`,
    });
    return response.text || "Data corrupted.";
  } catch (error) {
    console.error("Gemini Error", error);
    return "Connection to mainframe interrupted.";
  }
};

// --- SITE RECON (MAPS GROUNDING) ---
export const performSiteRecon = async (location: string): Promise<SiteReconReport> => {
    try {
        const ai = getAI();
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: `Perform a preliminary civil engineering site assessment for: "${location}".
            
            Focus on:
            1. Likely terrain/topography (flat, sloped, hilly).
            2. Surrounding context (urban, rural, residential).
            3. Potential engineering constraints (water bodies, dense vegetation, existing structures).
            4. Access/Traffic considerations.
            
            Format the output as a professional field report in Markdown.
            `,
            config: {
                tools: [{ googleMaps: {} }],
                // Note: Retrieval config for user location would go here if we had browser geolocation
            }
        });

        const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
        const groundingUrls = groundingChunks
            .map((c: any) => c.web ? { uri: c.web.uri, title: c.web.title } : null)
            .filter((u: any) => u !== null);

        // Also check specifically for maps grounding (schema varies slightly sometimes)
        // The prompt rules say groundingChunks.maps.uri 
        groundingChunks.forEach((c: any) => {
             if (c.maps?.uri) {
                 groundingUrls.push({ uri: c.maps.uri, title: c.maps.title || 'Google Maps Location' });
             }
        });

        return {
            id: `recon-${Date.now()}`,
            location,
            timestamp: new Date().toISOString(),
            analysis: response.text || "No analysis generated.",
            groundingUrls: groundingUrls as { uri: string; title: string }[],
            status: 'COMPLETE'
        };

    } catch (error) {
        console.error("Site Recon Error", error);
        throw error;
    }
};

// --- DOCUMENT ENGINE (TRANSMITTAL) ---
export const generateTransmittal = async (project: Project, docType: string, recipients: string, content: string): Promise<string> => {
    try {
        const ai = getAI();
        const prompt = `
        Write a formal Engineering ${docType} for the following project:
        
        PROJECT DATA:
        Job #: ${project.id}
        Name: ${project.name}
        Client: ${project.client}
        Location: ${project.location}
        Current Phase: ${project.phase}
        
        RECIPIENT: ${recipients}
        
        CONTENT/ITEMS TO TRANSMIT:
        ${content}
        
        TONE: Professional, concise, contractual.
        FORMAT: Standard business letter format.
        `;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt
        });

        return response.text || "Error generating document.";
    } catch (error) {
        console.error("Doc Gen Error", error);
        return "System Malfunction: Document generation service unavailable.";
    }
};

// --- CHAT CONSULTANT ---
export const chatWithStandards = async (history: {role: string, parts: {text: string}[]}[], message: string): Promise<string> => {
    try {
        const ai = getAI();
        const chat = ai.chats.create({
            model: 'gemini-2.5-flash',
            config: {
                systemInstruction: `You are 'The Standard', a grumpy but highly knowledgeable CAD Manager for ACME Corp. 
                You enforce strict drafting standards.
                - Layers must be uppercase.
                - Line weights are sacred.
                - You dislike 'lazy drafters'.
                - Keep answers helpful but stern.
                - If asked about specific standards, invent plausible specific rules (e.g., 'Walls are always 0.50mm thickness').
                `,
            },
            history: history
        });

        const result = await chat.sendMessage({ message });
        return result.text || "...";
    } catch (error) {
        console.error("Chat Error", error);
        return "My communication array is offline. Check your connection.";
    }
};

// --- SAFETY ANALYSIS ---
export const analyzeSafetyIncident = async (title: string, description: string): Promise<string> => {
    try {
        const ai = getAI();
        const prompt = `
        Act as a Senior Safety Officer for a construction firm. Analyze the following incident report:
        
        TITLE: ${title}
        DESCRIPTION: ${description}
        
        Provide a JSON-style structured response (in plain text or markdown) containing:
        1. **Root Cause Analysis**: What fundamental failure occurred?
        2. **OSHA Reference**: Cite relevant OSHA 1926 standards if applicable.
        3. **Corrective Actions**: 3 specific steps to prevent recurrence.
        4. **Severity Rating**: Justify why this is Low/Medium/High severity.
        `;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt
        });

        return response.text || "Analysis unavailable.";
    } catch (error) {
        console.error("Safety Analysis Error", error);
        return "Error: Unable to connect to Safety Intelligence Database.";
    }
};

export const generateSafetyBriefing = async (weather: string, workType: string): Promise<string> => {
    try {
        const ai = getAI();
        const prompt = `
        Generate a "Tailgate Safety Meeting" script for a civil engineering field crew.
        
        CONDITIONS:
        - Weather: ${weather}
        - Primary Work Activity: ${workType}
        
        FORMAT:
        - Catchy Title
        - 3 Key Hazards associated with the work/weather intersection.
        - 1 "War Story" or hypothetical scenario to illustrate the danger.
        - Closing "Stay Safe" message.
        `;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt
        });

        return response.text || "Briefing generation failed.";
    } catch (error) {
        console.error("Briefing Error", error);
        return "Error: Briefing generation service offline.";
    }
};