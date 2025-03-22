'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { auth, db } from './firebase';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  signOut,
} from 'firebase/auth';
import { setDoc, doc, getDoc, collection, getDocs, query, where } from 'firebase/firestore';
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import jsPDF from 'jspdf';
import Image from 'next/image';
import '../styles/globalStyles.css';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

// Configuración del patrón de fondo de Highcharts
Highcharts.wrap(Highcharts.Chart.prototype, 'getContainer', function (proceed) {
  const result = proceed.apply(this, Array.prototype.slice.call(arguments, 1));
  const chart = this;
  if (chart.options.chart.backgroundPattern) {
    const pattern = chart.renderer.createElement('pattern').attr({
      id: 'gridPattern',
      patternUnits: 'userSpaceOnUse',
      width: 20,
      height: 20,
    }).add();
    chart.renderer
      .path(['M', 0, 0, 'L', 20, 20, 'M', 20, 0, 'L', 0, 20])
      .attr({
        stroke: 'rgba(229, 231, 235, 0.05)',
        'stroke-width': 1,
      })
      .add(pattern);
    chart.container.style.backgroundImage = `url(#${pattern.attr('id')})`;
  }
  return result;
});

// Estado inicial de chartOptions (gráfico vacío)
const initialChartOptions = {
  chart: {
    type: 'line',
    height: 550,
    backgroundColor: 'rgba(26, 32, 44, 0.95)',
    style: { fontFamily: 'Roboto, sans-serif' },
    borderRadius: 16,
    shadow: { color: 'rgba(0, 0, 0, 0.5)', offsetX: 0, offsetY: 5, opacity: 0.2, width: 10 },
    backgroundPattern: true,
    animation: { duration: 1500, easing: 'easeOutBounce' },
  },
  title: { text: 'Progreso de Rehabilitación', style: { color: '#e5e7eb', fontSize: '24px', fontWeight: 'bold' } },
  subtitle: { text: 'No hay datos disponibles', style: { color: '#ff4444', fontSize: '14px' } },
  xAxis: {
    categories: ['Índice', 'Meñique', 'Medio', 'Anular'],
    title: { text: 'Dedos', style: { color: '#e5e7eb', fontSize: '14px' } },
    labels: { style: { color: '#e5e7eb', fontSize: '14px' } },
    lineColor: '#e5e7eb',
    tickColor: '#e5e7eb',
    margin: 20,
  },
  yAxis: [
    {
      id: 'angle',
      title: { text: 'Ángulo (grados)', style: { color: '#00eaff', fontSize: '14px' } },
      labels: {
        style: { color: '#00eaff', fontSize: '12px' },
        formatter: function () {
          return `${this.value}°`;
        },
      },
      min: 0,
      max: 180,
      tickInterval: 30,
      gridLineColor: 'rgba(229, 231, 235, 0.1)',
    },
    {
      id: 'force',
      title: { text: 'Fuerza (N)', style: { color: '#ff00cc', fontSize: '14px' } },
      labels: {
        style: { color: '#ff00cc', fontSize: '12px' },
        formatter: function () {
          return `${this.value} N`;
        },
      },
      min: 0,
      max: 20,
      tickInterval: 5,
      opposite: true,
      gridLineColor: 'rgba(229, 231, 235, 0.1)',
    },
    {
      id: 'servoforce',
      title: { text: 'Fuerza Servo (N) *Estimada', style: { color: '#ffaa00', fontSize: '14px' } },
      labels: {
        style: { color: '#ffaa00', fontSize: '12px' },
        formatter: function () {
          return `${this.value} N`;
        },
      },
      min: 0,
      max: 15,
      tickInterval: 3,
      opposite: true,
      gridLineColor: 'rgba(229, 231, 235, 0.1)',
    },
    {
      id: 'velocity',
      title: { text: 'Velocidad (grados/s)', style: { color: '#a3e635', fontSize: '14px' } },
      labels: {
        style: { color: '#a3e635', fontSize: '12px' },
        formatter: function () {
          return `${this.value} °/s`;
        },
      },
      min: 0,
      max: 200,
      tickInterval: 40,
      gridLineColor: 'rgba(229, 231, 235, 0.1)',
    },
  ],
  tooltip: {
    shared: true,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    style: { color: '#e5e7eb', fontSize: '14px' },
    formatter: function () {
      const points = this.points;
      let tooltip = `<b>${this.x}</b><br/>`;
      points.forEach((point) => {
        const seriesName = point.series.name;
        const value = point.y;
        const unit = seriesName.includes('Ángulo') ? '°' : seriesName.includes('Fuerza') || seriesName.includes('Servo') ? ' N' : ' °/s';
        const description = seriesName === 'Ángulo del Dedo' ? 'Nivel de flexión del dedo (medido por sensores flexibles)' :
                          seriesName === 'Fuerza' ? 'Fuerza ejercida por el dedo' :
                          seriesName === 'Fuerza Servo' ? 'Fuerza estimada del servo (SM-S4306R)' :
                          'Velocidad de movimiento (medida por MPU6050)';
        tooltip += `<span style="color:${point.color}">${seriesName}: ${value}${unit} (${description})</span><br/>`;
      });
      return tooltip;
    },
  },
  plotOptions: {
    line: {
      lineWidth: 3,
      marker: {
        symbol: 'circle',
        radius: 6,
        fillColor: '#ffffff',
        lineWidth: 2,
        lineColor: null,
        states: { hover: { radius: 8, fillColor: '#ffffff', lineWidth: 3 } },
      },
      states: { hover: { lineWidth: 4 } },
      zones: [{ value: 0 }, { color: null }],
    },
    series: {
      dataLabels: {
        enabled: true,
        formatter: function () {
          const seriesName = this.series.name;
          const unit = seriesName.includes('Ángulo') ? '°' : seriesName.includes('Fuerza') || seriesName.includes('Servo') ? ' N' : ' °/s';
          return `<span style="color:${this.series.color}">${this.y}${unit}</span>`;
        },
        style: { fontSize: '12px', textOutline: 'none' },
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        borderRadius: 4,
        padding: 4,
        shadow: true,
      },
      events: { legendItemClick: function () { return true; } },
    },
  },
  series: [
    { name: 'Ángulo del Dedo', yAxis: 'angle', data: [], color: { linearGradient: { x1: 0, x2: 0, y1: 0, y2: 1 }, stops: [[0, '#00eaff'], [1, '#00b4cc']] }, dashStyle: 'Solid' },
    { name: 'Fuerza', yAxis: 'force', data: [], color: { linearGradient: { x1: 0, x2: 0, y1: 0, y2: 1 }, stops: [[0, '#ff00cc'], [1, '#cc0099']] }, dashStyle: 'Dash' },
    { name: 'Fuerza Servo', yAxis: 'servoforce', data: [], color: { linearGradient: { x1: 0, x2: 0, y1: 0, y2: 1 }, stops: [[0, '#ffaa00'], [1, '#cc8800']] }, dashStyle: 'Dot' },
    { name: 'Velocidad', yAxis: 'velocity', data: [], color: { linearGradient: { x1: 0, x2: 0, y1: 0, y2: 1 }, stops: [[0, '#a3e635'], [1, '#7ecc1c']] }, dashStyle: 'DashDot' },
  ],
  legend: {
    itemStyle: { color: '#e5e7eb', fontSize: '14px' },
    itemHoverStyle: { color: '#ffffff' },
    align: 'center',
    verticalAlign: 'top',
    floating: false,
    borderWidth: 1,
    borderColor: 'rgba(229, 231, 235, 0.2)',
    backgroundColor: 'rgba(26, 32, 44, 0.8)',
    padding: 8,
    itemMarginTop: 5,
    itemMarginBottom: 5,
  },
  credits: { enabled: false },
};

export default function Home() {
  const [user, setUser] = useState(null);
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [userType, setUserType] = useState('basic');
  const [cedula, setCedula] = useState('');
  const [error, setError] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [patientName, setPatientName] = useState('');
  const [patientEmail, setPatientEmail] = useState('');
  const [patients, setPatients] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [observaciones, setObservaciones] = useState('');
  const [chartOptions, setChartOptions] = useState(initialChartOptions);
  const [previousData, setPreviousData] = useState(null);
  const [progressMessage, setProgressMessage] = useState('');
  const [sessionCount, setSessionCount] = useState(0);
  const [userObservaciones, setUserObservaciones] = useState('');
  const [loading, setLoading] = useState(true);

  const components = useMemo(
    () => [
      { name: 'Raspberry Pi 4 Modelo B', description: 'Microcontrolador principal con WiFi y Bluetooth.', image: '/imagenes/raspberry.jpg' },
      { name: 'Sensores Flexibles', description: 'Miden la flexión de los dedos.', image: '/imagenes/sensoresflexibles.png' },
      { name: 'MPU6050 (Giroscopio SparkFun)', description: 'Acelerómetro y giroscopio para detectar movimientos de la mano.', image: '/imagenes/sparkfun.jpg' },
      { name: 'Servomotores SM-S4306R', description: 'Asisten en los movimientos de los dedos con rotación continua.', image: '/imagenes/servo.jpg' },
      { name: 'Batería Recargable', description: 'Fuente de alimentación portátil.', image: '/imagenes/bateria.png' },
      { name: 'Módulo Bluetooth/WiFi', description: 'Comunicación con la app y la web.', image: '/imagenes/modulo.jpg' },
      { name: 'Cables y Conectores', description: 'Para integrar los componentes.', image: '/imagenes/jumpers.jpg' },
      { name: 'Guante de Tela o Neopreno', description: 'Base para montar los sensores.', image: '/imagenes/guantes.jpeg' },
    ],
    []
  );

  const [imageLoadStatus, setImageLoadStatus] = useState(
    components.map(() => ({ loaded: false, failed: false }))
  );

  const handleImageLoad = useCallback((index) => {
    setImageLoadStatus((prev) =>
      prev.map((status, i) =>
        i === index ? { ...status, loaded: true, failed: false } : status
      )
    );
  }, []);

  const handleImageError = useCallback((index) => {
    setImageLoadStatus((prev) =>
      prev.map((status, i) =>
        i === index ? { ...status, loaded: false, failed: true } : status
      )
    );
  }, []);

  // Función para reiniciar todos los estados
  const resetAllStates = useCallback(() => {
    setUser(null);
    setEmail('');
    setPassword('');
    setName('');
    setUserType('basic');
    setCedula('');
    setError('');
    setCurrentIndex(0);
    setPatientName('');
    setPatientEmail('');
    setPatients([]);
    setSelectedPatient(null);
    setObservaciones('');
    setChartOptions(initialChartOptions);
    setPreviousData(null);
    setProgressMessage('');
    setSessionCount(0);
    setUserObservaciones('');
  }, []);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (currentUser) => {
      setLoading(true);
      try {
        if (currentUser) {
          console.log('Cargando documento de usuario para UID:', currentUser.uid);
          const userDoc = await getDoc(doc(db, 'usuarios', currentUser.uid));
          if (userDoc.exists()) {
            const userData = { ...currentUser, ...userDoc.data() };
            setUser(userData);
            if (userData.userType === 'physio') {
              // Reiniciar estados antes de cargar pacientes
              setPatients([]);
              setSelectedPatient(null);
              setChartOptions(initialChartOptions);
              setProgressMessage('');
              setSessionCount(0);
              await fetchPatients(userData.uid);
            } else {
              await validateAndFetchUserData(currentUser.uid);
              try {
                const patientDoc = await getDoc(doc(db, 'pacientes', currentUser.email));
                if (patientDoc.exists()) {
                  const observacionData = patientDoc.data().observaciones || [];
                  const latestObservacion = Array.isArray(observacionData)
                    ? observacionData[observacionData.length - 1]?.text
                    : '';
                  setUserObservaciones(latestObservacion || '');
                }
              } catch (err) {
                console.error('Error al cargar documento de paciente:', err.message);
              }
            }
          } else {
            setError('Usuario no encontrado en la base de datos.');
            await signOut(auth);
            resetAllStates();
          }
        } else {
          resetAllStates();
        }
      } catch (err) {
        console.error('Error en el estado de autenticación:', err.message);
        setError('Error en la autenticación o permisos: ' + err.message);
        resetAllStates();
      } finally {
        setLoading(false);
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (user) {
      const interval = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % components.length);
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [user, components]);

  const isPhysioForUser = useCallback(async (userId, physioId) => {
    try {
      console.log(`Verificando si physioId ${physioId} tiene permisos para userId ${userId}`);
      const userDoc = await getDoc(doc(db, 'usuarios', userId));
      if (!userDoc.exists()) {
        console.error(`Documento de usuario no encontrado para userId: ${userId}`);
        return false;
      }
      const userEmail = userDoc.data().email;
      if (!userEmail) {
        console.error(`El usuario ${userId} no tiene un campo email válido`);
        return false;
      }
      const patientDoc = await getDoc(doc(db, 'pacientes', userEmail));
      if (!patientDoc.exists()) {
        console.error(`No se encontró un paciente con email: ${userEmail}`);
        return false;
      }
      const patientData = patientDoc.data();
      const isLinked = patientData.physioId === physioId;
      console.log(`Resultado de verificación: physioId ${physioId} ${isLinked ? 'tiene' : 'no tiene'} permisos para userId ${userId}`);
      return isLinked;
    } catch (err) {
      console.error('Error al verificar permisos de fisioterapeuta:', err.message);
      return false;
    }
  }, []);

  const hasValidSessionData = useCallback((snapshot) => {
    let hasData = false;
    snapshot.forEach((doc) => {
      const docData = doc.data();
      const angle = Number(docData.angle?.replace('°', '') || 0);
      const force = Number(docData.force?.replace(' N', '') || 0);
      const servoforce = Number(docData.servoforce?.replace(' N', '') || 0);
      const velocity = Number(docData.velocity?.replace(' °/s', '') || 0);
      if (angle > 0 || force > 0 || servoforce > 0 || velocity > 0) {
        hasData = true;
      }
    });
    return hasData;
  }, []);

  const getLatestSession = useCallback(async (userId, physioId = null) => {
    console.log('Intentando acceder a subcolecciones de userId:', userId, 'para physioId:', physioId);
    try {
      if (physioId) {
        const hasPermission = await isPhysioForUser(userId, physioId);
        if (!hasPermission) {
          console.error(`El fisioterapeuta ${physioId} no tiene permisos para acceder a los datos de userId ${userId}`);
          throw new Error('No tienes permisos para acceder a los datos de este usuario.');
        }
      }

      let sessionNum = 0;
      let latestSession = null;

      while (true) {
        const collectionName = sessionNum === 0 ? 'datos' : `datos${sessionNum}`;
        const sessionSnapshot = await getDocs(collection(db, 'usuarios', userId, collectionName));
        if (sessionSnapshot.empty) {
          break;
        }
        if (hasValidSessionData(sessionSnapshot)) {
          latestSession = collectionName;
        }
        sessionNum++;
      }

      console.log(`Última sesión válida encontrada: ${latestSession} para userId: ${userId}`);
      return latestSession;
    } catch (err) {
      console.error('Error en getLatestSession:', err.message);
      throw err;
    }
  }, [isPhysioForUser, hasValidSessionData]);

  const fetchPatients = useCallback(async (physioId) => {
    try {
      console.log('Cargando pacientes para physioId:', physioId);
      const patientsQuery = query(collection(db, 'pacientes'), where('physioId', '==', physioId));
      const patientsSnapshot = await getDocs(patientsQuery);
      const patientsList = [];
      let totalSessions = 0;

      for (const patientDoc of patientsSnapshot.docs) {
        const patientData = patientDoc.data();
        const patientEmail = patientData.email;

        const userQuery = query(collection(db, 'usuarios'), where('email', '==', patientEmail));
        const userSnapshot = await getDocs(userQuery);

        let userId = null;
        let userData = {};
        if (!userSnapshot.empty) {
          const userDoc = userSnapshot.docs[0];
          userId = userDoc.id;
          userData = userDoc.data();
        }

        let sessionCountForPatient = 0;
        let hasSessions = false;

        if (userId) {
          try {
            let sessionNum = 0;
            while (true) {
              const collectionName = sessionNum === 0 ? 'datos' : `datos${sessionNum}`;
              const sessionSnapshot = await getDocs(collection(db, 'usuarios', userId, collectionName));
              if (sessionSnapshot.empty) {
                break;
              }
              if (hasValidSessionData(sessionSnapshot)) {
                hasSessions = true;
                sessionCountForPatient++;
              }
              sessionNum++;
            }
            totalSessions += sessionCountForPatient;
          } catch (err) {
            console.warn(`No se pudo obtener las sesiones para userId ${userId}: ${err.message}`);
          }

          if (!userData.hasSessions && hasSessions) {
            await setDoc(doc(db, 'usuarios', userId), { hasSessions: true }, { merge: true });
          }

          patientsList.push({
            id: patientEmail,
            ...patientData,
            userId: userId,
            nombre: userData.nombre || patientData.nombre,
            hasSessions: hasSessions,
            sessionCount: sessionCountForPatient,
          });

          if (userId && (!patientData.userId || patientData.userId !== userId)) {
            await setDoc(doc(db, 'pacientes', patientEmail), { userId: userId }, { merge: true });
          }
        } else {
          // Incluir pacientes incluso si no tienen un usuario asociado en 'usuarios'
          patientsList.push({
            id: patientEmail,
            ...patientData,
            userId: null,
            nombre: patientData.nombre,
            hasSessions: false,
            sessionCount: 0,
          });
        }
      }

      console.log('Pacientes cargados:', patientsList);
      setPatients(patientsList);
      setSessionCount(totalSessions);

      // Si no hay pacientes, asegurarse de que no se muestre ningún dato
      if (patientsList.length === 0) {
        setSelectedPatient(null);
        setChartOptions(initialChartOptions);
        setProgressMessage('');
      }
    } catch (error) {
      console.error('Error al cargar pacientes:', error.message);
      setError('Error al cargar los pacientes: ' + error.message);
      setPatients([]);
      setSelectedPatient(null);
      setChartOptions(initialChartOptions);
      setProgressMessage('');
      setSessionCount(0);
    }
  }, [hasValidSessionData]);

  const validateAndFetchUserData = useCallback(async (userId) => {
    try {
      const latestSession = await getLatestSession(userId);
      if (!latestSession) {
        setChartOptions({
          ...initialChartOptions,
          subtitle: { text: 'Aún no tiene sesión registrada.', style: { color: '#ff4444', fontSize: '14px' } },
          series: initialChartOptions.series.map((s) => ({ ...s, data: [] })),
        });
        setProgressMessage('');
        return;
      }

      const datosSnapshot = await getDocs(collection(db, 'usuarios', userId, latestSession));
      const latestData = { session: latestSession, data: processSessionData(datosSnapshot) };
      setSessionCount(latestSession === 'datos' ? 1 : Number(latestSession.replace('datos', '')) + 1);

      const newOptions = {
        ...initialChartOptions,
        xAxis: { ...initialChartOptions.xAxis, categories: latestData.data.categories },
        series: [
          { ...initialChartOptions.series[0], data: latestData.data.series[0].data },
          { ...initialChartOptions.series[1], data: latestData.data.series[1].data },
          { ...initialChartOptions.series[2], data: latestData.data.series[2].data },
          { ...initialChartOptions.series[3], data: latestData.data.series[3].data },
        ],
        subtitle: {
          text: `${latestSession === 'datos' ? 'Sesión Inicial' : `Sesión ${latestSession.replace('datos', '')}`} | Mayor flexión: ${latestData.data.maxAngleFinger} (${latestData.data.maxAngle}°)`,
          style: { color: '#a0aec0', fontSize: '14px' },
        },
      };

      if (previousData && previousData.series[0].data.length > 0) {
        const message = analyzeProgress(newOptions, previousData, user?.userType === 'basic');
        setProgressMessage(message);
      } else {
        setProgressMessage('<span className="text-gray-400">Primera sesión registrada. ¡Sigue así!</span>');
      }

      setChartOptions(newOptions);
      setPreviousData(newOptions);
      await saveProgressCopy(userId, latestSession, latestData.data);
    } catch (err) {
      console.error('Error al validar y cargar datos del usuario:', err.message);
      setError('Error al cargar datos del usuario: ' + err.message);
      setChartOptions(initialChartOptions);
    }
  }, [previousData, user]);

  const processSessionData = useCallback((snapshot) => {
    const data = {
      categories: ['Índice', 'Meñique', 'Medio', 'Anular'],
      series: [
        { name: 'Ángulo del Dedo', data: [], yAxis: 'angle' },
        { name: 'Fuerza', data: [], yAxis: 'force' },
        { name: 'Fuerza Servo', data: [], yAxis: 'servoforce' },
        { name: 'Velocidad', data: [], yAxis: 'velocity' },
      ],
    };

    const fingerData = {};
    snapshot.forEach((doc) => {
      const finger = doc.id;
      const docData = doc.data();
      fingerData[finger] = {
        angle: Number(docData.angle?.replace('°', '') || 0),
        force: Number(docData.force?.replace(' N', '') || 0),
        servoforce: Number(docData.servoforce?.replace(' N', '') || 0),
        velocity: Number(docData.velocity?.replace(' °/s', '') || 0),
      };
    });

    const englishToSpanish = { Index: 'Índice', Little: 'Meñique', Middle: 'Medio', Ring: 'Anular' };
    const orderedData = ['Index', 'Little', 'Middle', 'Ring'].map(
      (finger) => fingerData[finger] || { angle: 0, force: 0, servoforce: 0, velocity: 0 }
    );

    data.series[0].data = orderedData.map((f) => f.angle);
    data.series[1].data = orderedData.map((f) => f.force);
    data.series[2].data = orderedData.map((f) => f.servoforce);
    data.series[3].data = orderedData.map((f) => f.velocity);

    const maxAngle = Math.max(...data.series[0].data);
    const maxAngleFingerEnglish = ['Index', 'Little', 'Middle', 'Ring'][data.series[0].data.indexOf(maxAngle)];
    data.maxAngleFinger = englishToSpanish[maxAngleFingerEnglish];
    data.maxAngle = maxAngle;

    return data;
  }, []);

  const saveProgressCopy = useCallback(async (userId, sessionName, data) => {
    try {
      let newSessionNum;
      if (sessionName === 'datos') {
        newSessionNum = 1;
      } else {
        newSessionNum = Number(sessionName.replace('datos', '')) + 1;
      }

      const newCollection = collection(db, 'usuarios', userId, `datos${newSessionNum}`);
      await Promise.all([
        setDoc(doc(newCollection, 'Index'), { angle: '0°', force: '0 N', servoforce: '0 N', velocity: '0 °/s' }),
        setDoc(doc(newCollection, 'Little'), { angle: '0°', force: '0 N', servoforce: '0 N', velocity: '0 °/s' }),
        setDoc(doc(newCollection, 'Middle'), { angle: '0°', force: '0 N', servoforce: '0 N', velocity: '0 °/s' }),
        setDoc(doc(newCollection, 'Ring'), { angle: '0°', force: '0 N', servoforce: '0 N', velocity: '0 °/s' }),
      ]);

      setSessionCount(newSessionNum);
      await setDoc(doc(db, 'usuarios', userId), { hasSessions: true }, { merge: true });
    } catch (err) {
      console.error('Error al guardar copia de progreso:', err.message);
      setError('Error al guardar progreso: ' + err.message);
    }
  }, []);

  const validateCedula = useCallback((cedula) => {
    const cedulaRegex = /^\d{8,10}$/;
    return cedulaRegex.test(cedula);
  }, []);

  const analyzeProgress = useCallback((currentData, previousData, isBasicUser) => {
    if (!previousData || !previousData.series || currentData.series.length < 4) return '';
    const currentAngles = currentData.series[0].data;
    const currentForces = currentData.series[1].data;
    const currentServoForces = currentData.series[2].data;
    const currentVelocities = currentData.series[3].data;
    const prevAngles = previousData.series[0].data;
    const prevForces = previousData.series[1].data;
    const prevServoForces = previousData.series[2].data;
    const prevVelocities = previousData.series[3].data;

    const avgCurrentAngle = currentAngles.reduce((a, b) => a + b, 0) / currentAngles.length || 0;
    const avgCurrentForce = currentForces.reduce((a, b) => a + b, 0) / currentForces.length || 0;
    const avgCurrentServoForce = currentServoForces.reduce((a, b) => a + b, 0) / currentServoForces.length || 0;
    const avgCurrentVelocity = currentVelocities.reduce((a, b) => a + b, 0) / currentVelocities.length || 0;
    const avgPrevAngle = prevAngles.reduce((a, b) => a + b, 0) / prevAngles.length || 0;
    const avgPrevForce = prevForces.reduce((a, b) => a + b, 0) / prevForces.length || 0;
    const avgPrevServoForce = prevServoForces.reduce((a, b) => a + b, 0) / prevServoForces.length || 0;
    const avgPrevVelocity = prevVelocities.reduce((a, b) => a + b, 0) / prevVelocities.length || 0;

    let message = '<span className="text-gray-400">Análisis de Progreso:</span><br/>';
    let improvements = [];
    let suggestions = [];

    if (avgCurrentAngle > avgPrevAngle) {
      improvements.push(`Flexión mejorada en ${(avgCurrentAngle - avgPrevAngle).toFixed(1)}°.`);
    } else if (avgCurrentAngle < avgPrevAngle) {
      suggestions.push('Haz ejercicios suaves para mejorar la flexión.');
    }

    if (avgCurrentForce > avgPrevForce) {
      improvements.push(`Fuerza aumentada en ${(avgCurrentForce - avgPrevForce).toFixed(1)} N.`);
    } else if (avgCurrentForce < avgPrevForce) {
      suggestions.push('Prueba ejercicios de resistencia.');
    }

    if (avgCurrentVelocity > avgPrevVelocity) {
      improvements.push(`Velocidad mejorada en ${(avgCurrentVelocity - avgPrevVelocity).toFixed(1)} °/s.`);
    } else if (avgCurrentVelocity < avgPrevVelocity) {
      suggestions.push('Practica movimientos más rápidos.');
    }

    if (improvements.length > 0) {
      message += '<span className="text-green-400">Mejoras: ' + improvements.join(' ') + '</span><br/>';
    }
    if (suggestions.length > 0) {
      message += '<span className="text-yellow-400">Sugerencias: ' + suggestions.join(' ') + '</span>';
    } else if (
      improvements.length === 0 &&
      avgCurrentAngle < avgPrevAngle &&
      avgCurrentForce < avgPrevForce &&
      avgCurrentVelocity < avgPrevVelocity
    ) {
      message +=
        '<span className="text-blue-400">¡Ánimo! Aunque hayas retrocedido un poco, cada pequeño esfuerzo cuenta. Sigue practicando y consulta a tu fisioterapeuta si necesitas apoyo.</span>';
    } else if (improvements.length === 0) {
      message += '<span className="text-yellow-400">¡Sigue así! Tus métricas están estables.</span>';
    }

    if (isBasicUser) {
      message += '<br/><span className="text-cyan-400 cursor-pointer mt-2" onClick={handleShowTips}>Consejos</span>';
      message += ' <span className="text-cyan-400 cursor-pointer mt-2" onClick={handleShowGoals}>Objetivos Esperados</span>';
    }

    return message;
  }, []);

  const handleShowTips = useCallback(() => {
    const avgAngle = chartOptions.series[0].data.reduce((a, b) => a + b, 0) / chartOptions.series[0].data.length || 0;
    const avgForce = chartOptions.series[1].data.reduce((a, b) => a + b, 0) / chartOptions.series[1].data.length || 0;
    const avgVelocity = chartOptions.series[3].data.reduce((a, b) => a + b, 0) / chartOptions.series[3].data.length || 0;

    let tips = '<span className="text-gray-400">Consejos Personalizados:</span><br/>';
    if (avgAngle < 30) {
      tips += '<span className="text-yellow-400">Realiza ejercicios suaves de flexión (como abrir y cerrar la mano lentamente) 5-10 minutos al día.</span><br/>';
    } else if (avgAngle < 60) {
      tips += '<span className="text-yellow-400">Aumenta la intensidad con ejercicios de resistencia ligera, como apretar una pelota blanda.</span><br/>';
    } else {
      tips += '<span className="text-yellow-400">Mantén el progreso con ejercicios variados y consulta a tu fisioterapeuta para retos nuevos.</span><br/>';
    }
    if (avgForce < 5) {
      tips += '<span className="text-yellow-400">Fortalece los dedos con ejercicios isométricos (mantén la presión por 5 segundos).</span><br/>';
    } else if (avgForce < 10) {
      tips += '<span className="text-yellow-400">Prueba levantar objetos ligeros (100-200g) para ganar fuerza.</span><br/>';
    }
    if (avgVelocity < 20) {
      tips += '<span className="text-yellow-400">Practica movimientos rápidos pero controlados (flexión en 1-2 segundos).</span>';
    }
    setProgressMessage(tips);
  }, [chartOptions]);

  const handleShowGoals = useCallback(() => {
    const avgAngle = chartOptions.series[0].data.reduce((a, b) => a + b, 0) / chartOptions.series[0].data.length || 0;
    const avgForce = chartOptions.series[1].data.reduce((a, b) => a + b, 0) / chartOptions.series[1].data.length || 0;
    const avgVelocity = chartOptions.series[3].data.reduce((a, b) => a + b, 0) / chartOptions.series[3].data.length || 0;

    let goals = '<span className="text-gray-400">Objetivos Esperados:</span><br/>';
    if (avgAngle < 30) {
      goals += '<span className="text-yellow-400">Alcanzar 45° de flexión en 2 semanas con práctica diaria.</span><br/>';
    } else if (avgAngle < 60) {
      goals += '<span className="text-yellow-400">Llegar a 90° de flexión y 5 N de fuerza en 1 mes.</span><br/>';
    } else {
      goals += '<span className="text-yellow-400">Mantener 90-120° de flexión y aumentar fuerza a 10-15 N en 2 meses.</span><br/>';
    }
    if (avgForce < 5) {
      goals += '<span className="text-yellow-400">Alcanzar 5-7 N de fuerza en 3 semanas.</span><br/>';
    } else if (avgForce < 10) {
      goals += '<span className="text-yellow-400">Llegar a 10 N con ejercicios regulares en 1 mes.</span><br/>';
    }
    if (avgVelocity < 20) {
      goals += '<span className="text-yellow-400">Aumentar a 30-50 °/s en 2 semanas con práctica.</span>';
    }
    setProgressMessage(goals);
  }, [chartOptions]);

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Por favor, completa todos los campos requeridos (correo y contraseña).');
      return;
    }

    if (!isLoginMode) {
      if (!name || !userType) {
        setError('Por favor, completa todos los campos requeridos (nombre y tipo de usuario).');
        return;
      }
      if (userType === 'physio' && !validateCedula(cedula)) {
        setError('Cédula inválida. Debe ser un número de 8 a 10 dígitos.');
        return;
      }
    }

    try {
      if (isLoginMode) {
        console.log('Iniciando sesión con email:', email);
        const response = await fetch('http://localhost:3001/api/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email, password }),
        });

        const result = await response.json();
        if (!response.ok) {
          throw new Error(result.error || 'Error al iniciar sesión.');
        }

        await signInWithEmailAndPassword(auth, email, password);
        console.log('Inicio de sesión exitoso');
      } else {
        console.log('Registrando usuario con email:', email, 'y tipo:', userType);
        const response = await fetch('http://localhost:3001/api/register', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email, password, nombre: name, userType, cedula }),
        });

        const result = await response.json();
        if (!response.ok) {
          throw new Error(result.error || 'Error al registrar usuario.');
        }

        await signInWithEmailAndPassword(auth, email, password);
        console.log('Registro e inicio de sesión completados.');

        resetAllStates();
      }
    } catch (err) {
      if (err.message.includes('No estás autorizado por un fisioterapeuta')) {
        setError('No estás autorizado por un fisioterapeuta para registrarte. Contacta a tu fisioterapeuta.');
      } else if (err.message.includes('El correo ya está registrado')) {
        setError('El correo ya está registrado. Por favor, inicia sesión o usa otro correo.');
      } else if (err.code === 'auth/user-not-found') {
        setError('El usuario no existe. Por favor, verifica tu correo o regístrate.');
      } else if (err.code === 'auth/wrong-password') {
        setError('Contraseña incorrecta. Por favor, intenta de nuevo.');
      } else if (err.code === 'auth/email-already-in-use') {
        setError('El correo ya está registrado. Por favor, inicia sesión o usa otro correo.');
      } else if (err.code === 'auth/invalid-email') {
        setError('El formato del correo electrónico no es válido. Por favor, verifica tu correo.');
      } else if (err.code === 'auth/weak-password') {
        setError('La contraseña es demasiado débil. Debe tener al menos 6 caracteres.');
      } else if (err.code === 'auth/too-many-requests') {
        setError('Demasiados intentos fallidos. Por favor, espera unos minutos e intenta de nuevo.');
      } else if (err.code === 'permission-denied') {
        setError('No tienes permisos suficientes. Contacta al administrador.');
      } else if (err.message.includes('Usuario no permitido')) {
        setError('Este usuario no está permitido para realizar esta acción. Contacta al administrador.');
      } else if (err.message.includes('Credenciales inválidas')) {
        setError('Credenciales inválidas. Por favor, verifica tu correo y contraseña.');
      } else {
        setError('Ocurrió un error inesperado. Por favor, intenta de nuevo más tarde.');
      }
    }
  }, [isLoginMode, email, password, name, userType, cedula, validateCedula, resetAllStates]);

  const handleAddPatient = useCallback(async (e) => {
    e.preventDefault();
    try {
      if (!user || user.userType !== 'physio') {
        throw new Error('Solo fisioterapeutas pueden agregar pacientes.');
      }
      const userQuery = query(collection(db, 'usuarios'), where('email', '==', patientEmail));
      const userSnapshot = await getDocs(userQuery);
      let patientUserId = null;
      if (!userSnapshot.empty) {
        patientUserId = userSnapshot.docs[0].id;
      }

      const patientData = {
        nombre: patientName,
        email: patientEmail,
        physioId: user.uid,
        userId: patientUserId || null,
        createdAt: new Date().toISOString(),
        observaciones: [],
      };
      await setDoc(doc(db, 'pacientes', patientEmail), patientData);

      await setDoc(doc(db, 'usuariosPermitidos', patientEmail), {
        nombre: patientName,
        email: patientEmail,
        physioId: user.uid,
        registered: false,
        createdAt: new Date().toISOString(),
      }, { merge: true });

      setPatientName('');
      setPatientEmail('');
      await fetchPatients(user.uid);
    } catch (err) {
      console.error('Error al agregar paciente:', err.message);
      setError('Error al agregar paciente: ' + err.message);
    }
  }, [user, patientName, patientEmail, fetchPatients]);

  const handleAddObservacion = useCallback(async () => {
    if (!selectedPatient || !user || user.userType !== 'physio') return;
    try {
      const patientDoc = await getDoc(doc(db, 'pacientes', selectedPatient.id));
      if (patientDoc.exists()) {
        const currentObservaciones = patientDoc.data().observaciones || [];
        const newObservacion = {
          text: observaciones,
          fechaObservacion: new Date().toISOString(),
          physioId: user.uid,
        };
        const updatedObservaciones = [...currentObservaciones, newObservacion];
        await setDoc(doc(db, 'pacientes', selectedPatient.id), { observaciones: updatedObservaciones }, { merge: true });
        setObservaciones('');
        await fetchPatients(user.uid);
      }
    } catch (err) {
      console.error('Error al agregar observación:', err.message);
      setError('Error al agregar observación: ' + err.message);
    }
  }, [selectedPatient, user, observaciones, fetchPatients]);

  const handleDownloadReport = useCallback(() => {
    if (!user || user.userType !== 'physio') {
      setError('Solo los fisioterapeutas pueden descargar informes.');
      return;
    }

    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    doc.setFont('helvetica');
    doc.setTextColor(255, 255, 255);
    doc.setFillColor(26, 32, 44);
    doc.rect(10, 10, 190, 277, 'F');

    doc.setFontSize(20);
    doc.setTextColor(0, 234, 255);
    doc.text('Informe de Progreso', 105, 30, { align: 'center' });

    doc.setFontSize(12);
    doc.setTextColor(150, 150, 150);
    if (selectedPatient && chartOptions.series[0].data.length > 0) {
      doc.text(`Paciente: ${selectedPatient.nombre}`, 20, 50);
      doc.text(`Fecha: ${new Date().toLocaleDateString()}`, 20, 60);

      doc.setFillColor(45, 55, 72);
      doc.rect(20, 70, 170, 100, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(10);
      doc.text('Dedos', 30, 80);
      doc.text('Ángulo (°)', 80, 80);
      doc.text('Fuerza (N)', 110, 80);
      doc.text('Fuerza Servo (N)', 140, 80);
      doc.text('Velocidad (°/s)', 170, 80);

      chartOptions.xAxis.categories.forEach((category, index) => {
        const yPos = 90 + index * 15;
        doc.setTextColor(0, 234, 255);
        doc.text(category, 30, yPos);
        doc.setTextColor(255, 165, 0);
        doc.text(`${chartOptions.series[0].data[index]}`, 80, yPos);
        doc.text(`${chartOptions.series[1].data[index]}`, 110, yPos);
        doc.text(`${chartOptions.series[2].data[index]}`, 140, yPos);
        doc.text(`${chartOptions.series[3].data[index]}`, 170, yPos);
      });

      doc.setTextColor(150, 150, 150);
      doc.text('Observaciones:', 20, 180);
      const observacionesText =
        selectedPatient.observaciones?.map((obs) => `${new Date(obs.fechaObservacion).toLocaleString()}: ${obs.text}`).join('\n') ||
        'Sin observaciones';
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(9);
      doc.text(observacionesText.split('\n'), 20, 190, { maxWidth: 170, lineHeightFactor: 1.2 });

      doc.save(`Informe_Progreso_${selectedPatient.nombre}_${new Date().toLocaleDateString().replace(/\//g, '-')}.pdf`);
    } else {
      setError('No hay datos disponibles para descargar.');
    }
  }, [user, selectedPatient, chartOptions]);

  const getDailyProgressChart = useCallback(async (patientEmail) => {
    try {
      console.log(`Cargando progreso para el paciente con email: ${patientEmail}`);
      const userQuery = query(collection(db, 'usuarios'), where('email', '==', patientEmail));
      const userSnapshot = await getDocs(userQuery);
      if (userSnapshot.empty) {
        console.error(`Usuario no encontrado para email: ${patientEmail}`);
        return {
          ...initialChartOptions,
          subtitle: { text: 'Usuario no encontrado.', style: { color: '#ff4444', fontSize: '14px' } },
          series: initialChartOptions.series.map((s) => ({ ...s, data: [] })),
        };
      }

      const userDoc = userSnapshot.docs[0];
      const userId = userDoc.id;
      console.log(`Usuario encontrado con userId: ${userId}`);

      if (user && user.userType === 'physio') {
        const hasPermission = await isPhysioForUser(userId, user.uid);
        if (!hasPermission) {
          console.error(`El fisioterapeuta ${user.uid} no tiene permisos para acceder a los datos de userId ${userId}`);
          return {
            ...initialChartOptions,
            title: { text: 'Progreso Actual', style: { color: '#e5e7eb', fontSize: '24px', fontWeight: 'bold' } },
            subtitle: { text: 'No tienes permisos para ver los datos de este usuario.', style: { color: '#ff4444', fontSize: '14px' } },
            series: initialChartOptions.series.map((s) => ({ ...s, data: [] })),
          };
        }
      }

      const latestSession = await getLatestSession(userId, user?.userType === 'physio' ? user.uid : null);
      if (!latestSession) {
        console.log(`No se encontraron datos válidos para userId: ${userId}`);
        return {
          ...initialChartOptions,
          title: { text: 'Progreso Actual', style: { color: '#e5e7eb', fontSize: '24px', fontWeight: 'bold' } },
          subtitle: { text: 'Aún no hay datos registrados para este usuario.', style: { color: '#ff4444', fontSize: '14px' } },
          series: initialChartOptions.series.map((s) => ({ ...s, data: [] })),
        };
      }

      const datosSnapshot = await getDocs(collection(db, 'usuarios', userId, latestSession));
      const data = processSessionData(datosSnapshot);
      console.log(`Datos procesados para userId ${userId}:`, data);

      return {
        ...initialChartOptions,
        title: { text: 'Progreso Actual', style: { color: '#e5e7eb', fontSize: '24px', fontWeight: 'bold' } },
        subtitle: {
          text: `Datos de la última sesión | Mayor flexión: ${data.maxAngleFinger} (${data.maxAngle}°)`,
          style: { color: '#a0aec0', fontSize: '14px' },
        },
        xAxis: { categories: data.categories, title: { text: 'Dedos', style: { color: '#e5e7eb', fontSize: '14px' } } },
        series: [
          { ...initialChartOptions.series[0], data: data.series[0].data },
          { ...initialChartOptions.series[1], data: data.series[1].data },
          { ...initialChartOptions.series[2], data: data.series[2].data },
          { ...initialChartOptions.series[3], data: data.series[3].data },
        ],
      };
    } catch (err) {
      console.error('Error al cargar gráfico de progreso:', err.message);
      setError('Error al cargar gráfico de progreso: ' + err.message);
      return {
        ...initialChartOptions,
        title: { text: 'Progreso Actual', style: { color: '#e5e7eb', fontSize: '24px', fontWeight: 'bold' } },
        subtitle: { text: 'Error al cargar los datos.', style: { color: '#ff4444', fontSize: '14px' } },
        series: initialChartOptions.series.map((s) => ({ ...s, data: [] })),
      };
    }
  }, [user, isPhysioForUser, getLatestSession]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center background-pattern">
        <p className="text-gray-300 text-lg">Cargando...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col relative background-pattern">
      <Navbar user={user} />
      <main className="flex-grow">
        {!user ? (
          <div className="container mx-auto py-16 px-6 relative min-h-screen z-10 flex items-center justify-center">
            <div className="flex flex-col md:flex-row items-center justify-center gap-16 w-full max-w-6xl">
              <div className="w-full md:w-1/2 flex flex-col items-center space-y-8">
                <div className="relative w-full max-w-lg h-[300px] rounded-2xl overflow-hidden shadow-xl border border-gray-700">
                  <video autoPlay loop muted className="absolute top-0 left-0 w-full h-full object-cover">
                    <source src="./videos/BACKGROUND.mp4" type="video/mp4" />
                    Tu navegador no soporta el elemento de video.
                  </video>
                </div>
                <div className="text-center">
                  <h1 className="text-5xl font-bold text-cyan-300 mb-4">Smart Glove</h1>
                  <p className="text-lg text-gray-300 max-w-xl mx-auto">
                    Una solución avanzada para la rehabilitación de manos. Monitorea tu progreso, mejora tu movilidad y recupera tu fuerza con tecnología de punta.
                  </p>
                </div>
              </div>

              <div className="w-full md:w-1/2 flex justify-center">
                <div className="max-w-md w-full bg-cardBg backdrop-blur-md p-8 rounded-2xl shadow-2xl border border-gray-700">
                  <h2 className="text-3xl font-bold text-cyan-300 text-center mb-6">
                    {isLoginMode ? 'Iniciar Sesión' : 'Registrarse'}
                  </h2>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    {!isLoginMode && (
                      <>
                        <input
                          type="text"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder="Nombre"
                          required
                          className="input-field"
                        />
                        <select
                          value={userType}
                          onChange={(e) => setUserType(e.target.value)}
                          className="input-field"
                        >
                          <option value="basic">Usuario Básico</option>
                          <option value="physio">Fisioterapeuta</option>
                        </select>
                        {userType === 'physio' && (
                          <input
                            type="text"
                            value={cedula}
                            onChange={(e) => setCedula(e.target.value)}
                            placeholder="Cédula Profesional"
                            required
                            className="input-field"
                          />
                        )}
                      </>
                    )}
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Correo"
                      required
                      className="input-field"
                    />
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Contraseña"
                      required
                      className="input-field"
                    />
                    <button type="submit" className="button-primary">
                      {isLoginMode ? 'Iniciar Sesión' : 'Registrarse'}
                    </button>
                  </form>
                  <p className="text-center mt-4 text-gray-300">
                    {isLoginMode ? '¿No tienes cuenta?' : '¿Ya tienes cuenta?'}{' '}
                    <button
                      type="button"
                      onClick={() => setIsLoginMode(!isLoginMode)}
                      className="text-cyan-400 hover:text-cyan-300 transition-all"
                    >
                      {isLoginMode ? 'Regístrate' : 'Inicia sesión'}
                    </button>
                  </p>
                  {error && <p className="text-center text-red-500 mt-4">{error}</p>}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="container mx-auto py-16 px-6">
            {user.userType === 'physio' ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="bg-cardBg backdrop-blur-md p-6 rounded-2xl shadow-2xl border border-gray-700">
                  <h3 className="text-2xl font-bold text-cyan-300 mb-4 text-center">Agregar Paciente</h3>
                  <form onSubmit={handleAddPatient} className="space-y-4 w-full">
                    <input
                      type="text"
                      value={patientName}
                      onChange={(e) => setPatientName(e.target.value)}
                      placeholder="Nombre del paciente"
                      required
                      className="input-field"
                    />
                    <input
                      type="email"
                      value={patientEmail}
                      onChange={(e) => setPatientEmail(e.target.value)}
                      placeholder="Correo del paciente"
                      required
                      className="input-field"
                    />
                    <button type="submit" className="button-primary">Agregar</button>
                  </form>
                  <h3 className="text-2xl font-bold text-cyan-300 mt-8 mb-4 text-center">Pacientes Registrados</h3>
                  <ul className="space-y-4 w-full">
                    {patients.length > 0 ? (
                      patients.map((patient) => (
                        <li key={patient.id} className="flex justify-between items-center p-4 bg-darkBg rounded-lg shadow-md border border-gray-600">
                          <span className="text-gray-300">
                            {patient.nombre} ({patient.email}) {patient.hasSessions ? `(${patient.sessionCount} sesiones)` : '(Sin sesiones)'}
                          </span>
                          <button
                            onClick={() => {
                              setSelectedPatient(patient);
                              getDailyProgressChart(patient.email).then((options) => setChartOptions(options));
                            }}
                            className="text-cyan-400 hover:text-cyan-300 transition-all"
                          >
                            Ver
                          </button>
                        </li>
                      ))
                    ) : (
                      <p className="text-gray-400 text-center">No hay pacientes registrados.</p>
                    )}
                  </ul>
                  <div className="mt-8 w-full">
                    <h4 className="text-xl font-bold text-cyan-300 mb-4 text-center">Estadísticas Rápidas</h4>
                    <div className="space-y-4 text-center">
                      <p className="text-gray-300">Pacientes registrados: {patients.length}</p>
                      <p className="text-gray-300">Sesiones registradas: {sessionCount}</p>
                      <p className="text-gray-300">Última actualización: {new Date().toLocaleDateString()}</p>
                    </div>
                  </div>
                  {selectedPatient && selectedPatient.observaciones && selectedPatient.observaciones.length > 0 && (
                    <div className="mt-8 p-4 bg-darkBg rounded-lg shadow-md border border-gray-600">
                      <h5 className="text-xl font-bold text-cyan-300 mb-4">Historial de Observaciones</h5>
                      {selectedPatient.observaciones.map((obs, index) => (
                        <p key={index} className="text-gray-300 whitespace-pre-wrap">
                          {new Date(obs.fechaObservacion).toLocaleString()}: {obs.text}
                        </p>
                      ))}
                    </div>
                  )}
                </div>

                <div className="md:col-span-2 bg-cardBg backdrop-blur-md p-6 rounded-2xl shadow-2xl border border-gray-700">
                  {selectedPatient ? (
                    <>
                      <h3 className="text-2xl font-bold text-cyan-300 mb-4 text-center">
                        Progreso de {selectedPatient.nombre}
                      </h3>
                      <div className="w-full chart-container p-4 bg-darkBg rounded-lg shadow-inner">
                        <HighchartsReact highcharts={Highcharts} options={chartOptions} />
                      </div>
                      {progressMessage && (
                        <div
                          className="mt-8 p-4 bg-darkBg rounded-lg shadow-md border border-gray-600 text-center"
                          dangerouslySetInnerHTML={{ __html: progressMessage }}
                        />
                      )}
                      <div className="mt-8 w-full">
                        <h4 className="text-xl font-bold text-cyan-300 mb-4 text-center">Observaciones</h4>
                        <textarea
                          value={observaciones}
                          onChange={(e) => setObservaciones(e.target.value)}
                          placeholder="Escribe tus observaciones aquí..."
                          className="input-field h-32"
                        />
                        <button onClick={handleAddObservacion} className="button-primary mt-4">
                          Guardar Observación
                        </button>
                      </div>
                      <button onClick={handleDownloadReport} className="button-primary mt-4">
                        Descargar Informe PDF
                      </button>
                    </>
                  ) : (
                    <p className="text-gray-400 text-center">Selecciona un paciente para ver su progreso.</p>
                  )}
                  {error && <p className="text-center text-red-500 mt-4">{error}</p>}
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="md:col-span-2 bg-cardBg backdrop-blur-md p-6 rounded-2xl shadow-2xl border border-gray-700">
                  <div className="w-full chart-container p-4 bg-darkBg rounded-lg shadow-inner">
                    <HighchartsReact highcharts={Highcharts} options={chartOptions} />
                  </div>
                  {progressMessage && (
                    <div
                      className="mt-8 p-4 bg-darkBg rounded-lg shadow-md border border-gray-600 text-center"
                      dangerouslySetInnerHTML={{ __html: progressMessage }}
                    />
                  )}
                  {userObservaciones && (
                    <div className="mt-8 p-4 bg-darkBg rounded-lg shadow-md border border-gray-600 text-center">
                      <h4 className="text-xl font-bold text-cyan-300 mb-4">Observaciones de tu Fisioterapeuta</h4>
                      <p className="text-gray-300 whitespace-pre-wrap">{userObservaciones}</p>
                    </div>
                  )}
                </div>

                <div className="bg-cardBg backdrop-blur-md p-6 rounded-2xl shadow-2xl border border-gray-700">
                  <h3 className="text-2xl font-bold text-cyan-300 mb-4 text-center">Componentes del Smart Glove</h3>
                  <div className="relative w-full h-[600px] overflow-hidden rounded-lg shadow-inner border border-gray-600">
                    {components.map((component, index) => (
                      <div
                        key={index}
                        className={`absolute w-full h-[600px] flex flex-col justify-start items-center p-6 transition-opacity duration-500 ease-in-out ${
                          index === currentIndex ? 'opacity-100' : 'opacity-0'
                        }`}
                        style={{ top: 0, left: 0 }}
                      >
                        <div className="w-full flex flex-col">
                          <h4 className="text-xl font-semibold text-cyan-300 text-center mb-4">{component.name}</h4>
                          <p className="text-gray-300 text-center mb-6">{component.description}</p>
                          <div className="w-full flex-1 flex items-center justify-center">
                            {imageLoadStatus[index].failed ? (
                              <div className="text-gray-400 text-center">[Imagen no disponible]</div>
                            ) : (
                              <Image
                                src={component.image}
                                alt={component.name}
                                width={400}
                                height={400}
                                className="max-w-full max-h-[400px] object-contain rounded-lg"
                                onLoad={() => handleImageLoad(index)}
                                onError={() => handleImageError(index)}
                              />
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}