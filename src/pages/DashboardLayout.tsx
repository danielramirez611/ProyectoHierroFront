import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { User } from '../types/User';
import '../styles/DashboardPage.css';
import CarpetaIcon from '../imgs/Icons-Nav-Bar/Carpeta.svg';
import CasaIcon from '../imgs/Icons-Nav-Bar/Casita.svg';
import MegafonoIcon from '../imgs/Icons-Nav-Bar/megafono.svg';
import BarrasIcon from '../imgs/Icons-Nav-Bar/barras.svg';

interface DashboardLayoutProps {
  children: React.ReactNode;
  onLogout?: () => void;
}

export default function DashboardLayout({ children, onLogout }: DashboardLayoutProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState<User | null>(() => {
    const stored = localStorage.getItem('user');
    return stored ? JSON.parse(stored) : null;
  });

  const [hora, setHora] = useState('');
  const [fecha, setFecha] = useState('');
  const [gestionOpen, setGestionOpen] = useState(false);
  const [inicioOpen, setInicioOpen] = useState(false);
  const [comunicacionOpen, setComunicacionOpen] = useState(false);
  const [reportesOpen, setReportesOpen] = useState(false);

  useEffect(() => {
    if (!user) navigate('/login');
  }, [user, navigate]);

  useEffect(() => {
    const intervalo = setInterval(() => {
      const ahora = new Date();
      setHora(
        ahora.toLocaleTimeString('es-PE', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: false,
        })
      );
      setFecha(
        `${String(ahora.getDate()).padStart(2, '0')}/${String(
          ahora.getMonth() + 1
        ).padStart(2, '0')}/${ahora.getFullYear()}`
      );
    }, 1000);
    return () => clearInterval(intervalo);
  }, []);

  const handleLogout = () => {
    if (onLogout) onLogout();
  };

  // Evita renderizar el layout en la página de login o register
  if (location.pathname === '/login' || location.pathname === '/register') {
    return <>{children}</>;
  }

  if (!user) return null;

  return (
    <div className="dashboard-container">
      <aside className="sidebar">
        <div className="logo-section">
          <img src="/img/Logo.png" alt="Logo" className="logo" />
        </div>
        <nav className="menu">
          <div className="menu-item">
            <div className="menu-item-header">
                <img src={CasaIcon} alt="" />
              <button onClick={() => navigate('/')} className="menu-btn">
                  <i className="fa fa-home"></i> <span>INICIO</span>
                </button>
            </div>
          </div>
          <div className="menu-item">
            <div className="menu-item-header" onClick={() => setGestionOpen(!gestionOpen)}>

            <img src={CarpetaIcon} alt="" />
            <button  className="menu-btn">
              <i className="fa fa-folder-open"></i> 
              <span>GESTIÓN</span>
            </button>
              <img
                src="/img/flecha.png"
                alt="chevron"
                className={`chevron-icon ${gestionOpen ? 'rotate' : ''}`}
              />
            </div>
            {gestionOpen && (
              <div className="submenu">
                <button onClick={() => navigate('/colaboradores')} className="submenu-link">
                  Colaboradores
                </button>
                <button onClick={() => navigate('/tambos')} className="submenu-link">
                  Tambos
                </button>
                <button onClick={() => navigate('/asignaciones')} className="submenu-link">
                  Asignación de gestores
                </button>
                <button onClick={() => navigate('/pacientes')} className="submenu-link">
                  Pacientes
                </button>
                <button onClick={() => navigate('/contactos')} className="submenu-link">
                  Contactos
                </button>
              </div>
            )}
          </div>
          <div className="menu-item">
            <div className="menu-item-header " onClick={() => setComunicacionOpen(!comunicacionOpen)}>
              <img src={MegafonoIcon} alt="" />
              <button  className="menu-btn">
                <i className="fa fa-folder-open"></i> <span>COMONUCACION</span>
              </button>
                <img
                  src="/img/flecha.png"
                  alt="chevron"
                  className={`chevron-icon ${comunicacionOpen ? 'rotate' : ''}`}
                />
            </div>
            {comunicacionOpen && (
              <div className="submenu">
               
                <button onClick={() => navigate('/comunicados')} className="submenu-link">
                  Comunicado
                </button>
              </div>
            )}
          </div>
          <div className="menu-item">
            <div className="menu-item-header"  onClick={() => setReportesOpen(!reportesOpen)}> 
              <img src={BarrasIcon} alt="" />
              <button onClick={() => setReportesOpen(!reportesOpen)} className="menu-btn">
                <i className="fa fa-chart-bar"></i> <span>REPORTES</span>
              </button>
              <img
                    src="/img/flecha.png"
                    alt="chevron"
                    className={`chevron-icon ${reportesOpen ? 'rotate' : ''}`}
                  />
              </div>
          </div>
          <button onClick={handleLogout} className="logout-btn">
            Cerrar sesión
          </button>
        </nav>
      </aside>

      <main className="main-content">
        <header className="dashboard-header">
          <div className="user-info">
            <span>
              👤 {user.firstName} {user.lastNameP}
            </span>
            <span>
              📅 {fecha} 🕒 {hora}
            </span>
          </div>
        </header>

        <section className="dashboard-body">{children}</section>
      </main>
    </div>
  );
}
