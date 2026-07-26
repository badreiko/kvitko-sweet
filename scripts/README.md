# Scripts

Здесь живут одноразовые миграционные / административные скрипты.
Не попадают в основной bundle.

## `migrateStorageToWebp.ts`

Конвертирует legacy PNG/JPG в Firebase Storage в WebP с пересохранением
imageUrl, imageOrientation, imageAspectRatio в Firestore.

### Зачем

До переключения `imageCompression.ts` на WebP-by-default часть товаров,
категорий и блог-постов хранится в Storage как .png / .jpg по 1.5–2 MB
каждый. Lighthouse-аудит назвал это главным виновником LCP. Скрипт
проходит по Firestore, скачивает оригиналы, жмёт в WebP через `sharp` и
переписывает в Storage по тому же детерминированному пути с
cache-bust.

### Что нужно

1. Service account ключ Firebase. В Firebase Console:
   `Project settings → Service accounts → Generate new private key`.
   Сохрани JSON где-нибудь **вне** репо.
2. Установлен `firebase-admin` (см. ниже).
3. Резервная копия Firestore (`gcloud firestore export` в bucket).

### Установка

```bash
npm i -D firebase-admin ts-node
```

### Запуск

Сухой прогон — посмотреть, что будет обновлено:

```bash
DRY_RUN=1 \
GOOGLE_APPLICATION_CREDENTIALS=/path/to/serviceAccount.json \
npx ts-node scripts/migrateStorageToWebp.ts
```

Боевой запуск:

```bash
GOOGLE_APPLICATION_CREDENTIALS=/path/to/serviceAccount.json \
npx ts-node scripts/migrateStorageToWebp.ts
```

Ограничить коллекции:

```bash
COLLECTIONS=products,categories \
GOOGLE_APPLICATION_CREDENTIALS=/path/to/serviceAccount.json \
npx ts-node scripts/migrateStorageToWebp.ts
```

### Что делает шаг за шагом

1. Читает все документы из `products`, `categories`, `blogPosts`.
2. Пропускает те, где imageUrl уже `.webp`.
3. Скачивает оригинал → конвертирует sharp → WebP q78.
4. Заливает в Storage по пути `<collection>/<id>.webp` (перезапись).
5. Пишет в документ:
   - `imageUrl` (с `?v={timestamp}` для cache-bust),
   - `imageOrientation` (`portrait` / `landscape` / `square`),
   - `imageAspectRatio` (number).
6. Старый PNG/JPG в Storage **не удаляется** — можно зачистить вручную
   после успешной миграции.

### После миграции

В админке проверь, что картинки отрисовываются нормально. Если что-то
пошло не так — Firestore-импорт из бэкапа восстанавливает старые URL.
