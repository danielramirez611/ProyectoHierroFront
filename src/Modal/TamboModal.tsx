import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, MenuItem, Button, Box, FormControlLabel, Switch,
  CircularProgress,
  Typography,
  Divider, Grid
} from '@mui/material';
import { useEffect, useState } from 'react';
import api from '../api';
import type { Tambo } from '../types/Tambo';

interface Props {
  open: boolean;
  onClose: () => void;
  onSave: () => void;
  initialData?: Partial<Tambo>;
}

const tipos = ['Temporal', 'Movil', 'Permanente'];
const estados = [
  { value: true,  label: 'Activo'   },
  { value: false, label: 'Inactivo' }
];


interface UserOption {
  telefono: string;
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
  const [distritos, setDistritos]   = useState<string[]>([]);
  const [usuarios, setUsuarios]     = useState<UserOption[]>([]);

  const isFormValid = Boolean(
    formData.name &&
    formData.departamento &&
    formData.provincia &&
    formData.distrito &&
    formData.direccion &&
    formData.tipo &&
    formData.documentoRepresentante   // o lo que definas obligatorio
  );


  /* 🔄 loader para el código autogenerado */
  const [loadingCode, setLoadingCode] = useState(false);

  /* ─────────────────────────────────────────────────────
     1.  Carga inicial de departamentos y usuarios
  ───────────────────────────────────────────────────── */
  useEffect(() => {
    api.get('/Tambos/departamentos').then(res => setDepartamentos(res.data));

    api.get('/Users').then(res => {
      const filtrados = res.data.filter((u: any) =>
        u.role === 'Administrador' || u.role === 'Gestor'
      );
      const opciones = filtrados.map((u: any) => ({
        fullName: `${u.firstName} ${u.lastNameP} ${u.lastNameM}`,
        dni: u.documentNumber,
        telefono: u.phone          // ← backend envía “phone”
      }));
      setUsuarios(opciones);
    });
  }, []);

  /* ─────────────────────────────────────────────────────
     2.  Provincias según departamento
  ───────────────────────────────────────────────────── */
  useEffect(() => {
    if (formData.departamento) {
      api.get(`/Tambos/provincias/${formData.departamento}`)
         .then(res => setProvincias(res.data));
      /*  limpiar selección dependiente              */
      setFormData(prev => ({ ...prev, provincia: '', distrito: '' }));
    }
  }, [formData.departamento]);

  /* ─────────────────────────────────────────────────────
     3.  Distritos según provincia
  ───────────────────────────────────────────────────── */
  useEffect(() => {
    if (formData.departamento && formData.provincia) {
      api.get(`/Tambos/distritos/${formData.departamento}/${formData.provincia}`)
         .then(res => setDistritos(res.data));
      setFormData(prev => ({ ...prev, distrito: '' }));
    }
  }, [formData.departamento, formData.provincia]);

  /* ─────────────────────────────────────────────────────
     4.  Código autogenerado cuando ya hay distrito
  ───────────────────────────────────────────────────── */
  useEffect(() => {
    if (!formData.id && formData.departamento && formData.provincia && formData.distrito) {
      const { departamento, provincia, distrito } = formData;
      setLoadingCode(true);
      api
        .get(`/Tambos/next-code`, { params: { departamento, provincia, distrito } })
        .then(res => {
          setFormData(prev => ({ ...prev, code: res.data })); /* código sugerido */
        })
        .finally(() => setLoadingCode(false));
    }
  }, [formData.departamento, formData.provincia, formData.distrito, formData.id]);

  /* ─────────────────────────────────────────────────────
     5.  Datos iniciales (modo edición)
  ───────────────────────────────────────────────────── */
  useEffect(() => {
    if (initialData) setFormData(initialData);
  }, [initialData]);

  /* ──────────────────────────── handlers */
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
      representante: usuario ? usuario.fullName : '',
      telefono: usuario ? usuario.telefono : ''
    }));
  };

  const handleEstadoChange = (
  e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const valorBoolean = e.target.value === 'true'; // 'true' → true
    setFormData(prev => ({ ...prev, estado: valorBoolean }));
  };


  const handleSubmit = async () => {
    if (formData.id) await api.put(`/Tambos/${formData.id}`, formData);
    else             await api.post('/Tambos', formData);
    onSave();
    onClose();
  };

  /* ──────────────────────────── UI */
  return (
  <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
    <DialogTitle>{formData.id ? 'Editar' : 'Nuevo'} Tambo</DialogTitle>

    <DialogContent dividers>

      {/* ─────────────── Información general ─────────────── */}
      <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
        Información general
      </Typography>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
          gap: 2,
          mb: 3
        }}
      >
        {/* Código autogenerado */}
        <Box position="relative">
          <TextField
            required
            label="Código"
            name="code"
            value={formData.code}
            fullWidth
            InputProps={{ readOnly: true }}
            helperText="Se genera al elegir distrito"
          />
          {loadingCode && (
            <CircularProgress
              size={24}
              sx={{ position: 'absolute', top: '50%', right: 16, mt: '-12px' }}
            />
          )}
        </Box>

        <TextField
          required
          label="Nombre"
          name="name"
          value={formData.name}
          onChange={handleChange}
          fullWidth
        />

        <TextField
          required
          select
          label="Tipo de Tambo"
          name="tipo"
          value={formData.tipo}
          onChange={handleChange}
          fullWidth
        >
          {tipos.map(t => (
            <MenuItem key={t} value={t}>
              {t}
            </MenuItem>
          ))}
        </TextField>

        <TextField
          required
          select
          label="Estado del Tambo"
          name="estado"
          value={(formData.estado ?? true).toString()}
          onChange={handleEstadoChange}
          fullWidth
        >
          {estados.map(opt => (
            <MenuItem key={opt.value.toString()} value={opt.value.toString()}>
              {opt.label}
            </MenuItem>
          ))}
        </TextField>
      </Box>

      <Divider sx={{ mb: 2 }} />

      {/* ─────────────── Ubicación ─────────────── */}
      <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
        Ubicación
      </Typography>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
          gap: 2,
          mb: 3
        }}
      >
        <TextField
          required
          select
          label="Departamento"
          name="departamento"
          value={formData.departamento}
          onChange={handleChange}
          fullWidth
        >
          {departamentos.map(d => (
            <MenuItem key={d} value={d}>
              {d}
            </MenuItem>
          ))}
        </TextField>

        <TextField
          required
          select
          label="Provincia"
          name="provincia"
          value={formData.provincia}
          onChange={handleChange}
          fullWidth
        >
          {provincias.map(p => (
            <MenuItem key={p} value={p}>
              {p}
            </MenuItem>
          ))}
        </TextField>

        <TextField 
          required
          select
          label="Distrito"
          name="distrito"
          value={formData.distrito}
          onChange={handleChange}
          fullWidth
        >
          {distritos.map(d => (
            <MenuItem key={d} value={d}>
              {d}
            </MenuItem>
          ))}
        </TextField>

        <TextField
          required
          label="Dirección"
          name="direccion"
          value={formData.direccion}
          onChange={handleChange}
          fullWidth
        />

        <TextField
          required
          label="Referencia"
          name="referencia"
          value={formData.referencia}
          onChange={handleChange}
          fullWidth
        />

        <TextField
          required
          label="Horario de Atención"
          name="horarioAtencion"
          value={formData.horarioAtencion}
          onChange={handleChange}
          fullWidth
        />
      </Box>

      <Divider sx={{ mb: 2 }} />

      {/* ─────────────── Representante ─────────────── */}
      <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
        Representante
      </Typography>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
          gap: 2,
          mb: 3
        }}
      >
        <TextField
          required
          select
          label="DNI Representante"
          name="documentoRepresentante"
          value={formData.documentoRepresentante}
          onChange={handleDniChange}
          fullWidth
        >
          {usuarios.map(u => (
            <MenuItem key={u.dni} value={u.dni}>
              {u.dni}
            </MenuItem>
          ))}
        </TextField>

        <TextField
          required
          label="Nombre del Representante"
          name="representante"
          value={formData.representante}
          fullWidth
          InputProps={{ readOnly: true }}
        />

        <TextField
          required
          label="Teléfono"
          name="telefono"
          value={formData.telefono}
          fullWidth
          InputProps={{ readOnly: true }}
        />
      </Box>
    </DialogContent>

    <DialogActions>
      <Button onClick={onClose}>Cancelar</Button>
      <Button onClick={handleSubmit} variant="contained" color="primary" disabled={!isFormValid}>
        Guardar
      </Button>
    </DialogActions>
  </Dialog>
);


}
