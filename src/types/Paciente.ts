export interface Paciente {
    id: number;
    userId: number;
    tieneAnemia: boolean;
    nombreCompleto: string;
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
  