const { getAdmin } = require('./_lib/firebase-admin');

module.exports = async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');

  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({
      ok: false,
      error: 'Method not allowed.'
    });
  }

  try {
    const { cardId, recoveryCode } = req.body || {};

    if (!cardId || !/^[A-Za-z0-9_-]+$/.test(cardId)) {
      return res.status(400).json({
        ok: false,
        error: 'Invalid card ID.'
      });
    }

    const expected = process.env.MASTER_RECOVERY_CODE;

    if (!expected) {
      console.error('MASTER_RECOVERY_CODE is not configured.');
      return res.status(500).json({
        ok: false,
        error: 'Server configuration error.'
      });
    }

    if (
      typeof recoveryCode !== 'string' ||
      recoveryCode.trim() !== expected
    ) {
      return res.status(401).json({
        ok: false,
        error: 'Invalid Recovery Code!'
      });
    }

    const admin = getAdmin();
    const db = admin.firestore();

    const cardRef = db.collection('cards').doc(cardId);

    await cardRef.set(
      {
        pin: '1234',
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      },
      { merge: true }
    );

    return res.status(200).json({
      ok: true,
      message: 'PIN reset successfully.',
      pin: '1234'
    });

  } catch (error) {
    console.error('RESET PIN ERROR:', error);

    return res.status(500).json({
      ok: false,
      error: 'PIN reset failed.'
    });
  }
};
