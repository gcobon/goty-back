import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import * as express from 'express';
import * as cors from 'cors';

const serviceAccount = require('./firebaseServiceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

// // Start writing Firebase Functions
// // https://firebase.google.com/docs/functions/typescript
//
export const helloWorld = functions.https.onRequest((request, response) => {
  functions.logger.info('Hello logs!', { structuredData: true });
  response.json('Hola mundo desde funciones de firebase!!!!');
});

export const getGoty = functions.https.onRequest(
  async (request, response) => {}
);

//Express
const app = express();
app.use(cors({ origin: true }));

app.get('/goty', async (req, res) => {
  const gotyRef = db.collection('goty');
  const docsSnap = await gotyRef.get();
  const juegos = docsSnap.docs.map((doc) => doc.data());

  res.json(juegos);
});

app.post('/goty/:id', async (req, res) => {
  const id = req.params.id;
  const gameRef = db.collection('goty').doc(id);
  const gameSnap = await gameRef.get();

  if (!gameSnap.exists) {
    return res.status(404).json({
      ok: false,
      message: `No existe el juego con el id ${id}`,
    });
  }

  const antes = gameSnap.data() || { votos: 0 };

  await gameRef.update({
    votos: antes.votos + 1,
  });

  return res.json({
    ok: true,
    message: `Gracias por tu voto a ${antes.name}`,
  });
});

export const api = functions.https.onRequest(app);
