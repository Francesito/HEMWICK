'use client';

import Link from 'next/link';
import { useState, useEffect, useCallback } from 'react';
import { auth } from '../app/firebase';
import { FaBars, FaTimes } from 'react-icons/fa';

export default function Navbar() {
  const [user, setUser] = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (currentUser) => {
      if (currentUser) {
        const { getFirestore, doc, getDoc } = await import('firebase/firestore');
        const db = getFirestore();
        const userDocRef = doc(db, 'usuarios', currentUser.uid);
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists()) {
          setUser({ ...currentUser, ...userDoc.data() });
        } else {
          setUser(currentUser);
        }
      } else {
        setUser(null);
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = useCallback(async () => {
    await auth.signOut();
    setUser(null);
    setDropdownOpen(false);
    setMobileMenuOpen(false);
   // alert('Sesión cerrada');
  }, []);

  const toggleMobileMenu = useCallback(() => {
    setMobileMenuOpen((prev) => !prev);
    setDropdownOpen(false);
  }, []);

  const toggleDropdown = useCallback(() => {
    setDropdownOpen((prev) => !prev);
    setMobileMenuOpen(false);
  }, []);

  return (
    <nav
      className={`bg-gradient-to-b from-dark-bg to-gray-900 py-4 text-center border-b border-neonCyan/30 shadow-lg fixed top-0 w-full z-50 transition-all duration-300 ${
        scrolled ? 'backdrop-blur-md bg-dark-bg/80' : ''
      }`}
    >
      <div className="container mx-auto px-6 flex justify-between items-center">
        <Link
          href="/"
          className="text-3xl font-bold text-cyan-300 hover:text-cyan-400 transition-colors duration-300 tracking-wide"
        >
          RECOVGLOX
        </Link>

        <div className="md:hidden">
          <button
            onClick={toggleMobileMenu}
            className="text-gray-400 hover:text-neonCyan transition-all duration-300 transform hover:scale-110 p-2 rounded-full hover:bg-gray-800"
          >
            {mobileMenuOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
          </button>
        </div>

        <div className="hidden md:flex items-center space-x-6">
          <Link
            href="/"
            className="text-gray-400 text-sm font-medium hover:text-neonCyan transition-all duration-300 hover:scale-105 px-4 py-2 rounded-lg hover:bg-gray-800"
          >
            Inicio
          </Link>
          <Link
            href="/sobre-nosotros"
            className="text-gray-400 text-sm font-medium hover:text-neonCyan transition-all duration-300 hover:scale-105 px-4 py-2 rounded-lg hover:bg-gray-800"
          >
            Sobre Nosotros
          </Link>
          <Link
            href="/sobre-producto"
            className="text-gray-400 text-sm font-medium hover:text-neonCyan transition-all duration-300 hover:scale-105 px-4 py-2 rounded-lg hover:bg-gray-800"
          >
            Sobre el Producto
          </Link>
          {user && (
            <div className="relative">
              <button
                onClick={toggleDropdown}
                className="text-gray-400 hover:text-neonCyan transition-all duration-300 flex items-center space-x-2 px-4 py-2 rounded-lg hover:bg-gray-800"
              >
                <span className="truncate max-w-[200px] text-sm font-medium">{user.displayName || user.email}</span>
                <span className="text-sm">▼</span>
              </button>
              {dropdownOpen && (
                <div
                  className="absolute right-0 top-12 w-64 rounded-lg shadow-xl border border-gray-700 p-4 transition-opacity duration-300 ease-in-out"
                  style={{ backgroundColor: '#1a202c' }} // Solid background for desktop dropdown
                >
                  <div className="space-y-4">
                    <p className="text-cyan-300 text-sm font-semibold">
                      Email: <span className="text-gray-400">{user.email}</span>
                    </p>
                    <p className="text-cyan-300 text-sm font-semibold">
                      Usuario: <span className="text-gray-400">{user.displayName || 'N/A'}</span>
                    </p>
                    <p className="text-cyan-300 text-sm font-semibold">
                      Tipo: <span className="text-gray-400">{user.userType === 'physio' ? 'Fisioterapeuta' : 'Básico'}</span>
                    </p>
                    <button
                      onClick={handleLogout}
                      className="w-full mt-4 bg-red-500 text-white hover:bg-red-600 transition-colors duration-300 py-2 rounded-lg font-semibold text-sm"
                    >
                      Cerrar Sesión
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {mobileMenuOpen && (
        <div
          className="md:hidden border-t border-neonCyan/30 py-4"
          style={{ backgroundColor: '#1a202c' }} // Solid background for mobile menu
        >
          <div className="flex flex-col items-center space-y-4 px-6">
            <Link
              href="/"
              onClick={toggleMobileMenu}
              className="text-gray-400 text-sm font-medium hover:text-neonCyan transition-all duration-300 hover:scale-105 px-4 py-2 rounded-lg hover:bg-gray-800"
            >
              Inicio
            </Link>
            <Link
              href="/sobre-nosotros"
              onClick={toggleMobileMenu}
              className="text-gray-400 text-sm font-medium hover:text-neonCyan transition-all duration-300 hover:scale-105 px-4 py-2 rounded-lg hover:bg-gray-800"
            >
              Sobre Nosotros
            </Link>
            <Link
              href="/sobre-producto"
              onClick={toggleMobileMenu}
              className="text-gray-400 text-sm font-medium hover:text-neonCyan transition-all duration-300 hover:scale-105 px-4 py-2 rounded-lg hover:bg-gray-800"
            >
              Sobre el Producto
            </Link>
            {user && (
              <div className="w-full px-6 pt-4 border-t border-neonCyan/30">
                <p className="text-cyan-300 text-sm font-semibold">
                  Email: <span className="text-gray-400">{user.email}</span>
                </p>
                <p className="text-cyan-300 text-sm font-semibold mt-2">
                  Usuario: <span className="text-gray-400">{user.displayName || 'N/A'}</span>
                </p>
                <p className="text-cyan-300 text-sm font-semibold mt-2">
                  Tipo: <span className="text-gray-400">{user.userType === 'physio' ? 'Fisioterapeuta' : 'Básico'}</span>
                </p>
                <button
                  onClick={handleLogout}
                  className="w-full mt-4 bg-red-500 text-white hover:bg-red-600 transition-colors duration-300 py-2 rounded-lg font-semibold text-sm"
                >
                  Cerrar Sesión
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}