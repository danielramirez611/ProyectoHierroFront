import { useEffect, useState } from 'react';
import api from '../api';
import '../styles/ColaboradorPage.css';
import TamboModal from '../Modal/TamboModal';
import { Tambo } from '../types/Tambo';

import addUserIcon from '../imgs/Icons-botones/addUser.svg';


export default function TambosPage() {
  const [tambos, setTambos] = useState<Tambo[]>([]);
  const [search, setSearch] = useState('');
  const [filteredTambos, setFilteredTambos] = useState<Tambo[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedTambo, setSelectedTambo] = useState<Tambo | null>(null);

  const fetchTambos = async () => {
    try {
      const res = await api.get('/Tambos');
      setTambos(res.data);
      setFilteredTambos(res.data);
    } catch (err) {
      console.error('Error al obtener tambos:', err);
    }
  };

  useEffect(() => {
    fetchTambos();
  }, []);

  useEffect(() => {
    const filtered = tambos.filter((t) =>
      (t.name || '').toLowerCase().includes(search.toLowerCase())
    );
    setFilteredTambos(filtered);
  }, [search, tambos]);

  const handleDelete = async (id: number) => {
    if (!window.confirm('¿Estás seguro de eliminar este tambo?')) return;
    await api.delete(`/Tambos/${id}`);
    fetchTambos();
  };

  return (
    <div className="page-container">
      <div className="header">
        <h2>Lista de Tambos</h2>
      </div>
        {/* CONTROLES */}
        <div className="actions" style={{ marginBottom: '1.5rem' }}>
          {/* BUSCADOR */}
          <div className="search-bar">
            <input
              type="text"
              placeholder="Ingrese el nombre"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              aria-label="Buscar Tambo por nombre"
            />
            <span className="search-icon">🔍</span>
          </div>
        <button
            className="new-btn"
            onClick={() => {
              setSelectedTambo(null);
              setModalOpen(true);
            }}
            aria-label="Agregar nuevo Tambo"
            title="Agregar Tambo"
          >
            <img src={addUserIcon} alt="" />
            <span>
              Nuevo
              <br />
              Tambo
            </span>
          </button>
      </div>

      <table className="collab-table">
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Código</th>
            <th>Departamento</th>
            <th>Provincia</th>
            <th>Distrito</th>
            <th>Dirección</th>
            <th>Referencia</th>
            <th>Horario</th>
            <th>Tipo</th>
            <th>Representante</th>
            <th>DNI</th>
            <th>Teléfono</th>
            <th>Estado</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {filteredTambos.map((t) => (
            <tr key={t.id}>
              <td>{t.name}</td>
              <td>{t.code}</td>
              <td>{t.departamento}</td>
              <td>{t.provincia}</td>
              <td>{t.distrito}</td>
              <td>{t.direccion}</td>
              <td>{t.referencia}</td>
              <td>{t.horarioAtencion}</td>
              <td>{t.tipo}</td>
              <td>{t.representante}</td>
              <td>{t.documentoRepresentante}</td>
              <td>{t.telefono}</td>
              <td>{t.estado ? 'Activo' : 'Inactivo'}</td>
              <td>
                <button className="edit-btn" onClick={() => {
                  setSelectedTambo(t);
                  setModalOpen(true);
                }}>✏️</button>
                <button className="delete-btn" onClick={() => handleDelete(t.id)}>🗑️</button>
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
      <TamboModal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setSelectedTambo(null);
        }}
        onSave={() => {
          fetchTambos();
          setModalOpen(false);
          setSelectedTambo(null);
        }}
        initialData={selectedTambo}
      />
    </div>
  );
}
