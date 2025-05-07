import { useEffect, useState } from 'react';
import api from '../api';
import '../styles/ColaboradorPage.css';
import ColaboradorModal from '../Modal/ColaboradorModal';
import { toUserFormData } from '../utils/userMapper';
import { User } from '../types/User';
import { useSnackbar } from 'notistack';


export default function ColaboradoresPage() {
  const handleLogout = () => {
    localStorage.removeItem('user');
    window.location.href = '/login';
  };
  const [users, setUsers] = useState<User[]>([]);
  const [search, setSearch] = useState('');
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const { enqueueSnackbar } = useSnackbar();

  const fetchUsers = async () => {
    try {
      const res = await api.get('/Users');
      setUsers(res.data);
      setFilteredUsers(res.data);
    } catch (err) {
      console.error('Error al obtener usuarios:', err);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    const filtered = users.filter((u) =>
      `${u.firstName} ${u.lastNameP} ${u.lastNameM}`.toLowerCase().includes(search.toLowerCase())
    );
    setFilteredUsers(filtered);
  }, [search, users]);

  const handleDelete = async (id: number) => {
    if (!window.confirm('¿Estás seguro de eliminar este colaborador?')) return;
    await api.delete(`/Users/${id}`);
    enqueueSnackbar('🗑️ Colaborador eliminado correctamente', { variant: 'info' });
    fetchUsers();
  };
  

  return (
    <main className="main-content">
      <div className="page-container">
        <div className="header">
          <h2>Lista de colaboradores</h2>
          <div className="search-bar">
            <input
              type="text"
              placeholder="Ingrese el nombre"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <button>🔍</button>
          </div>
          <button
            className="new-btn"
            onClick={() => {
              setSelectedUser(null); // sin datos iniciales → modo agregar
              setModalOpen(true);
            }}
          >
            👤+ Nuevo colaborador
          </button>
        </div>

        <table className="collab-table">
          <thead>
            <tr>
              <th>Nombre completo</th>
              <th>DNI</th>
              <th>Teléfono</th>
              <th>Rol</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map((user) => (
              <tr key={user.id}>
                <td>{user.firstName} {user.lastNameP} {user.lastNameM}</td>
                <td>{user.documentNumber}</td>
                <td>{user.phone}</td>
                <td>{user.role}</td>
                <td>
                  <button
                    className="edit-btn"
                    onClick={() => {
                      setSelectedUser(user); // con datos → modo editar
                      setModalOpen(true);
                    }}
                  >
                    ✏️
                  </button>
                  <button className="delete-btn" onClick={() => handleDelete(user.id)}>🗑️</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {/* MODAL para agregar/editar */}
      <ColaboradorModal
        open={modalOpen}
        initialData={selectedUser ? toUserFormData(selectedUser) : undefined}
        onClose={() => {
          setModalOpen(false);
          setSelectedUser(null); // limpia el estado cuando se cierra
          
        }}
        onSave={() => {
          const fueEdicion = !!selectedUser;
          fetchUsers();
          setModalOpen(false);
          setSelectedUser(null);
        
          enqueueSnackbar(
            fueEdicion
              ? '✏️ Colaborador actualizado exitosamente'
              : '🆕 Nuevo colaborador registrado con éxito',
            { variant: 'success' }
          );
        }}
        
        
      />


    </main>


  );
}
