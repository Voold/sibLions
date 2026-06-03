import type { Level } from "../types/level.types.js";

export const LEVELS: Level[] = [
  {
    id: 1,
    name: "Львёнок",
    min_points: 0,
    bonus_percent: 2,
    description: "Начальный уровень, первые шаги в сообществе.",
    color: "#FFD700",
  },
  {
    id: 2,
    name: "Бронзовый лев",
    min_points: 100,
    bonus_percent: 7,
    description: "Активный участник сообщества.",
    color: "#CD7F32",
  },
  {
    id: 3,
    name: "Серебрянный лев",
    min_points: 500,
    bonus_percent: 10,
    description: "Опытный участник с заслугами.",
    color: "#C0C0C0",
  },
  {
    id: 4,
    name: "Золотой лев",
    min_points: 1000,
    bonus_percent: 15,
    description: "Признанный лидер сообщества.",
    color: "#FFD700",
  },
  {
    id: 5,
    name: "Платиновый лев",
    min_points: 2000,
    bonus_percent: 17,
    description: "Выдающийся участник с высокими достижениями.",
    color: "#E5E4E2",
  },
  {
    id: 6,
    name: "Сибирский лев",
    min_points: 5000,
    bonus_percent: 20,
    description: "Легенда сообщества, высшая честь.",
    color: "#FF6B35",
  },
];

export const getLevelByPoints = (points: number): Level => {
  for (let index = LEVELS.length - 1; index >= 0; index -= 1) {
    const level = LEVELS[index]!;

    if (points >= level.min_points) {
      return level;
    }
  }

  return LEVELS[0]!;
};
