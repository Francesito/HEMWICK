// db/config/firebase.js
const admin = require('firebase-admin');
const { readFileSync } = require('fs');
require('dotenv').config();

const serviceAccount = JSON.parse(readFileSync(process.env.FIREBASE_SERVICE_ACCOUNT));

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();
const auth = admin.auth();

module.exports = { db, auth };