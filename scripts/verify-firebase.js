import dotenv from 'dotenv';
import admin from 'firebase-admin';
import { serviceAccount } from '../configs/dev-xcard-firebase.js';

dotenv.config();

const results = {
  projectId: serviceAccount.project_id,
  clientEmail: serviceAccount.client_email,
  bucketEnv: process.env.BUCKET_URL || null,
  auth: null,
  storage: null,
  messaging: null,
};

const app = admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: process.env.BUCKET_URL,
  projectId: serviceAccount.project_id,
});

results.initialized = Boolean(app);

try {
  await admin.auth().listUsers(1);
  results.auth = { ok: true };
} catch (e) {
  results.auth = {
    ok: false,
    code: e.code || e.errorInfo?.code || null,
    message: String(e.message || e).split('\n')[0],
  };
}

const configured = String(process.env.BUCKET_URL || '').replace(/^gs:\/\//, '');
const candidates = [
  configured,
  'xcard-ee43c.firebasestorage.app',
  'xcard-ee43c.appspot.com',
].filter((v, i, arr) => v && arr.indexOf(v) === i);

const storageResults = {};
let workingBucket = null;
for (const name of candidates) {
  try {
    const bucket = admin.storage().bucket(name);
    const [exists] = await bucket.exists();
    if (exists) {
      const [meta] = await bucket.getMetadata();
      storageResults[name] = { ok: true, location: meta.location || null };
      workingBucket = name;
    } else {
      storageResults[name] = { ok: false, message: 'does not exist' };
    }
  } catch (e) {
    storageResults[name] = {
      ok: false,
      code: e.code || null,
      message: String(e.message || e).split('\n')[0],
    };
  }
}
results.storage = { workingBucket, candidates: storageResults };

try {
  results.messaging = { ok: Boolean(admin.messaging()) };
} catch (e) {
  results.messaging = {
    ok: false,
    message: String(e.message || e).split('\n')[0],
  };
}

results.overall =
  results.auth?.ok === true && Boolean(results.storage?.workingBucket);

console.log(JSON.stringify(results, null, 2));
process.exit(results.overall ? 0 : 1);
