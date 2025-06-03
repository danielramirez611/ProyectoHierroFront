import { useEffect, useState } from 'react';
import api from '../api';
import '../styles/ColaboradorPage.css';
import AsignacionModal from '../Modal/AsignacionModal';
import type { Asignacion, AsignacionExtendida } from '../types/Asignacion';
import addUserIcon from '../imgs/Icons-botones/addUser.svg';


export default function AsignacionesPage() {
  const [asignaciones, setAsignaciones] = useState<AsignacionExtendida[]>([]);
  const [search, setSearch] = useState('');
  const [filteredAsignaciones, setFilteredAsignaciones] = useState<AsignacionExtendida[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedAsignacion, setSelectedAsignacion] = useState<Partial<Asignacion> | undefined>(undefined);

  const fetchAsignaciones = async () => {
    try {
      const { data } = await api.get('/Asignaciones/extendidas');
      setAsignaciones(data);
      setFilteredAsignaciones(data);
    } catch (err) {
      console.error('Error al obtener asignaciones extendidas:', err);
    }
  };

  useEffect(() => {
    fetchAsignaciones();
  }, []);

  useEffect(() => {
    const filtered = asignaciones.filter((a) =>
      `${a.gestorNombre} ${a.tamboNombre} ${a.departamento} ${a.provincia} ${a.distrito}`.toLowerCase().includes(search.toLowerCase())
    );
    setFilteredAsignaciones(filtered);
  }, [search, asignaciones]);

  const handleDelete = async (id: number) => {
    if (!window.confirm('¿Estás seguro de eliminar esta asignación?')) return;
    await api.delete(`/Asignaciones/${id}`);
    fetchAsignaciones();
  };

  return (
    <div className="page-container">
      <div className="header">
        <h2>Lista de Asignaciones</h2>
      </div>

        {/* CONTROLES */}
       <div className="actions" style={{ marginBottom: '1.5rem' }}>
          {/* BUSCADOR */}
          <div className="search-bar">
            <input
              type="text"
              placeholder="Ingrese el nombre del colaborador o tambo"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              aria-label="Buscar colaborador por nombre"
            />
            <span className="search-icon">🔍</span>
          </div>

          {/* NUEVO */}
          <button
            className="new-btn"
            onClick={() => {
            setSelectedAsignacion(undefined);
            setModalOpen(true);
          }}
            aria-label="Agregar nueva asignación"
            title="Agregar asignación"
          >
            <img src={addUserIcon} alt="" />
            <span>
              Nueva
              <br />
              Asignación
            </span>
          </button>
        
        </div>

      <table className="collab-table">
        <thead>
          <tr>
            <th>Gestor</th>
            <th>Tambo</th>
            <th>Fecha</th>
            <th>Departamento</th>
            <th>Provincia</th>
            <th>Distrito</th>
            <th>Centro Poblado</th>
            <th>Estado</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {filteredAsignaciones.map((a) => (
            <tr key={a.id}>
              <td>{a.gestorNombre}</td>
              <td>{a.tamboNombre}</td>
              <td>{new Date(a.fechaAsignacion).toLocaleDateString()}</td>
              <td>{a.departamento}</td>
              <td>{a.provincia}</td>
              <td>{a.distrito}</td>
              <td>{a.centroPoblado || '-'}</td>
              <td>{a.estado ? 'Activo' : 'Inactivo'}</td>
              <td>
                <button
                  className="edit-btn"
                  onClick={() => {
                    setSelectedAsignacion(a);
                    setModalOpen(true);
                  }}
                >✏️</button>
                <button className="delete-btn" onClick={() => handleDelete(a.id)}>🗑️</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="pagination">
        <button>Retroceder</button>
        <button>1</button>
        <button>2</button>
        <button>3</button>
        <button>4</button>
        <button>Avanzar</button>
      </div>
      <AsignacionModal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setSelectedAsignacion(undefined);
        }}
        onSave={() => {
          fetchAsignaciones();
          setModalOpen(false);
          setSelectedAsignacion(undefined);
        }}
        initialData={selectedAsignacion}
      />
    </div>
  );
}
