import { useEffect, useState } from 'react';
import api from '../api';
import '../styles/ColaboradorPage.css';
import ColaboradorModal from '../Modal/ColaboradorModal';
import { toUserFormData } from '../utils/userMapper';
import { User } from '../types/User';
import { useSnackbar } from 'notistack';

import addUserIcon from '../imgs/Icons-botones/addUser.svg';

export default function ColaboradoresPage() {
  /* ---------- estado ---------- */
  const [users, setUsers] = useState<User[]>([]);
  const [search, setSearch] = useState('');
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const { enqueueSnackbar } = useSnackbar();

  /* ---------- helpers ---------- */
  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      const res = await api.get('/Users');
      setUsers(res.data);
      setFilteredUsers(res.data);
    } catch (err) {
      console.error('Error al obtener usuarios:', err);
      enqueueSnackbar('❌ No se pudieron cargar los colaboradores', {
        variant: 'error',
      });
    } finally {
      setIsLoading(false);
    }
  };

  /* ---------- efectos ---------- */
  useEffect(() => {
    fetchUsers();
  }, []);

  /*  Debounce de 300 ms para el buscador  */
  useEffect(() => {
    const id = setTimeout(() => {
      const term = search.toLowerCase();
      setFilteredUsers(
        users.filter((u) =>
          `${u.firstName} ${u.lastNameP} ${u.lastNameM}`
            .toLowerCase()
            .includes(term)
        )
      );
    }, 300);
    return () => clearTimeout(id);
  }, [search, users]);

  /* ---------- handlers ---------- */
  const handleDelete = async (id: number) => {
    if (!window.confirm('¿Estás seguro de eliminar este colaborador?')) return;
    await api.delete(`/Users/${id}`);
    enqueueSnackbar('🗑️ Colaborador eliminado correctamente', {
      variant: 'info',
    });
    fetchUsers();
  };

  /* ---------- UI ---------- */
  return (
    <main className="main-content">
      <div className="page-container">
        {/* CABECERA */}
        <div className="header">
          <h2>Lista de colaboradores</h2>
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
              aria-label="Buscar colaborador por nombre"
            />
            <span className="search-icon">🔍</span>
          </div>

          {/* NUEVO */}
          <button
            className="new-btn"
            onClick={() => {
              setSelectedUser(null);
              setModalOpen(true);
            }}
            aria-label="Agregar nuevo colaborador"
            title="Agregar colaborador"
          >
            <img src={addUserIcon} alt="" />
            <span className='new-comunicado'>
              Nuevo
              <br />
              colaborador
            </span>
          </button>
        </div>

        {/* TABLA */}
        <div className="table-container">
          <table className="collab-table">
            <thead>
              <tr>
                <th>Nombre completo</th>
                <th style={{ textAlign: 'center' }}>DNI</th>
                <th style={{ textAlign: 'center' }}>Teléfono</th>
                <th>Rol</th>
                <th style={{ textAlign: 'center' }}>Acciones</th>
              </tr>
            </thead>

            <tbody>
              {isLoading ? (
                /* 3 filas skeleton simples */
                [...Array(3)].map((_, i) => (
                  <tr key={i}>
                    <td colSpan={5} style={{ padding: '1rem', opacity: 0.5 }}>
                      Cargando...
                    </td>
                  </tr>
                ))
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ padding: '1rem', textAlign: 'center' }}>
                    No se encontraron colaboradores
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user, idx) => (
                  <tr
                    key={user.id}
                    style={{
                      backgroundColor: idx % 2 === 0 ? '#ffffff' : '#f7f7f7',
                    }}
                  >
                    <td>{`${user.firstName} ${user.lastNameP} ${user.lastNameM}`}</td>
                    <td style={{ textAlign: 'center' }}>{user.documentNumber}</td>
                    <td style={{ textAlign: 'center' }}>{user.phone}</td>
                    <td>
                      {/* badge de rol, sin tocar CSS existente */}
                      <span
                        style={{
                          background: '#e0e7ff',
                          color: '#3730a3',
                          borderRadius: '9999px',
                          padding: '0.15rem 0.55rem',
                          fontSize: '0.85rem',
                          fontWeight: 500,
                        }}
                      >
                        {user.role}
                      </span>
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <button
                        className="edit-btn"
                        onClick={() => {
                          setSelectedUser(user);
                          setModalOpen(true);
                        }}
                        aria-label="Editar colaborador"
                        title="Editar"
                      >
                        ✏️
                      </button>
                      <button
                        className="delete-btn"
                        onClick={() => handleDelete(user.id)}
                        aria-label="Eliminar colaborador"
                        title="Eliminar"
                      >
                        🗑️
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL AGREGAR/EDITAR */}
      <ColaboradorModal
        open={modalOpen}
        initialData={selectedUser ? toUserFormData(selectedUser) : undefined}
        onClose={() => {
          setModalOpen(false);
          setSelectedUser(null);
        }}
        onSave={() => {
          const edicion = !!selectedUser;
          fetchUsers();
          setModalOpen(false);
          setSelectedUser(null);
          enqueueSnackbar(
            edicion
              ? '✏️ Colaborador actualizado exitosamente'
              : '🆕 Nuevo colaborador registrado con éxito',
            { variant: 'success' }
          );
        }}
      />
    </main>
  );
}
