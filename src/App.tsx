import { useEffect, useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
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
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { User } from './types/User';

import { messaging } from './FirebaseData/Firebase'; // importa tu config Firebase
import { onMessage } from 'firebase/messaging';
import ComunicadoModal from './Modal/ComunicadoModal'; // importa tu modal

function App() {
  const [user, setUser] = useState<User | null>(null);

 // Estado para notificación push entrante
 const [notifData, setNotifData] = useState<{ titulo: string; cuerpo: string } | null>(null);
 const [modalOpen, setModalOpen] = useState(false);

 useEffect(() => {
   const storedUser = localStorage.getItem('user');
   if (storedUser) {
     setUser(JSON.parse(storedUser));
   }
 }, []);
 // Listener para recibir notificaciones en primer plano
 useEffect(() => {
  const unsubscribe = onMessage(messaging, (payload) => {
    console.log('Notificación recibida:', payload);
    if (payload.notification) {
      setNotifData({
        titulo: payload.notification.title || '',
        cuerpo: payload.notification.body || '',
      });
      setModalOpen(true);
    }
  });
  return () => unsubscribe();
}, []);
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

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
          <Route
            path="/colaboradores"
            element={
              <DashboardLayout onLogout={handleLogout}>
                <ColaboradoresPage />
              </DashboardLayout>
            }
          />
          <Route
            path="/tambos"
            element={
              <DashboardLayout onLogout={handleLogout}>
                <TambosPage />
              </DashboardLayout>
            }
          />
           <Route
            path="/asignaciones"
            element={
              <DashboardLayout onLogout={handleLogout}>
                <AsignacionesPage />
              </DashboardLayout>
            }
          />
          <Route
            path="/pacientes"
            element={
              <DashboardLayout onLogout={handleLogout}>
                <PacientesPage />
              </DashboardLayout>
            }
          />
          <Route
            path="/contactos"
            element={
              <DashboardLayout onLogout={handleLogout}>
                <ContactosPage />
              </DashboardLayout>
            }
          />
          <Route
            path="/comunicados"
            element={
              <DashboardLayout onLogout={handleLogout}>
                <ComunicadoPage />
              </DashboardLayout>
            }
          />
        </>
      )}

      <Route path="*" element={<Navigate to={user ? '/' : '/login'} />} />
    </Routes>
    </>

  );
}

export default App;
