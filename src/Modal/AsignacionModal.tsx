import {
    Dialog, DialogTitle, DialogContent, DialogActions,
    TextField, MenuItem, Button, Box, FormControlLabel, Switch
  } from '@mui/material';
  import { useEffect, useState } from 'react';
  import api from '../api';
  import type { Asignacion } from '../types/Asignacion';
  
  interface Props {
    open: boolean;
    onClose: () => void;
    onSave: () => void;
    initialData?: Partial<Asignacion>;
  }
  
  export default function AsignacionModal({ open, onClose, onSave, initialData }: Props) {
    const [formData, setFormData] = useState<Partial<Asignacion>>({
      id: undefined,
      gestorId: 0,
      tamboId: 0,
      fechaAsignacion:'',
      departamento: '',
      provincia: '',
      distrito: '',
      centroPoblado: '',
      estado: true
    });
  
    const [gestores, setGestores] = useState<any[]>([]);
    const [tambos, setTambos] = useState<any[]>([]);
  
    useEffect(() => {
      if (initialData) setFormData({
        ...initialData,
        gestorId: initialData.gestorId ?? 0,
        tamboId: initialData.tamboId ?? 0
      });
    }, [initialData]);
  
    useEffect(() => {
        api.get('/Asignaciones/gestores-disponibles').then(res => {
          console.log("Gestores disponibles:", res.data); // Asegúrate de que tengan todos los campos
          setGestores(res.data);
        });
        api.get('/Asignaciones/tambos-disponibles').then(res => {
          console.log("Tambos disponibles:", res.data); // Igual acá
          setTambos(res.data);
        });
      }, []);
      
  
    useEffect(() => {
      const selectedTambo = tambos.find(t => t.id === formData.tamboId);
      if (selectedTambo) {
        setFormData(prev => ({
          ...prev,
          departamento: selectedTambo.departamento,
          provincia: selectedTambo.provincia,
          distrito: selectedTambo.distrito
        }));
      }
    }, [formData.tamboId, tambos]);
  
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const { name, value } = e.target;
      setFormData(prev => ({ ...prev, [name]: name === 'gestorId' || name === 'tamboId' ? Number(value) : value }));
    };
  
    const handleEstadoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setFormData(prev => ({ ...prev, estado: e.target.checked }));
    };
  
    const handleSubmit = async () => {
        try {
          if (!formData.gestorId || !formData.tamboId) {
            alert("Debe seleccionar un gestor y un tambo.");
            return;
          }
      
          const selectedGestor = gestores.find(g => g.id === formData.gestorId);
          const selectedTambo = tambos.find(t => t.id === formData.tamboId);
      
          if (!selectedGestor || !selectedTambo) {
            alert("Datos de gestor o tambo no encontrados.");
            return;
          }
      
          const payload = {
            gestorId: formData.gestorId,
            tamboId: formData.tamboId,
            centroPoblado: formData.centroPoblado || "",
            estado: formData.estado ?? true,
            departamento: selectedTambo.departamento,
            provincia: selectedTambo.provincia,
            distrito: selectedTambo.distrito,
            fechaAsignacion: new Date().toISOString()
          };
          
          
          
      
          if (formData.id) {
            await api.put(`/Asignaciones/${formData.id}`, {
              ...payload,
              id: formData.id
            });
          } else {
            await api.post('/Asignaciones', payload);
          }
      
          onSave();
          onClose();
        } catch (err: any) {
          console.error('❌ Error al guardar asignación:', err);
      
          if (err.response?.data?.errors) {
            const mensajes = Object.entries(err.response.data.errors)
              .map(([campo, errores]) => `${campo}: ${(errores as string[]).join(', ')}`)
              .join('\n');
            alert(`Errores de validación:\n${mensajes}`);
          } else {
            alert("Error desconocido al guardar la asignación.");
          }
        }
      };
      

      
  
    return (
      <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
        <DialogTitle>{formData.id ? 'Editar Asignación' : 'Nueva Asignación'}</DialogTitle>
        <DialogContent dividers>
        <Box display="grid" gridTemplateColumns="1fr 1fr" gap={2} mb={2}>
  <TextField
    label="Tambo"
    name="tamboId"
    select
    value={formData.tamboId}
    onChange={handleChange}
    fullWidth
  >
    {tambos.map(t => (
      <MenuItem key={t.id} value={t.id}>{t.name}</MenuItem>
    ))}
  </TextField>

  <TextField
    label="Gestor"
    name="gestorId"
    select
    value={formData.gestorId}
    onChange={handleChange}
    fullWidth
  >
    {gestores.map(g => (
      <MenuItem key={g.id} value={g.id}>{g.firstName} {g.lastNameP} {g.lastNameM}</MenuItem>
    ))}
  </TextField>

  <TextField
    label="Centro Poblado"
    name="centroPoblado"
    value={formData.centroPoblado}
    onChange={handleChange}
    fullWidth
  />

  <TextField
    label="Departamento"
    name="departamento"
    value={formData.departamento}
    fullWidth
    InputProps={{ readOnly: true }}
  />

  <TextField
    label="Provincia"
    name="provincia"
    value={formData.provincia}
    fullWidth
    InputProps={{ readOnly: true }}
  />

  <TextField
    label="Distrito"
    name="distrito"
    value={formData.distrito}
    fullWidth
    InputProps={{ readOnly: true }}
  />

  <Box gridColumn="span 2">
    <FormControlLabel
      control={<Switch checked={formData.estado} onChange={handleEstadoChange} />}
      label={formData.estado ? 'Activo' : 'Inactivo'}
    />
  </Box>
</Box>

        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cancelar</Button>
          <Button onClick={handleSubmit} variant="contained" color="primary">Guardar</Button>
        </DialogActions>
      </Dialog>
    );
  }
  