import type { Request  , Response} from "express";
import { createMemory, searchMemory, getUserMemories } from "../services/memoryService";
import { AuthenticatedRequest } from "../middleware/auth";

export const createMemoryHandler = async (req : AuthenticatedRequest , res : Response) => {
    try{
        console.log("Request body in createMemoryHandler:", req.body);
        const { content ,  metadata = {} } = req.body;
        const userId = req.user?.id;
        
        // Validate authenticated user
        if (!userId) {
            return res.status(401).json({ error: "User not authenticated" });
        }
        
        // Validate required fields
        if (!content) {
            return res.status(400).json({ error: "content is required" });
        }
        
    const result = await createMemory(userId, content , metadata)
    const io = req.app.get("io");
    io.emit("memory:created", result);
    res.json(result)

    } catch(err : any){
        console.error("Error while creating memory" , err)
         res.status(500).json({ error: "Failed to create memory" });
    }    
}  

export const searchMemoryHandler = async (req : AuthenticatedRequest , res : Response) => {
    try{
        const { query } = req.body;
        const userId = req.user?.id;
        
        if (!userId) {
            return res.status(401).json({ error: "User not authenticated" });
        }
        
        const results = await searchMemory(query);
        res.json(results)
    } catch(err : any) {
        console.error("Error while searching the memory" , err)
        res.status(500).json({ error : "Failed to search memory"})
    }      
}            

export const fetchUserMemoryHandler = async (req : AuthenticatedRequest , res : Response) => {
    try{
        const userId = req.user?.id;
        
        if (!userId) {
            return res.status(401).json({ error: "User not authenticated" });
        }
        
        const memories = await getUserMemories(userId);
        res.json(memories)
    } catch ( err : any){
        console.error("Error while fetching the memory" , err)
        res.status(500).json({ error : "Failed to fetch memory"})
    }
}


