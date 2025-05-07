import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import '../styles/LoginPage.css';
import '../styles/PhoneVerificationModal.css';

import PhoneVerificationModal from '../Modal/PhoneVerificationModal';


export default function RegisterPage() {
    const [formData, setFormData] = useState({
        firstName: '',
        lastNameP: '',
        lastNameM: '',
        documentNumber: '',
        phone: '',
        email: '',
        passwordHash: '', // CAMBIA "password" por "passwordHash"
        role: 'Niño',
        birthDate: '',
        gender: '',
        address: ''
    });

    const [message, setMessage] = useState<React.ReactNode>('');
    const [showVerificationModal, setShowVerificationModal] = useState(true);
    const [verificationCode, setVerificationCode] = useState('');
    const [phoneVerified, setPhoneVerified] = useState(false);
    const [loading, setLoading] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [isVerified, setIsVerified] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleDniBlur = async () => {
        if (formData.documentNumber.length === 8) {
            try {
                const response = await api.post('/Users/dni', {
                    dni: formData.documentNumber
                });
                const { firstName, lastNameP, lastNameM } = response.data;
                setFormData(prev => ({
                    ...prev,
                    firstName,
                    lastNameP,
                    lastNameM
                }));
            } catch {
                console.log('DNI no encontrado en RENIEC');
            }
        }
    };

    const sendVerification = async () => {
        try {
            await api.post('/Users/verify/send', { phone: formData.phone });
            alert('📩 Código enviado por SMS');
        } catch {
            alert('❌ Error al enviar el código');
        }
    };

    const checkVerification = async () => {
        try {
            setLoading(true);
            await api.post('/Users/verify/check', {
                phone: formData.phone,
                code: verificationCode
            });
            setPhoneVerified(true);
            setShowVerificationModal(false);
            alert('✅ Teléfono verificado correctamente');
        } catch {
            alert('❌ Código incorrecto');
        } finally {
            setLoading(false);
        }
    };
    const handleRegister = async () => {
        if (!phoneVerified) {
            setShowVerificationModal(true);
            return;
        }

        try {
            await api.post('/Users', formData);
            // ✅ Mensaje de éxito con ícono check
            setMessage('✅ Usuario registrado correctamente');
            // ⏱ Redirige al login luego de 2 segundos
            setTimeout(() => {
                navigate('/login');
            }, 2000);
        } catch (err: any) {
            // ✅ Evita error por intentar renderizar objetos
            const errorMsg = typeof err.response?.data === 'string'
                ? err.response.data
                : err.response?.data?.title || '❌ Error al registrar usuario';
            setMessage(errorMsg);
        }
    };



    return (

        <div className="login-container">
            
            <div className="background-image">
            {showVerificationModal && (
      <PhoneVerificationModal
        phone={formData.phone}
        code={verificationCode}
        loading={loading}
        onPhoneChange={(value) => setFormData({ ...formData, phone: value })}
        onCodeChange={setVerificationCode}
        onSendCode={sendVerification}
        onCheckCode={checkVerification}
      />
    )}

                <div className="login-box">
                    
                    <h2>Registro</h2>

                    <input name="firstName" value={formData.firstName} onChange={handleChange} placeholder="Nombres" className="form-input" />
                    <input name="lastNameP" value={formData.lastNameP} onChange={handleChange} placeholder="Apellido paterno" className="form-input" />
                    <input name="lastNameM" value={formData.lastNameM} onChange={handleChange} placeholder="Apellido materno" className="form-input" />
                    <input name="documentNumber" value={formData.documentNumber} onBlur={handleDniBlur} onChange={handleChange} placeholder="DNI" className="form-input" />
                    <input name="phone" value={formData.phone} onChange={handleChange} placeholder="Teléfono" className="form-input" />
                    <input name="email" onChange={handleChange} placeholder="Correo" className="form-input" />
                    <input
                        type="password"
                        name="passwordHash" // este es el campo correcto
                        onChange={handleChange}
                        placeholder="Contraseña"
                        className="form-input"
                    />
                    <select name="role" onChange={handleChange} className="form-input">
                        <option value="Administrador">Administrador</option>
                        <option value="Gestor">Gestor</option>
                        <option value="Gestante">Gestante</option>
                        <option value="Niño">Niño</option>
                    </select>
                    <input type="date" name="birthDate" onChange={handleChange} className="form-input" />
                    <input name="gender" onChange={handleChange} placeholder="Género" className="form-input" />
                    <input name="address" onChange={handleChange} placeholder="Dirección" className="form-input" />

                    <button onClick={handleRegister} className="form-button">Registrarse</button>
                    {message && <p className="error-text">{message}</p>}
                </div>
            </div>

        </div>
    );
}
