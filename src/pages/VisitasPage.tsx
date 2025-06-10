import { useEffect, useState } from 'react';
import api from '../api';
import VisitasModal from '../Modal/VisitasModal';
import { VisitaDomiciliaria } from '../types/visitas';
import '../styles/ColaboradorPage.css';
import addUserIcon from '../imgs/Icons-botones/addUser.svg';

export default function VisitasPage() {
  const [visitas, setVisitas] = useState<VisitaDomiciliaria[]>([]);
  const [search, setSearch] = useState('');
  const [filtered, setFiltered] = useState<VisitaDomiciliaria[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedVisita, setSelectedVisita] = useState<VisitaDomiciliaria | null>(null);

  const fetchVisitas = async () => {
    try {
      const res = await api.get('/VisitaDomiciliaria');
      setVisitas(res.data);
      setFiltered(res.data);
    } catch (err) {
      console.error('Error al obtener visitas:', err);
    }
  };

  useEffect(() => {
    fetchVisitas();
  }, []);

  useEffect(() => {
    const results = visitas.filter((v) =>
      v.observacion?.toLowerCase().includes(search.toLowerCase())
    );
    setFiltered(results);
  }, [search, visitas]);

  const handleDelete = async (id: number) => {
    if (!window.confirm('¿Estás seguro de eliminar esta visita?')) return;
    try {
      await api.delete(`/VisitaDomiciliaria/${id}`);
      fetchVisitas();
    } catch (err) {
      console.error('Error al eliminar visita:', err);
    }
  };

  return (
    <div className="page-container">
      <div className="header">
        <h2>Lista de Visitas</h2>
      </div>

      {/* CONTROLES */}
      <div className="actions">
        <div className="search-bar">
          <input
            type="text"
            placeholder="Buscar por observación"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            aria-label="Buscar por observación"
          />
          <span className="search-icon">🔍</span>
        </div>
        <button
          className="new-btn"
          onClick={() => {
            setSelectedVisita(null);
            setModalOpen(true);
          }}
          aria-label="Agregar nueva visita"
          title="Agregar Visita"
        >
          <img src={addUserIcon} alt="" />
          <span className='new-comunicado'>
            Nueva<br />Visita
          </span>
        </button>
      </div>

      <table className="collab-table">
        <thead>
          <tr>
            <th>Paciente</th>
            <th>Gestor</th>
            <th>Fecha Visita</th>
            <th>Observación</th>
            <th>Servicios</th>
            <th>Ubicación</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {filtered.map((v) => (
            <tr key={v.id}>
              <td>
                {v.paciente?.user
                  ? `${v.paciente.user.firstName} ${v.paciente.user.lastNameP} ${v.paciente.user.lastNameM}`
                  : `Paciente ${v.pacienteId}`}
              </td>
              <td>
                {v.gestor
                  ? `${v.gestor.firstName} ${v.gestor.lastNameP} ${v.gestor.lastNameM}`
                  : `Gestor ${v.gestorId}`}
              </td>
              <td>{new Date(v.fechaVisita).toLocaleDateString()}</td>
              <td>{v.observacion}</td>
              <td>
                {v.tieneAgua && '🚿 '}
                {v.tieneLuz && '💡 '}
                {v.tieneInternet && '🌐'}
              </td>
              <td>
                {v.latitud && v.longitud
                  ? `${v.latitud.toFixed(5)}, ${v.longitud.toFixed(5)}`
                  : '—'}
                {v.ubicacionConfirmada && ' ✅'}
              </td>
              <td>
                <button
                  className="edit-btn"
                  onClick={() => {
                    setSelectedVisita(v);
                    setModalOpen(true);
                  }}
                >
                  ✏️
                </button>
                <button
                  className="delete-btn"
                  onClick={() => handleDelete(v.id)}
                >
                  🗑️
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <VisitasModal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          fetchVisitas();
        }}
        visita={selectedVisita}
      />
    </div>
  );
}
