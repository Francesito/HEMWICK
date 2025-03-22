// back/db/routes/usuarioRutas.js
const express = require('express');
const router = express.Router();

module.exports = (db, auth) => {
  router.post('/register', async (req, res) => {
    let userRecord = null;
    try {
      const { email, password, nombre, userType, cedula } = req.body;

      if (!email || !password || !nombre || !userType) {
        return res.status(400).json({ success: false, error: 'Faltan campos requeridos.' });
      }

      if (userType === 'physio' && (!cedula || !/^\d{8,10}$/.test(cedula))) {
        return res.status(400).json({ success: false, error: 'Cédula inválida. Debe ser un número de 8 a 10 dígitos.' });
      }

      if (userType === 'basic') {
        const allowedUserDoc = await db.collection('usuariosPermitidos').doc(email).get();
        if (!allowedUserDoc.exists) {
          return res.status(403).json({ success: false, error: 'No estás autorizado por un fisioterapeuta para registrarte.' });
        }
      }

      userRecord = await auth.createUser({
        email,
        password,
        displayName: nombre,
      });

      await db.collection('usuarios').doc(userRecord.uid).set({
        nombre,
        email,
        userType,
        cedula: userType === 'physio' ? cedula : null,
        createdAt: new Date().toISOString(),
        hasSessions: false,
      });

      if (userType === 'basic') {
        const initialCollection = db.collection('usuarios').doc(userRecord.uid).collection('datos');
        await Promise.all([
          initialCollection.doc('Index').set({ angle: '0°', force: '0 N', servoforce: '0 N', velocity: '0 °/s' }),
          initialCollection.doc('Little').set({ angle: '0°', force: '0 N', servoforce: '0 N', velocity: '0 °/s' }),
          initialCollection.doc('Middle').set({ angle: '0°', force: '0 N', servoforce: '0 N', velocity: '0 °/s' }),
          initialCollection.doc('Ring').set({ angle: '0°', force: '0 N', servoforce: '0 N', velocity: '0 °/s' }),
        ]);

        await db.collection('usuarios').doc(userRecord.uid).update({ hasSessions: true });

        await db.collection('usuariosPermitidos').doc(email).update({ registered: true });

        const patientDocRef = db.collection('pacientes').doc(email);
        const patientDoc = await patientDocRef.get();
        if (patientDoc.exists) {
          await patientDocRef.update({ userId: userRecord.uid });
        }
      }

      res.status(201).json({ success: true, message: 'Usuario registrado', uid: userRecord.uid });
    } catch (error) {
      console.error('Error en /register:', error.message);
      if (userRecord) {
        try {
          await auth.deleteUser(userRecord.uid);
          console.log(`Usuario ${userRecord.uid} eliminado de Authentication debido a un error.`);
        } catch (deleteError) {
          console.error('Error al eliminar usuario de Authentication:', deleteError.message);
        }
      }
      if (error.code === 'auth/email-already-in-use') {
        res.status(400).json({ success: false, error: 'El correo ya está registrado. Por favor, inicia sesión.' });
      } else {
        res.status(500).json({ success: false, error: error.message });
      }
    }
  });

  // Ruta para eliminar un usuario
  router.post('/delete-user', async (req, res) => {
    try {
      const { email } = req.body;
      if (!email) {
        return res.status(400).json({ success: false, error: 'Falta el correo electrónico.' });
      }

      const userRecord = await auth.getUserByEmail(email);
      await auth.deleteUser(userRecord.uid);
      res.json({ success: true, message: `Usuario con email ${email} eliminado.` });
    } catch (error) {
      console.error('Error en /delete-user:', error.message);
      if (error.code === 'auth/user-not-found') {
        res.status(404).json({ success: false, error: 'Usuario no encontrado en Firebase Authentication.' });
      } else {
        res.status(500).json({ success: false, error: error.message });
      }
    }
  });

  router.post('/login', async (req, res) => {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        return res.status(400).json({ success: false, error: 'Faltan email o contraseña.' });
      }

      const userRecord = await auth.getUserByEmail(email);
      res.json({ success: true, uid: userRecord.uid });
    } catch (error) {
      console.error('Error en /login:', error.message);
      res.status(401).json({ success: false, error: 'Credenciales inválidas.' });
    }
  });

  router.get('/sobre-nosotros', (req, res) => {
    res.json({
      success: true,
      data: 'Somos un equipo dedicado a innovar en tecnología wearable.',
    });
  });

  router.get('/sobre-producto', (req, res) => {
    res.json({
      success: true,
      data: 'El guante inteligente captura movimientos en tiempo real con sensores flexibles.',
    });
  });

  router.get('/dashboard', async (req, res) => {
    try {
      const token = req.header('Authorization')?.replace('Bearer ', '');
      if (!token) return res.status(401).json({ success: false, message: 'No autorizado' });

      const decodedToken = await auth.verifyIdToken(token);
      const userDoc = await db.collection('usuarios').doc(decodedToken.uid).get();
      if (!userDoc.exists) {
        return res.status(404).json({ success: false, message: 'Usuario no encontrado' });
      }

      res.json({ success: true, data: userDoc.data() });
    } catch (error) {
      console.error('Error en /dashboard:', error.message);
      res.status(500).json({ success: false, error: error.message });
    }
  });

  return router;
};