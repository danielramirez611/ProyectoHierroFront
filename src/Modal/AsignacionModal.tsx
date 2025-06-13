import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  FormControlLabel,
  Switch,
  Autocomplete
} from '@mui/material';
import { useEffect, useState } from 'react';
import api from '../api';
import type { Asignacion } from '../types/Asignacion';

/* ───────────────────────── utilidades ────────────────────────── */
const norm = (s: string | undefined | null) => (s ?? '').toString().toLowerCase();

/* Devuelve código del tambo sin importar el nombre real de la propiedad */
const getTamboCode = (t: any) =>
  t.code ?? t.codigo ?? t.tamboCode ?? '';

const getTamboName = (t: any) =>
  t.name ?? t.nombre ?? '';

/* Devuelve DNI del gestor sin importar la clave */
const getGestorDni = (g: any) =>
  g.documentNumber ?? g.dni ?? g.doc ?? '';

const getGestorName = (g: any) =>
  `${g.firstName ?? ''} ${g.lastNameP ?? ''} ${g.lastNameM ?? ''}`.trim();
/* ─────────────────────────────────────────────────────────────── */

interface Props {
  open: boolean;
  onClose: () => void;
  onSave: () => void;
  initialData?: Partial<Asignacion>;
}

export default function AsignacionModal({
  open,
  onClose,
  onSave,
  initialData
}: Props) {
  const [formData, setFormData] = useState<Partial<Asignacion>>({
    id: undefined,
    gestorId: 0,
    tamboId: 0,
    fechaAsignacion: '',
    departamento: '',
    provincia: '',
    distrito: '',
    centroPoblado: '',
    estado: true
  });

  const [gestores, setGestores] = useState<any[]>([]);
  const [tambos, setTambos] = useState<any[]>([]);

  /* ---- Carga inicial ---- */
  useEffect(() => {
    api.get('/Asignaciones/gestores-disponibles').then(res => setGestores(res.data));
    api.get('/Asignaciones/tambos-disponibles').then(res => setTambos(res.data));
  }, []);

  /* ---- Edición ---- */
  useEffect(() => {
    if (initialData) {
      setFormData({
        ...initialData,
        gestorId: initialData.gestorId ?? 0,
        tamboId: initialData.tamboId ?? 0
      });
    }
  }, [initialData]);

  /* ---- Autocompletar ubicación al elegir tambo ---- */
  useEffect(() => {
    const t = tambos.find(x => x.id === formData.tamboId);
    if (t) {
      setFormData(prev => ({
        ...prev,
        departamento: t.departamento,
        provincia: t.provincia,
        distrito: t.distrito
      }));
    }
  }, [formData.tamboId, tambos]);

  /* ---- Handlers ---- */
  const handleTexto = (e: React.ChangeEvent<HTMLInputElement>) =>
    setFormData(p => ({ ...p, [e.target.name]: e.target.value }));

  const handleEstado = (e: React.ChangeEvent<HTMLInputElement>) =>
    setFormData(p => ({ ...p, estado: e.target.checked }));

  /* ---- Enviar ---- */
  const handleSubmit = async () => {
    if (!formData.tamboId || !formData.gestorId) {
      alert('Seleccione un tambo y un gestor.');
      return;
    }

    const t = tambos.find(x => x.id === formData.tamboId);
    const g = gestores.find(x => x.id === formData.gestorId);
    if (!t || !g) {
      alert('Datos de tambo o gestor no encontrados.');
      return;
    }

    const payload = {
      gestorId: g.id,
      tamboId: t.id,
      centroPoblado: formData.centroPoblado ?? '',
      estado: formData.estado ?? true,
      departamento: t.departamento,
      provincia: t.provincia,
      distrito: t.distrito,
      fechaAsignacion: new Date().toISOString()
    };

    try {
      if (formData.id) {
        await api.put(`/Asignaciones/${formData.id}`, { ...payload, id: formData.id });
      } else {
        await api.post('/Asignaciones', payload);
      }
      onSave();
      onClose();
    } catch (err: any) {
      console.error('❌ Error al guardar asignación:', err);
      alert('Error al guardar la asignación.');
    }
  };

  /* ---- filtros ---- */

  const filtrarTambos = (list: any[], { inputValue }: { inputValue: string }) => {
    const s = norm(inputValue);
    if (!s) return list;
    return list.filter(t =>
      norm(getTamboCode(t)).includes(s) ||
      norm(getTamboName(t)).includes(s)
    );
  };

  const filtrarGestores = (list: any[], { inputValue }: { inputValue: string }) => {
    const s = norm(inputValue);
    if (!s) return list;
    return list.filter(g =>
      norm(getGestorDni(g)).includes(s) ||
      norm(getGestorName(g)).includes(s)
    );
  };

  /* ---- UI ---- */
  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle>{formData.id ? 'Editar Asignación' : 'Nueva Asignación'}</DialogTitle>

      <DialogContent dividers>
        <Box display="grid" gridTemplateColumns="1fr 1fr" gap={2} mb={2}>
          {/* TAMBO */}
          <Autocomplete
            options={tambos}
            filterOptions={filtrarTambos}
            isOptionEqualToValue={(o, v) => o.id === v.id}
            getOptionLabel={o =>
              `${getTamboCode(o)} - ${getTamboName(o)}`
            }
            renderInput={p => (
              <TextField {...p} label="Tambo (código o nombre)" fullWidth />
            )}
            value={tambos.find(t => t.id === formData.tamboId) || null}
            onChange={(_, val) => {
              if (val) {
                setFormData(prev => ({
                  ...prev,
                  tamboId: val.id,
                  departamento: val.departamento,
                  provincia: val.provincia,
                  distrito: val.distrito
                }));
              }
            }}
          />

          {/* GESTOR */}
          <Autocomplete
            options={gestores}
            filterOptions={filtrarGestores}
            isOptionEqualToValue={(o, v) => o.id === v.id}
            getOptionLabel={o =>
              `${getGestorDni(o)} - ${getGestorName(o)}`
            }
            renderInput={p => (
              <TextField {...p} label="Gestor (DNI o nombre)" fullWidth />
            )}
            value={gestores.find(g => g.id === formData.gestorId) || null}
            onChange={(_, val) => {
              if (val) setFormData(prev => ({ ...prev, gestorId: val.id }));
            }}
          />

          <TextField
            label="Centro Poblado"
            name="centroPoblado"
            value={formData.centroPoblado}
            onChange={handleTexto}
            fullWidth
          />

          <TextField label="Departamento" value={formData.departamento} fullWidth InputProps={{ readOnly: true }} />
          <TextField label="Provincia"    value={formData.provincia}    fullWidth InputProps={{ readOnly: true }} />
          <TextField label="Distrito"     value={formData.distrito}     fullWidth InputProps={{ readOnly: true }} />

          <Box gridColumn="span 2">
            <FormControlLabel
              control={<Switch checked={formData.estado} onChange={handleEstado} />}
              label={formData.estado ? 'Activo' : 'Inactivo'}
            />
          </Box>
        </Box>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Cancelar</Button>
        <Button variant="contained" onClick={handleSubmit}>
          Guardar
        </Button>
      </DialogActions>
    </Dialog>
  );
}
