import { useEffect, useRef,useState, useMemo } from 'react';
import api from '../api';
import '../styles/TambosPage.css';
import TamboModal from '../Modal/TamboModal';
import { Tambo } from '../types/Tambo';
import casitaIcon from '../imgs/Icons-botones/casita.svg';

export default function TambosPage() {
  /* ---------------- ESTADOS PRINCIPALES ---------------- */
  const pageRef = useRef<HTMLDivElement | null>(null);
  const [tambos, setTambos] = useState<Tambo[]>([]);
  const [search, setSearch] = useState('');
  const [filteredTambos, setFilteredTambos] = useState<Tambo[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedTambo, setSelectedTambo] = useState<Partial<Tambo> | undefined>(undefined);

  /* ---------------- PAGINACIÓN ---------------- */
  const [currentPage, setCurrentPage] = useState(1);

  /* --------- FILAS POR PÁGINA DINÁMICAS --------- */
  const getItemsPerPage = (h: number) => {
      if (h >= 1280) return 9;
      if (h >= 1000)  return 7;
      if (h >= 800)  return 6;
      return 4;
    };

  const [itemsPerPage, setItemsPerPage] = useState(8);

  /* Recalcular al redimensionar */
  useEffect(() => {
    if (!pageRef.current) return;

    // ResizeObserver detecta cada cambio en el ancho del div
    const observer = new ResizeObserver(([entry]) => {
      const width = entry.contentRect.width;
      setItemsPerPage((prev) => {
        const next = getItemsPerPage(width);
        return prev === next ? prev : next;
      });
    });
    observer.observe(pageRef.current);
    return () => observer.disconnect();
  }, []);

  /* Garantizar que currentPage nunca supere el máximo posible */
  useEffect(() => {
    setCurrentPage((page) => {
      const maxPage = Math.max(1, Math.ceil(filteredTambos.length / itemsPerPage));
      return page > maxPage ? maxPage : page;
    });
  }, [itemsPerPage, filteredTambos.length]);

  const lastIndex = currentPage * itemsPerPage;
  const firstIndex = lastIndex - itemsPerPage;
  const currentTambos = useMemo(
    () => filteredTambos.slice(firstIndex, lastIndex),
    [filteredTambos, firstIndex, lastIndex]
  );
  const totalPages = Math.max(1, Math.ceil(filteredTambos.length / itemsPerPage));

  /* ---------------- CRUD ---------------- */
  const fetchTambos = async () => {
    try {
      const res = await api.get('/Tambos');
      setTambos(res.data);
      setFilteredTambos(res.data);
      setCurrentPage(1);
    } catch (err) {
      console.error('Error al obtener tambos:', err);
    }
  };

  useEffect(() => {
    const load = async () => {
      try {
        await fetchTambos();
      } catch (err) {
        console.error(err);
      }
    };
    load();
  }, []);


  /* Búsqueda */
  useEffect(() => {
    const filtered = tambos.filter((t) =>
      (t.name || '').toLowerCase().includes(search.toLowerCase())
    );
    setFilteredTambos(filtered);
    setCurrentPage(1);
  }, [search, tambos]);

  const handleDelete = async (id: number) => {
    if (!window.confirm('¿Estás seguro de eliminar este tambo?')) return;
    await api.delete(`/Tambos/${id}`);
    fetchTambos();
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedTambo(undefined);
  };

  /* ---------------- RENDER ---------------- */
  return (
    <div ref={pageRef} className="page-container">
      <div className="header">
        <h2>Lista de Tambos</h2>
      </div>

      {/* CONTROLES */}
      <div className="actions">
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
            setSelectedTambo(undefined);
            setModalOpen(true);
          }}
          aria-label="Agregar nuevo Tambo"
          title="Agregar Tambo"
        >
          <img src={casitaIcon} alt="" />
          <span className='new-comunicado'>
            Nuevo
            <br />
            Tambo
          </span>
        </button>
      </div>

      {/* TABLA */}
      <div className="table-container">
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
              <th>Estado</th>
              <th style={{ textAlign: 'center' }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {currentTambos.map((t) => (
              <tr key={t.id}>
                <td>{t.name}</td>
                <td>{t.code}</td>
                <td>{t.departamento}</td>
                <td>{t.provincia}</td>
                <td>{t.distrito}</td>
                <td title={t.direccion}>
                  {t.direccion?.substring(0, 15)}
                  {t.direccion && t.direccion.length > 15 ? '…' : ''}
                </td>
                <td title={t.referencia}>
                  {t.referencia?.substring(0, 15)}
                  {t.referencia && t.referencia.length > 15 ? '…' : ''}
                </td>
                <td title={t.horarioAtencion}>
                  {t.horarioAtencion?.substring(0, 10)}
                  {t.horarioAtencion && t.horarioAtencion.length > 10 ? '…' : ''}
                </td>
                <td>{t.tipo}</td>
                <td title={t.representante}>
                  {t.representante?.substring(0, 15)}
                  {t.representante && t.representante.length > 15 ? '…' : ''}
                </td>
                <td>{t.estado ? 'Activo' : 'Inactivo'}</td>
                <td className="botones text-center">
                  <button
                    className="edit-btn"
                    onClick={() => {
                      setSelectedTambo(t);
                      setModalOpen(true);
                    }}
                  >
                    ✏️
                  </button>
                  <button className="delete-btn" onClick={() => handleDelete(t.id)}>
                    🗑️
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* PAGINACIÓN */}
      {totalPages > 1 && (
        <div className="pagination">
          <button
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((p) => p - 1)}
          >
            Retroceder
          </button>

          {Array.from({ length: totalPages }, (_, i) => (
            <button
              key={i + 1}
              className={currentPage === i + 1 ? 'active' : ''}
              onClick={() => setCurrentPage(i + 1)}
            >
              {i + 1}
            </button>
          ))}

          <button
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage((p) => p + 1)}
          >
            Avanzar
          </button>
        </div>
      )}

      <TamboModal
        open={modalOpen}
        onClose={handleCloseModal}
        onSave={fetchTambos}
        initialData={selectedTambo}
      />
    </div>
  );
}
