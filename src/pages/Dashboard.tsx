import { useEffect, useState } from 'react';
import DashboardLayout from '../pages/DashboardLayout';
import { User } from '../types/User';

export default function DashboardPage() {
  const handleLogout = () => {
    localStorage.removeItem('user');
    window.location.href = '/login';
  };
  const [user, setUser] = useState<User | null>(null);
  const [hora, setHora] = useState('');
  const [fecha, setFecha] = useState('');

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }

    const intervalo = setInterval(() => {
      const ahora = new Date();
      const horaActual = ahora.toLocaleTimeString('es-PE', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
      });

      const dia = String(ahora.getDate()).padStart(2, '0');
      const mes = String(ahora.getMonth() + 1).padStart(2, '0');
      const anio = ahora.getFullYear();
      const fechaActual = `${dia}/${mes}/${anio}`;

      setHora(horaActual);
      setFecha(fechaActual);
    }, 1000);

    return () => clearInterval(intervalo);
  }, []);

  return (
      <main className="main-content">
        <header className="welcome-bar">
          <span className="emoji">😊</span>
          {user && (
            <h2>
              BIENVENIDO, {user.firstName} {user.lastNameP} {user.lastNameM}
            </h2>
          )}
          <div className="datetime">
            <span>{hora}</span>
            <span>{fecha}</span>
          </div>
        </header>

        <section className="stats-section">
          <div className="stat-card">cuadro 1</div>
          <div className="stat-card">cuadro 2</div>
          <div className="stat-card">cuadro 3</div>
        </section>

        <section className="data-table">
          <p>Tabla con datos relevantes</p>
        </section>
      </main>
  );
}
