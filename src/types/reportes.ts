// Tipos genéricos para gráficos simples
export interface ResumenSimple {
    label: string;
    total: number;
  }
  
  // Visitas agrupadas por día, semana o mes
  export interface VisitaPorTiempo {
    fecha: string | Date;
    total: number;
  }
  
  // Coordenadas de visitas para mapa
  export interface CoordenadaVisita {
    latitud: number;
    longitud: number;
    fecha: string;
    confirmada: boolean;
    pacienteId: number;
  }
  
  // Visitas con servicios básicos detectados
  export interface ServiciosBasicos {
    tieneAgua: boolean;
    tieneLuz: boolean;
    tieneInternet: boolean;
    total: number;
  }
  
  // Top 10 distritos con más visitas
  export interface TopDistrito {
    distrito: string;
    total: number;
  }
  
  // Porcentaje de usuarios verificados
  export interface VerificacionUsuarios {
    totalUsuarios: number;
    verificados: number;
    porcentaje: number;
  }
  
  // Asignaciones agrupadas por gestor
  export interface AsignacionesPorGestor {
    gestor: string;
    totalAsignaciones: number;
  }
  
  // Tiempo promedio entre visitas por gestor
  export interface PromedioVisitas {
    gestorId: number;
    promedioDias: number;
  }
  
  // Tambos por región (departamento, provincia, distrito)
  export interface TambosPorRegion {
    departamento: string;
    provincia: string;
    distrito: string;
    total: number;
  }
  
  // Tambos por tipo (Infraestructura, móvil, etc.)
  export interface TambosPorTipo {
    tipo: string;
    total: number;
  }
  
  // Pacientes con anemia por distrito
  export interface AnemiaPorDistrito {
    distrito: string;
    total: number;
  }
  
  // Pacientes registrados por mes
  export interface PacientesPorMes {
    mes: number;
    total: number;
  }
  
  // Historial de exportaciones
  export interface ExportacionAgrupada {
    tipo: string;
    usuarioId: number;
    totalExportaciones: number;
  }
  