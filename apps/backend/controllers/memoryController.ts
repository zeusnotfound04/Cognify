import type { Request  , Response} from "express";
import { createMemory, searchMemory, getUserMemories, createMemoryForUser, searchMemoriesForUser } from "../services/memoryService";
import { AuthenticatedRequest } from "../middleware/auth";
import { MCPRequest } from "../middleware/mcpAuth";

export const createMemoryHandler = async (req : AuthenticatedRequest & MCPRequest , res : Response) => {
    try{
        console.log("Request body in createMemoryHandler:", req.body);
        const { content ,  metadata = {} } = req.body;
        
        let userId: string;
        
        if (req.fromMCP) {
            userId = req.mcpUserId || 'anonymous';
        } else {
            const userIdFromAuth = req.user?.id;
            if (!userIdFromAuth) {
                return res.status(401).json({ error: "User not authenticated" });
            }
            userId = userIdFromAuth;
        }
        
        if (!content) {
            return res.status(400).json({ error: "content is required" });
        }
        
        // Use the user-specific function for consistency
        const result = await createMemoryForUser({
            content,
            metadata,
            userId
        });
        
        const io = req.app.get("io");
        io.emit("memory:created", result);
        res.json(result)

    } catch(err : any){
        console.error("Error while creating memory" , err)
         res.status(500).json({ error: "Failed to create memory" });
    }    
}  

export const searchMemoryHandler = async (req : AuthenticatedRequest & MCPRequest , res : Response) => {
    try{
        const { query, limit = 5 } = req.body;
        
        let userId: string;
        
        if (req.fromMCP) {
            userId = req.mcpUserId || 'anonymous';
            // Use user-specific search for MCP requests
            const results = await searchMemoriesForUser({
                query,
                userId,
                limit
            });
            res.json(results);
        } else {
            const userIdFromAuth = req.user?.id;
            if (!userIdFromAuth) {
                return res.status(401).json({ error: "User not authenticated" });
            }
            userId = userIdFromAuth;
            // Use user-specific search for authenticated requests too
            const results = await searchMemoriesForUser({
                query,
                userId,
                limit
            });
            res.json(results);
        }
    } catch(err : any) {
        console.error("Error while searching the memory" , err)
        res.status(500).json({ error : "Failed to search memory"})
    }      
}            

export const fetchUserMemoryHandler = async (req : AuthenticatedRequest & MCPRequest , res : Response) => {
    try{
        let userId: string;
        
        if (req.fromMCP) {
            userId = req.mcpUserId || 'anonymous';
        } else {
            const userIdFromAuth = req.user?.id;
            if (!userIdFromAuth) {
                return res.status(401).json({ error: "User not authenticated" });
            }
            userId = userIdFromAuth;
        }
        
        const memories = await getUserMemories(userId);
        res.json(memories)
    } catch ( err : any){
        console.error("Error while fetching the memory" , err)
        res.status(500).json({ error : "Failed to fetch memory"})
    }
}


