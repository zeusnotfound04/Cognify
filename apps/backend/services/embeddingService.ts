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

export async function callLLM(query:string) {
    console.log("Calling LLM with query:", query);
    const response = await ai.models.generateContent({
          model: "gemini-2.5-flash",
          contents: query,
    });
    console.log(response.text);
    return response.text
}