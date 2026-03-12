import type { Order, Achievement } from '../types/profile.types.js';

const MOCK_ORDERS: Order[] = [
  {
    id: 101,
    image: null,
    product: "Футболка TS",
    description: "Размер L, черная",
    price: "1200",
    status: 'completed',
    time: "12:30",
    date: "10.03.2024"
  }
];

const MOCK_ACHIEVEMENTS: Achievement[] = [
  { id: 1, icon: '🔥', title: 'Первый код', description: 'Написал "Hello World"', achieved: true },
  { id: 2, icon: '🚀', title: 'Деплой', description: 'Запустил сервер на проде', achieved: false }
];

export const getUserOrders = async () => MOCK_ORDERS;
export const getUserAchievements = async () => MOCK_ACHIEVEMENTS;