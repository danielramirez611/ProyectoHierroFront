import api from '../api';

// 1. Usuarios por rol
export const obtenerUsuariosPorRol = () => 
  api.get('/estadisticas/usuarios-por-rol');

// 2. Visitas por tiempo (dia, semana, mes)
export const obtenerVisitasPorTiempo = (modo: 'dia' | 'semana' | 'mes') => 
  api.get(`/estadisticas/visitas-tiempo?agrupadoPor=${modo}`);

// 3. Visitas con ubicación para mapa
export const obtenerVisitasMapa = () => 
  api.get('/estadisticas/visitas-mapa');

// 4. Servicios básicos detectados en visitas
export const obtenerServiciosBasicos = () => 
  api.get('/estadisticas/servicios-basicos');

// 5. Comparativa mensual de visitas
export const obtenerComparativaVisitas = () => 
  api.get('/estadisticas/comparativa-visitas');

// 6. Top distritos con más visitas
export const obtenerTopDistritosVisitas = () => 
  api.get('/estadisticas/top-distritos-visitas');

// 7. Pacientes con anemia por distrito
export const obtenerPacientesConAnemiaPorDistrito = () => 
  api.get('/estadisticas/pacientes-anemia-por-distrito');

// 8. Tambos por región
export const obtenerTambosPorRegion = () => 
  api.get('/estadisticas/tambos-por-region');

// 9. Tambos por tipo
export const obtenerTambosPorTipo = () => 
  api.get('/estadisticas/tambos-por-tipo');

// 10. Gestores por región
export const obtenerGestoresPorRegion = () => 
  api.get('/estadisticas/gestores-por-region');

// 11. Asignaciones por gestor
export const obtenerAsignacionesPorGestor = () => 
  api.get('/estadisticas/asignaciones-por-gestor');

// 12. Gestores sin visitas
export const obtenerGestoresSinVisitas = () => 
  api.get('/estadisticas/gestores-sin-visitas');

// 13. Tiempo promedio entre visitas por gestor
export const obtenerTiempoPromedioVisitas = () => 
  api.get('/estadisticas/tiempo-promedio-visitas');

// 14. Pacientes registrados por mes
export const obtenerPacientesPorMes = () => 
  api.get('/estadisticas/pacientes-por-mes');

// 15. Porcentaje de usuarios verificados
export const obtenerUsuariosVerificados = () => 
  api.get('/estadisticas/usuarios-verificados');

// 16. Historial de exportaciones
export const obtenerHistorialExportaciones = () => 
  api.get('/estadisticas/historial-exportaciones');
