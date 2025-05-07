export interface Asignacion {
    id: number;
    gestorId: number;
    tamboId: number;
    fechaAsignacion: string;
    departamento: string;
    provincia: string;
    distrito: string;
    centroPoblado?: string;
    estado: boolean;
  }
  
  export interface AsignacionExtendida extends Asignacion {
    gestorNombre: string;
    tamboNombre: string;
  }
  