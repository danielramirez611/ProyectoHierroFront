import { useEffect, useRef, useState, useMemo } from 'react';
import api from '../api';
import '../styles/TambosPage.css';    // reutiliza el mismo archivo
import ContactoModal from '../Modal/ContactoModal';
import addUserIcon from '../imgs/Icons-botones/addUser.svg';

interface Contacto {
  id: number;
  tipoDocumento: string;
  documento: string;
  telefono: string;
  apellidoPaterno: string;
  apellidoMaterno: string;
  nombreCompleto: string;
  fechaNacimiento?: string;
  genero: string;
  direccion?: string;
  parentesco: string;
  notificaciones: string;
  pacienteId: number;
  pacienteNombre: string;
}

export default function ContactosPage() {
  /* ---------------- ESTADOS PRINCIPALES ---------------- */
  const pageRef = useRef<HTMLDivElement | null>(null);
  const [contactos, setContactos] = useState<Contacto[]>([]);
  const [search, setSearch]       = useState('');
  const [filtered, setFiltered]   = useState<Contacto[]>([]);
  const [openModal, setOpenModal] = useState(false);
  const [selectedContacto, setSelectedContacto] = useState<Contacto | null>(null);

  /* ---------------- FILAS POR PÁGINA DINÁMICAS ---------------- */
  const getItemsPerPage = (h: number) => {
    if (h >= 1280) return 10;
    if (h >= 1000) return 8;
    if (h >= 800)  return 6;
    return 4;
  };
  const [itemsPerPage, setItemsPerPage] = useState(8);
  const [currentPage, setCurrentPage] = useState(1);

  /* Observa la altura del contenedor para reajustar filas */
  useEffect(() => {
    if (!pageRef.current) return;
    const ro = new ResizeObserver(([e]) => {
      const height = e.contentRect.width;
      setItemsPerPage(p => {
        const next = getItemsPerPage(height);
        return p === next ? p : next;
      });
    });
    ro.observe(pageRef.current);
    return () => ro.disconnect();
  }, []);

  /* Ajusta currentPage si se queda fuera de rango */
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
  const fetchContactos = async () => {
    try {
      const { data } = await api.get('/Contactos');
      const list = data.map((c: any) => ({
        ...c,
        pacienteNombre: c.paciente?.usuario?.nombre || 'Desconocido',
      }));
      setContactos(list);
      setFiltered(list);
      setCurrentPage(1);
    } catch (err) {
      console.error('Error al obtener contactos:', err);
    }
  };
  useEffect(() => { fetchContactos(); }, []);

  useEffect(() => {
    const f = contactos.filter(c =>
      `${c.nombreCompleto} ${c.pacienteNombre}`
        .toLowerCase()
        .includes(search.toLowerCase())
    );
    setFiltered(f);
    setCurrentPage(1);
  }, [search, contactos]);

  const handleDelete = async (id: number) => {
    if (!window.confirm('¿Estás seguro de eliminar este contacto?')) return;
    await api.delete(`/Contactos/${id}`);
    fetchContactos();
  };

  /* ---------------- RENDER ---------------- */
  return (
    <div ref={pageRef} className="page-container">
      <div className="header">
        <h2>Lista de Contactos</h2>
      </div>

      {/* CONTROLES */}
      <div className="actions">
        <div className="search-bar">
          <input
            type="text"
            placeholder="Ingrese el nombre"
            value={search}
            onChange={e => setSearch(e.target.value)}
            aria-label="Buscar contacto por nombre"
          />
          <span className="search-icon">🔍</span>
        </div>

        <button
          className="new-btn"
          onClick={() => { setSelectedContacto(null); setOpenModal(true); }}
          aria-label="Agregar nuevo contacto"
        >
          <img src={addUserIcon} alt="" />
          <span>Nuevo<br />Contacto</span>
        </button>
      </div>

      {/* TABLA */}
      <div className="table-wrapper">
        <table className="collab-table">
          <thead>
            <tr>
              <th>Nombre</th>
              <th className="hide-sm">Documento</th>
              <th>Teléfono</th>
              <th className="hide-md">Nacimiento</th>
              <th>Género</th>
              <th className="hide-md">Dirección</th>
              <th className="hide-sm">Parentesco</th>
              <th>Paciente</th>
              <th className="hide-sm">Notif.</th>
              <th style={{ textAlign: 'center' }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {current.map(c => (
              <tr key={c.id}>
                <td>{c.nombreCompleto}</td>
                <td className="hide-sm">{c.documento}</td>
                <td>{c.telefono}</td>
                <td className="hide-md">
                  {c.fechaNacimiento ? new Date(c.fechaNacimiento).toLocaleDateString() : '-'}
                </td>
                <td>{c.genero}</td>
                <td className="hide-md">{c.direccion || '-'}</td>
                <td className="hide-sm">{c.parentesco}</td>
                <td>{c.pacienteNombre}</td>
                <td className="hide-sm">{c.notificaciones}</td>
                <td className="text-center">
                  <button className="edit-btn" onClick={() => { setSelectedContacto(c); setOpenModal(true); }}>✏️</button>
                  <button className="delete-btn" onClick={() => handleDelete(c.id)}>🗑️</button>
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
        <ContactoModal
          open={openModal}
          onClose={() => setOpenModal(false)}
          onSave={fetchContactos}
          initialData={selectedContacto ?? undefined}
        />
      )}
    </div>
  );
}
