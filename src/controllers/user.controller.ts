import type { Request, Response } from 'express';
import * as userService from '../services/user.service.js';
import type { NewUser } from '../types/user.types.js';

export const getUsers = async (req: Request, res: Response) => {
  try {
    const events = await userService.getAllUsers();
    res.json(events);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const getUserData = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id as string);
    if (isNaN(id)) return res.status(400).json({ message: 'Invalid ID' });

    const user = await userService.getUserById(id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching user' });
  }
};

export const createUser = async (req: Request, res: Response) => {
  try {
    //ANCHOR - ZOD Валидация
    const userData: NewUser = req.body;

    const newUser = await userService.createUser(userData);
    
    res.status(201).json(newUser);
  } catch (error: any) {
    // Обработка уникальных полей (например, если username уже занят)
    if (error.code === '23505') {
       return res.status(400).json({ message: 'Username or Email already exists' });
    }
    res.status(500).json({ message: 'Server error' });
  }
};