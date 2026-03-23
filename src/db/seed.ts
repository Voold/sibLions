/* import { db } from './index.js';
import * as schema from './schema.js';

async function seed() {
  console.log('--- Начинаем сидинг базы данных SibLions ---');

  // 1. Очистка старых данных (необязательно, но полезно для перезапуска)
  // await db.delete(schema.registrations); 
  // await db.delete(schema.users);

  // 2. Уровни (Levels)
  console.log('Вставляем уровни...');
  const insertedLevels = await db.insert(schema.levels).values([
    { name: 'Новичок', minPoints: 0, description: 'Добро пожаловать в сообщество!', benefits: 'Базовый доступ к мероприятиям', badgeImage: 'badge_lvl1.png', color: '#9E9E9E', requirements: 'Регистрация в системе' },
    { name: 'Активист', minPoints: 500, description: 'Вы начали проявлять интерес к жизни вуза', benefits: 'Скидка 5% на мерч, доступ к закрытым чатам', badgeImage: 'badge_lvl2.png', color: '#4CAF50', requirements: 'Набрать 500 баллов' },
    { name: 'Лидер', minPoints: 1500, description: 'Один из самых заметных участников', benefits: 'Скидка 15% на мерч, приоритетная регистрация', badgeImage: 'badge_lvl3.png', color: '#2196F3', requirements: 'Участие в 5+ мероприятиях' },
    { name: 'Амбассадор', minPoints: 5000, description: 'Лицо нашего университета', benefits: 'Бесплатный мерч (1 ед. в месяц), доступ в VIP-лаунж', badgeImage: 'badge_lvl4.png', color: '#FFC107', requirements: 'Набрать 5000 баллов и организовать 1 событие' },
    { name: 'Легенда', minPoints: 10000, description: 'Высшая ступень признания', benefits: 'Пожизненный статус, личный ментор, спец-награды', badgeImage: 'badge_lvl5.png', color: '#9C27B0', requirements: 'Внести исключительный вклад в развитие' },
  ]).returning();

  // 3. Товары (Products)
  console.log('Вставляем мерч...');
  await db.insert(schema.products).values([
    { name: 'Худи "TPU Core"', description: 'Оверсайз худи с вышивкой логотипа', category: 'clothing', price: 2500, stock: 15, status: 'active', image: 'hoodie_tpu.jpg' },
    { name: 'Футболка "Code & Coffee"', description: 'Черная хлопковая футболка', category: 'clothing', price: 1200, stock: 40, status: 'active', image: 'tshirt_code.jpg' },
    { name: 'Термокружка 500мл', description: 'Держит тепло 12 часов', category: 'accessories', price: 1500, stock: 0, status: 'out_of_stock', image: 'mug_pro.jpg' },
    { name: 'Набор стикеров "IT-Student"', description: 'Виниловые стикеры для ноутбука', category: 'souvenirs', price: 300, stock: 100, status: 'active', image: 'stickers_it.jpg' },
  ]);

  // 4. Пользователи (Users)
  // Мы используем ID первого уровня для привязки, если уровни создались с другими ID
  console.log('Вставляем пользователей...');
  const insertedUsers = await db.insert(schema.users).values([
    { username: 'admin_main', email: 'admin@tpu.ru', firstName: 'Алексей', lastName: 'Иванов', role: 'admin', tpuId: 'ADM-001', currentLevelId: insertedLevels[0].id, faculty: 'Администрация' },
    { username: 'sergey_org', email: 'sergey.org@tpu.ru', firstName: 'Сергей', lastName: 'Волков', role: 'organizer', tpuId: 'ORG-555', totalPoints: 1200, currentLevelId: insertedLevels[1].id, faculty: 'ИШИТР' },
    { username: 'ivan_pro', email: 'ivanov_ia@tpu.ru', firstName: 'Иван', lastName: 'Иванов', tpuId: '778899', totalPoints: 5200, currentLevelId: insertedLevels[3].id, faculty: 'ИШИТР' },
  ]).returning();

  // 5. Мероприятия (Events)
  console.log('Вставляем мероприятия...');
  const insertedEvents = await db.insert(schema.events).values([
    { title: 'Хакатон "Smart Campus"', description: 'Разработка сервисов для студентов', eventType: 'training', status: 'completed', startDate: new Date('2025-10-10T10:00:00'), endDate: new Date('2025-10-12T18:00:00'), participantPoints: 500, organizerId: insertedUsers[1].id },
    { title: 'Кубок по футболу', status: 'completed', startDate: new Date('2025-11-05T09:00:00'), endDate: new Date('2025-11-05T15:00:00'), participantPoints: 300, organizerId: insertedUsers[1].id },
  ]).returning();

  // 6. Регистрации и история
  console.log('Финальные штрихи (регистрации)...');
  await db.insert(schema.registrations).values([
    { userId: insertedUsers[2]!.id, eventId: insertedEvents[0]!.id, role: 'participant', status: 'attended', attended: true },
  ]);

  console.log('--- Сидинг успешно завершен! ---');
  process.exit(0);
}

seed().catch((err) => {
  console.error('Ошибка сидинга:', err);
  process.exit(1);
}); */