import { useEffect, useState } from 'react';
import api from '../api';
import '../styles/ColaboradorPage.css';
import ContactoModal from '../Modal/ContactoModal'; // asegúrate que exista
import addUserIcon from '../imgs/Icons-botones/addUser.svg'; // asegúrate que exista

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
  const [contactos, setContactos] = useState<Contacto[]>([]);
  const [search, setSearch] = useState('');
  const [filtered, setFiltered] = useState<Contacto[]>([]);
  const [openModal, setOpenModal] = useState(false);
  const [selectedContacto, setSelectedContacto] = useState<Contacto | null>(null);

  const fetchContactos = async () => {
    try {
      const res = await api.get('/Contactos');
      const data = res.data.map((c: any) => ({
        ...c,
        pacienteNombre: c.paciente?.usuario?.nombre || 'Desconocido'
      }));
      setContactos(data);
      setFiltered(data);
    } catch (err) {
      console.error('Error al obtener contactos:', err);
    }
  };

  useEffect(() => {
    fetchContactos();
  }, []);

  useEffect(() => {
    const f = contactos.filter(c =>
      `${c.nombreCompleto} ${c.pacienteNombre}`.toLowerCase().includes(search.toLowerCase())
    );
    setFiltered(f);
  }, [search, contactos]);

  const handleDelete = async (id: number) => {
    if (!window.confirm('¿Estás seguro de eliminar este contacto?')) return;
    await api.delete(`/Contactos/${id}`);
    fetchContactos();
  };

  return (
    <div className="page-container">
      <div className="header">
        <h2>Lista de Contactos</h2>
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
              aria-label="Buscar al contacto por nombre"
            />
            <span className="search-icon">🔍</span>
          </div>

          {/* NUEVO */}
          <button
            className="new-btn"
            onClick={() => {
              setSelectedContacto(null);
              setOpenModal(true);
            }}
            aria-label="Agregar nuevo contacto"
            title="Agregar contacto"
          >
            <img src={addUserIcon} alt="" />
            <span>
              Nuevo
              <br />
              Contacto
            </span>
          </button>
        </div>

      <table className="collab-table">
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Documento</th>
            <th>Teléfono</th>
            <th>Fecha Nacimiento</th>
            <th>Género</th>
            <th>Dirección</th>
            <th>Parentesco</th>
            <th>Paciente</th>
            <th>Notificación</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {filtered.map((c) => (
            <tr key={c.id}>
              <td>{c.nombreCompleto}</td>
              <td>{c.documento}</td>
              <td>{c.telefono}</td>
              <td>{c.fechaNacimiento ? new Date(c.fechaNacimiento).toLocaleDateString() : '-'}</td>
              <td>{c.genero}</td>
              <td>{c.direccion || '-'}</td>
              <td>{c.parentesco}</td>
              <td>{c.pacienteNombre}</td>
              <td>{c.notificaciones}</td>
              <td>
              <button className="edit-btn" onClick={() => {
                  setSelectedContacto(c);
                  setOpenModal(true);
                }}>✏️</button>                <button className="delete-btn" onClick={() => handleDelete(c.id)}>🗑️</button>
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
      {openModal && (
        <ContactoModal
          open={openModal}
          onClose={() => setOpenModal(false)}
          onSave={fetchContactos}
          initialData={selectedContacto || undefined}
        />
      )}
    </div>
  );
}
