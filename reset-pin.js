const { getAdmin } = require('./_lib/firebase-admin');

module.exports = async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ ok: false, error: 'Method not allowed.' });
  }

  try {
    const { cardId, recoveryCode } = req.body || {};
    if (!cardId || !/^[A-Za-z0-9_-]+$/.test(cardId)) {
      return res.status(400).json({ ok: false, error: 'Invalid card ID.' });
    }

    // Kept server-side so it is no longer exposed in index.html.
    // You can later add MASTER_RECOVERY_CODE in Vercel to change it without editing code.
    const expected = process.env.MASTER_RECOVERY_CODE || 'ZD2026';
    if (typeof recoveryCode !== 'string' || recoveryCode.trim() !== expected) {
      return res.status(401).json({ ok: false, error: 'Invalid Recovery Code!' });
    }

    const admin = getAdmin();
    const ref = admin.firestore().collection('cards').doc(cardId);
    const snap = await ref.get();
    if (!snap.exists) return res.status(404).json({ ok: false, error: 'Card not found.' });

    await ref.update({ pin: '1234', passcode: '1234', enable_pin: true });
    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error('reset-pin error:', err);
    return res.status(500).json({ ok: false, error: 'Server error while resetting PIN.' });
  }
};
