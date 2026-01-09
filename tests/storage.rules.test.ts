/**
 * 🧪 Test Firebase Storage Rules
 *
 * Testa che le regole di Storage funzionino correttamente
 * prima del deploy in produzione.
 *
 * PREREQUISITO: Firebase Emulator deve essere in esecuzione
 * Run: npm run firebase:start
 *
 * Poi esegui: npm run test:storage-rules
 */

import {
  assertFails,
  assertSucceeds,
  initializeTestEnvironment,
  RulesTestEnvironment,
} from '@firebase/rules-unit-testing';
import { readFileSync } from 'fs';
import { afterAll, afterEach, beforeAll, describe, it } from 'vitest';

let testEnv: RulesTestEnvironment;

describe('Firebase Storage Rules', () => {
  beforeAll(async () => {
    // Inizializza ambiente di test con le regole
    testEnv = await initializeTestEnvironment({
      projectId: 'gallery-app-test',
      storage: {
        rules: readFileSync('storage.rules', 'utf8'),
        host: '127.0.0.1',
        port: 9209, // Porta Storage dall'emulator
      },
    });
  });

  afterAll(async () => {
    await testEnv.cleanup();
  });

  afterEach(async () => {
    await testEnv.clearStorage();
  });

  describe('brands/uploads/ path', () => {
    it('✅ permette lettura pubblica', async () => {
      const unauthedStorage = testEnv.unauthenticatedContext().storage();
      const ref = unauthedStorage.ref('brands/uploads/test.jpg');

      // Simula che il file esista
      await testEnv.withSecurityRulesDisabled(async (context) => {
        await context.storage().ref('brands/uploads/test.jpg').putString('test data');
      });

      await assertSucceeds(ref.getMetadata());
    });

    it('✅ permette upload per utenti autenticati', async () => {
      const authedStorage = testEnv
        .authenticatedContext('user123', { email: 'test@example.com' })
        .storage();

      const ref = authedStorage.ref('brands/uploads/photo.jpg');
      await assertSucceeds(ref.putString('test photo data'));
    });

    it('❌ blocca upload per utenti non autenticati', async () => {
      const unauthedStorage = testEnv.unauthenticatedContext().storage();
      const ref = unauthedStorage.ref('brands/uploads/photo.jpg');

      await assertFails(ref.putString('test photo data'));
    });

    it('✅ permette delete per utenti autenticati', async () => {
      // Prima crea il file
      await testEnv.withSecurityRulesDisabled(async (context) => {
        await context.storage().ref('brands/uploads/to-delete.jpg').putString('data');
      });

      const authedStorage = testEnv.authenticatedContext('user123').storage();

      const ref = authedStorage.ref('brands/uploads/to-delete.jpg');
      await assertSucceeds(ref.delete());
    });
  });

  describe('brands/{brandId}/ path', () => {
    it('✅ permette lettura pubblica', async () => {
      // Crea file di test
      await testEnv.withSecurityRulesDisabled(async (context) => {
        await context.storage().ref('brands/brand123/photo.jpg').putString('test');
      });

      const unauthedStorage = testEnv.unauthenticatedContext().storage();
      const ref = unauthedStorage.ref('brands/brand123/photo.jpg');

      await assertSucceeds(ref.getMetadata());
    });

    it('✅ permette upload per brand owner', async () => {
      // Mock Firestore data per simulare brand owner
      await testEnv.withSecurityRulesDisabled(async (context) => {
        const firestore = context.firestore();
        await firestore.doc('superusers/user123').set({
          brandId: 'brand123',
          email: 'owner@brand.com',
        });
      });

      const ownerStorage = testEnv
        .authenticatedContext('user123', { email: 'owner@brand.com' })
        .storage();

      const ref = ownerStorage.ref('brands/brand123/photo.jpg');
      await assertSucceeds(ref.putString('brand photo'));
    });

    it('❌ blocca upload per utenti non owner', async () => {
      const otherUserStorage = testEnv
        .authenticatedContext('otherUser', { email: 'other@example.com' })
        .storage();

      const ref = otherUserStorage.ref('brands/brand123/photo.jpg');
      await assertFails(ref.putString('unauthorized upload'));
    });
  });

  describe('platform/landing/ path', () => {
    it('✅ permette lettura pubblica', async () => {
      // Crea file di test
      await testEnv.withSecurityRulesDisabled(async (context) => {
        await context.storage().ref('platform/landing/hero.jpg').putString('test');
      });

      const unauthedStorage = testEnv.unauthenticatedContext().storage();
      const ref = unauthedStorage.ref('platform/landing/hero.jpg');

      await assertSucceeds(ref.getMetadata());
    });

    it('✅ permette upload per superadmin', async () => {
      // Mock superadmin
      await testEnv.withSecurityRulesDisabled(async (context) => {
        await context.firestore().doc('superadmins/admin123').set({
          email: 'admin@gallery.com',
          role: 'superadmin',
        });
      });

      const adminStorage = testEnv
        .authenticatedContext('admin123', { email: 'admin@gallery.com' })
        .storage();

      const ref = adminStorage.ref('platform/landing/hero.jpg');
      await assertSucceeds(ref.putString('landing asset'));
    });

    it('❌ blocca upload per utenti normali', async () => {
      const userStorage = testEnv
        .authenticatedContext('user123', { email: 'user@example.com' })
        .storage();

      const ref = userStorage.ref('platform/landing/hero.jpg');
      await assertFails(ref.putString('unauthorized'));
    });
  });

  describe('uploads/ (legacy) path', () => {
    it('✅ permette lettura pubblica', async () => {
      await testEnv.withSecurityRulesDisabled(async (context) => {
        await context.storage().ref('uploads/legacy.jpg').putString('test');
      });

      const unauthedStorage = testEnv.unauthenticatedContext().storage();
      const ref = unauthedStorage.ref('uploads/legacy.jpg');

      await assertSucceeds(ref.getMetadata());
    });

    it('✅ permette upload per utenti autenticati', async () => {
      const authedStorage = testEnv.authenticatedContext('user123').storage();

      const ref = authedStorage.ref('uploads/new-file.jpg');
      await assertSucceeds(ref.putString('legacy upload'));
    });
  });
});
