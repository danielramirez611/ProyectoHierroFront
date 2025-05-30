import { useEffect, useState } from 'react';
import api from '../api';
import { User } from '../types/User';
import '../styles/LoginPage.css';
import { getToken } from "firebase/messaging";
import { messaging } from '../FirebaseData/Firebase'; // tu config Firebase

interface Props {
  onLogin: (user: User) => void;
}


export default function LoginPage({ onLogin }: Props) {
  const [dni, setDni] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(false);
  const [error, setError] = useState('');
  const updateFirebaseToken = async (userId: number) => {
    try {
      const vapidKey = 'BOWk-BBMRj-OB15gVC7cao7oIn5xEBpCaH0oSYA0wIjlfzgCDdQcg5CKEMuFKLV2aq8srzMd6WthsIHRDoA4e7M';
      const currentToken = await getToken(messaging, { vapidKey });
      if (currentToken) {
        await api.put(`/Users/${userId}/firebase-token`, { firebaseToken: currentToken });
        console.log('Token Firebase actualizado en backend');
      }
    } catch (error) {
      console.error('Error actualizando token Firebase:', error);
    }
  };

  // Cargar usuario recordado si existe
  useEffect(() => {
    const rememberedDni = localStorage.getItem('rememberedDni');
    const rememberedPassword = localStorage.getItem('rememberedPassword');

    if (rememberedDni && rememberedPassword) {
      setDni(rememberedDni);
      setPassword(rememberedPassword);
      setRemember(true);
    }
  }, []);
  const handleLogin = async () => {
    try {
      const response = await api.post('/Users/login', { dni, password });

      // Extraer datos del usuario y token
      const {
        token,
        id,
        firstName,
        lastNameP,
        lastNameM,
        role,
        documentNumber,
        phone,
        email,
        passwordHash,
        birthDate,
        gender,
        address,
      } = response.data;

      // Guardar token JWT y datos usuario...
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify({
        id, firstName, lastNameP, lastNameM, role, documentNumber, phone, email,
        passwordHash, birthDate, gender, address,
      }));

      if (remember) {
        localStorage.setItem('rememberedDni', dni);
        localStorage.setItem('rememberedPassword', password);
      } else {
        localStorage.removeItem('rememberedDni');
        localStorage.removeItem('rememberedPassword');
      }
  
      // Actualiza token Firebase
      await updateFirebaseToken(id);
  
      // Ejecuta acción login
      onLogin({
        id, firstName, lastNameP, lastNameM, role, documentNumber, phone, email,
        passwordHash, birthDate, gender, address,
      });
  
    } catch (err: any) {
      setError(err.response?.data || 'Error al iniciar sesión');
    }
  };



  return (
    <div className="login-container">
      <div className="background-image">
        <div className="login-box">
          <h2>Niños de Hierro</h2>
          <input value={dni} onChange={e => setDni(e.target.value)} placeholder="Numero de documento" />
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Contraseña" />
          <div className="remember-row">
            <input
              type="checkbox"
              id="remember"
              checked={remember}
              onChange={() => setRemember(!remember)}
            />
            <label htmlFor="remember">Recuérdame</label>
          </div>
          <button onClick={handleLogin}>Iniciar sesión</button>
          <a href="/recuperar" className="register-link">¿Olvidaste tu contraseña?</a>
          <a href="/register" className="register-link">¿No tienes cuenta? Regístrate aquí</a>

          {error && <p className="error-text">{error}</p>}
        </div>
      </div>
    </div>
  );
}
