export interface Tambo {
    id: number;
    name: string;
    code: string;
    departamento: string;
    provincia: string;
    distrito: string;
    direccion: string;
    referencia?: string;
    horarioAtencion?: string;
    tipo: string;
    representante: string;
    documentoRepresentante: string;
    telefono: string;
    estado: boolean;
  }
  
  export type TamboFormData = Omit<Tambo, 'id'> & { id?: number }; // id opcional solo en formularios
  