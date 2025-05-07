import React, { useState } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Button,
    Box
} from '@mui/material';
import api from '../api';

interface Props {
    open: boolean;
    onClose: () => void;
    phone: string;
    onVerified: () => void;
}

export default function TelefonoVerificacionModal({ open, onClose, phone, onVerified }: Props) {
    const [code, setCode] = useState('');
    const [message, setMessage] = useState('');
    const [sent, setSent] = useState(false);

    const handleSendCode = async () => {
        try {
            await api.post('/users/verify/send', { phone });
            setSent(true);
            setMessage('Código enviado. Revisa tu teléfono.');
        } catch {
            setMessage('Error al enviar el código. Intenta nuevamente.');
        }
    };

    const handleVerify = async () => {
        try {
            await api.post('/users/verify/check', { phone, code });
            setMessage('✅ Teléfono verificado correctamente.');
            onVerified();
            onClose();
        } catch {
            setMessage('❌ Código incorrecto o expirado.');
        }
    };

    return (
        <Dialog open={open} onClose={onClose}>
            <DialogTitle>Verificar número</DialogTitle>
            <DialogContent>
                <p><strong>Teléfono:</strong> {phone}</p>
                <Box mb={2}>
                    <Button variant="outlined" onClick={handleSendCode} disabled={sent}>
                        Enviar código
                    </Button>
                </Box>
                <TextField
                    fullWidth
                    label="Código de verificación"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                />
                {message && <Box mt={2} color="gray">{message}</Box>}
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Cerrar</Button>
                <Button onClick={handleVerify} variant="contained" disabled={!code}>
                    Verificar
                </Button>
            </DialogActions>
        </Dialog>
    );
}
