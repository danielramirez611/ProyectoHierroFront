export interface Comunicado {
    id?: number;
    titulo: string;
    cuerpo: string;
    destinatario: DestinatarioEnum;
    fechaInicio: string;
    fechaFin: string;
    canalEnvio: ComunicadoCanalEnvioEnum;
    tipoContenido?: TipoContenidoEnum;
    esDestacado?: boolean;
    esProgramado?: boolean;
    urlPDF?: string;
    imagenUrl?: string;
    fechaCreacion?: string;
    eliminado?: boolean;
  }
  
  export enum DestinatarioEnum {
    Niño = 0,
    Gestante = 1,
    Administrador = 2,
    Gestor = 3,
    Todos = 4
  }
  
  export enum TipoContenidoEnum {
    Informativo = 0,
    Educativo = 1,
    Preventivo = 2
  }
  
  export enum ComunicadoCanalEnvioEnum {
    Ninguno = 0,
    App = 1,
    SMS = 2,
    Correo = 4,
    WhatsApp = 8,
    Todos = App | SMS | Correo | WhatsApp
  }
  