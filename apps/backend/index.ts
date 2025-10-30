import express from "express"
import cors from "cors"
import { createUser, getUsers } from "./controllers/usersController";
import { createMemoryHandler, fetchUserMemoryHandler, searchMemoryHandler } from "./controllers/memoryController";
import http from "http"
import { Server } from "socket.io";
import { callLLM, generateEmbedding } from "./services/embeddingService";
import { findSimilarMemories } from "./services/memoryService";
import authRoutes from "./routes/auth";
import { requireAuth, optionalAuth, AuthenticatedRequest } from "./middleware/auth";
import dotenv from "dotenv";

dotenv.config();
const app = express();
const PORT = 3001

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

app.post("/memory" , requireAuth, createMemoryHandler)
app.get("/memory", requireAuth, fetchUserMemoryHandler)
app.post("/memory/search", requireAuth, searchMemoryHandler)

app.post("/chat" , requireAuth, async (req: AuthenticatedRequest , res) => {
    const { query } = req.body;
    const userId = req.user?.id;
    
    if (!userId) {
        return res.status(401).json({ error: 'User not authenticated' });
    }
    
    console.time("Total chat time");
    
    console.time("Embedding generation");
    const queryEmbedding = await generateEmbedding(query);
    console.timeEnd("Embedding generation");
    console.log("Query Embedding:", queryEmbedding.slice(0, 5), "...");
    
    console.time("Memory search");
    const relatedMemories = await findSimilarMemories(userId, queryEmbedding, 5);
    console.timeEnd("Memory search");
    console.log(`Found ${relatedMemories.length} memories`);

    const context = relatedMemories
        .slice(0, 3)
        .map((m:any) => m.content)
        .join("\n");
        
    const prompt = context 
        ? `Context:\n${context}\n\nUser: ${query}\n\nAssistant:`
        : `User: ${query}\n\nAssistant:`;
    
    console.time("LLM call");
    const answer = await callLLM(prompt);
    console.timeEnd("LLM call");
    console.timeEnd("Total chat time");

    res.json({ 
        answer,
        metadata: {
            memoriesUsed: relatedMemories.length,
            contextSize: context.length
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


server.listen(PORT , ()=> {
    console.log("Server is running gng", PORT)
})