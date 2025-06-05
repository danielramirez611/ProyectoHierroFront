import { useEffect, useState } from 'react';
import api from '../api';
import { Alerta, AlertaTipo, AlertaCategoria, CanalEnvioAlertaEnum } from '../types/Alerta';
import { toast } from 'react-toastify';
import '../styles/ColaboradorPage.css';
import { messaging } from '../FirebaseData/Firebase';
import { onMessage } from 'firebase/messaging';
import AlertaModal from '../Modal/AlertaModal';
import { Paciente } from '../types/Paciente';
import { getToken } from 'firebase/messaging'; // ✅ Agrega esto

export default function AlertaPage() {
  const [alertas, setAlertas] = useState<Alerta[]>([]);
  const [search, setSearch] = useState('');
  const [filtered, setFiltered] = useState<Alerta[]>([]);
  const [form, setForm] = useState<Partial<Alerta>>({
    mensaje: '',
    tipo: AlertaTipo.Vacunacion,
    categoria: AlertaCategoria.Niño,
    fechaAlerta: new Date().toISOString().split('T')[0],
    canalEnvio: CanalEnvioAlertaEnum.App,
    pacienteId: 0,
    creadoPorUserId: 0,
  });
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedAlerta, setSelectedAlerta] = useState<Alerta | null>(null);
  const [pacientes, setPacientes] = useState<Paciente[]>([]);

  const fetchAlertas = async () => {
    try {
      const res = await api.get('/Alerta');
      setAlertas(res.data);
      setFiltered(res.data);
    } catch (err) {
      console.error('Error al obtener alertas:', err);
    }
  };
  
  useEffect(() => {
    const fetchPacientes = async () => {
      try {
        const res = await api.get('/Pacientes');
        const pacientesConNombreCompleto = res.data.map((p: any) => ({
          id: p.id,  // id del paciente
          nombreCompleto: `${p.usuario.lastNameP} ${p.usuario.lastNameM}, ${p.usuario.firstName}`, // nombre del usuario asociado
        }));
        setPacientes(pacientesConNombreCompleto);
        console.log('Pacientes recibidos mapeados:', pacientesConNombreCompleto);
      } catch (err) {
        console.error('Error al obtener pacientes:', err);
        toast.error('❌ No se pudieron cargar los pacientes');
      }
    };
    fetchPacientes();
  }, []);
  
  
  // 🔔 Firebase Push Notifications + Permiso
  useEffect(() => {
    fetchAlertas();

    if ('Notification' in window && Notification.permission !== 'granted') {
      Notification.requestPermission().then((permission) => {
        if (permission === 'granted') {
          console.log('🔔 Permiso de notificaciones concedido');
        }
      });
    }

    const unsubscribe = onMessage(messaging, (payload) => {
      console.log('📥 Notificación recibida:', payload);
      const { title, body } = payload.notification || {};

      if (Notification.permission === 'granted' && title) {
        new Notification(title, { body });
      }

      toast.info(`📢 ${title || 'Nueva Alerta'}: ${body || ''}`, {
        position: 'top-right',
        autoClose: 5000,
      });

      fetchAlertas();
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const results = alertas.filter((a) => a.mensaje.toLowerCase().includes(search.toLowerCase()));
    setFiltered(results);
  }, [search, alertas]);

  const handleSubmit = async () => {
    if (!form.mensaje?.trim()) {
      toast.error('⚠️ El mensaje es obligatorio');
      return;
    }
  
    if (!form.pacienteId || form.pacienteId === 0) {
      toast.error('⚠️ Debes asignar un paciente válido');
      return;
    }
  
    // 🧠 Obtener el usuario actual desde localStorage
    const storedUser = localStorage.getItem('user');
    const currentUser = storedUser ? JSON.parse(storedUser) : null;
  
    if (!currentUser || !currentUser.id) {
      toast.error('⚠️ No se ha podido identificar al usuario autenticado');
      return;
    }
  
    try {
      const alertaPayload = {
        ...form,
        creadoPorUserId: currentUser.id, // 👈 clave para evitar error FK
      };
  
      if (selectedAlerta?.id) {
        await api.put(`/Alerta/${selectedAlerta.id}`, alertaPayload);
        toast.success('✅ Alerta actualizada correctamente');
      } else {
        console.log('Datos a enviar:', alertaPayload);
        await api.post('/Alerta', alertaPayload);
        toast.success('✅ Alerta creada correctamente');
      }
  
      await fetchAlertas();
      setModalOpen(false);
      setSelectedAlerta(null);
      setForm({
        mensaje: '',
        tipo: AlertaTipo.Vacunacion,
        categoria: AlertaCategoria.Niño,
        fechaAlerta: new Date().toISOString().split('T')[0],
        canalEnvio: CanalEnvioAlertaEnum.App,
        pacienteId: 0,
        creadoPorUserId: 0,
      });
    } catch (err) {
      console.error('Error al guardar alerta:', err);
      toast.error('❌ Ocurrió un error al guardar la alerta');
    }
  };
  

  const handleDelete = async (id: number) => {
    if (!window.confirm('¿Estás seguro de eliminar esta alerta?')) return;
    await api.delete(`/Alerta/${id}`);
    await fetchAlertas();
  };
  const resetForm = () => {
    setForm({
      mensaje: '',
      tipo: AlertaTipo.Vacunacion,
      categoria: AlertaCategoria.Niño,
      fechaAlerta: new Date().toISOString().split('T')[0],
      canalEnvio: CanalEnvioAlertaEnum.App,
      pacienteId: 0,
      creadoPorUserId: 0,
    });
  };
  const enviarNotificacionDePrueba = async () => {
    const storedUser = localStorage.getItem('user');
    const currentUser = storedUser ? JSON.parse(storedUser) : null;
  
    if (!currentUser || !currentUser.id) {
      toast.error('⚠️ Usuario no autenticado');
      return;
    }
  
    try {
      // Obtener datos del usuario actual desde la API (para traer el FirebaseToken actualizado)
      const res = await api.get(`/Users/${currentUser.id}`);
      const firebaseToken = res.data.firebaseToken;
  
      if (!firebaseToken) {
        toast.error('⚠️ El usuario no tiene un token Firebase registrado');
        return;
      }
  
      // Llamar al backend con una notificación genérica
      await api.post('/Notificacion/prueba', {
        token: firebaseToken,
        titulo: '🔔 Notificación de prueba',
        cuerpo: 'Este es un mensaje de prueba desde el botón',
      });
  
      toast.success('✅ Notificación enviada');
    } catch (err) {
      console.error('❌ Error al enviar notificación de prueba:', err);
      toast.error('❌ Falló el envío de notificación');
    }
  };
  
  return (
    
    <div className="page-container">
      <div className="header">
        <h2>Lista de Alertas</h2>
        <div className="search-bar">
          <input
            type="text"
            placeholder="Buscar por mensaje"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-blue"
          />
          <button>🔍</button>
        </div>
        <button
  className="new-btn"
  onClick={() => {
    setSelectedAlerta(null);
    resetForm();
    setModalOpen(true);
  }}
>
  ➕ Nueva Alerta
</button>
<button
  className="test-btn"
  onClick={async () => {
    try {
      const vapidKey = 'BOWk-BBMRj-OB15gVC7cao7oIn5xEBpCaH0oSYA0wIjlfzgCDdQcg5CKEMuFKLV2aq8srzMd6WthsIHRDoA4e7M';
      const token = await getToken(messaging, { vapidKey });
      
      if (!token) {
        toast.error("❌ No se pudo obtener el token Firebase");
        return;
      }

      console.log("🔑 Token actual:", token);

      // Obtener el usuario actual
      const storedUser = localStorage.getItem('user');
      const currentUser = storedUser ? JSON.parse(storedUser) : null;

      if (!currentUser || !currentUser.id) {
        toast.error("⚠️ Usuario no autenticado");
        return;
      }

      // 🔁 Actualiza el token en el backend
      await api.put(`/Users/${currentUser.id}/firebase-token`, {
        firebaseToken: token,
      });

      // 🚀 Enviar notificación de prueba
      const res = await api.post('/Alerta/probar-notificacion', { token }, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      

      toast.success(res.data || "✅ Notificación enviada");
    } catch (err) {
      console.error('❌ Error al enviar notificación de prueba:', err);
      toast.error("❌ Error al enviar notificación");
    }
  }}
>
  📤 Probar Notificación Push
</button>




      </div>

      <table className="collab-table">
        <thead>
          <tr>
            <th>Tipo</th>
            <th>Mensaje</th>
            <th>Categoría</th>
            <th>Fecha</th>
            <th>Canal</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {filtered.map((a) => (
            <tr key={a.id}>
              <td>{a.tipo}</td>
              <td>{a.mensaje}</td>
              <td>{a.categoria}</td>
              <td>{new Date(a.fechaAlerta).toLocaleDateString()}</td>
              <td>
                {(a.canalEnvio & CanalEnvioAlertaEnum.App) ? '📱 ' : ''}
                {(a.canalEnvio & CanalEnvioAlertaEnum.Correo) ? '📧 ' : ''}
                {(a.canalEnvio & CanalEnvioAlertaEnum.SMS) ? '📲' : ''}
              </td>
              <td>
                <button className="edit-btn" onClick={() => { setSelectedAlerta(a); setForm(a); setModalOpen(true); }}>✏️</button>
                <button className="delete-btn" onClick={() => handleDelete(a.id)}>🗑️</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

     
      <AlertaModal
  open={modalOpen}
  onClose={() => setModalOpen(false)}
  onSave={handleSubmit}
  form={form}
  setForm={setForm}
  editing={!!selectedAlerta}
  pacientes={pacientes}
/>


    </div>
    
  );
}
