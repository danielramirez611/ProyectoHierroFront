import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, MenuItem, Button, FormControlLabel, Switch
} from '@mui/material';
import { useState, useEffect } from 'react';
import api from '../api';
import { PacienteFormData, UsuarioPacienteOption } from '../types/Paciente';

interface Props {
  open: boolean;
  onClose: () => void;
  onSave: () => void;
  initialData?: { id: number; userId: number; tieneAnemia: boolean };
}

export default function PacienteModal({ open, onClose, onSave, initialData }: Props) {
  const [userId, setUserId] = useState('');
  const [tieneAnemia, setTieneAnemia] = useState(false);
  const [usuarios, setUsuarios] = useState<UsuarioPacienteOption[]>([]);

  useEffect(() => {
    if (open) {
      api.get('/Pacientes/usuarios-pacientes')
        .then(res => setUsuarios(res.data))
        .catch(err => console.error('Error al cargar usuarios:', err));
    }
  }, [open]);

  useEffect(() => {
    if (initialData) {
      setUserId(initialData.userId.toString());
      setTieneAnemia(initialData.tieneAnemia);
    } else {
      setUserId('');
      setTieneAnemia(false);
    }
  }, [initialData]);

  const handleSubmit = async () => {
    if (!userId) {
      alert('Debes seleccionar un usuario.');
      return;
    }

    const payload = {
      userId: Number(userId),
      tieneAnemia
    };

    try {
      if (initialData?.id) {
        await api.put(`/Pacientes/${initialData.id}`, { id: initialData.id, ...payload });
      } else {
        await api.post('/Pacientes', payload);
      }
      onSave();
      onClose();
    } catch (err: any) {
      console.error('❌ Error al guardar paciente:', err);
      alert('No se pudo guardar el paciente.');
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth>
      <DialogTitle>{initialData ? 'Editar Paciente' : 'Nuevo Paciente'}</DialogTitle>
      <DialogContent dividers>
      <TextField
  select
  fullWidth
  label="Usuario (Gestante o Niño)"
  value={userId}
  onChange={(e) => setUserId(e.target.value)}
  margin="normal"
>

          {usuarios.map(u => (
            <MenuItem key={u.id} value={u.id}>{u.nombre}</MenuItem>
          ))}
        </TextField>

        <FormControlLabel
          control={<Switch checked={tieneAnemia} onChange={(e) => setTieneAnemia(e.target.checked)} />}
          label="¿Tiene Anemia?"
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancelar</Button>
        <Button variant="contained" color="primary" onClick={handleSubmit}>
          {initialData ? 'Actualizar' : 'Guardar'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
