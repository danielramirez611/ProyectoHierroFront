import { useEffect, useState } from 'react';
import api from '../api';
import { ExportacionHistorial, TipoExportacionEnum } from '../types/Exportacion';
import ExportacionModal from '../Modal/ExportacionModal';
import { toast } from 'react-toastify';

export default function ExportacionPage() {
  const [exportaciones, setExportaciones] = useState<ExportacionHistorial[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [usuarioId, setUsuarioId] = useState<number>(0);
  const baseUrl = process.env.REACT_APP_API_URL || 'https://192.168.18.6:7268';

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const user = JSON.parse(storedUser);
      setUsuarioId(user.id);
      fetchExportaciones(user.id);
    }
  }, []);

  const fetchExportaciones = async (id: number) => {
    try {
      const res = await api.get(`/exportacionhistorial/usuario/${id}`);
      setExportaciones(res.data.historial);
    } catch (error) {
      console.error('Error cargando exportaciones:', error);
      toast.error('❌ No se pudo cargar el historial');
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('¿Estás seguro de eliminar esta exportación?')) return;
    try {
      await api.delete(`/exportacionhistorial/${id}`);
      toast.success('✅ Exportación eliminada');
      fetchExportaciones(usuarioId);
    } catch {
      toast.error('❌ Error al eliminar exportación');
    }
  };

  return (
    <div className="page-container">
      <div className="header">
        <h2>Historial de Exportaciones</h2>
        <button className="new-btn" onClick={() => setModalOpen(true)}>
          ➕ Nueva Exportación
        </button>
      </div>

      <table className="collab-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Tipo</th>
            <th>Fecha</th>
            <th>Estado</th>
            <th>Archivo</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {exportaciones.map((e) => (
            <tr key={e.id}>
              <td>{e.id}</td>
              <td>{e.tipoExportacion}</td>
              <td>{new Date(e.fechaExportacion).toLocaleString()}</td>
              <td>{e.estado}</td>
              <td>
  {e.urlArchivo ? (
 <a
 href={`${baseUrl}/${e.urlArchivo}`}
 download
 target="_blank"
 rel="noopener noreferrer"
 className="text-blue-600 hover:underline"
>
 Descargar
</a>
  ) : (
    <span className="text-gray-500">No disponible</span>
  )}
</td>

              <td>
                <button className="delete-btn" onClick={() => handleDelete(e.id)}>
                  🗑️
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <ExportacionModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSuccess={() => fetchExportaciones(usuarioId)}
      />
    </div>
  );
}
