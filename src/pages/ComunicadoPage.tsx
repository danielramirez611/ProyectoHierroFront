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
import addUserIcon from '../imgs/Icons-botones/addUser.svg'; // asegúrate que exista


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
  
        // ✅ Mostrar notificación push si es posible
      // ✅ Mostrar notificación push si es posible
if ('Notification' in window) {
  console.log('🔔 Notification API está disponible');

  if (Notification.permission === 'granted') {
    console.log('🔓 Permiso ya concedido para notificaciones');
    new Notification(form.titulo, {
      body: form.cuerpo,
      image: form.imagenUrl || undefined,
    });
    console.log('📤 Notificación enviada');
  } else if (Notification.permission !== 'denied') {
    console.log('📩 Solicitando permiso para notificaciones...');
    Notification.requestPermission().then((permission) => {
      console.log('🔐 Resultado del permiso:', permission);
      if (permission === 'granted') {
        new Notification(form.titulo, {
          body: form.cuerpo,
          image: form.imagenUrl || undefined,
        });
        console.log('📤 Notificación enviada tras permiso');
      } else {
        console.warn('🚫 Permiso de notificaciones denegado');
      }
    });
  } else {
    console.warn('❌ Notificaciones bloqueadas permanentemente');
  }
} else {
  console.error('❌ Notification API no está soportada en este navegador');
}

      }
  
      await fetchComunicados();
      setModalOpen(false);
      setSelectedComunicado(null);
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
    } catch (error: any) {
      console.error('❌ Error al enviar comunicado:', error);
      toast.error('❌ Ocurrió un error al guardar el comunicado');
    }
  };
  

  const renderTipoContenido = (tipo: number | string | undefined) => {
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

  const renderCanalEnvio = (canal: number | string) => {
    // Convertir string tipo 'App' a su valor numérico
    const canalMap: Record<string, number> = {
      App: ComunicadoCanalEnvioEnum.App,
      SMS: ComunicadoCanalEnvioEnum.SMS,
      Correo: ComunicadoCanalEnvioEnum.Correo,
      WhatsApp: ComunicadoCanalEnvioEnum.WhatsApp,
      Todos: ComunicadoCanalEnvioEnum.Todos,
    };
  
    let canalNum: number = 0;
  
    if (typeof canal === 'number') {
      canalNum = canal;
    } else if (!isNaN(Number(canal))) {
      canalNum = Number(canal);
    } else {
      // Si viene como texto (App, Correo, etc.)
      canalNum = canalMap[canal] ?? 0;
    }
  
    const canales: string[] = [];
  
    if (canalNum & ComunicadoCanalEnvioEnum.App) canales.push('📱 App');
    if (canalNum & ComunicadoCanalEnvioEnum.SMS) canales.push('📩 SMS');
    if (canalNum & ComunicadoCanalEnvioEnum.Correo) canales.push('✉️ Correo');
    if (canalNum & ComunicadoCanalEnvioEnum.WhatsApp) canales.push('🟢 WhatsApp');
  
    return canales.length > 0 ? canales.join(' • ') : '—';
  };
  const renderDestinatario = (valor: number | string) => {
    const map: Record<string, string> = {
      [DestinatarioEnum.Niño]: '👦 Niño',
      [DestinatarioEnum.Gestante]: '🤰 Gestante',
      [DestinatarioEnum.Administrador]: '🧑‍💼 Administrador',
      [DestinatarioEnum.Gestor]: '🧑‍🏫 Gestor',
      [DestinatarioEnum.Todos]: '👥 Todos',
      'Niño': '👦 Niño',
      'Gestante': '🤰 Gestante',
      'Administrador': '🧑‍💼 Administrador',
      'Gestor': '🧑‍🏫 Gestor',
      'Todos': '👥 Todos',
    };
  
    return map[String(valor)] || '—';
  };
  

  return (
    <div className="page-container">
      <div className="header">
        <h2>Lista de Comunicados</h2>
      </div>

        {/* CONTROLES */}
       <div className="actions" style={{ marginBottom: '1.5rem' }}>
          {/* BUSCADOR */}
          <div className="search-bar">
            <input
              type="text"
              placeholder="Ingrese el título del comunicado"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              aria-label="Buscar comunicado por título"
            />
            <span className="search-icon">🔍</span>
          </div>

          {/* NUEVO */}
          <button
            className="new-btn"
            onClick={() => {
            setSelectedComunicado(null);
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
            setModalOpen(true);
          }}
            aria-label="Crear nuevo comunicado"
            title="crear comunicado"
          >
            <img src={addUserIcon} alt="" />
            <span>
             Crear Nuevo
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
                    src={c.imagenUrl}
                    alt="Imagen"
                    style={{ width: '60px', height: '40px', objectFit: 'cover' }}
                  />
                ) : (
                  '—'
                )}
              </td>
              <td>
    {c.urlPDF ? (
      <button onClick={() => setPdfPreviewUrl(c.urlPDF!)}>
        📄 Ver PDF
      </button>
    ) : (
      '—'
    )}
  </td>

              <td>{renderCanalEnvio(c.canalEnvio)}</td>
              <td>
                <button
                  className="edit-btn"
                  onClick={() => {
                    setSelectedComunicado(c);
                    setForm(c);
                    setModalOpen(true);
                  }}
                >
                  ✏️
                </button>
                <button className="delete-btn" onClick={() => handleDelete(c.id!)}>
                  🗑️
                </button>
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
