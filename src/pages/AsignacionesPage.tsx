import { useEffect, useRef, useState, useMemo } from 'react';
import api from '../api';
import '../styles/TambosPage.css';    // mantiene tus estilos base
import AsignacionModal from '../Modal/AsignacionModal';
import type { Asignacion, AsignacionExtendida } from '../types/Asignacion';
import gestorIcon from '../imgs/Icons-botones/gestor.svg';

export default function AsignacionesPage() {
  /* ---------------- ESTADOS PRINCIPALES ---------------- */
  const pageRef = useRef<HTMLDivElement | null>(null);
  const [asignaciones, setAsignaciones]   = useState<AsignacionExtendida[]>([]);
  const [search, setSearch]               = useState('');
  const [filtered, setFiltered]           = useState<AsignacionExtendida[]>([]);
  const [modalOpen, setModalOpen]         = useState(false);
  const [selected, setSelected]           = useState<Partial<Asignacion>>();

  /* ---------------- PAGINACIÓN DINÁMICA ---------------- */
const getItemsPerPage = (h: number) => {
      if (h >= 1280) return 9;
      if (h >= 1000)  return 7;
      if (h >= 800)  return 6;
      return 4;
    };

  const [itemsPerPage, setItemsPerPage] = useState(8);
  const [currentPage, setCurrentPage] = useState(1);

  /* Recalcular al redimensionar */
  useEffect(() => {
    if (!pageRef.current) return;
    const observer = new ResizeObserver(([e]) => {
      const h = e.contentRect.width;
      setItemsPerPage(p => {
        const n = getItemsPerPage(h);
        return p === n ? p : n;
      });
    });
    observer.observe(pageRef.current);
    return () => observer.disconnect();
  }, []);

  /* Garantizar que currentPage no se pase de rango */
  useEffect(() => {
    setCurrentPage(p => {
      const max = Math.max(1, Math.ceil(filtered.length / itemsPerPage));
      return p > max ? max : p;
    });
  }, [itemsPerPage, filtered.length]);

  const firstIdx = (currentPage - 1) * itemsPerPage;
  const current  = useMemo(
    () => filtered.slice(firstIdx, firstIdx + itemsPerPage),
    [filtered, firstIdx, itemsPerPage]
  );
  const totalPages = Math.max(1, Math.ceil(filtered.length / itemsPerPage));

  /* ---------------- CRUD & SEARCH ---------------- */
  const fetchAsignaciones = async () => {
    try {
      const { data } = await api.get('/Asignaciones/extendidas');
      setAsignaciones(data);
      setFiltered(data);
      setCurrentPage(1);
    } catch (err) {
      console.error('Error al obtener asignaciones extendidas:', err);
    }
  };
  useEffect(() => { fetchAsignaciones(); }, []);

  useEffect(() => {
    const f = asignaciones.filter(a =>
      `${a.gestorNombre} ${a.tamboNombre} ${a.departamento} ${a.provincia} ${a.distrito}`
        .toLowerCase()
        .includes(search.toLowerCase())
    );
    setFiltered(f);
    setCurrentPage(1);
  }, [search, asignaciones]);

  const handleDelete = async (id: number) => {
    if (!window.confirm('¿Estás seguro de eliminar esta asignación?')) return;
    await api.delete(`/Asignaciones/${id}`);
    fetchAsignaciones();
  };

  /* ---------------- RENDER ---------------- */
  return (
    <div ref={pageRef} className="page-container">
      <div className="header">
        <h2>Lista de Asignaciones</h2>
      </div>

      {/* CONTROLES */}
      <div className="actions">
        <div className="search-bar">
          <input
            type="text"
            placeholder="Colaborador, tambo o ubicación…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            aria-label="Buscar asignación"
          />
          <span className="search-icon">🔍</span>
        </div>

        <button
          className="new-btn"
          onClick={() => { setSelected(undefined); setModalOpen(true); }}
          aria-label="Agregar nueva asignación"
        >
          <img src={gestorIcon} alt="" />
          <span className='new-comunicado'>Nueva<br />Asignación</span>
        </button>
      </div>

      {/* TABLA */}
      <div className="table-wrapper">
        <table className="collab-table">
          <thead>
            <tr>
              <th>Gestor</th>
              <th>Tambo</th>
              <th>Fecha</th>
              <th>Departamento</th>
              <th className="hide-sm">Provincia</th>
              <th>Distrito</th>
              <th className="hide-xs">Centro&nbsp;Poblado</th>
              <th>Estado</th>
              <th style={{ textAlign: 'center' }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {current.map(a => (
              <tr key={a.id}>
                <td>{a.gestorNombre}</td>
                <td>{a.tamboNombre}</td>
                <td>{new Date(a.fechaAsignacion).toLocaleDateString()}</td>
                <td>{a.departamento}</td>
                <td className="hide-sm">{a.provincia}</td>
                <td>{a.distrito}</td>
                <td className="hide-xs">{a.centroPoblado || '-'}</td>
                <td>{a.estado ? 'Activo' : 'Inactivo'}</td>
                <td className="text-center">
                  <button className="edit-btn" onClick={() => { setSelected(a); setModalOpen(true); }}>✏️</button>
                  <button className="delete-btn" onClick={() => handleDelete(a.id)}>🗑️</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* PAGINACIÓN */}
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
      <AsignacionModal
        open={modalOpen}
        onClose={() => { setModalOpen(false); setSelected(undefined); }}
        onSave={() => { fetchAsignaciones(); setModalOpen(false); setSelected(undefined); }}
        initialData={selected}
      />
    </div>
  );
}
