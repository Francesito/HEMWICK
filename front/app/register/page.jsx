// front/app/register/page.jsx
'use client';

import { useState } from 'react';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { setDoc, doc } from 'firebase/firestore';
import { auth, db } from '../firebase';
import styles from '../../styles/register.module.css';

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      await setDoc(doc(db, 'usuarios', userCredential.user.uid), {
        nombre: name,
        email,
        createdAt: new Date().toISOString(),
      });
      alert('Registro exitoso');
    } catch (error) {
      alert('Error: ' + error.message);
    }
  };

  return (
    <div className={styles.container}>
      <h1>Registrarse</h1>
      <form onSubmit={handleSubmit} className={styles.form}>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Nombre"
          required
          className={styles.input}
        />
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Correo"
          required
          className={styles.input}
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Contraseña"
          required
          className={styles.input}
        />
        <button type="submit" className={styles.button}>Registrarse</button>
      </form>
    </div>
  );
}