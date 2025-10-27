import prisma from "../db/prisma";

interface User {
    id: string;
    email: string;
    name: string | null;
    createdAt : any;
    username? : string | null;
    memories : any[]
}

interface CreateUserData {
    email: string;
    name?: string ;
}

export async function getUsers(): Promise<User[]> {
    const users = await prisma.user.findMany({
        select: {
            id: true,
            email: true,
            name: true,
            memories: true,
            username: true,
            createdAt: true
        }
    });
    return users;
}

export async function createUser(userData: CreateUserData): Promise<User> {
    console.log("User data" , userData)
   
    const newUser : User = await prisma.user.create({
        data: {
            email: userData.email,
            name: userData.name,         
        },
        select: {
            id: true,
            email: true,
            name: true,
            username: true,
            createdAt : true,
            memories : true,
            
            
        }
    });
    return newUser;
}

