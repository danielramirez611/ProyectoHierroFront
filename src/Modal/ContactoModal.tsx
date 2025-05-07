import {
    Dialog, DialogTitle, DialogContent, DialogActions,
    TextField, MenuItem, Button, FormControlLabel, Switch, Box
  } from '@mui/material';
  import { useEffect, useState } from 'react';
  import api from '../api';
  
  interface Props {
    open: boolean;
    onClose: () => void;
    onSave: () => void;
    initialData?: any;
  }
  
  export default function ContactoModal({ open, onClose, onSave, initialData }: Props) {
    const [formData, setFormData] = useState({
      id: 0,
      tipoDocumento: 'DNI',
      documento: '',
      telefono: '',
      apellidoPaterno: '',
      apellidoMaterno: '',
      nombreCompleto: '',
      fechaNacimiento: '',
      genero: '',
      direccion: '',
      parentesco: '',
      notificaciones: '',
      pacienteId: 0,
    });
  
    const [pacientes, setPacientes] = useState<any[]>([]);
  
    useEffect(() => {
      api.get('/Contactos/pacientes-disponibles')
        .then(res => setPacientes(res.data))
        .catch(err => console.error('Error cargando pacientes:', err));
    }, []);
  
    useEffect(() => {
      if (initialData) {
        setFormData({ ...initialData });
      } else {
        setFormData({
          id: 0,
          tipoDocumento: 'DNI',
          documento: '',
          telefono: '',
          apellidoPaterno: '',
          apellidoMaterno: '',
          nombreCompleto: '',
          fechaNacimiento: '',
          genero: '',
          direccion: '',
          parentesco: '',
          notificaciones: '',
          pacienteId: 0,
        });
      }
    }, [initialData]);
  
    const handleChange = (e: any) => {
      const { name, value } = e.target;
      setFormData(prev => ({ ...prev, [name]: value }));
    };
  
    const handleDocumentoBlur = async () => {
        if (formData.tipoDocumento === 'DNI' && formData.documento.length === 8) {
          try {
            const res = await api.post('/Users/dni', { dni: formData.documento });
            const { firstName, lastNameP, lastNameM } = res.data;
      
            setFormData(prev => ({
              ...prev,
              nombreCompleto: firstName,
              apellidoPaterno: lastNameP,
              apellidoMaterno: lastNameM,
            }));
          } catch (err) {
            console.warn('❌ No se pudo obtener datos desde el DNI:', err);
          }
        }
      };
      
  
    const handleSubmit = async () => {
      try {
        const payload = { ...formData };
        if (formData.id) {
          await api.put(`/Contactos/${formData.id}`, payload);
        } else {
          await api.post('/Contactos', payload);
        }
        onSave();
        onClose();
      } catch (err) {
        console.error('❌ Error al guardar contacto:', err);
        alert('Error al guardar contacto');
      }
    };
  
    return (
      <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
        <DialogTitle>{formData.id ? 'Editar Contacto' : 'Nuevo Contacto'}</DialogTitle>
        <DialogContent dividers>
          <Box display="flex" flexDirection="column" gap={2}>
  
            <TextField
              select label="Paciente"
              name="pacienteId"
              value={formData.pacienteId}
              onChange={handleChange}
              fullWidth
            >
              {pacientes.map(p => (
                <MenuItem key={p.id} value={p.id}>{p.nombre}</MenuItem>
              ))}
            </TextField>
  
            <TextField
              label="Documento"
              name="documento"
              value={formData.documento}
              onChange={handleChange}
              onBlur={handleDocumentoBlur}
              fullWidth
            />
  
            <TextField
              label="Teléfono"
              name="telefono"
              value={formData.telefono}
              onChange={handleChange}
              fullWidth
            />
  
            <TextField
              label="Nombre"
              name="nombreCompleto"
              value={formData.nombreCompleto}
              onChange={handleChange}
              fullWidth
            />
  
            <TextField
              label="Apellido Paterno"
              name="apellidoPaterno"
              value={formData.apellidoPaterno}
              onChange={handleChange}
              fullWidth
            />
  
            <TextField
              label="Apellido Materno"
              name="apellidoMaterno"
              value={formData.apellidoMaterno}
              onChange={handleChange}
              fullWidth
            />
  
            <TextField
              type="date"
              label="Fecha Nacimiento"
              name="fechaNacimiento"
              value={formData.fechaNacimiento}
              onChange={handleChange}
              InputLabelProps={{ shrink: true }}
              fullWidth
            />
  
            <TextField
              select
              label="Género"
              name="genero"
              value={formData.genero}
              onChange={handleChange}
              fullWidth
            >
              <MenuItem value="Masculino">Masculino</MenuItem>
              <MenuItem value="Femenino">Femenino</MenuItem>
            </TextField>
  
            <TextField
              label="Dirección"
              name="direccion"
              value={formData.direccion}
              onChange={handleChange}
              fullWidth
            />
  
            <TextField
              select
              label="Parentesco"
              name="parentesco"
              value={formData.parentesco}
              onChange={handleChange}
              fullWidth
            >
              <MenuItem value="Madre">Madre</MenuItem>
              <MenuItem value="Padre">Padre</MenuItem>
              <MenuItem value="Tutor">Tutor</MenuItem>
              <MenuItem value="Hermano">Hermano</MenuItem>
            </TextField>
  
            <TextField
              select
              label="Notificaciones"
              name="notificaciones"
              value={formData.notificaciones}
              onChange={handleChange}
              fullWidth
            >
              <MenuItem value="SMS">SMS</MenuItem>
              <MenuItem value="Correo">Correo</MenuItem>
              <MenuItem value="WhatsApp">WhatsApp</MenuItem>
              <MenuItem value="NotificacionApp">Notificación App</MenuItem>
            </TextField>
  
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cancelar</Button>
          <Button onClick={handleSubmit} variant="contained" color="primary">
            {formData.id ? 'Actualizar' : 'Guardar'}
          </Button>
        </DialogActions>
      </Dialog>
    );
  }
  