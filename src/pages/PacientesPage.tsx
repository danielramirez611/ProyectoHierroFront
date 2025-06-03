import { useEffect, useState } from 'react';
import api from '../api';
import '../styles/ColaboradorPage.css';
import PacienteModal from '../Modal/PacienteModal';
import { Paciente } from '../types/Paciente'; // ajusta el path si es necesario
import addUserIcon from '../imgs/Icons-botones/addUser.svg'; // ajusta el path si es necesario


export default function PacientesPage() {
  const [pacientes, setPacientes] = useState<Paciente[]>([]);
  const [search, setSearch] = useState('');
  const [filteredPacientes, setFilteredPacientes] = useState<Paciente[]>([]);
  const [openModal, setOpenModal] = useState(false);
  const [selectedPaciente, setSelectedPaciente] = useState<Paciente | null>(null);
  
  const fetchPacientes = async () => {
    try {
      const res = await api.get('/Pacientes');
      const pacientesConNombre: Paciente[] = res.data.map((p: any) => ({
        id: p.id,
        userId: p.usuario?.id,
        tieneAnemia: p.tieneAnemia,
        nombreCompleto: p.usuario ? `${p.usuario.firstName} ${p.usuario.lastNameP} ${p.usuario.lastNameM}` : 'Desconocido'
      }));
      setPacientes(pacientesConNombre);
      setFilteredPacientes(pacientesConNombre);
    } catch (err) {
      console.error('Error al obtener pacientes:', err);
    }
  };

  useEffect(() => {
    fetchPacientes();
  }, []);

  useEffect(() => {
    const filtered = pacientes.filter((p) =>
      p.nombreCompleto.toLowerCase().includes(search.toLowerCase())
    );
    setFilteredPacientes(filtered);
  }, [search, pacientes]);

  const handleDelete = async (id: number) => {
    if (!window.confirm('¿Estás seguro de eliminar este paciente?')) return;
    await api.delete(`/Pacientes/${id}`);
    fetchPacientes();
  };

  return (
    <div className="page-container">
      <div className="header">
        <h2>Lista de Pacientes</h2>
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
              aria-label="Buscar al paciente por nombre"
            />
            <span className="search-icon">🔍</span>
          </div>

          {/* NUEVO */}
          <button
            className="new-btn"
            onClick={() => {
              setSelectedPaciente(null);
              setOpenModal(true);
            }}
            aria-label="Agregar nuevo paciente"
            title="Agregar paciente"
          >
            <img src={addUserIcon} alt="" />
            <span>
              Nuevo
              <br />
              PAciente
            </span>
          </button>
        </div>

      <table className="collab-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Nombre</th>
            <th>Anemia</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {filteredPacientes.map((p) => (
            <tr key={p.id}>
              <td>{p.id}</td>
              <td>{p.nombreCompleto}</td>
              <td>{p.tieneAnemia ? 'Sí' : 'No'}</td>
              <td>
              <button className="edit-btn" onClick={() => {
  setSelectedPaciente(p);
  setOpenModal(true);
}}>✏️</button>
                <button className="delete-btn" onClick={() => handleDelete(p.id)}>🗑️</button>
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
  <PacienteModal
    open={openModal}
    onClose={() => setOpenModal(false)}
    onSave={fetchPacientes}
    initialData={selectedPaciente || undefined}
  />
)}


    </div>
  );
}
