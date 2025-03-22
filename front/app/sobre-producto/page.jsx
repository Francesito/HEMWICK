// ./app/sobre-producto/page.jsx
'use client';

import { useState, useEffect } from 'react';
import { simulatedData, improvedData } from './data/simulatedData'; // Ajusta la ruta según tu estructura

export default function SobreProducto() {
  const [chartData, setChartData] = useState(simulatedData);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Dimensiones y máximo valor para el eje Y (casos)
  const maxCases = 1500000; // 1.5M como máximo, basado en tus datos
  const chartWidth = 700;
  const chartHeight = 400;
  const margin = { top: 20, right: 30, bottom: 50, left: 50 };

  // Actualización dinámica de los datos
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => {
        const nextIndex = (prev + 1) % (simulatedData.length + 1);
        if (nextIndex === simulatedData.length) {
          setChartData((prevData) =>
            prevData.map((item) => ({
              ...item,
              cases: Math.max(0, Math.min(maxCases, item.cases + Math.floor(Math.random() * 200000 - 100000))), // Limitar entre 0 y 1.5M
              fingerStrength: Number((item.fingerStrength + Math.random() * 5).toFixed(1)),
              tiltAngle: Number((item.tiltAngle + Math.random() * 5).toFixed(1)),
              rehabPercentage: Math.min(100, Math.round(item.rehabPercentage + Math.random() * 5)),
            }))
          );
          return 0;
        }
        return nextIndex;
      });
    }, 2500);

    return () => clearInterval(interval);
  }, []);

  // Datos visibles
  const visibleData = chartData.slice(0, currentIndex + 1);
  const stepWidth = simulatedData.length > 1 ? (chartWidth - margin.left - margin.right) / (simulatedData.length - 1) : chartWidth - margin.left - margin.right;

  // Calcular la altura del gráfico disponible
  const graphHeight = chartHeight - margin.top - margin.bottom;

  return (
    <div className="container mx-auto py-12 px-6 relative min-h-screen overflow-hidden">
      {/* SVG de Fondo */}
      <div className="absolute inset-0 -z-10">
        <svg className="w-full h-full opacity-20" viewBox="0 0 1200 1000" preserveAspectRatio="none">
          <defs>
            <linearGradient id="modernGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#00eaff" stopOpacity="0.7">
                <animate attributeName="stopColor" values="#00eaff;#ff6bcb;#00eaff" dur="8s" repeatCount="indefinite" />
              </stop>
              <stop offset="100%" stopColor="#ff6bcb" stopOpacity="0.7">
                <animate attributeName="stopColor" values="#ff6bcb;#00eaff;#ff6bcb" dur="8s" repeatCount="indefinite" />
              </stop>
            </linearGradient>
            <filter id="glow">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
          <path d="M0,150 Q300,50 600,150 T1200,150" fill="none" stroke="url(#modernGradient)" strokeWidth="4" filter="url(#glow)" className="wave-1" />
          <path d="M0,450 Q300,350 600,450 T1200,450" fill="none" stroke="url(#modernGradient)" strokeWidth="4" filter="url(#glow)" className="wave-2" />
          <circle cx="250" cy="250" r="8" fill="url(#modernGradient)" filter="url(#glow)" className="circle-1" />
          <circle cx="950" cy="650" r="8" fill="url(#modernGradient)" filter="url(#glow)" className="circle-2" />
        </svg>
      </div>

      {/* Contenido Principal */}
      <div className="relative z-10">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-extrabold text-cyan-300 mb-4 tracking-tight drop-shadow-md animate__fadeInDown" style={{ animationDuration: '1.2s' }}>
            Sobre el Producto
          </h1>
          <p className="text-lg text-gray-200 max-w-2xl mx-auto animate__fadeInUp" style={{ animationDuration: '1.4s' }}>
            Tecnología avanzada para capturar cada movimiento con precisión y estilo.
          </p>
        </div>
        <div className="max-w-4xl mx-auto bg-gray-900/95 backdrop-blur-xl p-8 rounded-2xl shadow-xl border border-cyan-500/30 animate__fadeIn" style={{ animationDuration: '1.8s' }}>
          <p className="text-base text-gray-200 mb-4 leading-relaxed">
            El <span className="text-cyan-400 font-semibold">Smart Glove</span> utiliza sensores de última generación para analizar movimientos en tiempo real con una precisión sin precedentes.
          </p>
          <p className="text-base text-gray-200 mb-4 leading-relaxed">
            Diseñado para deportes, rehabilitación y entretenimiento, ofrece datos personalizados que optimizan tu rendimiento, aceleran tu recuperación y mejoran tu experiencia interactiva.
          </p>
          <p className="text-base text-gray-200 leading-relaxed">
            Compatible con aplicaciones móviles y plataformas de análisis, es ligero, ergonómico y fabricado con materiales premium para una comodidad duradera.
          </p>
        </div>

        {/* Características Adicionales */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto relative z-10">
          <div className="bg-gray-800/90 p-6 rounded-xl shadow-lg border border-cyan-500/20 animate__fadeInLeft" style={{ animationDuration: '2s' }}>
            <h3 className="text-lg font-semibold text-cyan-300 mb-2">Sensores Avanzados</h3>
            <p className="text-gray-300 text-sm">Captura cada detalle con precisión milimétrica.</p>
          </div>
          <div className="bg-gray-800/90 p-6 rounded-xl shadow-lg border border-cyan-500/20 animate__fadeInUp" style={{ animationDuration: '2s' }}>
            <h3 className="text-lg font-semibold text-cyan-300 mb-2">Conectividad</h3>
            <p className="text-gray-300 text-sm">Sincronización en tiempo real con tus dispositivos.</p>
          </div>
          <div className="bg-gray-800/90 p-6 rounded-xl shadow-lg border border-cyan-500/20 animate__fadeInRight" style={{ animationDuration: '2s' }}>
            <h3 className="text-lg font-semibold text-cyan-300 mb-2">Diseño Ergonómico</h3>
            <p className="text-gray-300 text-sm">Comodidad y estilo en cada uso.</p>
          </div>
        </div>

        {/* Gráfica Dinámica Mejorada */}
        <div className="mt-16 max-w-4xl mx-auto relative z-10">
          <div className="bg-gray-900/95 backdrop-blur-xl p-8 rounded-2xl shadow-xl border border-cyan-500/30 animate__fadeIn" style={{ animationDuration: '2s' }}>
            <h3 className="text-2xl font-bold text-cyan-300 mb-6 text-center tracking-wide drop-shadow-md animate__pulse animate__infinite" style={{ animationDuration: '5s' }}>
              Estadísticas de Casos y Rehabilitación
            </h3>
            <div className="relative h-[450px] w-full">
              <svg className="w-full h-full" viewBox={`0 0 ${chartWidth} ${chartHeight}`}>
                <defs>
                  <linearGradient id="chartGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#00eaff" stopOpacity="0.9" />
                    <stop offset="100%" stopColor="#ff6bcb" stopOpacity="0.9" />
                  </linearGradient>
                  <filter id="chartGlow">
                    <feGaussianBlur stdDeviation="2.5" result="blur" />
                    <feMerge>
                      <feMergeNode in="blur" />
                      <feMergeNode in="SourceGraphic" />
                    </feMerge>
                  </filter>
                </defs>

                {/* Fondo de cuadrícula */}
                <rect
                  x={margin.left}
                  y={margin.top}
                  width={chartWidth - margin.left - margin.right}
                  height={graphHeight}
                  fill="rgba(255, 255, 255, 0.03)"
                  rx="8"
                  className="grid-background"
                />

                {/* Eje Y */}
                <line
                  x1={margin.left}
                  y1={margin.top}
                  x2={margin.left}
                  y2={chartHeight - margin.bottom}
                  stroke="#ffffff"
                  strokeWidth="1"
                  strokeDasharray="4,4"
                  className="axis-y"
                />

                {/* Eje X */}
                <line
                  x1={margin.left}
                  y1={chartHeight - margin.bottom}
                  x2={chartWidth - margin.right}
                  y2={chartHeight - margin.bottom}
                  stroke="#ffffff"
                  strokeWidth="1"
                  strokeDasharray="4,4"
                  className="axis-x"
                />

                {/* Área bajo la curva */}
                <polyline
                  points={`${visibleData
                    .map((point, index) => `${margin.left + index * stepWidth},${chartHeight - margin.bottom - (point.cases / maxCases) * graphHeight}`)
                    .join(' ')} ${chartWidth - margin.right},${chartHeight - margin.bottom} ${margin.left},${chartHeight - margin.bottom}`}
                  fill="url(#chartGradient)"
                  fillOpacity="0.25"
                  stroke="none"
                  className="area-chart"
                />

                {/* Línea de casos */}
                <polyline
                  points={visibleData.map((point, index) => `${margin.left + index * stepWidth},${chartHeight - margin.bottom - (point.cases / maxCases) * graphHeight}`).join(' ')}
                  fill="none"
                  stroke="url(#chartGradient)"
                  strokeWidth="3"
                  filter="url(#chartGlow)"
                  className={`line-chart-${visibleData.length}`}
                />

                {/* Puntos de casos */}
                {visibleData.map((point, index) => (
                  <g key={index}>
                    <circle
                      cx={margin.left + index * stepWidth}
                      cy={chartHeight - margin.bottom - (point.cases / maxCases) * graphHeight}
                      r="6"
                      fill="#ff6bcb"
                      filter="url(#chartGlow)"
                      className={`point-${index}`}
                    />
                    <text
                      x={margin.left + index * stepWidth}
                      y={chartHeight - margin.bottom - (point.cases / maxCases) * graphHeight - 15}
                      fill="#ffffff"
                      textAnchor="middle"
                      className={`label-point-${index}`}
                    >
                      {(point.cases / 1000000).toFixed(1)}M
                    </text>
                  </g>
                ))}

                {/* Etiquetas X (años) */}
                {visibleData.map((point, index) => (
                  <text
                    key={index}
                    x={margin.left + index * stepWidth}
                    y={chartHeight - margin.bottom + 25}
                    fill="#ffffff"
                    textAnchor="middle"
                    className={`label-x-${index}`}
                  >
                    {point.time}
                  </text>
                ))}

                {/* Etiquetas Y (casos en millones) */}
                {[0, 0.5, 1, 1.5].map((value, index) => (
                  <text
                    key={index}
                    x={margin.left - 10}
                    y={chartHeight - margin.bottom - (value / 1.5) * graphHeight}
                    fill="#ffffff"
                    textAnchor="end"
                    className={`label-y-${index}`}
                  >
                    {value}M
                  </text>
                ))}
              </svg>
            </div>

            {/* Información adicional */}
            <div className="mt-8 grid grid-cols-1 md:grid-cols-5 gap-4 text-center text-gray-200">
              {visibleData.length > 0 && (
                <>
                  <div className="bg-gray-800/70 p-4 rounded-lg card-info-0">
                    <p className="text-cyan-300 font-semibold text-sm">Año</p>
                    <p>{visibleData[visibleData.length - 1].time}</p>
                  </div>
                  <div className="bg-gray-800/70 p-4 rounded-lg card-info-1">
                    <p className="text-cyan-300 font-semibold text-sm">Casos</p>
                    <p>{(visibleData[visibleData.length - 1].cases / 1000000).toFixed(1)}M</p>
                  </div>
                  <div className="bg-gray-800/70 p-4 rounded-lg card-info-2">
                    <p className="text-cyan-300 font-semibold text-sm">Fuerza</p>
                    <p>{visibleData[visibleData.length - 1].fingerStrength.toFixed(1)} N</p>
                  </div>
                  <div className="bg-gray-800/70 p-4 rounded-lg card-info-3">
                    <p className="text-cyan-300 font-semibold text-sm">Inclinación</p>
                    <p>{visibleData[visibleData.length - 1].tiltAngle.toFixed(1)}°</p>
                  </div>
                  <div className="bg-gray-800/70 p-4 rounded-lg card-info-4">
                    <p className="text-cyan-300 font-semibold text-sm">Rehabilitación</p>
                    <p>{Math.round(visibleData[visibleData.length - 1].rehabPercentage)}%</p>
                  </div>
                </>
              )}
            </div>

            {/* Texto de mejora */}
            <p className="text-cyan-300 font-semibold mt-8 text-center text-improve">
              Con RECOVGLOX, la rehabilitación mejora hasta un{' '}
              <span className="text-xl text-cyan-400 font-bold">
                {Math.round(improvedData[improvedData.length - 1].improvedRehabPercentage)}%
              </span>{' '}
              en promedio, con una fuerza de{' '}
              <span className="text-xl text-cyan-400 font-bold">{improvedData[improvedData.length - 1].improvedFingerStrength.toFixed(1)} N</span>{' '}
              y una inclinación de{' '}
              <span className="text-xl text-cyan-400 font-bold">{improvedData[improvedData.length - 1].improvedTiltAngle.toFixed(1)}°</span>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// Estilo adicional para animaciones
const styles = `
  @keyframes fadeInDown {
    from { opacity: 0; transform: translateY(-30px); }
    to { opacity: 1; transform: translateY(0); }
  }
  @keyframes fadeInUp {
    from { opacity: 0; transform: translateY(30px); }
    to { opacity: 1; transform: translateY(0); }
  }
  @keyframes fadeInLeft {
    from { opacity: 0; transform: translateX(-30px); }
    to { opacity: 1; transform: translateX(0); }
  }
  @keyframes fadeInRight {
    from { opacity: 0; transform: translateX(30px); }
    to { opacity: 1; transform: translateX(0); }
  }
  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
  @keyframes drawAxis {
    from { stroke-dashoffset: 400; }
    to { stroke-dashoffset: 0; }
  }
  @keyframes drawLine {
    from { stroke-dashoffset: 1000; }
    to { stroke-dashoffset: 0; }
  }
  @keyframes pulseGlow {
    0%, 100% { opacity: 0.85; }
    50% { opacity: 1; }
  }
  @keyframes wave1 {
    0%, 100% { d: path('M0,150 Q300,50 600,150 T1200,150'); }
    50% { d: path('M0,150 Q300,100 600,50 T1200,150'); }
  }
  @keyframes wave2 {
    0%, 100% { d: path('M0,450 Q300,350 600,450 T1200,450'); }
    50% { d: path('M0,450 Q300,400 600,350 T1200,450'); }
  }
  @keyframes circle1 {
    0% { transform: translate(0, 0); }
    25% { transform: translate(40px, -40px); }
    50% { transform: translate(80px, 0); }
    75% { transform: translate(40px, 40px); }
    100% { transform: translate(0, 0); }
  }
  @keyframes circle2 {
    0% { transform: translate(0, 0); }
    25% { transform: translate(-40px, 40px); }
    50% { transform: translate(0, 80px); }
    75% { transform: translate(40px, 40px); }
    100% { transform: translate(0, 0); }
  }

  /* Animaciones de fondo */
  .wave-1 { animation: wave1 6s ease-in-out infinite; }
  .wave-2 { animation: wave2 7s ease-in-out infinite; }
  .circle-1 { animation: circle1 5s ease-in-out infinite; }
  .circle-2 { animation: circle2 6s ease-in-out infinite; }

  /* Animaciones de la gráfica */
  .grid-background { animation: fadeIn 1.5s ease-in-out forwards; }
  .axis-y { stroke-dasharray: 400; stroke-dashoffset: 400; animation: drawAxis 1.2s ease-in-out forwards; }
  .axis-x { stroke-dasharray: 600; stroke-dashoffset: 600; animation: drawAxis 1.5s ease-in-out forwards 0.3s; }
  .area-chart { animation: fadeIn 1.8s ease-in-out forwards 0.8s; }
  .line-chart-1 { stroke-dasharray: 1000; stroke-dashoffset: 1000; animation: drawLine 1.2s ease-in-out forwards 1s; }
  .line-chart-2 { stroke-dasharray: 1000; stroke-dashoffset: 1000; animation: drawLine 1.6s ease-in-out forwards 1s; }
  .line-chart-3 { stroke-dasharray: 1000; stroke-dashoffset: 1000; animation: drawLine 2s ease-in-out forwards 1s; }
  .line-chart-4 { stroke-dasharray: 1000; stroke-dashoffset: 1000; animation: drawLine 2.4s ease-in-out forwards 1s; }
  .line-chart-5 { stroke-dasharray: 1000; stroke-dashoffset: 1000; animation: drawLine 2.8s ease-in-out forwards 1s; }
  .point-0 { animation: fadeIn 0.8s ease-in-out forwards 1.2s; }
  .point-1 { animation: fadeIn 0.8s ease-in-out forwards 1.6s; }
  .point-2 { animation: fadeIn 0.8s ease-in-out forwards 2s; }
  .point-3 { animation: fadeIn 0.8s ease-in-out forwards 2.4s; }
  .point-4 { animation: fadeIn 0.8s ease-in-out forwards 2.8s; }
  .label-point-0 { animation: fadeInUp 0.8s ease-in-out forwards 1.2s; }
  .label-point-1 { animation: fadeInUp 0.8s ease-in-out forwards 1.6s; }
  .label-point-2 { animation: fadeInUp 0.8s ease-in-out forwards 2s; }
  .label-point-3 { animation: fadeInUp 0.8s ease-in-out forwards 2.4s; }
  .label-point-4 { animation: fadeInUp 0.8s ease-in-out forwards 2.8s; }
  .label-x-0 { animation: fadeInUp 0.8s ease-in-out forwards 0.8s; }
  .label-x-1 { animation: fadeInUp 0.8s ease-in-out forwards 1s; }
  .label-x-2 { animation: fadeInUp 0.8s ease-in-out forwards 1.2s; }
  .label-x-3 { animation: fadeInUp 0.8s ease-in-out forwards 1.4s; }
  .label-x-4 { animation: fadeInUp 0.8s ease-in-out forwards 1.6s; }
  .label-y-0 { animation: fadeInLeft 0.8s ease-in-out forwards 0.4s; }
  .label-y-1 { animation: fadeInLeft 0.8s ease-in-out forwards 0.6s; }
  .label-y-2 { animation: fadeInLeft 0.8s ease-in-out forwards 0.8s; }
  .label-y-3 { animation: fadeInLeft 0.8s ease-in-out forwards 1s; }

  /* Animaciones de tarjetas y texto */
  .card-info-0 { animation: fadeInUp 1s ease-in-out forwards 2.2s; }
  .card-info-1 { animation: fadeInUp 1s ease-in-out forwards 2.4s; }
  .card-info-2 { animation: fadeInUp 1s ease-in-out forwards 2.6s; }
  .card-info-3 { animation: fadeInUp 1s ease-in-out forwards 2.8s; }
  .card-info-4 { animation: fadeInUp 1s ease-in-out forwards 3s; }
  .text-improve { animation: fadeInUp 1.2s ease-in-out forwards 3.2s; }

  /* Estilos generales */
  svg text { font-size: 12px; font-family: 'Arial', sans-serif; }
  .animate__fadeInDown { animation-name: fadeInDown; }
  .animate__fadeInUp { animation-name: fadeInUp; }
  .animate__fadeInLeft { animation-name: fadeInLeft; }
  .animate__fadeInRight { animation-name: fadeInRight; }
  .animate__fadeIn { animation-name: fadeIn; }
  .animate__pulse { animation-name: pulseGlow; }
`;

// Agregar el estilo al documento
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style');
  styleSheet.textContent = styles;
  document.head.appendChild(styleSheet);
}