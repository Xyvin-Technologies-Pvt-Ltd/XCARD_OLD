import fs from 'fs';
import path from 'path';
import { fileURLToPath, pathToFileURL } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * Load Firebase Admin credentials for xcard-ee43c.
 * Prefers JSON (gitignored), falls back to legacy JS export module.
 */
export async function loadFirebaseServiceAccount() {
  const candidates = [
    process.env.FIREBASE_SERVICE_ACCOUNT_PATH,
    path.join(__dirname, 'xcard-ee43c-firebase.json'),
    path.join(__dirname, 'firebase-adminsdk.json'),
  ].filter(Boolean);

  for (const candidate of candidates) {
    if (!fs.existsSync(candidate)) continue;
    const data = JSON.parse(fs.readFileSync(candidate, 'utf8'));
    return { serviceAccount: data, source: candidate };
  }

  const legacyJs = path.join(__dirname, 'dev-xcard-firebase.js');
  if (fs.existsSync(legacyJs)) {
    const mod = await import(pathToFileURL(legacyJs).href);
    return {
      serviceAccount: mod.serviceAccount,
      source: legacyJs,
    };
  }

  throw new Error(
    'Firebase service account missing. Copy the xcard-ee43c admin SDK JSON to configs/xcard-ee43c-firebase.json (gitignored), or set FIREBASE_SERVICE_ACCOUNT_PATH.'
  );
}
