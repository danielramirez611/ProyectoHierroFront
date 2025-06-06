  import React, { useState, useEffect } from 'react';
  import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    MenuItem,
    Button,
    Box,
    FormControlLabel,
    Checkbox,
  } from '@mui/material';
  import {
    Alerta,
    AlertaTipo,
    AlertaCategoria,
    PrioridadAlerta,
    PeriodicidadAlerta,
    CanalEnvioAlertaEnum,
  } from '../types/Alerta';
  import { Paciente } from '../types/Paciente';

  interface Props {
    open: boolean;
    onClose: () => void;
    onSave: () => void;
    form: Partial<Alerta>;
    setForm: React.Dispatch<React.SetStateAction<Partial<Alerta>>>;
    editing: boolean;
    pacientes: Paciente[];
  }

  export default function AlertaModal({
    open,
    onClose,
    onSave,
    form,
    setForm,
    editing,
    pacientes,
  }: Props) {
    // Marcar paciente automáticamente si sólo hay uno
    useEffect(() => {
      if (open && pacientes.length === 1 && !form.pacienteId) {
        setForm(prev => ({ ...prev, pacienteId: pacientes[0].id }));
      }
    }, [open, pacientes, form.pacienteId, setForm]);

    // Log del paciente seleccionado
    useEffect(() => {
      if (form.pacienteId) {
        const pacienteSeleccionado = pacientes.find(p => p.id === form.pacienteId);
        console.log('Paciente seleccionado:', pacienteSeleccionado);
      }
    }, [form.pacienteId, pacientes]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const { name, value } = e.target;
      setForm(prev => ({ ...prev, [name]: value }));
    };

    const handleCheckboxChange = (canal: CanalEnvioAlertaEnum) => {
      setForm(prev => ({
        ...prev,
        canalEnvio: (prev.canalEnvio ?? 0) & canal
          ? (prev.canalEnvio ?? 0) & ~canal
          : (prev.canalEnvio ?? 0) | canal,
      }));
    };

  return (
      <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
        <DialogTitle>{editing ? 'Editar Alerta' : 'Nueva Alerta'}</DialogTitle>
        <DialogContent dividers>
          <Box display="flex" flexDirection="column" gap={2}>

          <TextField
            select
            label="Paciente"
            name="pacienteId"
            value={form.pacienteId || ''}
            onChange={(e) => setForm({ ...form, pacienteId: Number(e.target.value) })}
            fullWidth
          >
            <MenuItem value="">Selecciona un paciente</MenuItem>
            {pacientes.length > 0 ? (
              pacientes.map((p) => (
                <MenuItem key={p.id} value={p.id}>
                  {p.nombreCompleto}
                </MenuItem>
              ))
            ) : (
              <MenuItem disabled>No hay pacientes registrados</MenuItem>
            )}
          </TextField>

            {/* Campos del formulario alerta */}
              <TextField
                label="Mensaje"
                name="mensaje"
                value={form.mensaje || ''}
                onChange={handleChange}
                fullWidth
                multiline
                rows={3}
              />

            <Box display="flex" gap={2}>
              <TextField
                select
                label="Tipo de alerta"
                name="tipo"
                value={form.tipo || AlertaTipo.Vacunacion}
                onChange={(e) => setForm({ ...form, tipo: e.target.value as AlertaTipo })}
                fullWidth
              >
                {Object.values(AlertaTipo).map((tipo) => (
                  <MenuItem key={tipo} value={tipo}>{tipo}</MenuItem>
                ))}
              </TextField>
              <TextField
                select
                label="Categoría"
                name="categoria"
                value={form.categoria || AlertaCategoria.Niño}
                onChange={(e) => setForm({ ...form, categoria: e.target.value as AlertaCategoria })}
                fullWidth
              >
                {Object.values(AlertaCategoria).map((cat) => (
                  <MenuItem key={cat} value={cat}>{cat}</MenuItem>
                ))}
              </TextField>
            </Box>

            <Box display="flex" gap={2}>
              <TextField
                select
                label="Prioridad"
                name="prioridad"
                value={form.prioridad || PrioridadAlerta.Media}
                onChange={(e) => setForm({ ...form, prioridad: e.target.value as PrioridadAlerta })}
                fullWidth
              >
                {Object.values(PrioridadAlerta).map((prio) => (
                  <MenuItem key={prio} value={prio}>{prio}</MenuItem>
                ))}
              </TextField>

              <TextField
                select
                label="Periodicidad"
                name="periodicidad"
                value={form.periodicidad || PeriodicidadAlerta.Unica}
                onChange={(e) => setForm({ ...form, periodicidad: e.target.value as PeriodicidadAlerta })}
                fullWidth
              >
                {Object.values(PeriodicidadAlerta).map((p) => (
                  <MenuItem key={p} value={p}>{p}</MenuItem>
                ))}
              </TextField>
            </Box>
            <Box display="flex" gap={2}>
              {form.periodicidad && form.periodicidad !== PeriodicidadAlerta.Unica && (
                <TextField
                  label="Fecha Fin de Repetición"
                  name="fechaFinRepeticion"
                  type="date"
                  value={form.fechaFinRepeticion || ''}
                  onChange={handleChange}
                  InputLabelProps={{ shrink: true }}
                  fullWidth
                />
              )}

              <TextField
                label="Fecha de Alerta"
                name="fechaAlerta"
                type="date"
                value={form.fechaAlerta || ''}
                onChange={handleChange}
                InputLabelProps={{ shrink: true }}
                fullWidth
              />
            </Box>

            {/* Mostrar solo si no es 'Unica' */}

            <Box>
              <label>Canales de Envío:</label>
              <Box display="flex" gap={2} mt={1}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={!!((form.canalEnvio ?? 0) & CanalEnvioAlertaEnum.App)}
                      onChange={() => handleCheckboxChange(CanalEnvioAlertaEnum.App)}
                    />
                  }
                  label="App"
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={!!((form.canalEnvio ?? 0) & CanalEnvioAlertaEnum.Correo)}
                      onChange={() => handleCheckboxChange(CanalEnvioAlertaEnum.Correo)}
                    />
                  }
                  label="Correo"
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={!!((form.canalEnvio ?? 0) & CanalEnvioAlertaEnum.SMS)}
                      onChange={() => handleCheckboxChange(CanalEnvioAlertaEnum.SMS)}
                    />
                  }
                  label="SMS"
                />
              </Box>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cancelar</Button>
          <Button onClick={onSave} variant="contained" color="primary">
            {editing ? 'Actualizar' : 'Crear'}
          </Button>
        </DialogActions>
      </Dialog>
    );
  }
