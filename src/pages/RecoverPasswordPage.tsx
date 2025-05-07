import { useState } from 'react';
import api from '../api';
import '../styles/RecoverPasswordPage.css';

export default function RecoverPasswordPage() {
  const [step, setStep] = useState(1);
  const [dni, setDni] = useState('');
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [message, setMessage] = useState('');

  const handleSendCode = async () => {
    try {
      await api.post('/users/recover-password', { dni, phone });
      setMessage('📩 Código enviado al teléfono');
      setStep(2);
    } catch (error) {
      setMessage('❌ Error al enviar el código. Verifica los datos.');
    }
  };

  const handleResetPassword = async () => {
    try {
      await api.post('/users/reset-password', { dni, phone, code, newPassword });
      setMessage('✅ Contraseña restablecida. Inicia sesión nuevamente.');
      setStep(3);
    } catch (error) {
      setMessage('❌ Código incorrecto o error al cambiar contraseña.');
    }
  };

  return (
    <div className="recover-body">
            <div className="recover-container">

        <h2>Recuperar Contraseña</h2>
      {message && <p className="message">{message}</p>}

      {step === 1 && (
        <>
          <input
            type="text"
            placeholder="DNI"
            value={dni}
            onChange={(e) => setDni(e.target.value)}
          />
          <input
            type="text"
            placeholder="Teléfono"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
          <button onClick={handleSendCode}>Enviar código</button>
        </>
      )}

      {step === 2 && (
        <>
          <input
            type="text"
            placeholder="Código de verificación"
            value={code}
            onChange={(e) => setCode(e.target.value)}
          />
          <input
            type="password"
            placeholder="Nueva contraseña"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />
          <button onClick={handleResetPassword}>Restablecer contraseña</button>
        </>
      )}

      {step === 3 && (
        <a href="/login" className="back-login">Volver al login</a>
      )}
    </div>
    </div>

  );
}
