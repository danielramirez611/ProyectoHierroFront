import { useEffect, useState } from 'react';
import {
  obtenerUsuariosPorRol,
  obtenerVisitasPorTiempo,
  obtenerVisitasMapa,
  obtenerServiciosBasicos,
  obtenerTopDistritosVisitas,
  obtenerUsuariosVerificados,
  obtenerTambosPorRegion
} from '../services/reportes';

import {
  ResumenSimple,
  VisitaPorTiempo,
  CoordenadaVisita,
  ServiciosBasicos,
  TopDistrito,
  VerificacionUsuarios,
  TambosPorRegion
} from '../types/reportes';

import BarChart from '../componets/charts/BarChart';
import PieChart from '../componets/charts/PieChart';
import MapChart from '../componets/charts/MapChart';
import ChoroplethMap from '../componets/charts/ChoroplethMap';

// Tipo auxiliar para gráficos simples
type DatosAgrupados = { label: string; total: number };

export default function ReportePage() {
  const [agrupadoPor, setAgrupadoPor] = useState<'dia' | 'semana' | 'mes'>('mes');
  const [usuarios, setUsuarios] = useState<any[]>([]);
  const [visitasTiempo, setVisitasTiempo] = useState<VisitaPorTiempo[]>([]);
  const [visitasMapa, setVisitasMapa] = useState<CoordenadaVisita[]>([]);
  const [servicios, setServicios] = useState<ServiciosBasicos[]>([]);
  const [topDistritos, setTopDistritos] = useState<TopDistrito[]>([]);
  const [verificacion, setVerificacion] = useState<VerificacionUsuarios | null>(null);
  const [tambosRegion, setTambosRegion] = useState<TambosPorRegion[]>([]);

  useEffect(() => {
    obtenerUsuariosPorRol().then(res => {
      console.log('🔍 Usuarios por rol recibidos:', res.data);
      setUsuarios(res.data);
    });
    obtenerVisitasMapa().then(res => setVisitasMapa(res.data));
    obtenerServiciosBasicos().then(res => setServicios(res.data));
    obtenerTopDistritosVisitas().then(res => setTopDistritos(res.data));
    obtenerUsuariosVerificados().then(res => setVerificacion(res.data));
    obtenerTambosPorRegion().then(res => setTambosRegion(res.data));
  }, []);

  useEffect(() => {
    obtenerVisitasPorTiempo(agrupadoPor).then(res => setVisitasTiempo(res.data));
  }, [agrupadoPor]);

  // Agrupar tambos por departamento para mapa coroplético
  const tambosPorDepartamento = tambosRegion.reduce<{ nombre: string; valor: number }[]>((acc, curr) => {
    const existente = acc.find(a => a.nombre === curr.departamento);
    if (existente) {
      existente.valor += curr.total;
    } else {
      acc.push({ nombre: curr.departamento, valor: curr.total });
    }
    return acc;
  }, []);

  return (
    <div className="min-h-screen bg-[#0f172a] text-white p-6 max-w-[1300px] mx-auto">
      <h1 className="text-3xl font-bold text-center mb-8">Dashboard de Reportes</h1>

      {/* Bloque 1: Usuarios por rol y visitas por tiempo */}
      <div className="flex flex-wrap gap-6 mb-6 justify-between">
        <Card className="flex-1 min-w-[300px] max-w-[600px]">
          <PieChart
            title="Usuarios por Rol"
            data={usuarios.reduce((acc: DatosAgrupados[], curr: any) => {
              const rawLabel: string | null = curr.rol;
              const label: string = rawLabel && rawLabel.trim() !== '' ? rawLabel : 'Sin rol';
              const existente = acc.find((e: DatosAgrupados) => e.label === label);
              if (existente) {
                existente.total += curr.total;
              } else {
                acc.push({ label, total: curr.total });
              }
              return acc;
            }, [])}
          />
        </Card>

        <Card className="flex-1 min-w-[300px] max-w-[600px]">
          <BarChart
            title={`Visitas por ${agrupadoPor}`}
            data={visitasTiempo.map(v => ({
              label: v.fecha ? String(v.fecha) : 'Sin fecha',
              total: v.total ?? 0
            }))}
          />
        </Card>
      </div>

      {/* Bloque 2: Top distritos con visitas */}
      <div className="mb-6">
        <Card className="max-w-[500px] mx-auto">
          <PieChart
            title="Top Distritos con Visitas"
            data={topDistritos.map(d => ({
              label: d.distrito ?? 'Sin distrito',
              total: d.total ?? 0
            }))}
          />
        </Card>
      </div>

      {/* Fila 3: Mapa de visitas */}
      <div className="mb-6">
        <Card className="w-full min-h-[400px]">
          <MapChart data={visitasMapa} />
        </Card>
      </div>

      {/* Fila 4: Mapa coroplético */}
      <div className="mb-6">
        <Card className="w-full min-h-[400px]">
          <ChoroplethMap title="Tambos por Departamento" data={tambosPorDepartamento} />
        </Card>
      </div>

      {/* Filtro de agrupamiento */}
      <div className="flex justify-end mt-6">
        <select
          className="bg-white text-black border rounded px-3 py-1 text-sm"
          value={agrupadoPor}
          onChange={(e) => setAgrupadoPor(e.target.value as 'dia' | 'semana' | 'mes')}
        >
          <option value="dia">Día</option>
          <option value="semana">Semana</option>
          <option value="mes">Mes</option>
        </select>
      </div>
    </div>
  );
}

// 🧩 Componente reutilizable de tarjeta
function Card({ children, className = '' }: { children: React.ReactNode, className?: string }) {
  return (
    <div className={`bg-[#1e293b] p-4 rounded-xl shadow-md w-full h-full ${className}`}>
      {children}
    </div>
  );
}
