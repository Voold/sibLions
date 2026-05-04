# sibLions API

- Защищённые эндпоинты требуют, чтобы cookie уже были установлены

## Авторизация

### POST `/auth/login`

Логин через TPU OAuth code flow. После успешного входа сервер ставит cookies `app_token` и `refresh_token`.

Что ожидает:

- `code` - строка, код авторизации
- `codeVerifier` - строка, verifier из PKCE

Пример запроса:

```bash
curl -X POST {baseURL}/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "code": "auth_code_from_tpu",
    "codeVerifier": "pkce_verifier_value"
  }'
```

Пример ответа:

```json
{
  "message": "Successfully authenticated",
  "user": {
    "id": 1,
    "username": "ivanBanan",
    "email": "ib@tpu.ru",
    "tpuId": "111111",
    "totalPoints": 120
  }
}
```

### POST `/auth/refresh`

Обновляет access token и refresh token по cookie `refresh_token`.

Что ожидает:

- Cookie `refresh_token`

Пример запроса:

```bash
curl -X POST {baseURL}/auth/refresh \
  --cookie "refresh_token=xxx"
```

Пример ответа:

```json
{
  "user": {
    "id": 1,
    "username": "ivanBanan",
    "email": "ivanBanan@tpu.ru",
    "tpuId": "111111",
    "totalPoints": 120
  }
}
```

## Мероприятия

## Уровни

### GET `/api/levels`

Возвращает единственный уровень для тестового пользователя.

Что ожидает:

- Ничего, авторизация не требуется

Пример запроса:

```bash
curl {baseURL}/api/levels
```

Пример ответа:

```json
[
  {
    "id": 1,
    "name": "Лев Тестировщик",
    "min_points": 0,
    "description": "Базовый уровень для тестирования и первого доступа к системе.",
    "color": "#ca00c6"
  }
]
```

### GET `/events`

Список мероприятий. Для гостя возвращаются мероприятия без признака регистрации пользователя, для авторизованного пользователя добавляются `isRegistered` и `registrationType`.

Что ожидает:

- Ничего, авторизация необязательна

Пример запроса:

```bash
curl {baseURL}/events
```

Пример ответа:

```json
[
  {
    "uuid": "a1b2c3d4-e5f6-4789-8abc-1234567890ab",
    "title": "Весенний турнир",
    "startDate": "2026-05-10T10:00:00.000Z",
    "location": "Главный корпус",
    "description": "Соревнование между командами бананов",
    "participantPoints": 20,
    "fanPoints": 5,
    "registrationDeadline": "2026-05-08T18:00:00.000Z",
    "status": "published",
    "isRegistered": false,
    "registrationType": null
  }
]
```

### GET `/events/:uuid`

Детальная информация о мероприятии.

Что ожидает:

- `uuid` в path

Пример запроса:

```bash
curl {baseURL}/events/a1b2c3d4-e5f6-4789-8abc-1234567890ab
```

Пример ответа:

```json
{
  "uuid": "a1b2c3d4-e5f6-4789-8abc-1234567890ab",
  "title": "Весенний турнир",
  "description": "Соревнование между командами",
  "eventType": "sport",
  "status": "published",
  "startDate": "2026-05-10T10:00:00.000Z",
  "endDate": "2026-05-10T14:00:00.000Z",
  "registrationDeadline": "2026-05-08T18:00:00.000Z",
  "participantPoints": 20,
  "fanPoints": 5,
  "maxParticipants": 100,
  "location": "Главный корпус",
  "organizerId": 1,
  "createdAt": "2026-05-01T12:00:00.000Z",
  "updatedAt": "2026-05-02T12:00:00.000Z",
  "currentParticipants": 12,
  "currentFans": 4,
  "isRegistered": true,
  "userRegistration": {
    "id": 55,
    "role": "participant",
    "status": "registered",
    "registeredAt": "2026-05-03T09:15:00.000Z"
  }
}
```

### POST `/events`

Создаёт новое мероприятие.

Что ожидает:

- Cookie `app_token`
- `title` - строка, обязательно
- `startDate` - дата, обязательно
- `endDate` - дата, обязательно
- Дополнительно можно передать `description`, `eventType`, `status`, `registrationDeadline`, `participantPoints`, `fanPoints`, `maxParticipants`, `location`

Пример запроса:

```bash
curl -X POST {baseURL}/events \
  -H "Content-Type: application/json" \
  --cookie "app_token=your_access_token" \
  -d '{
    "title": "Весенний турнир",
    "description": "Соревнование между командами",
    "eventType": "sport",
    "startDate": "2026-05-10T10:00:00.000Z",
    "endDate": "2026-05-10T14:00:00.000Z",
    "registrationDeadline": "2026-05-08T18:00:00.000Z",
    "participantPoints": 20,
    "fanPoints": 5,
    "maxParticipants": 100,
    "location": "Главный корпус"
  }'
```

Пример ответа:

```json
{
  "message": "Мероприятие успешно создано",
  "uuid": "a1b2c3d4-e5f6-4789-8abc-1234567890ab"
}
```

### PATCH `/events/:uuid`

Частичное обновление мероприятия. Можно передать одно поле или все поля.

Что ожидает:

- Cookie `app_token`
- `uuid` в path
- Любые из полей: `title`, `description`, `eventType`, `status`, `startDate`, `endDate`, `registrationDeadline`, `participantPoints`, `fanPoints`, `maxParticipants`, `location`
- Минимальная проверка: хотя бы одно поле должно быть передано

Пример запроса:

```bash
curl -X PATCH {baseURL}/events/a1b2c3d4-e5f6-4789-8abc-1234567890ab \
  -H "Content-Type: application/json" \
  --cookie "app_token=your_access_token" \
  -d '{
    "title": "Весенний турнир 2026",
    "maxParticipants": 120,
    "status": "published"
  }'
```

Пример ответа:

```json
{
  "message": "Мероприятие успешно обновлено",
  "event": {
    "uuid": "a1b2c3d4-e5f6-4789-8abc-1234567890ab",
    "title": "Весенний турнир 2026",
    "description": "Соревнование между командами",
    "eventType": "sport",
    "status": "published",
    "startDate": "2026-05-10T10:00:00.000Z",
    "endDate": "2026-05-10T14:00:00.000Z",
    "registrationDeadline": "2026-05-08T18:00:00.000Z",
    "participantPoints": 20,
    "fanPoints": 5,
    "maxParticipants": 120,
    "location": "Главный корпус",
    "organizerId": 1,
    "createdAt": "2026-05-01T12:00:00.000Z",
    "updatedAt": "2026-05-04T12:00:00.000Z"
  }
}
```

### DELETE `/events/:uuid`

Удаляет мероприятие.

Что ожидает:

- Cookie `app_token`
- `uuid` в path

Пример запроса:

```bash
curl -X DELETE {baseURL}/events/a1b2c3d4-e5f6-4789-8abc-1234567890ab \
  --cookie "app_token=your_access_token"
```

Пример ответа:

```json
{
  "message": "Мероприятие успешно удалено",
  "uuid": "a1b2c3d4-e5f6-4789-8abc-1234567890ab"
}
```

### POST `/events/:uuid/register`

Регистрирует пользователя на мероприятие.

Что ожидает:

- Cookie `app_token`
- `uuid` в path
- `registrationType` - `participant` или `fan`

Пример запроса:

```bash
curl -X POST {baseURL}/events/a1b2c3d4-e5f6-4789-8abc-1234567890ab/register \
  -H "Content-Type: application/json" \
  --cookie "app_token=your_access_token" \
  -d '{
    "registrationType": "participant"
  }'
```

Пример ответа:

```json
{
  "success": true,
  "message": "Регистрация прошла успешно",
  "registration": {
    "id": 55,
    "eventUuid": "a1b2c3d4-e5f6-4789-8abc-1234567890ab",
    "userId": 1,
    "registrationType": "participant",
    "registeredAt": "2026-05-04T10:00:00.000Z"
  },
  "event": {
    "currentParticipants": 13
  }
}
```

### DELETE `/events/:uuid/unregister`

Снимает пользователя с регистрации на мероприятие.

Что ожидает:

- Cookie `app_token`
- `uuid` в path

Пример запроса:

```bash
curl -X DELETE {baseURL}/events/a1b2c3d4-e5f6-4789-8abc-1234567890ab/unregister \
  --cookie "app_token=your_access_token"
```

Пример ответа:

```json
{
  "success": true,
  "message": "Отписка от мероприятия выполнена успешно",
  "uuid": "a1b2c3d4-e5f6-4789-8abc-1234567890ab",
  "event": {
    "currentParticipants": 12
  }
}
```

### GET `/events/:eventId/persons`

Список участников мероприятия.

Что ожидает:

- Cookie `app_token`
- `eventId` в path как число

Пример запроса:

```bash
curl {baseURL}/events/1/persons \
  --cookie "app_token=your_access_token"
```

Пример ответа:

```json
{
  "success": true,
  "count": 2,
  "persons": [
    {
      "id": 1,
      "username": "ivanBanan",
      "firstName": "Иван",
      "lastName": "Банан",
      "email": "ivanBanan@tpu.ru",
      "totalPoints": 120,
      "registrationId": 55,
      "role": "participant",
      "attended": true,
      "registeredAt": "2026-05-03T09:15:00.000Z"
    }
  ]
}
```

### POST `/events/:eventId/persons`

Отмечает людей на мероприятии и начисляет баллы за участие.

Что ожидает:

- Cookie `app_token`
- `eventId` в path как число
- `userIds` - массив чисел

Пример запроса:

```bash
curl -X POST {baseURL}/events/1/persons \
  -H "Content-Type: application/json" \
  --cookie "app_token=your_access_token" \
  -d '{
    "userIds": [1, 2, 3]
  }'
```

Пример ответа:

```json
{
  "success": true,
  "message": "Points awarded successfully",
  "results": [
    {
      "userId": 1,
      "points": 20,
      "registered": true
    }
  ]
}
```

## Магазин

### GET `/shop`

Список товаров.

Что ожидает:

- Cookie `app_token`

Пример запроса:

```bash
curl {baseURL}/shop \
  --cookie "app_token=your_access_token"
```

Пример ответа:

```json
[
  {
    "id": 1,
    "name": "Худи 'Банан'",
    "description": "Теплая толстовка для тех, кто не боится никого",
    "price": 2500,
    "image": null,
    "points": 100
  }
]
```

### GET `/shop/:id`

Товар по id.

Что ожидает:

- Cookie `app_token`
- `id` в path как число

Пример запроса:

```bash
curl {baseURL}/shop/1 \
  --cookie "app_token=your_access_token"
```

Пример ответа:

```json
{
  "id": 1,
  "name": "Худи 'Банан'",
  "description": "Теплая толстовка для тех, кто не боится ничего",
  "price": 2500,
  "image": null,
  "points": 100
}
```

## Профиль

### GET `/profile/orders`

Список заказов пользователя.

Что ожидает:

- Cookie `app_token`

Пример запроса:

```bash
curl {baseURL}/profile/orders \
  --cookie "app_token=your_access_token"
```

Пример ответа:

```json
[
  {
    "id": 101,
    "image": null,
    "product": "Футболка",
    "description": "Размер L, черная",
    "price": "1200",
    "status": "completed",
    "time": "12:30",
    "date": "10.03.2024"
  }
]
```

### GET `/profile/achievements`

Список достижений пользователя.

Что ожидает:

- Cookie `app_token`

Пример запроса:

```bash
curl {baseURL}/profile/achievements \
  --cookie "app_token=your_access_token"
```

Пример ответа:

```json
[
  {
    "id": 1,
    "icon": "🔥",
    "title": "Первая регистрация",
    "description": "Зарегался на мероприятие",
    "achieved": true
  }
]
```

## Пользователи

### GET `/users`

Список всех пользователей.

Что ожидает:

- Cookie `app_token`

Пример запроса:

```bash
curl {baseURL}/users \
  --cookie "app_token=your_access_token"
```

Пример ответа:

```json
[
  {
    "id": 1,
    "username": "ivanBanan",
    "email": "ivanBanan@tpu.ru",
    "totalPoints": 120
  }
]
```

### GET `/users/:id`

Пользователь по id.

Что ожидает:

- Cookie `app_token`
- `id` в path как число

Пример запроса:

```bash
curl {baseURL}/users/1 \
  --cookie "app_token=your_access_token"
```

Пример ответа:

```json
{
  "id": 1,
  "username": "ivanBanan",
  "email": "ivanBanan@tpu.ru",
  "totalPoints": 120
}
```

## Ошибки

Типовые ответы при ошибках:

```json
{
  "message": "Unauthorized"
}
```

```json
{
  "message": "Invalid event uuid"
}
```

```json
{
  "message": "Event not found"
}
```

```json
{
  "message": "Server error"
}
```
