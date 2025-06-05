// src/types/Alerta.ts
export enum AlertaTipo {
    Vacunacion = "Vacunacion",
    ControlMedico = "ControlMedico",
    SuplementoHierro = "SuplementoHierro",
    VisitaDomiciliaria = "VisitaDomiciliaria",
    Otro = "Otro"
  }
  
  export enum AlertaCategoria {
    Niño = "Niño",       // ✅ ahora con tilde
    Gestante = "Gestante",
    Todos = "Todos"
  }
  
  export enum PrioridadAlerta {
    Alta = "Alta",
    Media = "Media",
    Baja = "Baja"
  }
  
  export enum PeriodicidadAlerta {
    Unica = "Unica",
    Diaria = "Diaria",
    Semanal = "Semanal",
    Mensual = "Mensual"
  }
  
  export enum CanalEnvioAlertaEnum {
    Ninguno = 0,
    App = 1,
    SMS = 2,
    Correo = 4,
    WhatsApp = 8
  }
  
  export interface Alerta {
    id: number;
    pacienteId: number;
    tipo: AlertaTipo;
    categoria: AlertaCategoria;
    mensaje: string;
    fechaAlerta: string;
    fechaCreacion?: string;
    notificacionEnviada?: boolean;
    canalEnvio: CanalEnvioAlertaEnum;
    prioridad?: PrioridadAlerta;
    eliminada?: boolean;
    periodicidad?: PeriodicidadAlerta;
    fechaFinRepeticion?: string;
    vistaPrevia?: string;
    creadoPorUserId: number;
  }
  