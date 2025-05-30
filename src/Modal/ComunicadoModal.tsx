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
import { Comunicado, DestinatarioEnum, ComunicadoCanalEnvioEnum, TipoContenidoEnum } from '../types/Comunicado';

interface Props {
  open: boolean;
  onClose: () => void;
  onSave: () => void;
  form: Comunicado;
  setForm: React.Dispatch<React.SetStateAction<Comunicado>>;
  editing: boolean;
  readOnly?: boolean; // nuevo prop para modo solo lectura (mostrar)

}

export default function ComunicadoModal({
  open,
  onClose,
  onSave,
  form,
  setForm,
  editing,
  readOnly = false, // por defecto falso
}: Props) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (readOnly) return; // no permitir cambios en modo lectura

    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (canal: ComunicadoCanalEnvioEnum) => {
    setForm(prev => ({
      ...prev,
      canalEnvio: prev.canalEnvio & canal
        ? prev.canalEnvio & ~canal
        : prev.canalEnvio | canal,
    }));
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>{editing ? 'Editar Comunicado' : 'Nuevo Comunicado'}</DialogTitle>
      <DialogContent dividers>
        <Box display="flex" flexDirection="column" gap={2}>
          <TextField
            label="Título"
            name="titulo"
            value={form.titulo}
            onChange={handleChange}
            fullWidth
          />

          <TextField
            label="Cuerpo"
            name="cuerpo"
            value={form.cuerpo}
            onChange={handleChange}
            fullWidth
            multiline
            rows={3}
          />
          <TextField
            label="URL de Imagen"
            name="imagenUrl"
            value={form.imagenUrl}
            onChange={handleChange}
            fullWidth
          />
          <input
            type="file"
            accept="image/*"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (!file) return;

              const reader = new FileReader();
              reader.onloadend = () => {
                const result = reader.result;
                if (typeof result === 'string') {
                  setForm(prev => ({
                    ...prev,
                    imagenUrl: result as string, // aseguramos que es string
                  }));
                }
              };
              reader.readAsDataURL(file); // convierte a base64 string
            }}
            style={{ marginTop: 8 }}
          />

          {form.imagenUrl && (
            <img
              src={form.imagenUrl}
              alt="Previsualización"
              style={{
                width: '100%',
                maxHeight: 150,
                objectFit: 'cover',
                borderRadius: 8,
                marginTop: 8
              }}
            />
          )}

          <TextField
            label="URL del PDF"
            name="urlPDF"
            value={form.urlPDF}
            onChange={handleChange}
            fullWidth
          />

          <input
            type="file"
            accept="application/pdf"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (!file) return;

              const reader = new FileReader();
              reader.onloadend = () => {
                const result = reader.result;
                if (typeof result === 'string') {
                  setForm(prev => ({
                    ...prev,
                    urlPDF: result as string, // aseguramos que es string
                  }));
                }
              };
              reader.readAsDataURL(file); // convierte en base64 temporal
            }}
            style={{ marginTop: 8 }}
          />

          {form.urlPDF && (
            <Box mt={2}>
              <iframe
                src={form.urlPDF}
                title="Previsualización del PDF"
                width="100%"
                height="300px"
                style={{ border: '1px solid #ccc', borderRadius: 8 }}
              />
            </Box>
          )}


          <TextField
            select
            label="Destinatario"
            name="destinatario"
            value={form.destinatario}
            onChange={(e) => setForm({ ...form, destinatario: Number(e.target.value) })}
            fullWidth
          >
            {Object.keys(DestinatarioEnum)
              .filter(k => !isNaN(Number(DestinatarioEnum[k as any])))
              .map((key, idx) => (
                <MenuItem key={idx} value={idx}>
                  {key}
                </MenuItem>
              ))}
          </TextField>
          <TextField
            select
            label="Tipo de Contenido"
            name="tipoContenido"
            value={form.tipoContenido ?? TipoContenidoEnum.Informativo}
            onChange={(e) => setForm({ ...form, tipoContenido: Number(e.target.value) })}
            fullWidth
          >
            {Object.keys(TipoContenidoEnum)
              .filter(k => !isNaN(Number(TipoContenidoEnum[k as any])))
              .map((key, idx) => (
                <MenuItem key={idx} value={idx}>
                  {key}
                </MenuItem>
              ))}
          </TextField>

          <Box display="flex" gap={2}>
            <TextField
              type="date"
              label="Fecha Inicio"
              name="fechaInicio"
              value={form.fechaInicio}
              onChange={handleChange}
              InputLabelProps={{ shrink: true }}
              fullWidth
            />
            <TextField
              type="date"
              label="Fecha Fin"
              name="fechaFin"
              value={form.fechaFin}
              onChange={handleChange}
              InputLabelProps={{ shrink: true }}
              fullWidth
            />
          </Box>

          <Box>
            <label>Canales de Envío:</label>
            <Box display="flex" gap={2} mt={1}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={!!(form.canalEnvio & ComunicadoCanalEnvioEnum.App)}
                    onChange={() => handleCheckboxChange(ComunicadoCanalEnvioEnum.App)}
                  />
                }
                label="App"
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={!!(form.canalEnvio & ComunicadoCanalEnvioEnum.SMS)}
                    onChange={() => handleCheckboxChange(ComunicadoCanalEnvioEnum.SMS)}
                  />
                }
                label="SMS"
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={!!(form.canalEnvio & ComunicadoCanalEnvioEnum.Correo)}
                    onChange={() => handleCheckboxChange(ComunicadoCanalEnvioEnum.Correo)}
                  />
                }
                label="Correo"
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={!!(form.canalEnvio & ComunicadoCanalEnvioEnum.WhatsApp)}
                    onChange={() => handleCheckboxChange(ComunicadoCanalEnvioEnum.WhatsApp)}
                  />
                }
                label="WhatsApp"
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
