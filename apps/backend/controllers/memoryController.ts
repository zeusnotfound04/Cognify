import type { Request  , Response} from "express";
import { createMemory, searchMemory, getUserMemories } from "../services/memoryService";

export const createMemoryHandler = async (req : Request , res : Response) => {
    try{
        console.log("Request body in createMemoryHandler:", req.body);
        const { userId , content ,  metadata = {} } = req.body;
        
        // Validate required fields
        if (!userId) {
            return res.status(400).json({ error: "userId is required" });
        }
        
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

export const searchMemoryHandler = async (req : Request , res : Response) => {
    try{
        const { query } = req.body;
        const results = await searchMemory(query);
        res.json(results)
    } catch(err : any) {
        console.error("Error while searching the memory" , err)
        res.status(500).json({ error : "Failed to search memory"})
    }      
}            

export const fetchUserMemoryHandler = async (req : Request , res : Response) => {
    try{
         const userId = req.params.id;
          if (!userId) {
            return res.status(400).json({ error: "User ID is required" });
        }
        const memories = await getUserMemories(userId);
        res.json(memories)
    } catch ( err : any){
        console.error("Error while fetching the memory" , err)
        res.status(500).json({ error : "Failed to fetch memory"})
    }
}


