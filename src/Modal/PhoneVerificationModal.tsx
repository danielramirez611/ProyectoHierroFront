import React from 'react';
import '../styles/PhoneVerificationModal.css';

interface Props {
  phone: string;
  code: string;
  loading: boolean;
  onPhoneChange: (value: string) => void;
  onCodeChange: (value: string) => void;
  onSendCode: () => void;
  onCheckCode: () => void;
}

const PhoneVerificationModal: React.FC<Props> = ({
  phone,
  code,
  loading,
  onPhoneChange,
  onCodeChange,
  onSendCode,
  onCheckCode
}) => {
  return (
    <div className="modal-overlay">
      <div className="modal modal-animated-frame">
        {/* GIF decorativo o video opcional */}
        <img src="/img/Logo.png" alt="Animación teléfono" className="modal-header-gif" />

        <h3 className="modal-title">📲 Verificación de Teléfono</h3>

        <p className="modal-text">
          <strong>Paso 1:</strong> Ingresa tu número de celular para recibir el código.
        </p>
        <input
          type="text"
          placeholder="📞 Número de celular"
          value={phone}
          onChange={e => onPhoneChange(e.target.value)}
          className="form-input"
        />
        <button onClick={onSendCode} className="form-button green-glow">
          Enviar código
        </button>

        <hr className="modal-divider" />

        <p className="modal-text">
          <strong>Paso 2:</strong> Introduce el código que recibiste por SMS.
        </p>
        <input
          type="text"
          placeholder="🔐 Código recibido"
          value={code}
          onChange={e => onCodeChange(e.target.value)}
          className="form-input"
        />
        <button
          onClick={onCheckCode}
          className="form-button green-glow"
          disabled={loading}
        >
          {loading ? '🔄 Verificando...' : '✔ Verificar código'}
        </button>
      </div>
    </div>
  );
};

export default PhoneVerificationModal;
