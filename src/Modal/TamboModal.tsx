import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, MenuItem, Button, Box, CircularProgress,
  Typography, Divider,
  Stack,
  Snackbar,
  Alert,
  Backdrop
} from '@mui/material';
import { useEffect, useState, useMemo } from 'react';
import api from '../api';
import type { Tambo } from '../types/Tambo';
import { AnimatePresence, motion } from 'framer-motion';

/* ╭─────── constantes ────────╮ */
const tipos = ['Temporal', 'Movil', 'Permanente'];
const estados = [
  { value: true,  label: 'Activo'   },
  { value: false, label: 'Inactivo' }
];

/* estado vacío reutilizable */
const emptyTambo: Partial<Tambo> = {
  id: undefined,
  name: '',
  code: '',
  departamento: '',
  provincia: '',
  distrito: '',
  direccion: '',
  referencia: '',
  horarioAtencion: '',
  tipo: '',               // ⬅️ sin elegir
  representante: '',
  documentoRepresentante: '',
  telefono: '',
  estado: undefined       // ⬅️ sin elegir
};

/* ╭─────── tipos ────────╮ */
interface Props {
  open: boolean;
  onClose: () => void;
  onSave: () => void;
  initialData?: Partial<Tambo>;
}
interface UserOption {
  telefono: string;
  fullName: string;
  dni: string;
}

/* ╭─────── componente ────────╮ */
export default function TamboModal({ open, onClose, onSave, initialData }: Props) {
  const [formData, setFormData] = useState<Partial<Tambo>>(emptyTambo);

  const [departamentos, setDepartamentos] = useState<string[]>([]);
  const [provincias,     setProvincias]   = useState<string[]>([]);
  const [distritos,      setDistritos]    = useState<string[]>([]);
  const [usuarios,       setUsuarios]     = useState<UserOption[]>([]);
  const [loadingCode,    setLoadingCode]  = useState(false);

  /* feedback UI */
  const [successOpen, setSuccessOpen]     = useState(false);
  const [confirmOpen, setConfirmOpen]     = useState(false);
  const [successAnim, setSuccessAnim]     = useState(false);

  /* ── formulario “sucio” ── */
  const isDirty = useMemo(() => {
    return JSON.stringify(formData) !== JSON.stringify(emptyTambo);
  }, [formData]);

  /* ── validación ── */
  const isFormValid = Boolean(
    formData.name &&
    formData.departamento &&
    formData.provincia &&
    formData.distrito &&
    formData.direccion &&
    formData.tipo &&
    formData.estado !== undefined &&
    formData.documentoRepresentante
  );

  /* ╭──── carga inicial ────╮ */
  useEffect(() => {
    api.get('/Tambos/departamentos').then(res => setDepartamentos(res.data));
    api.get('/Users').then(res => {
      const opciones = res.data
        .filter((u: any) => u.role === 'Administrador' || u.role === 'Gestor')
        .map((u: any) => ({
          fullName: `${u.firstName} ${u.lastNameP} ${u.lastNameM}`,
          dni     : u.documentNumber,
          telefono: u.phone
        }));
      setUsuarios(opciones);
    });
  }, []);

  /* provincias según departamento */
  useEffect(() => {
    if (formData.departamento) {
      api.get(`/Tambos/provincias/${formData.departamento}`)
         .then(res => setProvincias(res.data));
      setFormData(prev => ({ ...prev, provincia: '', distrito: '' }));
    }
  }, [formData.departamento]);

  /* distritos según provincia */
  useEffect(() => {
    if (formData.departamento && formData.provincia) {
      api
        .get(`/Tambos/distritos/${formData.departamento}/${formData.provincia}`)
        .then(res => setDistritos(res.data));
      setFormData(prev => ({ ...prev, distrito: '' }));
    }
  }, [formData.departamento, formData.provincia]);

  /* código autogenerado */
  useEffect(() => {
    if (!formData.id && formData.departamento && formData.provincia && formData.distrito) {
      const { departamento, provincia, distrito } = formData;
      setLoadingCode(true);
      api
        .get('/Tambos/next-code', { params: { departamento, provincia, distrito } })
        .then(res => setFormData(prev => ({ ...prev, code: res.data })))
        .finally(() => setLoadingCode(false));
    }
  }, [formData.departamento, formData.provincia, formData.distrito, formData.id]);

  /* modo edición */
  useEffect(() => {
    if (initialData) setFormData(initialData);
    else             setFormData(emptyTambo);
  }, [initialData, open]);

  /* ╭──── handlers ────╮ */
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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

  const handleEstadoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setFormData(prev => ({ ...prev, estado: val === '' ? undefined : val === 'true' }));
  };

  /* reset reutilizable */
  const resetForm = () => setFormData(emptyTambo);

  /* cerrar con confirm si hay cambios */
  const askClose = () => {
    if (isDirty) setConfirmOpen(true);
    else {
      resetForm();
      onClose();
    }
  };
  const confirmDiscard = () => {
    setConfirmOpen(false);
    resetForm();
    onClose();
    
  };

  /* guardar */
  const handleSubmit = async () => {
    if (formData.id) await api.put(`/Tambos/${formData.id}`, formData);
    else             await api.post('/Tambos', formData);

    setSuccessOpen(true);
    onSave();
    resetForm();
    onClose();// mostrar animación
    setSuccessAnim(true);
    setTimeout(() => setSuccessAnim(false), 1500);
  };

  /* ╭──── UI ────╮ */
  return (
    <>
      <Dialog open={open} onClose={askClose} fullWidth maxWidth="md">
        <DialogTitle>{formData.id ? 'Editar' : 'Nuevo'} Tambo</DialogTitle>

        <DialogContent dividers>
          {/* Información general */}
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
            {/* Código */}
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

            {/* Tipo */}
            <TextField
              required
              select
              label="Tipo de Tambo"
              name="tipo"
              value={formData.tipo}
              onChange={handleChange}
              fullWidth
            >
              <MenuItem value="">
                <em>Seleccione…</em>
              </MenuItem>
              {tipos.map(t => (
                <MenuItem key={t} value={t}>
                  {t}
                </MenuItem>
              ))}
            </TextField>

            {/* Estado */}
            <TextField
              required
              select
              label="Estado del Tambo"
              name="estado"
              value={formData.estado === undefined ? '' : formData.estado.toString()}
              onChange={handleEstadoChange}
              fullWidth
            >
              <MenuItem value="">
                <em>Seleccione…</em>
              </MenuItem>
              {estados.map(o => (
                <MenuItem key={o.value.toString()} value={o.value.toString()}>
                  {o.label}
                </MenuItem>
              ))}
            </TextField>
          </Box>

          <Divider sx={{ mb: 2 }} />

          {/* Ubicación */}
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

          {/* Representante */}
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
              InputProps={{ readOnly: true }}
              fullWidth
            />

            <TextField
              required
              label="Teléfono"
              name="telefono"
              value={formData.telefono}
              InputProps={{ readOnly: true }}
              fullWidth
            />
          </Box>
        </DialogContent>

        <DialogActions>
            <Button onClick={askClose}>Cancelar</Button>
            <Button variant="contained" disabled={!isFormValid} onClick={handleSubmit}>
              Guardar
            </Button>
          </DialogActions>
        </Dialog>
        <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)}>
          <DialogTitle fontWeight={600}>¿Descartar cambios?</DialogTitle>
          <DialogActions sx={{ p: 2 }}>
            <Stack direction="row" spacing={2} sx={{ mx: 'auto' }}>
              <Button onClick={() => setConfirmOpen(false)}>Volver</Button>
              <Button variant="contained" color="error" onClick={confirmDiscard}>
                Descartar
              </Button>
            </Stack>
          </DialogActions>
        </Dialog>

        {/* snackbar de éxito */}
        
       <AnimatePresence>
        {successAnim && (
          <Backdrop open sx={{ zIndex: 2000, backgroundColor: 'rgba(0,0,0,0.2)' }}>
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 15 }}
              style={{
                width: 120,
                height: 120,
                borderRadius: 60,
                backgroundColor: '#4caf50',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                fontSize: 56,
                fontWeight: 700
              }}
            >
              ✓
            </motion.div>
          </Backdrop>
        )}
      </AnimatePresence>
    </>
  );
}
