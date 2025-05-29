import { useEffect, useState } from 'react';
import api from '../api';
import ComunicadoModal from '../Modal/ComunicadoModal';
import { Comunicado, DestinatarioEnum, ComunicadoCanalEnvioEnum } from '../types/Comunicado';
import '../styles/ColaboradorPage.css';
import { toast } from 'react-toastify';

export default function ComunicadoPage() {
  const [comunicados, setComunicados] = useState<Comunicado[]>([]);
  const [search, setSearch] = useState('');
  const [filtered, setFiltered] = useState<Comunicado[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedComunicado, setSelectedComunicado] = useState<Comunicado | null>(null);
  const [form, setForm] = useState<Comunicado>({
    titulo: '',
    cuerpo: '',
    destinatario: DestinatarioEnum.Niño,
    fechaInicio: '',
    fechaFin: '',
    canalEnvio: ComunicadoCanalEnvioEnum.App,
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
        const res = await api.post('/Comunicado', form);
        toast.success('✅ Comunicado creado correctamente');
        console.log('📩 Comunicado enviado correctamente:', res.data);
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
      });
    } catch (error: any) {
      console.error('❌ Error al enviar comunicado:', error);
      toast.error('❌ Ocurrió un error al guardar el comunicado');
    }
  };

  return (
    <div className="page-container">
      <div className="header">
        <h2>Lista de Comunicados</h2>
        <div className="search-bar">
          <input
            type="text"
            placeholder="Buscar por título"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-blue"
          />
          <button>🔍</button>
        </div>
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
            });
            setModalOpen(true);
          }}
        >
          ➕ Nuevo Comunicado
        </button>
      </div>

      <table className="collab-table">
        <thead>
          <tr>
            <th>Título</th>
            <th>Cuerpo</th>
            <th>Destinatario</th>
            <th>Fecha Inicio</th>
            <th>Fecha Fin</th>
            <th>Canal Envío</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {filtered.map((c) => (
            <tr key={c.id}>
              <td>{c.titulo}</td>
              <td>{c.cuerpo}</td>
              <td>{DestinatarioEnum[c.destinatario]}</td>
              <td>{new Date(c.fechaInicio).toLocaleDateString()}</td>
              <td>{new Date(c.fechaFin).toLocaleDateString()}</td>
              <td>
                {c.canalEnvio & ComunicadoCanalEnvioEnum.App ? 'App ' : ''}
                {c.canalEnvio & ComunicadoCanalEnvioEnum.SMS ? 'SMS ' : ''}
                {c.canalEnvio & ComunicadoCanalEnvioEnum.Correo ? 'Correo' : ''}
              </td>
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
    </div>
  );
}
