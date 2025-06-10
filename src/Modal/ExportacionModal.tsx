import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    MenuItem,
    Button,
    Box,
    Typography,
  } from '@mui/material';
  import { useState } from 'react';
  import { TipoExportacionEnum } from '../types/Exportacion';
  import api from '../api';
  import { toast } from 'react-toastify';
  
  interface Props {
    open: boolean;
    onClose: () => void;
    onSuccess: () => void;
  }
  
  export default function ExportacionModal({ open, onClose, onSuccess }: Props) {
    const [tipoExportacion, setTipoExportacion] = useState<TipoExportacionEnum>(TipoExportacionEnum.Visitas);
    const [fechaInicio, setFechaInicio] = useState('');
    const [fechaFin, setFechaFin] = useState('');
    const [loading, setLoading] = useState(false);
    const [qrBase64, setQrBase64] = useState<string | null>(null);
    const [archivoNombre, setArchivoNombre] = useState<string | null>(null);
    const [archivoUrl, setArchivoUrl] = useState<string | null>(null);
  
    const handleExportar = async () => {
      if (!tipoExportacion || !fechaInicio || !fechaFin) {
        toast.error('❌ Todos los campos son obligatorios');
        return;
      }
  
      try {
        setLoading(true);
        const storedUser = localStorage.getItem('user');
        if (!storedUser) return;
        const user = JSON.parse(storedUser);
  
        const res = await api.post('/exportacionhistorial/generar-exportacion', {
          usuarioId: user.id,
          tipoExportacion,
          filtrosAplicados: JSON.stringify({ fechaInicio, fechaFin }),
          nombreEntidad: tipoExportacion.toString(),
          fechaInicio: new Date(fechaInicio).toISOString(),
          fechaFin: new Date(fechaFin).toISOString(),
        });
  
        toast.success('✅ Exportación generada correctamente');
  
        const archivoGenerado = res.data?.registro?.urlArchivo || '';
        const nombreExtraído = archivoGenerado.split('/').pop() ?? null;
  
        setQrBase64(res.data.qr);
        setArchivoNombre(nombreExtraído);
        setArchivoUrl(`${process.env.REACT_APP_API_URL}/${archivoGenerado}`);
  
        onSuccess();
      } catch (err) {
        toast.error('❌ Error al exportar');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
  
    const handleClose = () => {
      setQrBase64(null);
      setArchivoNombre(null);
      setArchivoUrl(null);
      onClose();
    };
  
    return (
      <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
        <DialogTitle>Nueva Exportación</DialogTitle>
        <DialogContent dividers>
          <Box display="flex" flexDirection="column" gap={3}>
            <TextField
              select
              label="Tipo de Exportación"
              value={tipoExportacion}
              onChange={(e) => setTipoExportacion(e.target.value as TipoExportacionEnum)}
              fullWidth
            >
              {Object.values(TipoExportacionEnum).map((valor) => (
                <MenuItem key={valor} value={valor}>
                  {valor}
                </MenuItem>
              ))}
            </TextField>
  
            <Box display="flex" gap={2}>
              <TextField
                type="date"
                label="Desde"
                value={fechaInicio}
                onChange={(e) => setFechaInicio(e.target.value)}
                InputLabelProps={{ shrink: true }}
                fullWidth
              />
              <TextField
                type="date"
                label="Hasta"
                value={fechaFin}
                onChange={(e) => setFechaFin(e.target.value)}
                InputLabelProps={{ shrink: true }}
                fullWidth
              />
            </Box>
  
            {qrBase64 && (
              <Box textAlign="center" mt={3}>
                <Typography variant="body1" gutterBottom>
                  Escanea el QR desde tu celular:
                </Typography>
                <img src={qrBase64} alt="Código QR" style={{ width: 200, height: 200 }} />
                {archivoNombre && (
                  <Typography variant="caption" mt={1} color="textSecondary">
                    Archivo generado: {archivoNombre}
                  </Typography>
                )}
                {archivoUrl && (
                  <Button
                    href={archivoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    variant="outlined"
                    size="small"
                    sx={{ mt: 1 }}
                  >
                    Descargar archivo
                  </Button>
                )}
              </Box>
            )}
          </Box>
        </DialogContent>
  
        <DialogActions>
          <Button onClick={handleClose}>Cerrar</Button>
          <Button
            onClick={handleExportar}
            variant="contained"
            color="primary"
            disabled={loading || !fechaInicio || !fechaFin}
          >
            {loading ? 'Generando...' : 'Exportar'}
          </Button>
        </DialogActions>
      </Dialog>
    );
  }
  