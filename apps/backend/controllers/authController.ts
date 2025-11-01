import { Request, Response } from 'express';
import { 
  registerUser, 
  loginUser, 
  getUserById, 
  updateUserProfile, 
  changePassword,
  RegisterCredentials,
  LoginCredentials 
} from '../services/authService.js';
import { AuthenticatedRequest } from '../middleware/auth.js';

export const register = async (req: Request, res: Response) => {
  try {
    const { email, password, name, username } = req.body as RegisterCredentials;

    // Validate required fields
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }

    // Validate password strength
    if (password.length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters long' });
    }

    // Validate username if provided
    if (username && (username.length < 3 || username.length > 30)) {
      return res.status(400).json({ error: 'Username must be between 3 and 30 characters' });
    }

    if (username && !/^[a-zA-Z0-9_]+$/.test(username)) {
      return res.status(400).json({ error: 'Username can only contain letters, numbers, and underscores' });
    }

    const user = await registerUser({ email, password, name, username });
    
    res.status(201).json({
      message: 'User registered successfully',
      user
    });
  } catch (error: any) {
    console.error('Registration error:', error);
    res.status(400).json({ error: error.message || 'Registration failed' });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body as LoginCredentials;

    // Validate required fields
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const result = await loginUser({ email, password });
    
    res.json({
      message: 'Login successful',
      user: result.user,
      token: result.token
    });
  } catch (error: any) {
    console.error('Login error:', error);
    res.status(401).json({ error: error.message || 'Login failed' });
  }
};

export const getProfile = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const user = await getUserById(userId);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ user });
  } catch (error: any) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: 'Failed to get profile' });
  }
};

export const updateProfile = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const { name, username } = req.body;
    const updates: Partial<{ name: string; username: string }> = {};

    if (name !== undefined) updates.name = name;
    if (username !== undefined) {
      // Validate username
      if (username && (username.length < 3 || username.length > 30)) {
        return res.status(400).json({ error: 'Username must be between 3 and 30 characters' });
      }

      if (username && !/^[a-zA-Z0-9_]+$/.test(username)) {
        return res.status(400).json({ error: 'Username can only contain letters, numbers, and underscores' });
      }

      updates.username = username;
    }

    const user = await updateUserProfile(userId, updates);
    
    res.json({
      message: 'Profile updated successfully',
      user
    });
  } catch (error: any) {
    console.error('Update profile error:', error);
    res.status(400).json({ error: error.message || 'Failed to update profile' });
  }
};

export const updatePassword = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const { currentPassword, newPassword } = req.body;

    // Validate required fields
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Current password and new password are required' });
    }

    // Validate new password strength
    if (newPassword.length < 8) {
      return res.status(400).json({ error: 'New password must be at least 8 characters long' });
    }

    await changePassword(userId, currentPassword, newPassword);
    
    res.json({ message: 'Password updated successfully' });
  } catch (error: any) {
    console.error('Update password error:', error);
    res.status(400).json({ error: error.message || 'Failed to update password' });
  }
};

export const logout = async (req: AuthenticatedRequest, res: Response) => {
  // Since we're using JWTs, logout is handled client-side by removing the token
  // In a production app, you might want to implement token blacklisting
  res.json({ message: 'Logout successful' });
};

export const verifyToken = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const user = await getUserById(userId);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ 
      valid: true,
      user,
      userId: user.id,
      email: user.email 
    });
  } catch (error: any) {
    console.error('Token verification error:', error);
    res.status(500).json({ error: 'Token verification failed' });
  }
};