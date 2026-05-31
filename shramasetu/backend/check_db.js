const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json'); // Assumes this is in backend

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function checkDb() {
  const usersSnap = await db.collection('users').get();
  console.log('USERS:', usersSnap.docs.map(d => ({id: d.id, ...d.data()})));

  const jobsSnap = await db.collection('jobs').get();
  console.log('JOBS:', jobsSnap.docs.map(d => ({id: d.id, ...d.data()})));

  process.exit(0);
}

checkDb();
