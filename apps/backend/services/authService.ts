import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import prisma from '../db/prisma.js';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const JWT_EXPIRY = process.env.JWT_EXPIRY || '7d';

// Generate a secure MCP API key
function generateMcpApiKey(): string {
  const randomBytes = crypto.randomBytes(32);
  const apiKey = randomBytes.toString('hex');
  return `mcp_${apiKey}`;
}

export interface AuthUser {
  id: string;
  email: string;
  name?: string | null;
  username?: string | null;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  email: string;
  password: string;
  name?: string;
  username?: string;
}

export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 12;
  return bcrypt.hash(password, saltRounds);
}

export async function comparePassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}

export function generateToken(user: AuthUser): string {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      username: user.username,
    },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRY } as jwt.SignOptions
  );
}

export function verifyToken(token: string): AuthUser {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    return {
      id: decoded.id,
      email: decoded.email,
      name: decoded.name,
      username: decoded.username,
    };
  } catch (error) {
    throw new Error('Invalid or expired token');
  }
}

export async function registerUser(credentials: RegisterCredentials): Promise<AuthUser> {
  const { email, password, name, username } = credentials;

  // Check if user already exists
  const existingUser = await prisma.user.findFirst({
    where: {
      OR: [
        { email },
        ...(username ? [{ username }] : [])
      ]
    }
  });

  if (existingUser) {
    if (existingUser.email === email) {
      throw new Error('User with this email already exists');
    }
    if (existingUser.username === username) {
      throw new Error('Username already taken');
    }
  }

  // Hash password
  const hashedPassword = await hashPassword(password);

  // Generate MCP API key for the user
  const mcpApiKey = generateMcpApiKey();

  // Create user with MCP API key
  const user = await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
      name,
      username,
      mcpApiKey,
    },
    select: {
      id: true,
      email: true,
      name: true,
      username: true,
    }
  });

  return user;
}

export async function loginUser(credentials: LoginCredentials): Promise<{ user: AuthUser; token: string }> {
  const { email, password } = credentials;

  // Find user by email
  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    throw new Error('Invalid email or password');
  }

  // Verify password
  const isValidPassword = await comparePassword(password, user.password);
  if (!isValidPassword) {
    throw new Error('Invalid email or password');
  }

  // Create auth user object (without password)
  const authUser: AuthUser = {
    id: user.id,
    email: user.email,
    name: user.name,
    username: user.username,
  };

  // Generate token
  const token = generateToken(authUser);

  return { user: authUser, token };
}

export async function getUserById(userId: string): Promise<AuthUser | null> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      name: true,
      username: true,
    }
  });

  return user;
}

export async function updateUserProfile(userId: string, updates: Partial<{ name: string; username: string }>): Promise<AuthUser> {
  // Check if username is taken by another user
  if (updates.username) {
    const existingUser = await prisma.user.findFirst({
      where: {
        username: updates.username,
        NOT: { id: userId }
      }
    });

    if (existingUser) {
      throw new Error('Username already taken');
    }
  }

  const user = await prisma.user.update({
    where: { id: userId },
    data: updates,
    select: {
      id: true,
      email: true,
      name: true,
      username: true,
    }
  });

  return user;
}

export async function changePassword(userId: string, currentPassword: string, newPassword: string): Promise<void> {
  // Get user with password
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw new Error('User not found');
  }

  // Verify current password
  const isValidPassword = await comparePassword(currentPassword, user.password);
  if (!isValidPassword) {
    throw new Error('Current password is incorrect');
  }

  // Hash new password
  const hashedNewPassword = await hashPassword(newPassword);

  // Update password
  await prisma.user.update({
    where: { id: userId },
    data: { password: hashedNewPassword },
  });
}

export async function getUserMcpApiKey(userId: string): Promise<string | null> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { mcpApiKey: true }
  });
  console.log("fetched MCP API key for user:", user?.mcpApiKey);
  return user?.mcpApiKey || null;
}

export async function authenticateByMcpApiKey(apiKey: string): Promise<AuthUser | null> {
  const user = await prisma.user.findFirst({
    where: { mcpApiKey: apiKey },
    select: {
      id: true,
      email: true,
      name: true,
      username: true,
    }
  });

  return user;
}