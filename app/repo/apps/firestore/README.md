# Firestore config

Здесь лежит конфигурация правил безопасности и составных индексов Firestore.
Это НЕ runtime-код — файлы деплоятся отдельно через `firebase deploy`.

## Файлы

- `firestore.rules` — правила безопасности (кто что может читать/писать).
- `firestore.indexes.json` — составные индексы для запросов с
  `where + orderBy` или несколькими `where`. Без них Firestore возвращает
  ошибку и запрос падает.

## Деплой

Единоразово настроить путь в корневом `firebase.json` (если ещё нет):

```json
{
  "firestore": {
    "rules": "app/repo/apps/firestore/firestore.rules",
    "indexes": "app/repo/apps/firestore/firestore.indexes.json"
  }
}
```

Затем:

```bash
# Только правила
firebase deploy --only firestore:rules

# Только индексы (создание индекса занимает от нескольких секунд до
# нескольких минут в зависимости от размера коллекции)
firebase deploy --only firestore:indexes

# Всё вместе
firebase deploy --only firestore
```

## Как добавить новый индекс

Если ты пишешь новый запрос с `where + orderBy` или несколькими
условиями — Firebase console после первого падающего запроса покажет
ссылку типа
`https://console.firebase.google.com/.../indexes?create_composite=...` —
это одноразовый способ. Но лучше сразу добавить в
`firestore.indexes.json` и задеплоить — тогда индекс попадает в git и
переезжает с проектом.

## Текущий набор индексов и зачем они нужны

| Коллекция | Поля | Используется |
|---|---|---|
| `orders` | userId + createdAt desc | `getUserOrders` — история заказов в Account |
| `customBouquets` | userId + createdAt desc | `getUserCustomBouquets` |
| `categories` | isActive + order asc | `getActiveCategories` (главная страница) |
| `flowers` | type + name asc | `getFlowersByType` |
| `flowers` | inStock + name asc | `getFlowersInStock` |
| `blogComments` | status + createdAt desc | Админ-панель комментариев |
| `blogComments` | postId + createdAt desc | Комментарии под постом |
| `blogComments` | postId + status + createdAt desc | Опубликованные комментарии под постом |
| `blogAnalytics` | postId + userId + createdAt asc | Дедупликация просмотров |
| `blogAnalytics` | postId + ip + createdAt asc | Дедупликация просмотров |
| `blogInteractions` | postId + type + userId | Проверка «уже лайкал» |

Если появится запрос, которого нет в таблице — либо добавь индекс,
либо перепиши сервис на `getDocs` без `orderBy` (сортировка на клиенте) —
это то, что уже сделано в `blogService` для `getAllPublishedPosts`.
