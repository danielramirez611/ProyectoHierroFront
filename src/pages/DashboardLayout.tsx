import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { User } from '../types/User';
import '../styles/DashboardPage.css';

import CarpetaIcon  from '../imgs/Icons-Nav-Bar/Carpeta.svg';
import CasaIcon     from '../imgs/Icons-Nav-Bar/Casita.svg';
import MegafonoIcon from '../imgs/Icons-Nav-Bar/megafono.svg';
import BarrasIcon   from '../imgs/Icons-Nav-Bar/barras.svg';
import logautIcon  from '../imgs/Icons-Nav-Bar/logout.svg';

type MenuKey = 'gestion' | 'comunicacion' | 'reportes' | null;

interface DashboardLayoutProps {
  children: React.ReactNode;
  onLogout?: () => void;
}

export default function DashboardLayout({ children, onLogout }: DashboardLayoutProps) {
  const navigate      = useNavigate();
  const { pathname }  = useLocation();

  /* === usuario ==================================================== */
  const [user] = useState<User | null>(() => {
    const stored = localStorage.getItem('user');
    return stored ? JSON.parse(stored) : null;
  });

  /* === reloj ====================================================== */
  const [hora,  setHora]  = useState('');
  const [fecha, setFecha] = useState('');

  /* === acordeón exclusivo ======================================== */
  const [openMenu, setOpenMenu] = useState<MenuKey>(null);

  /* ===  🆕  estado para la sidebar en móvil ======================= */
  const [mobileOpen, setMobileOpen] = useState(false);
  const toggleMobile  = () => setMobileOpen(p => !p);


  /* reloj */
  useEffect(() => {
    const id = setInterval(() => {
      const now = new Date();
      setHora(now.toLocaleTimeString('es-PE', { hour12: false }));
      setFecha(now.toLocaleDateString('es-PE'));
    }, 1000);
    return () => clearInterval(id);
  }, []);

  /* abre el menú adecuado según la ruta */
  useEffect(() => {
    if (
      ['/colaboradores','/tambos','/asignaciones','/pacientes','/contactos']
        .some(p => pathname.startsWith(p))
    )      setOpenMenu('gestion');
    else if (pathname.startsWith('/comunicados'))
            setOpenMenu('comunicacion');
    else if (pathname.startsWith('/reportes'))
            setOpenMenu('reportes');
    else    setOpenMenu(null);
  }, [pathname]);

  /* helpers */
  const toggleMenu = (k: MenuKey) => setOpenMenu(prev => (prev===k ? null : k));
  const closeMobile = () => setMobileOpen(false);
  const handleNavigate = (path: string) => {
    navigate(path);
    setMobileOpen(false);     // cierra sólo cuando cambiamos de ruta
  };

  /* no envuelvas login/register */
  if (pathname === '/login' || pathname === '/register') return <>{children}</>;
  if (!user) return null;
  /*Parte del responsive*/ 
  
  /* ================================================================= */

  return (
      <>
    {/* ---------- overlay (click = cerrar) ---------- */}
    <div
      className={`overlay ${mobileOpen ? 'show' : ''}`}
      onClick={closeMobile}
    />
    <div className="dashboard-container">
      {/* ================== SIDEBAR ================== */}
      <aside className={`sidebar ${mobileOpen ? 'sidebar-open' : ''}`}>
        <div className="logo-section">
          <img src="/img/Logo.png" alt="Logo" className="logo" />
        </div>

        <nav className="menu" >
          {/* ---------- INICIO ---------- */}
          <div className="menu-item">
            <div className="menu-item-header">
              <img src={CasaIcon} alt="" />
              <button
                onClick={() => handleNavigate('/')}
                className={`menu-btn ${pathname === '/' ? 'active' : ''}`}
              >
                INICIO
              </button>
            </div>
          </div>

          {/* ---------- GESTIÓN ---------- */}
          <div className={`menu-item ${openMenu==='gestion' ? 'open' : ''}`}>
            <div
              className="menu-item-header"
              onClick={() => toggleMenu('gestion')}
            >
              <img src={CarpetaIcon} alt="" />
              <button
                className={`menu-btn ${
                  ['/colaboradores','/tambos','/asignaciones','/pacientes','/contactos','/visitas']
                    .some(p => pathname.startsWith(p)) ? 'active' : ''
                }`}
              >
                GESTIÓN
              </button>
              <img
                src="/img/flecha.png"
                alt="chevron"
                className={`chevron-icon ${openMenu==='gestion' ? 'rotate' : ''}`}
              />
            </div>

            {openMenu==='gestion' && (
              <div className="submenu">
                {[
                  {path:'/colaboradores', label:'Colaboradores'},
                  {path:'/tambos',       label:'Tambos'},
                  {path:'/asignaciones', label:'Asignación de gestores'},
                  {path:'/pacientes',    label:'Pacientes'},
                  {path:'/contactos',    label:'Contactos'},
                  {path:'/visitas',    label:'Visitas'},

                ].map(({path,label})=>(
                  <button
                    key={path}
                    onClick={() =>  handleNavigate(path)}
                    className={`submenu-link ${pathname === path ? 'active' : ''}`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* ---------- COMUNICACIÓN ---------- */}
          <div className={`menu-item ${openMenu==='comunicacion' ? 'open' : ''}`}>
            <div
              className="menu-item-header"
              onClick={() => toggleMenu('comunicacion')}
            >
              <img src={CarpetaIcon} alt="" />
              <button
                className={`menu-btn ${
                  ['/comunicados','/alertas']
                    .some(p => pathname.startsWith(p)) ? 'active' : ''
                }`}
              >
                COMUNICADO
              </button>
              <img
                src="/img/flecha.png"
                alt="chevron"
                className={`chevron-icon ${openMenu==='gestion' ? 'rotate' : ''}`}
              />
            </div>
            {openMenu==='comunicacion' && (
              <div className="submenu">
                {[
                  {path:'/comunicados', label:'Comunicado'},
                  {path:'/alertas',       label:'Alerta'},
                ].map(({path,label})=>(
                  <button
                    key={path}
                    onClick={() =>  handleNavigate(path)}
                    className={`submenu-link ${pathname === path ? 'active' : ''}`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* ---------- REPORTES ---------- */}
          <div className={`menu-item ${openMenu==='reportes' ? 'open' : ''}`}>
            <div
              className="menu-item-header"
              onClick={() => toggleMenu('reportes')}
            >
              <img src={CarpetaIcon} alt="" />
              <button
                className={`menu-btn ${
                  ['/exportaciones','#']
                    .some(p => pathname.startsWith(p)) ? 'active' : ''
                }`}
              >
                REPORTE
              </button>
              <img
                src="/img/flecha.png"
                alt="chevron"
                className={`chevron-icon ${openMenu==='reportes' ? 'rotate' : ''}`}
              />
            </div>

            {openMenu==='reportes' && (
              <div className="submenu">
                {[
                  {path:'/exportaciones', label:'Exportaciones'},
                  {path:'/reportes',       label:'Reportes'},
                ].map(({path,label})=>(
                  <button
                    key={path}
                    onClick={() =>  handleNavigate(path)}
                    className={`submenu-link ${pathname === path ? 'active' : ''}`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            )}
          </div>

          <button onClick={onLogout} className="logout-btn">
            <img src={logautIcon} alt="" />
            Cerrar sesión
          </button>
        </nav>
      </aside>

      {/* ================== CONTENIDO ================== */}
      <main className="main-content">
        <header className="dashboard-header">
          {/* 🆕  botón ☰ visible sólo en móvil */}
          <button className="hamburger-btn" onClick={toggleMobile}>
            ☰
          </button>

          <div className="user-info">
            👤 {user.firstName} {user.lastNameP} &nbsp;|&nbsp; 📅 {fecha} 🕒 {hora}
          </div>
        </header>

        <section className="dashboard-body">{children}</section>
      </main>
    </div>
    </>
  );
}
