import express from "express"
import cors from "cors"
import { createUser, getUsers } from "./controllers/usersController";
import { createMemoryHandler, fetchUserMemoryHandler, searchMemoryHandler } from "./controllers/memoryController";
import http from "http"
import { Server } from "socket.io";
import { callLLM, generateEmbedding } from "./services/embeddingService";
import { findSimilarMemories } from "./services/memoryService";
import authRoutes from "./routes/auth";
import oauthRoutes from "./routes/oauth";
import syncRoutes from "./routes/sync";
import apiKeyRoutes from "./routes/apiKeys";
import { requireAuth, optionalAuth, AuthenticatedRequest } from "./middleware/auth";
import { validateMCPService } from "./middleware/mcpAuth";
import dotenv from "dotenv";
import prisma from "./db/prisma.js";

dotenv.config();
const app = express();
const PORT = 8888

app.use(cors({
    origin: ["http://localhost:3000", "http://127.0.0.1:3000"],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"]
}));

app.use(express.json())
app.use(express.urlencoded({ extended: true }));

const server = http.createServer(app)
const io = new Server(server, {
    cors: {
        origin : "*"
    }
})
app.set("io", io)

// Auth routes
app.use('/auth', authRoutes);

// OAuth and integration routes
app.use('/', oauthRoutes);

// Data sync routes
app.use('/sync', syncRoutes);

// API key management routes
app.use('/api-keys', apiKeyRoutes);

app.get("/users", requireAuth, async (req, res) => {
    try {
        const users = await getUsers();
        console.log("Got the users:", users);
        res.json(users);
    } catch (error) {
        console.error("Error fetching users:", error);
        res.status(500).json({ error: "Failed to fetch users" });
    }
})

app.post("/memory" , validateMCPService, requireAuth, createMemoryHandler)
app.get("/memory", validateMCPService, requireAuth, fetchUserMemoryHandler)
app.post("/memory/search", validateMCPService, requireAuth, searchMemoryHandler)

app.post("/chat" , requireAuth, async (req: AuthenticatedRequest , res) => {
    const { query, model = 'gemini-pro', useMemoryContext = true, maxTokens, temperature } = req.body;
    const userId = req.user?.id;
    
    if (!userId) {
        return res.status(401).json({ error: 'User not authenticated' });
    }
    
    if (!query || typeof query !== 'string') {
        return res.status(400).json({ error: 'Query is required and must be a string' });
    }
    
    console.time("Total chat time");
    const startTime = Date.now();
    
    let context = '';
    let relatedMemories: any[] = [];
    
    if (useMemoryContext) {
        console.time("Embedding generation");
        const queryEmbedding = await generateEmbedding(query);
        console.timeEnd("Embedding generation");
        console.log("Query Embedding:", queryEmbedding.slice(0, 5), "...");
        
        console.time("Memory search");
        relatedMemories = await findSimilarMemories(userId, queryEmbedding, 5);
        console.timeEnd("Memory search");
        console.log(`Found ${relatedMemories.length} memories`);

        context = relatedMemories
            .slice(0, 3)
            .map((m:any) => m.content)
            .join("\n");
    }
        
    const prompt = context 
        ? `Context from your memories:\n${context}\n\nUser: ${query}\n\nAssistant:`
        : `User: ${query}\n\nAssistant:`;
    
    console.time("LLM call");
    const answer = await callLLM(prompt, { model, maxTokens, temperature });
    console.timeEnd("LLM call");
    console.timeEnd("Total chat time");
    
    const endTime = Date.now();

    res.json({ 
        answer,
        metadata: {
            memoriesUsed: relatedMemories.length,
            contextSize: context.length,
            model: model,
            responseTime: endTime - startTime,
            useMemoryContext
        }
    });

})

app.post("/users", async (req, res) => {
    try {
        const data = req.body;
        const user = await createUser(data);
        console.log("made the user", user);
        res.json(user);
    } catch (error) {
        console.error("Error creating user:", error);
        res.status(500).json({ error: "Failed to create user" });
    }
})

app.get("/health", (req , res ) =>{
    res.json({ status: "ok"})
})

app.get("/health/database", async (req, res) => {
    try {
        await prisma.$queryRaw`SELECT 1`;
        const migrations = await prisma.$queryRaw`SELECT migration_name FROM _prisma_migrations ORDER BY finished_at DESC LIMIT 1`;
        res.json({ 
            database: "connected",
            migrations: "up-to-date"
        });
    } catch (error) {
        res.status(500).json({ 
            database: "disconnected", 
            error: "Database connection failed" 
        });
    }
})

app.get("/health/vector", async (req, res) => {
    try {
        await prisma.$queryRaw`SELECT 1 FROM "Memory" LIMIT 1`;
        await prisma.$queryRaw`SELECT extname FROM pg_extension WHERE extname = 'vector'`;
        res.json({
            vectorExtension: "enabled",
            memoryTable: "exists"
        });
    } catch (error) {
        res.status(500).json({
            vectorExtension: "unknown",
            memoryTable: "unknown",
            error: "Vector validation failed"
        });
    }
})

app.get("/auth/verify", requireAuth, async (req: AuthenticatedRequest, res) => {
    res.json({ 
        valid: true, 
        userId: req.user?.id,
        email: req.user?.email 
    });
})


server.listen(PORT , ()=> {
    console.log("Server is running gng", PORT)
})