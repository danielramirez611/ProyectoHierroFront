import {
    Dialog, DialogTitle, DialogContent, DialogActions,
    TextField, MenuItem, Button, Box, FormControlLabel, Switch
  } from '@mui/material';
  import { useEffect, useState } from 'react';
  import api from '../api';
  import type { Tambo } from '../types/Tambo';
  
  interface Props {
    open: boolean;
    onClose: () => void;
    onSave: () => void;
    initialData?: any;
  }
  
  const tipos = ['Temporal', 'Movil', 'Permanente'];
  
  interface UserOption {
    fullName: string;
    dni: string;
  }
  
  export default function TamboModal({ open, onClose, onSave, initialData }: Props) {
    const [formData, setFormData] = useState<Partial<Tambo>>({
      id: undefined,
      name: '',
      code: '',
      departamento: '',
      provincia: '',
      distrito: '',
      direccion: '',
      referencia: '',
      horarioAtencion: '',
      tipo: 'Temporal',
      representante: '',
      documentoRepresentante: '',
      telefono: '',
      estado: true
    });
  
    const [departamentos, setDepartamentos] = useState<string[]>([]);
    const [provincias, setProvincias] = useState<string[]>([]);
    const [distritos, setDistritos] = useState<string[]>([]);
    const [usuarios, setUsuarios] = useState<UserOption[]>([]);
  
    useEffect(() => {
      api.get('/Tambos/departamentos').then(res => setDepartamentos(res.data));
      api.get('/Users')
        .then(res => {
          const filtrados = res.data.filter((u: any) => u.role === 'Administrador' || u.role === 'Gestor');
          const opciones = filtrados.map((u: any) => ({
            fullName: `${u.firstName} ${u.lastNameP} ${u.lastNameM}`,
            dni: u.documentNumber
          }));
          setUsuarios(opciones);
        });
    }, []);
  
    useEffect(() => {
      if (formData.departamento) {
        api.get(`/Tambos/provincias/${formData.departamento}`)
          .then(res => setProvincias(res.data));
      }
    }, [formData.departamento]);
  
    useEffect(() => {
      if (formData.departamento && formData.provincia) {
        api.get(`/Tambos/distritos/${formData.departamento}/${formData.provincia}`)
          .then(res => setDistritos(res.data));
      }
    }, [formData.departamento, formData.provincia]);
  
    useEffect(() => {
      if (initialData) setFormData(initialData);
    }, [initialData]);
  
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const { name, value } = e.target;
      setFormData(prev => ({ ...prev, [name]: value }));
    };
  
    const handleDniChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const dni = e.target.value;
      const usuario = usuarios.find(u => u.dni === dni);
      setFormData(prev => ({
        ...prev,
        documentoRepresentante: dni,
        representante: usuario ? usuario.fullName : prev.representante
      }));
    };
  
    const handleEstadoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setFormData(prev => ({ ...prev, estado: e.target.checked }));
    };
  
    const handleSubmit = async () => {
      if (formData.id) await api.put(`/Tambos/${formData.id}`, formData);
      else await api.post('/Tambos', formData);
  
      onSave();
      onClose();
    };
  
    return (
      <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
        <DialogTitle>{formData.id ? 'Editar' : 'Nuevo'} Tambo</DialogTitle>
        <DialogContent dividers>
          <Box display="grid" gridTemplateColumns="1fr 1fr" gap={2} mb={2}>
            <TextField label="Nombre" name="name" value={formData.name} onChange={handleChange} fullWidth />
            <TextField label="Código" name="code" value={formData.code} onChange={handleChange} fullWidth />
            <TextField label="Departamento" name="departamento" select value={formData.departamento} onChange={handleChange} fullWidth>
              {departamentos.map(d => <MenuItem key={d} value={d}>{d}</MenuItem>)}
            </TextField>
            <TextField label="Provincia" name="provincia" select value={formData.provincia} onChange={handleChange} fullWidth>
              {provincias.map(p => <MenuItem key={p} value={p}>{p}</MenuItem>)}
            </TextField>
            <TextField label="Distrito" name="distrito" select value={formData.distrito} onChange={handleChange} fullWidth>
              {distritos.map(d => <MenuItem key={d} value={d}>{d}</MenuItem>)}
            </TextField>
            <TextField label="Dirección" name="direccion" value={formData.direccion} onChange={handleChange} fullWidth />
            <TextField label="Referencia" name="referencia" value={formData.referencia} onChange={handleChange} fullWidth />
            <TextField label="Horario de Atención" name="horarioAtencion" value={formData.horarioAtencion} onChange={handleChange} fullWidth />
            <TextField label="Tipo de Tambo" name="tipo" select value={formData.tipo} onChange={handleChange} fullWidth>
              {tipos.map(t => <MenuItem key={t} value={t}>{t}</MenuItem>)}
            </TextField>
            <TextField
              label="DNI Representante"
              name="documentoRepresentante"
              select
              value={formData.documentoRepresentante}
              onChange={handleDniChange}
              fullWidth
            >
              {usuarios.map((u) => (
                <MenuItem key={u.dni} value={u.dni}>{u.dni}</MenuItem>
              ))}
            </TextField>
            <TextField label="Nombre del Representante" name="representante" value={formData.representante} onChange={handleChange} fullWidth />
            <TextField label="Teléfono" name="telefono" value={formData.telefono} onChange={handleChange} fullWidth />
            <Box gridColumn="span 2">
              <FormControlLabel
                control={<Switch checked={formData.estado ?? true} onChange={handleEstadoChange} />}
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