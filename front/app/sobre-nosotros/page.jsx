'use client';

export default function SobreNosotros() {
  return (
    <div className="container mx-auto py-12 px-6 relative min-h-screen overflow-hidden">
      {/* SVG de Fondo */}
      <div className="absolute inset-0 -z-10">
        <svg
          className="w-full h-full opacity-25"
          viewBox="0 0 1200 1000"
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient id="modernGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#00eaff" stopOpacity="0.8">
                <animate
                  attributeName="stopColor"
                  values="#00eaff;#ff00cc;#00eaff"
                  dur="6s"
                  repeatCount="indefinite"
                />
              </stop>
              <stop offset="100%" stopColor="#ff00cc" stopOpacity="0.8">
                <animate
                  attributeName="stopColor"
                  values="#ff00cc;#00eaff;#ff00cc"
                  dur="6s"
                  repeatCount="indefinite"
                />
              </stop>
            </linearGradient>
            <filter id="glow">
              <feGaussianBlur stdDeviation="2.5" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Líneas dinámicas */}
          <path
            d="M0,200 Q300,100 600,200 T1200,200"
            fill="none"
            stroke="url(#modernGradient)"
            strokeWidth="3"
            filter="url(#glow)"
          >
            <animate
              attributeName="d"
              values="M0,200 Q300,100 600,200 T1200,200;
                      M0,200 Q300,150 600,100 T1200,200;
                      M0,200 Q300,100 600,200 T1200,200"
              dur="4s"
              repeatCount="indefinite"
            />
          </path>
          <path
            d="M0,500 Q300,400 600,500 T1200,500"
            fill="none"
            stroke="url(#modernGradient)"
            strokeWidth="3"
            filter="url(#glow)"
          >
            <animate
              attributeName="d"
              values="M0,500 Q300,400 600,500 T1200,500;
                      M0,500 Q300,450 600,400 T1200,500;
                      M0,500 Q300,400 600,500 T1200,500"
              dur="5s"
              repeatCount="indefinite"
            />
          </path>

          {/* Partículas animadas */}
          <circle cx="200" cy="300" r="6" fill="url(#modernGradient)" filter="url(#glow)">
            <animateMotion
              path="M0,0 Q50,-50 100,0 T200,0"
              dur="3s"
              repeatCount="indefinite"
            />
          </circle>
          <circle cx="800" cy="600" r="6" fill="url(#modernGradient)" filter="url(#glow)">
            <animateMotion
              path="M0,0 Q-50,50 0,100 T0,200"
              dur="4s"
              repeatCount="indefinite"
            />
          </circle>
          <circle cx="500" cy="800" r="6" fill="url(#modernGradient)" filter="url(#glow)">
            <animateMotion
              path="M0,0 Q50,50 100,0 T200,-50"
              dur="3.5s"
              repeatCount="indefinite"
            />
          </circle>
        </svg>
      </div>

      {/* Contenido Principal */}
      <div className="relative z-10">
        <div className="text-center mb-16">
          <h1 className="text-6xl font-extrabold text-cyan-300 mb-6 animate__animated animate__zoomIn" style={{ animationDuration: '1s' }}>
            Sobre Nosotros
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto animate__animated animate__fadeInUp" style={{ animationDuration: '1.2s' }}>
            Innovamos para el futuro del movimiento.
          </p>
        </div>
        <div className="max-w-4xl mx-auto bg-gray-900/90 backdrop-blur-lg p-10 rounded-3xl shadow-2xl border border-cyan-400/40 animate__animated animate__fadeInUp" style={{ animationDuration: '1.5s' }}>
          <p className="text-lg text-gray-200 mb-6 leading-relaxed">
            En <span className="text-cyan-400 font-semibold">Smart Glove</span>, revolucionamos el monitoreo de movimientos con tecnología de punta, combinando diseño y precisión.
          </p>
          <p className="text-gray-200 leading-relaxed">
            Fundada en 2025, nuestro equipo está comprometido con transformar datos en soluciones accesibles para atletas, profesionales de la salud y más allá.
          </p>
        </div>

        {/* Elementos adicionales */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto relative z-10">
          <div className="bg-gray-800/80 p-6 rounded-xl shadow-lg border border-cyan-500/20 animate__animated animate__fadeInLeft" style={{ animationDuration: '1.8s' }}>
            <h3 className="text-xl font-semibold text-cyan-300 mb-2">Innovación</h3>
            <p className="text-gray-300">Tecnología avanzada al alcance de todos.</p>
          </div>
          <div className="bg-gray-800/80 p-6 rounded-xl shadow-lg border border-cyan-500/20 animate__animated animate__fadeInUp" style={{ animationDuration: '1.8s' }}>
            <h3 className="text-xl font-semibold text-cyan-300 mb-2">Precisión</h3>
            <p className="text-gray-300">Datos exactos para decisiones inteligentes.</p>
          </div>
          <div className="bg-gray-800/80 p-6 rounded-xl shadow-lg border border-cyan-500/20 animate__animated animate__fadeInRight" style={{ animationDuration: '1.8s' }}>
            <h3 className="text-xl font-semibold text-cyan-300 mb-2">Accesibilidad</h3>
            <p className="text-gray-300">Conectamos el movimiento con el mundo.</p>
          </div>
        </div>
      </div>
    </div>
  );
}