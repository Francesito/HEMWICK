// front/components/Footer.jsx
import { FaGithub, FaLinkedin, FaTwitter } from 'react-icons/fa';

export default function Footer() {
  return (
    <footer className="bg-gradient-to-b from-darkBg to-gray-900 py-8 text-center border-t border-neonCyan/30 shadow-lg">
      <div className="container mx-auto px-6">
        {/* Texto principal con derechos reservados */}
        <p className="text-gray-400 text-sm font-medium mb-4 hover:text-neonCyan transition-colors duration-300">
          © 2025 Smart RECOVGLOX. Todos los derechos reservados.
        </p>

        {/* Enlaces de navegación */}
        <div className="flex justify-center space-x-6 mb-6">
          <a
            href="/privacy"
            className="text-gray-400 text-sm font-medium hover:text-neonCyan transition-all duration-300 hover:scale-105"
          >
            Política de Privacidad
          </a>
          <a
            href="/terms"
            className="text-gray-400 text-sm font-medium hover:text-neonCyan transition-all duration-300 hover:scale-105"
          >
            Términos de Servicio
          </a>
          <a
            href="/contact"
            className="text-gray-400 text-sm font-medium hover:text-neonCyan transition-all duration-300 hover:scale-105"
          >
            Contacto
          </a>
        </div>

        {/* Íconos sociales */}
        <div className="flex justify-center space-x-6">
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-400 hover:text-neonCyan transition-all duration-300 transform hover:scale-110"
          >
            <FaGithub size={24} />
          </a>
          <a
            href="https://linkedin.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-400 hover:text-neonCyan transition-all duration-300 transform hover:scale-110"
          >
            <FaLinkedin size={24} />
          </a>
          <a
            href="https://twitter.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-400 hover:text-neonCyan transition-all duration-300 transform hover:scale-110"
          >
            <FaTwitter size={24} />
          </a>
        </div>
      </div>
    </footer>
  );
}