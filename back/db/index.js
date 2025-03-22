// back/db/index.js
const express = require('express');
const cors = require('cors');
const admin = require('firebase-admin');
const usuarioRutas = require('./routes/usuariosRutas'); // Importa la función

// Carga las credenciales (ajusta el nombre del archivo según el que descargaste)
const serviceAccount = require('./config/serviceAccountKey.json'); // Reemplaza con el nombre real de tu archivo

// Inicializa Firebase Admin SDK
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

// Exporta db y auth para usarlos en las rutas
const db = admin.firestore();
const auth = admin.auth();

// Configura Express
const app = express();
app.use(express.json());
app.use(cors());

// Ruta raíz
app.get('/', (req, res) => {
  res.json({ message: 'Backend corriendo' });
});

// Registra las rutas de usuarioRutas, pasando db y auth
app.use('/api', usuarioRutas(db, auth));

// Inicia el servidor
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});