import { User } from './User';

export interface Paciente {
    id: number;
    userId: number;
    tieneAnemia: boolean;
    nombreCompleto: string;
    usuario?: User; // <-- AGREGAR ESTA LÍNEA

  }
  
  export interface PacienteFormData {
    id?: number;
    userId: number;
    tieneAnemia: boolean;
  }
  
  export interface UsuarioPacienteOption {
    id: number;
    nombre: string;
  }
  