// 📁 src/types/exportacion.ts

export enum TipoExportacionEnum {
  Visitas = 'Visitas',
  Pacientes = 'Pacientes',
  Alertas = 'Alertas',
  Asignaciones = 'Asignaciones',
  Tambos = 'Tambos',
  Usuarios = 'Usuarios',
  Contactos = 'Contactos',
  Comunicados = 'Comunicados'
}

export interface ExportacionHistorial {
  id: number;
  usuarioId: number;
  tipoExportacion: TipoExportacionEnum;
  filtrosAplicados?: string;
  fechaExportacion: string;
  formato: string;
  estado: string;
  urlArchivo?: string;
  ipCliente?: string;
  navegador?: string;
  tiempoGeneracionSegundos?: number;
}

export interface ExportacionRegistroDto {
  usuarioId: number;
  tipoExportacion: TipoExportacionEnum;
  filtrosAplicados?: string;
  nombreEntidad: string;
  fechaInicio?: string;
  fechaFin?: string;
}
