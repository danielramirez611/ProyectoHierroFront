import { useEffect, useState } from 'react';
import api from '../api';
import { Comunicado } from '../types/Comunicado';
import '../styles/NotificacionesBuzon.css';

export default function NotificacionesBuzon() {
  const [notificaciones, setNotificaciones] = useState<Comunicado[]>([]);

  useEffect(() => {
    const fetchNotificaciones = async () => {
      try {
        const res = await api.get('/Comunicado');
        setNotificaciones(res.data);
      } catch (err) {
        console.error('Error al obtener notificaciones:', err);
      }
    };
    fetchNotificaciones();
  }, []);

  return (
    <div className="notificaciones-buzon">
      <h2 className="titulo-buzon">📬 Buzón de Notificaciones</h2>

      {notificaciones.length === 0 ? (
        <p className="no-notificaciones">No hay notificaciones aún.</p>
      ) : (
        <div className="notificaciones-grid">
          {notificaciones.map((n) => (
            <div key={n.id} className="notificacion-card">
              {n.imagenUrl && (
                <div className="notificacion-imagen-wrapper">
                  <img
                    src={n.imagenUrl}
                    alt={n.titulo}
                    className="notificacion-imagen"
                  />
                </div>
              )}
              <div className="notificacion-info">
                <h3 className="notificacion-titulo">{n.titulo}</h3>
                <p className="notificacion-cuerpo">{n.cuerpo}</p>
                <div className="notificacion-footer">
                  <span className="notificacion-fecha">
                    📅 {new Date(n.fechaInicio).toLocaleDateString()}
                  </span>
                  {n.urlPDF && (
                    <a
                      href={n.urlPDF}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="notificacion-pdf"
                    >
                      📄 Ver PDF
                    </a>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
