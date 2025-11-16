const admin = require('firebase-admin');
const path = require('path');

// Path to your service account key file
const serviceAccount = require(path.join(__dirname, 'serviceAccountKey.json'));

// Initialize Firebase Admin SDK
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

module.exports = { admin, db };
