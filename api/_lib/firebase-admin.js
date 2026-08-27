const admin = require('firebase-admin');

function getAdmin() {
  if (admin.apps.length) return admin;
  const raw = process.env.FIREBASE_SERVICE_ACCOUNT;
  if (!raw) throw new Error('FIREBASE_SERVICE_ACCOUNT is not configured.');
  let serviceAccount;
  try {
    serviceAccount = JSON.parse(raw);
  } catch (_) {
    throw new Error('FIREBASE_SERVICE_ACCOUNT must contain the complete Firebase service-account JSON.');
  }
  if (serviceAccount.private_key) {
    serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, '\n');
  }
  admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
  return admin;
}

module.exports = { getAdmin };
