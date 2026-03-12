export type OrderStatus = 'pending' | 'completed' | 'cancelled' | 'shipped';

export interface Order {
  id: number;
  image: string | null; 
  product: string; 
  description: string;
  price: string; 
  status: OrderStatus;
  time: string; 
  date: string;
}

export interface Achievement {
  id: number;
  icon: string;
  title: string;
  description: string;
  achieved: boolean;
}

export interface UserProfile {
  id: number;
  username: string;
  points: number;
  achievements: Achievement[];
  orders: Order[];
}