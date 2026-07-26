/**
 * Миграционный скрипт: конвертация legacy JPG/PNG в Firebase Storage → WebP.
 *
 * Сценарий:
 *   Часть товаров/категорий/постов залита до того, как мы переключили
 *   imageCompression.ts на WebP. У них в Firestore стоят URL на PNG/JPG
 *   файлы по 1.5–2 MB. Этот скрипт:
 *     1. читает все документы products/categories/blogPosts,
 *     2. для каждого с не-WebP imageUrl скачивает оригинал,
 *     3. конвертирует через sharp в WebP с качеством 78,
 *     4. перезаливает в Storage по детерминированному пути
 *        `<collection>/<id>.webp`,
 *     5. обновляет Firestore: imageUrl (с cache-bust v=now),
 *        imageOrientation, imageAspectRatio.
 *
 * Запуск (нужен service account ключ):
 *   GOOGLE_APPLICATION_CREDENTIALS=./serviceAccount.json \
 *   npx ts-node scripts/migrateStorageToWebp.ts
 *
 * Опции:
 *   DRY_RUN=1 — только список того, что было бы обновлено, без записи.
 *   COLLECTIONS=products,categories — ограничить набор.
 *
 * ВАЖНО: запускать против отдельного env или с резервной копией Firestore.
 * Это деструктивная операция: старые файлы остаются в Storage, но URL в
 * Firestore меняется → откат потребует ручного восстановления.
 */

import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getStorage } from 'firebase-admin/storage';
import sharp from 'sharp';

const PROJECT_ID = process.env.FIREBASE_PROJECT_ID || 'kvitko-sweet-d226a';
const BUCKET = process.env.FIREBASE_STORAGE_BUCKET || 'kvitko-sweet-d226a.firebasestorage.app';
const DRY_RUN = process.env.DRY_RUN === '1';
const COLLECTIONS = (process.env.COLLECTIONS || 'products,categories,blogPosts').split(',');

interface Target {
  collection: string;
  storagePrefix: string;
}

const TARGETS: Target[] = [
  { collection: 'products', storagePrefix: 'products' },
  { collection: 'categories', storagePrefix: 'categories' },
  { collection: 'blogPosts', storagePrefix: 'blog' },
];

function bootstrap() {
  if (getApps().length) return;
  const sa = process.env.GOOGLE_APPLICATION_CREDENTIALS;
  if (!sa) {
    throw new Error(
      'Set GOOGLE_APPLICATION_CREDENTIALS to a service-account JSON file path.'
    );
  }
  initializeApp({
    credential: cert(require(sa)),
    projectId: PROJECT_ID,
    storageBucket: BUCKET,
  });
}

function inferOrientation(width: number, height: number): 'portrait' | 'landscape' | 'square' {
  const ratio = width / height;
  if (ratio > 1.1) return 'landscape';
  if (ratio < 0.9) return 'portrait';
  return 'square';
}

async function downloadAsBuffer(url: string): Promise<Buffer> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
  const ab = await res.arrayBuffer();
  return Buffer.from(ab);
}

async function migrateDoc(
  docId: string,
  data: Record<string, unknown>,
  target: Target
): Promise<{ migrated: boolean; reason?: string }> {
  const imageUrl = data.imageUrl as string | undefined;
  if (!imageUrl) return { migrated: false, reason: 'no imageUrl' };

  // Уже webp в пути и нет PNG/JPG — пропускаем.
  const lower = imageUrl.toLowerCase();
  if (lower.includes('.webp') && !lower.includes('.png') && !lower.includes('.jpg') && !lower.includes('.jpeg')) {
    return { migrated: false, reason: 'already webp' };
  }

  console.log(`[${target.collection}/${docId}] processing ${imageUrl.slice(0, 80)}`);
  if (DRY_RUN) return { migrated: true, reason: 'DRY_RUN' };

  const original = await downloadAsBuffer(imageUrl);

  const pipeline = sharp(original).webp({ quality: 78, effort: 6 });
  const webpBuffer = await pipeline.toBuffer();
  const meta = await sharp(webpBuffer).metadata();
  const width = meta.width || 0;
  const height = meta.height || 0;

  const storage = getStorage();
  const file = storage.bucket().file(`${target.storagePrefix}/${docId}.webp`);
  await file.save(webpBuffer, {
    contentType: 'image/webp',
    metadata: { cacheControl: 'public, max-age=31536000' },
  });
  await file.makePublic().catch(() => undefined);

  const [signed] = await file.getSignedUrl({
    action: 'read',
    expires: '03-01-2500',
  });
  const finalUrl = `${signed}${signed.includes('?') ? '&' : '?'}v=${Date.now()}`;

  await getFirestore().collection(target.collection).doc(docId).update({
    imageUrl: finalUrl,
    imageOrientation: inferOrientation(width, height),
    imageAspectRatio: width && height ? width / height : 1,
  });

  console.log(`  → ${target.storagePrefix}/${docId}.webp (${(webpBuffer.length / 1024).toFixed(0)} KB)`);
  return { migrated: true };
}

async function main() {
  bootstrap();
  const db = getFirestore();

  const summary: Record<string, { processed: number; migrated: number; skipped: number; failed: number }> = {};

  for (const target of TARGETS) {
    if (!COLLECTIONS.includes(target.collection)) continue;
    summary[target.collection] = { processed: 0, migrated: 0, skipped: 0, failed: 0 };

    const snap = await db.collection(target.collection).get();
    for (const doc of snap.docs) {
      summary[target.collection].processed++;
      try {
        const result = await migrateDoc(doc.id, doc.data(), target);
        if (result.migrated) summary[target.collection].migrated++;
        else summary[target.collection].skipped++;
      } catch (err) {
        summary[target.collection].failed++;
        console.error(`  ✗ ${target.collection}/${doc.id} failed:`, (err as Error).message);
      }
    }
  }

  console.log('\n=== Summary ===');
  console.log(JSON.stringify(summary, null, 2));
}

main().catch((err) => {
  console.error('Fatal:', err);
  process.exit(1);
});
