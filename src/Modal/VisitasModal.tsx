// VisitasModal.tsx
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  FormControlLabel,
  Checkbox,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
} from '@mui/material';
import { useEffect, useState } from 'react';
import { VisitaDomiciliaria, VisitaOfflineDto } from '../types/visitas';
import api from '../api';
import { Paciente } from '../types/Paciente';
import { User } from '../types/User';
import MapaSelector from '../componets/MapaSelector';

interface Props {
  open: boolean;
  onClose: () => void;
  visita?: VisitaDomiciliaria | null;
}

export default function VisitasModal({ open, onClose, visita }: Props) {
  const [data, setData] = useState<VisitaOfflineDto>({
    pacienteId: 0,
    gestorId: 0,
    asignacionId: undefined,
    fechaVisita: new Date().toISOString().split('T')[0],
    observacion: '',
    altura: undefined,
    peso: undefined,
    tieneAgua: false,
    tieneLuz: false,
    tieneInternet: false,
    latitud: undefined,
    longitud: undefined,
    ubicacionConfirmada: false,
  });

  const [pacientes, setPacientes] = useState<Paciente[]>([]);
  const [gestores, setGestores] = useState<User[]>([]);
  const [mapOpen, setMapOpen] = useState(false);

  useEffect(() => {
    if (open) {
      const cargarDatos = async () => {
        try {
          const resPacientes = await api.get('/Pacientes');
          const pacientes: Paciente[] = resPacientes.data;
          const pacientesConNombre = pacientes.map(p => ({
            ...p,
            nombreCompleto: p.usuario
              ? `${p.usuario.firstName} ${p.usuario.lastNameP} ${p.usuario.lastNameM}`
              : `Paciente ${p.id}`,
          }));
          setPacientes(pacientesConNombre);
        } catch (err) {
          console.error('❌ Error al cargar pacientes:', err);
        }
      };

      const cargarGestores = async () => {
        try {
          const res = await api.get('/Users');
          const gestores = res.data.filter((u: User) => u.role === 'Gestor');
          setGestores(gestores);
        } catch (err) {
          console.error('❌ Error al cargar gestores:', err);
        }
      };

      cargarDatos();
      cargarGestores();
    }
  }, [open]);

  useEffect(() => {
    if (visita) {
      setData({
        pacienteId: visita.pacienteId,
        gestorId: visita.gestorId,
        asignacionId: visita.asignacionId,
        fechaVisita: visita.fechaVisita.split('T')[0],
        observacion: visita.observacion,
        altura: visita.altura,
        peso: visita.peso,
        tieneAgua: visita.tieneAgua,
        tieneLuz: visita.tieneLuz,
        tieneInternet: visita.tieneInternet,
        latitud: visita.latitud,
        longitud: visita.longitud,
        ubicacionConfirmada: visita.ubicacionConfirmada,
      });
    }
  }, [visita]);

  const handleChange = (e: any) => {
    const { name, value, type } = e.target;
    const inputValue = type === 'checkbox' ? e.target.checked : value;
    setData(prev => ({ ...prev, [name]: inputValue }));
  };

  const isOnline = () => window.navigator.onLine;

  const handleObtenerUbicacion = () => {
    if (!navigator.geolocation) {
      alert('Tu navegador no soporta geolocalización.');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setData(prev => ({
          ...prev,
          latitud: pos.coords.latitude,
          longitud: pos.coords.longitude,
          ubicacionConfirmada: true,
        }));
      },
      (err) => {
        console.error(err);
        alert('No se pudo obtener la ubicación.');
      },
      { enableHighAccuracy: true }
    );
  };

  const handleMapaSelect = (lat: number, lng: number) => {
    setData(prev => ({
      ...prev,
      latitud: lat,
      longitud: lng,
      ubicacionConfirmada: true,
    }));
    setMapOpen(false);
  };

  const handleSubmit = async () => {
    try {
      if (isOnline()) {
        if (visita?.id) {
          await api.put(`/VisitaDomiciliaria/${visita.id}`, data);
        } else {

          await api.post('/VisitaDomiciliaria', data);
        }
      } else {
        const almacenadas = JSON.parse(localStorage.getItem('visitas_offline') || '[]');
        almacenadas.push(data);
        localStorage.setItem('visitas_offline', JSON.stringify(almacenadas));
        alert('Visita guardada sin conexión. Será sincronizada luego.');
      }
      onClose();
    } catch (error) {
      console.error('Error al guardar visita:', error);
    }
  };

  return (
    <>
      <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
        <DialogTitle>{visita ? 'Editar Visita' : 'Nueva Visita'}</DialogTitle>
        <DialogContent dividers>
          <Box display="flex" flexDirection="column" gap={2}>
            <FormControl fullWidth>
              <InputLabel>Paciente</InputLabel>
              <Select name="pacienteId" value={data.pacienteId} onChange={handleChange} fullWidth>
                {pacientes.map(p => (
                  <MenuItem key={p.id} value={p.id}>{p.nombreCompleto}</MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl fullWidth>
              <InputLabel>Gestor</InputLabel>
              <Select name="gestorId" value={data.gestorId} onChange={handleChange} fullWidth>
                {gestores.map(g => (
                  <MenuItem key={g.id} value={g.id}>
                    {`${g.firstName} ${g.lastNameP} ${g.lastNameM}`}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField label="Observación" name="observacion" value={data.observacion} onChange={handleChange} fullWidth multiline rows={3} />

            <Box display="flex" gap={2}>
              <TextField label="Altura (cm)" name="altura" type="number" value={data.altura ?? ''} onChange={handleChange} fullWidth />
              <TextField label="Peso (kg)" name="peso" type="number" value={data.peso ?? ''} onChange={handleChange} fullWidth />
            </Box>

            <TextField label="Fecha Visita" name="fechaVisita" type="date" value={data.fechaVisita} onChange={handleChange} InputLabelProps={{ shrink: true }} fullWidth />

            <Box>
              <label>Servicios básicos:</label>
              <Box display="flex" gap={2} mt={1}>
                <FormControlLabel control={<Checkbox checked={data.tieneAgua} onChange={handleChange} name="tieneAgua" />} label="Agua" />
                <FormControlLabel control={<Checkbox checked={data.tieneLuz} onChange={handleChange} name="tieneLuz" />} label="Luz" />
                <FormControlLabel control={<Checkbox checked={data.tieneInternet} onChange={handleChange} name="tieneInternet" />} label="Internet" />
              </Box>
            </Box>

            <Box display="flex" gap={2}>
              <TextField label="Latitud" name="latitud" type="number" value={data.latitud ?? ''} onChange={handleChange} fullWidth />
              <TextField label="Longitud" name="longitud" type="number" value={data.longitud ?? ''} onChange={handleChange} fullWidth />
            </Box>

            <FormControlLabel
              control={<Checkbox checked={data.ubicacionConfirmada} onChange={handleChange} name="ubicacionConfirmada" />}
              label="Ubicación confirmada"
            />

            <Box display="flex" gap={2}>
              <Button variant="outlined" onClick={handleObtenerUbicacion}>Obtener ubicación actual 📍</Button>
              <Button variant="outlined" onClick={() => setMapOpen(true)}>Seleccionar en el mapa 🗺️</Button>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cancelar</Button>
          <Button onClick={handleSubmit} variant="contained" color="primary">
            {visita ? 'Actualizar' : 'Guardar'}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={mapOpen} onClose={() => setMapOpen(false)} fullWidth maxWidth="md">
        <DialogTitle>Seleccionar ubicación en el mapa</DialogTitle>
        <DialogContent>
          <MapaSelector lat={data.latitud} lng={data.longitud} onSelect={handleMapaSelect} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setMapOpen(false)}>Cerrar</Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
