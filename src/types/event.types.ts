export interface Event {
  id: number;
  title: string;
  date: string; 
  location: string;
  description: string;
  fullDescription: string;
  category: string;
  maxParticipants: number;
  currentParticipants: number;
  maxSpectators: number;
  currentSpectators: number;
  organizer: string;
  contactEmail: string;
  contactPhone: string;
  requirements: string;
  price: number;
  rewardsPoints: number;
  duration: string;
  level: string;
  rules: string;
  equipment?: string;
}

export type EventType = 'past' | 'upcoming';