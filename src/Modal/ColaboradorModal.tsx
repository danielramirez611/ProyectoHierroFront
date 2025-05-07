import React, { useState, useEffect } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    MenuItem,
    Box,
    CircularProgress,
    Fade
} from '@mui/material';

import api from '../api';
import { UserFormData } from '../types/User';
import TelefonoVerificacionModal from './TelefonoVerificacionModal'; // importa el nuevo modal
import { useSnackbar } from 'notistack';

interface Props {
    open: boolean;
    onClose: () => void;
    onSave: () => void;
    initialData?: UserFormData;
}

const roles = ['Administrador', 'Gestor', 'Gestante', 'Niño'];

export default function ColaboradorModal({ open, onClose, onSave, initialData }: Props) {
    const [formData, setFormData] = useState<UserFormData>({
        firstName: '',
        lastNameP: '',
        lastNameM: '',
        documentNumber: '',
        phone: '',
        email: '',
        passwordHash: '',
        role: 'Gestor',
        birthDate: '',
        gender: '',
        address: ''
    });
    const [loadingDni, setLoadingDni] = useState(false);
    const [dniAutofilled, setDniAutofilled] = useState(false);
    const [showVerifyModal, setShowVerifyModal] = useState(false);
    const [phoneVerified, setPhoneVerified] = useState(false);
    const { enqueueSnackbar } = useSnackbar();

    function formatDate(dateString: string | undefined): string {
        return dateString ? dateString.split('T')[0] : '';
    }

    useEffect(() => {
        if (initialData) {
            setFormData({
                ...initialData,
                birthDate: formatDate(initialData.birthDate)
            });
        } else {
            setFormData({
                firstName: '',
                lastNameP: '',
                lastNameM: '',
                documentNumber: '',
                phone: '',
                email: '',
                passwordHash: '',
                role: 'Gestor',
                birthDate: '',
                gender: '',
                address: ''
            });
        }
        setDniAutofilled(false);
    }, [initialData]);

    const fetchReniecData = async (dni: string) => {
        setLoadingDni(true);
        try {
            const res = await api.post('/Users/dni', { dni });
            setFormData(prev => ({
                ...prev,
                firstName: res.data.firstName,
                lastNameP: res.data.lastNameP,
                lastNameM: res.data.lastNameM
            }));
            setDniAutofilled(true);
        } catch (error) {
            console.warn('No se pudo obtener datos desde RENIEC');
        } finally {
            setLoadingDni(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async () => {
        try {
            if (formData.id) {
                await api.put(`/Users/${formData.id}`, formData);
            } else {
                await api.post('/Users', formData);
            }
            onSave();
            onClose();
        } catch (error: any) {
          const mensaje = error.response?.data || 'Error al guardar el colaborador';
          enqueueSnackbar(`❌ ${mensaje}`, { variant: 'error' });
        }
      
    };

    const renderTextField = (name: keyof UserFormData, label: string, type: string = 'text', extraProps = {}) => (
        <Fade in={dniAutofilled} timeout={800}>
            <Box
                mb={2}
                sx={{
                    transition: 'background-color 1s',
                    backgroundColor: dniAutofilled && ['firstName', 'lastNameP', 'lastNameM'].includes(name)
                        ? '#e3f2fd'
                        : 'transparent',
                    borderRadius: 1,
                    p: dniAutofilled && ['firstName', 'lastNameP', 'lastNameM'].includes(name) ? 1 : 0
                }}
            >
                <TextField
                    fullWidth
                    label={label}
                    name={name}
                    type={type}
                    value={formData[name] ?? ''}
                    onChange={handleChange}
                    {...extraProps}
                />
            </Box>
        </Fade>
    );

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
            <DialogTitle sx={{ fontWeight: 'bold', fontSize: '1.25rem' }}>
                {formData.id ? 'Editar' : 'Nuevo'} Colaborador
            </DialogTitle>
            <DialogContent dividers>
                <Box display="flex" gap={2} alignItems="center" mb={2}>
                    <TextField
                        fullWidth
                        label="DNI"
                        name="documentNumber"
                        value={formData.documentNumber}
                        onChange={(e) => {
                            const value = e.target.value;
                            setFormData({ ...formData, documentNumber: value });
                            setDniAutofilled(false);
                            if (value.length === 8) fetchReniecData(value);
                        }}
                    />
                    {loadingDni && <CircularProgress size={24} />}
                </Box>

                {renderTextField('phone', 'Teléfono')}
                <Box mb={2}>
    <Button
        variant="outlined"
        color={phoneVerified ? 'success' : 'primary'}
        onClick={() => setShowVerifyModal(true)}
    >
        {phoneVerified ? 'Teléfono verificado ✅' : 'Verificar número'}
    </Button>
</Box>

                {renderTextField('firstName', 'Nombres')}
                {renderTextField('lastNameP', 'Apellido Paterno')}
                {renderTextField('lastNameM', 'Apellido Materno')}
                {renderTextField('email', 'Correo electrónico', 'email')}
                {renderTextField('passwordHash', 'Contraseña', 'password')}
                {renderTextField('birthDate', 'Fecha de nacimiento', 'date', {
                    InputLabelProps: { shrink: true }
                })}
                {renderTextField('gender', 'Género')}
                {renderTextField('address', 'Dirección')}

                <Box mb={2}>
                    <TextField
                        select
                        fullWidth
                        label="Rol"
                        name="role"
                        value={formData.role}
                        onChange={handleChange}
                    >
                        {roles.map((rol) => (
                            <MenuItem key={rol} value={rol}>
                                {rol}
                            </MenuItem>
                        ))}
                    </TextField>
                </Box>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Cancelar</Button>
                <Button onClick={handleSubmit} variant="contained" color="success">
                    Guardar
                </Button>
            </DialogActions>
            <TelefonoVerificacionModal
    open={showVerifyModal}
    onClose={() => setShowVerifyModal(false)}
    phone={formData.phone}
    onVerified={() => setPhoneVerified(true)}
/>

        </Dialog>
        
    );
}
