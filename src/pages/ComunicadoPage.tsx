// ComunicadoPage.tsx
import { useEffect, useState } from 'react';
import api from '../api';
import ComunicadoModal from '../Modal/ComunicadoModal';
import {
  Comunicado,
  DestinatarioEnum,
  ComunicadoCanalEnvioEnum,
  TipoContenidoEnum,
} from '../types/Comunicado';
import '../styles/ColaboradorPage.css';
import { toast } from 'react-toastify';
import PdfPreviewModal from '../Modal/PdfPreviewModal';
import { messaging } from '../FirebaseData/Firebase';
import { onMessage } from 'firebase/messaging';
import addUserIcon from '../imgs/Icons-botones/addUser.svg';

const BASE_URL =  'https://localhost:7268';

export default function ComunicadoPage() {
  const [comunicados, setComunicados] = useState<Comunicado[]>([]);
  const [search, setSearch] = useState('');
  const [filtered, setFiltered] = useState<Comunicado[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [pdfPreviewUrl, setPdfPreviewUrl] = useState<string | null>(null);
  const [selectedComunicado, setSelectedComunicado] = useState<Comunicado | null>(null);
  const [form, setForm] = useState<Comunicado>({
    titulo: '',
    cuerpo: '',
    destinatario: DestinatarioEnum.Niño,
    fechaInicio: '',
    fechaFin: '',
    canalEnvio: ComunicadoCanalEnvioEnum.App,
    imagenUrl: '',
    urlPDF: '',
    tipoContenido: TipoContenidoEnum.Informativo,
  });

  const fetchComunicados = async () => {
    try {
      const res = await api.get('/Comunicado');
      setComunicados(res.data);
      setFiltered(res.data);
    } catch (err) {
      console.error('Error al obtener comunicados:', err);
    }
  };

  useEffect(() => {
    fetchComunicados();

    if ('Notification' in window && Notification.permission !== 'granted') {
      Notification.requestPermission().then((permission) => {
        if (permission === 'granted') {
          console.log('🔔 Permiso de notificaciones concedido');
        }
      });
    }

    onMessage(messaging, (payload) => {
      console.log('📥 Notificación recibida:', payload);
      const { title, body } = payload.notification || {};
      if (Notification.permission === 'granted' && title) {
        new Notification(title, { body });
      }
    });
  }, []);

  useEffect(() => {
    const results = comunicados.filter((c) =>
      c.titulo.toLowerCase().includes(search.toLowerCase())
    );
    setFiltered(results);
  }, [search, comunicados]);

  const handleDelete = async (id: number) => {
    if (!window.confirm('¿Estás seguro de eliminar este comunicado?')) return;
    await api.delete(`/Comunicado/${id}`);
    fetchComunicados();
  };

  const handleSubmit = async () => {
    try {
      if (selectedComunicado?.id) {
        await api.put(`/Comunicado/${selectedComunicado.id}`, form);
        toast.success('✅ Comunicado actualizado correctamente');
      } else {
        await api.post('/Comunicado', form);
        toast.success('✅ Comunicado creado correctamente');
      }

      await fetchComunicados();
      setModalOpen(false);
      setSelectedComunicado(null);
      resetForm();
    } catch (error) {
      console.error('❌ Error al guardar el comunicado:', error);
      toast.error('❌ Ocurrió un error al guardar el comunicado');
    }
  };

  const resetForm = () => {
    setForm({
      titulo: '',
      cuerpo: '',
      destinatario: DestinatarioEnum.Niño,
      fechaInicio: '',
      fechaFin: '',
      canalEnvio: ComunicadoCanalEnvioEnum.App,
      imagenUrl: '',
      urlPDF: '',
      tipoContenido: TipoContenidoEnum.Informativo,
    });
  };

  const renderTipoContenido = (tipo: any) => {
    const map: Record<string, string> = {
      Informativo: '🔵 Informativo',
      Educativo: '🟢 Educativo',
      Preventivo: '🟡 Preventivo',
      '0': '🔵 Informativo',
      '1': '🟢 Educativo',
      '2': '🟡 Preventivo',
    };
    return map[String(tipo)] || '—';
  };

  const renderCanalEnvio = (canal: any) => {
    const canalMap: Record<string, number> = {
      App: ComunicadoCanalEnvioEnum.App,
      SMS: ComunicadoCanalEnvioEnum.SMS,
      Correo: ComunicadoCanalEnvioEnum.Correo,
      WhatsApp: ComunicadoCanalEnvioEnum.WhatsApp,
      Todos: ComunicadoCanalEnvioEnum.Todos,
    };

    let canalNum = typeof canal === 'number' ? canal : canalMap[canal] ?? 0;
    const canales = [];
    if (canalNum & ComunicadoCanalEnvioEnum.App) canales.push('📱 App');
    if (canalNum & ComunicadoCanalEnvioEnum.SMS) canales.push('📩 SMS');
    if (canalNum & ComunicadoCanalEnvioEnum.Correo) canales.push('✉️ Correo');
    if (canalNum & ComunicadoCanalEnvioEnum.WhatsApp) canales.push('🟢 WhatsApp');
    return canales.join(' • ') || '—';
  };

  const renderDestinatario = (valor: any) => {
    const map: Record<string, string> = {
      [DestinatarioEnum.Niño]: '👦 Niño',
      [DestinatarioEnum.Gestante]: '🤰 Gestante',
      [DestinatarioEnum.Administrador]: '🧑‍💼 Administrador',
      [DestinatarioEnum.Gestor]: '🧑‍🏫 Gestor',
      [DestinatarioEnum.Todos]: '👥 Todos',
      Niño: '👦 Niño',
      Gestante: '🤰 Gestante',
      Administrador: '🧑‍💼 Administrador',
      Gestor: '🧑‍🏫 Gestor',
      Todos: '👥 Todos',
    };
    return map[String(valor)] || '—';
  };

  return (
    <div className="page-container">
      <div className="header">
        <h2>Lista de Comunicados</h2>
      </div>

      {/* CONTROLES */}
      <div className="actions">
        <div className="search-bar">
          <input
            type="text"
            placeholder="Buscar por título"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            aria-label="Buscar por nombre"
          />
          <span className="search-icon">🔍</span>
        </div>
        <button
          className="new-btn"
          onClick={() => {
            setSelectedComunicado(null);
            resetForm();
            setModalOpen(true);
          }}
          aria-label="Agregar nuevo comunicado"
          title="Agregar Comunicado"
        >
          <img src={addUserIcon} alt="" />
          <span className='new-comunicado'>
            Nuevo
            <br />
            Comunicado
          </span>
        </button>
        
      </div>

      <table className="collab-table">
        <thead>
          <tr>
            <th>Título</th>
            <th>Cuerpo</th>
            <th>Destinatario</th>
            <th>Tipo</th>
            <th>Fecha Inicio</th>
            <th>Fecha Fin</th>
            <th>Imagen</th>
            <th>PDF</th>
            <th>Canal Envío</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {filtered.map((c) => (
            <tr key={c.id}>
              <td>{c.titulo}</td>
              <td>{c.cuerpo}</td>
              <td>{renderDestinatario(c.destinatario)}</td>
              <td>{renderTipoContenido(c.tipoContenido)}</td>
              <td>{new Date(c.fechaInicio).toLocaleDateString()}</td>
              <td>{new Date(c.fechaFin).toLocaleDateString()}</td>
              <td>
                {c.imagenUrl ? (
                  <img
                    src={`${BASE_URL}${c.imagenUrl}`}
                    alt="Imagen"
                    style={{ width: '60px', height: '40px', objectFit: 'cover' }}
                  />
                ) : '—'}
              </td>
              <td>
                {c.urlPDF ? (
                  <button onClick={() => setPdfPreviewUrl(`${BASE_URL}${c.urlPDF}`)}>📄 Ver PDF</button>
                ) : '—'}
              </td>
              <td>{renderCanalEnvio(c.canalEnvio)}</td>
              <td>
                <button className="edit-btn" onClick={() => {
                  setSelectedComunicado(c);
                  setForm(c);
                  setModalOpen(true);
                }}>✏️</button>
                <button className="delete-btn" onClick={() => handleDelete(c.id!)}>🗑️</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <ComunicadoModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleSubmit}
        form={form}
        setForm={setForm}
        editing={!!selectedComunicado}
      />
      <PdfPreviewModal
        open={!!pdfPreviewUrl}
        url={pdfPreviewUrl || ''}
        onClose={() => setPdfPreviewUrl(null)}
      />
    </div>
  );
}
