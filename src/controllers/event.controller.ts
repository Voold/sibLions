import type { Request, Response } from 'express';
import * as eventService from '../services/event.service.js';

export const getEvents = async (req: Request, res: Response) => {
  try {
    const events = await eventService.getAllEvents();
    res.json(events);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const getEventDetail = async (req: Request, res: Response) => {
  const id = parseInt(req.params.id as string);
  const event = await eventService.getEventById(id);
  
  if (!event) {
    return res.status(404).json({ message: 'Event not found' });
  }
  res.json(event);
};