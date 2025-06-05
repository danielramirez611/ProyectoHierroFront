import { useEffect, useRef, useState, useMemo } from 'react';
import api from '../api';
import '../styles/ColaboradorPage.css';   // reutiliza tu estilo base
import PacienteModal from '../Modal/PacienteModal';
import { Paciente } from '../types/Paciente';
import addUserIcon from '../imgs/Icons-botones/addUser.svg';

export default function PacientesPage() {
  /* ---------------- ESTADOS PRINCIPALES ---------------- */
  const pageRef = useRef<HTMLDivElement | null>(null);
  const [pacientes, setPacientes] = useState<Paciente[]>([]);
  const [search, setSearch] = useState('');
  const [filtered, setFiltered] = useState<Paciente[]>([]);
  const [openModal, setOpenModal] = useState(false);
  const [selectedPaciente, setSelectedPaciente] = useState<Paciente | null>(null);

  /* ---------------- FILAS POR PÁGINA ---------------- */
  const getItemsPerPage = (h: number) => {
    if (h >= 1280) return 10;
    if (h >= 1000) return 8;
    if (h >= 800)  return 6;
    return 4;
  };
  const [itemsPerPage, setItemsPerPage] = useState(8);
  const [currentPage, setCurrentPage] = useState(1);

  /* Observa altura del contenedor */
  useEffect(() => {
    if (!pageRef.current) return;
    const ro = new ResizeObserver(([e]) => {
      const h = e.contentRect.width;
      setItemsPerPage(p => {
        const n = getItemsPerPage(h);
        return p === n ? p : n;
      });
    });
    ro.observe(pageRef.current);
    return () => ro.disconnect();
  }, []);

  /* Garantiza página válida */
  useEffect(() => {
    setCurrentPage(p => {
      const max = Math.max(1, Math.ceil(filtered.length / itemsPerPage));
      return p > max ? max : p;
    });
  }, [itemsPerPage, filtered.length]);

  const sliceStart = (currentPage - 1) * itemsPerPage;
  const current = useMemo(
    () => filtered.slice(sliceStart, sliceStart + itemsPerPage),
    [filtered, sliceStart, itemsPerPage]
  );
  const totalPages = Math.max(1, Math.ceil(filtered.length / itemsPerPage));

  /* ---------------- CRUD + SEARCH ---------------- */
  const fetchPacientes = async () => {
    try {
      const { data } = await api.get('/Pacientes');
      const list: Paciente[] = data.map((p: any) => ({
        id: p.id,
        userId: p.usuario?.id,
        tieneAnemia: p.tieneAnemia,
        nombreCompleto: p.usuario
          ? `${p.usuario.firstName} ${p.usuario.lastNameP} ${p.usuario.lastNameM}`
          : 'Desconocido',
      }));
      setPacientes(list);
      setFiltered(list);
      setCurrentPage(1);
    } catch (err) {
      console.error('Error al obtener pacientes:', err);
    }
  };
  useEffect(() => { fetchPacientes(); }, []);

  useEffect(() => {
    const f = pacientes.filter(p =>
      p.nombreCompleto.toLowerCase().includes(search.toLowerCase())
    );
    setFiltered(f);
    setCurrentPage(1);
  }, [search, pacientes]);

  const handleDelete = async (id: number) => {
    if (!window.confirm('¿Estás seguro de eliminar este paciente?')) return;
    await api.delete(`/Pacientes/${id}`);
    fetchPacientes();
  };

  /* ---------------- RENDER ---------------- */
  return (
    <div ref={pageRef} className="page-container">
      <div className="header">
        <h2>Lista de Pacientes</h2>
      </div>

      {/* CONTROLES */}
      <div className="actions">
        <div className="search-bar">
          <input
            type="text"
            placeholder="Ingrese el nombre"
            value={search}
            onChange={e => setSearch(e.target.value)}
            aria-label="Buscar paciente por nombre"
          />
          <span className="search-icon">🔍</span>
        </div>

        <button
          className="new-btn"
          onClick={() => { setSelectedPaciente(null); setOpenModal(true); }}
          aria-label="Agregar nuevo paciente"
        >
          <img src={addUserIcon} alt="" />
          <span>Nuevo<br />Paciente</span>
        </button>
      </div>

      {/* TABLA */}
      <div className="table-wrapper">
        <table className="collab-table">
          <thead>
            <tr>
              <th className="hide-xs">ID</th>
              <th>Nombre</th>
              <th>Anemia</th>
              <th style={{ textAlign: 'center' }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {current.map(p => (
              <tr key={p.id}>
                <td className="hide-xs">{p.id}</td>
                <td>{p.nombreCompleto}</td>
                <td>{p.tieneAnemia ? 'Sí' : 'No'}</td>
                <td className="text-center">
                  <button className="edit-btn" onClick={() => { setSelectedPaciente(p); setOpenModal(true); }}>✏️</button>
                  <button className="delete-btn" onClick={() => handleDelete(p.id)}>🗑️</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* PAGINADOR */}
      {totalPages > 1 && (
        <div className="pagination">
          <button disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)}>Retroceder</button>
          {Array.from({ length: totalPages }, (_, i) => (
            <button
              key={i + 1}
              className={currentPage === i + 1 ? 'active' : ''}
              onClick={() => setCurrentPage(i + 1)}
            >
              {i + 1}
            </button>
          ))}
          <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p + 1)}>Avanzar</button>
        </div>
      )}

      {/* MODAL */}
      {openModal && (
        <PacienteModal
          open={openModal}
          onClose={() => setOpenModal(false)}
          onSave={fetchPacientes}
          initialData={selectedPaciente ?? undefined}
        />
      )}
    </div>
  );
}
