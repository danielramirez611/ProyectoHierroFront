export interface VisitaDomiciliaria {
  id: number;
  pacienteId: number;
  gestorId: number;
  asignacionId?: number;
  fechaVisita: string; // formato ISO
  observacion: string;
  altura?: number;
  peso?: number;
  tieneAgua: boolean;
  tieneLuz: boolean;
  tieneInternet: boolean;
  latitud?: number;
  longitud?: number;
  ubicacionConfirmada: boolean;
  registradoOffline: boolean;
  fechaRegistro: string;

  paciente?: {
    user?: {
      firstName: string;
      lastNameP: string;
      lastNameM: string;
    };
  };
  gestor?: {
    firstName: string;
    lastNameP: string;
    lastNameM: string;
  };
  asignacion?: any;
}

export interface VisitaOfflineDto {
  pacienteId: number;
  gestorId: number;
  asignacionId?: number;
  fechaVisita: string;
  observacion: string;
  altura?: number;
  peso?: number;
  tieneAgua: boolean;
  tieneLuz: boolean;
  tieneInternet: boolean;
  latitud?: number;
  longitud?: number;
  ubicacionConfirmada: boolean;
}
