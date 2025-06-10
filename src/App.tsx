import { useEffect, useState } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import Dashboard from './pages/Dashboard';
import DashboardLayout from './pages/DashboardLayout';
import ColaboradoresPage from './pages/ColaboradoresPage';
import TambosPage from './pages/TambosPage';
import AsignacionesPage from './pages/AsignacionesPage';
import PacientesPage from './pages/PacientesPage';
import ContactosPage from './pages/ContactosPage';
import RecoverPasswordPage from './pages/RecoverPasswordPage';
import ComunicadoPage from './pages/ComunicadoPage';
import AlertaPage from './pages/AlertaPage';

import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { User } from './types/User';

import { messaging } from './FirebaseData/Firebase';
import { onMessage } from 'firebase/messaging';

import ComunicadoModal from './Modal/ComunicadoModal';
import NotificacionesPage from './pages/NotificacionesBuzon';
import ExportacionPage from './pages/ExportacionPage';
import VisitasPage from './pages/VisitasPage';

function App() {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [notifData, setNotifData] = useState<{ titulo: string; cuerpo: string } | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  // 🔐 Cargar usuario guardado
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) setUser(JSON.parse(storedUser));
  }, []);

  // ✅ Pedir permiso para notificaciones
  useEffect(() => {
    if (Notification.permission !== 'granted') {
      Notification.requestPermission().then((perm) => {
        console.log('🔔 Permiso de notificación:', perm);
      });
    }
  }, []);

  // 🔔 Escuchar notificaciones en primer plano
  useEffect(() => {
    const unsubscribe = onMessage(messaging, (payload) => {
      console.log('📩 Notificación recibida:', payload);
      if (payload.notification) {
        setNotifData({
          titulo: payload.notification.title || '',
          cuerpo: payload.notification.body || '',
        });
        setModalOpen(true);

        // 🔁 También mostrar notificación nativa del navegador
        if (Notification.permission === 'granted') {
          const notification = new Notification(payload.notification.title || '', {
            body: payload.notification.body || '',
          });

          // 🎯 Redirigir al módulo de comunicados al hacer clic
          notification.onclick = () => {
            window.focus();
            navigate('/comunicados');
          };
        }
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('user');
    setUser(null);
  };

  return (
    <>
      <ToastContainer position="top-right" autoClose={3000} />
      <Routes>
        <Route
          path="/login"
          element={
            user ? (
              <Navigate to="/" />
            ) : (
              <LoginPage
                onLogin={(userData) => {
                  localStorage.setItem('user', JSON.stringify(userData));
                  setUser(userData);
                }}
              />
            )
          }
        />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/recuperar" element={<RecoverPasswordPage />} />

        {user && (
          <>
            <Route
              path="/"
              element={
                <DashboardLayout onLogout={handleLogout}>
                  <Dashboard />
                </DashboardLayout>
              }
            />
            <Route path="/colaboradores" element={<DashboardLayout onLogout={handleLogout}><ColaboradoresPage /></DashboardLayout>} />
            <Route path="/tambos" element={<DashboardLayout onLogout={handleLogout}><TambosPage /></DashboardLayout>} />
            <Route path="/asignaciones" element={<DashboardLayout onLogout={handleLogout}><AsignacionesPage /></DashboardLayout>} />
            <Route path="/pacientes" element={<DashboardLayout onLogout={handleLogout}><PacientesPage /></DashboardLayout>} />
            <Route path="/contactos" element={<DashboardLayout onLogout={handleLogout}><ContactosPage /></DashboardLayout>} />
            <Route path="/comunicados" element={<DashboardLayout onLogout={handleLogout}><ComunicadoPage /></DashboardLayout>} />
            <Route path="/alertas" element={<DashboardLayout onLogout={handleLogout}><AlertaPage /></DashboardLayout>} />
            <Route path="/exportaciones" element={<DashboardLayout onLogout={handleLogout}><ExportacionPage /></DashboardLayout>} />
            <Route path="/visitas" element={<DashboardLayout onLogout={handleLogout}><VisitasPage/></DashboardLayout>} />

            <Route path="/notificaciones" element={<DashboardLayout onLogout={handleLogout}><NotificacionesPage /></DashboardLayout>} />

          </>
        )}

        <Route path="*" element={<Navigate to={user ? '/' : '/login'} />} />
      </Routes>

      {/* Modal personalizado para la notificación (si lo quieres seguir mostrando en pantalla) */}
      <ComunicadoModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        form={{
          titulo: notifData?.titulo || '',
          cuerpo: notifData?.cuerpo || '',
          destinatario: 0,
          fechaInicio: '',
          fechaFin: '',
          canalEnvio: 1,
        }}
        setForm={() => {}}
        onSave={() => {}}
        editing={false}
      />
    </>
  );
}

export default App;
