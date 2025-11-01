import { GoogleGenerativeAI } from "@google/generative-ai";
import { getCachedEmbedding, setCachedEmbedding } from "./cacheService";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
dotenv.config();

const GEMINI_API_KEY=process.env.GOOGLE_GEMINI_API_KEY || "";

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
const ai = new GoogleGenAI({
    apiKey : GEMINI_API_KEY
})

export async function generateEmbedding(text:string) : Promise<number[]> {
    if (!text || typeof text !== 'string') {
        throw new Error(`Invalid text input for embedding generation: ${text}`);
    }
    
    const cached = getCachedEmbedding(text);
    if (cached) {
        console.log("Embedding cache hit!");
        return cached;
    }
    
    console.log("Generating new embedding...");
    const model = genAI.getGenerativeModel({ model: "text-embedding-004" });
    const result = await model.embedContent(text);
    const embedding = result.embedding.values;
    setCachedEmbedding(text, embedding);
    return embedding;
}

export async function callLLM(query: string, options: {
    model?: string;
    maxTokens?: number;
    temperature?: number;
} = {}) {
    const { model = "gemini-2.0-flash-exp", maxTokens, temperature } = options;
    
    console.log(`Calling LLM with model: ${model}, query:`, query.substring(0, 100) + "...");
    
    // Map frontend model IDs to actual Gemini model names
    const modelMap: { [key: string]: string } = {
        'gemini-pro': 'gemini-1.5-pro',
        'gemini-flash': 'gemini-2.0-flash-exp',
        'gemini-nano': 'gemini-1.5-flash'
    };
    
    const actualModel = modelMap[model] || model;
    
    try {
        const response = await ai.models.generateContent({
            model: actualModel,
            contents: query,
            ...(maxTokens && { maxOutputTokens: maxTokens }),
            ...(temperature !== undefined && { temperature }),
            ...(temperature === undefined && { temperature: 0.7 }) // Default temperature
        });
        
        console.log("LLM Response received");
        return response.text;
    } catch (error) {
        console.error("LLM Error:", error);
        
        // Fallback to default model if the specified model fails
        if (actualModel !== "gemini-2.0-flash-exp") {
            console.log("Falling back to default model...");
            const fallbackResponse = await ai.models.generateContent({
                model: "gemini-2.0-flash-exp",
                contents: query,
            });
            return fallbackResponse.text;
        }
        
        throw error;
    }
}