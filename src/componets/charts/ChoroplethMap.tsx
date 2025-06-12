import { ComposableMap, Geographies, Geography } from 'react-simple-maps';
import { scaleQuantize } from 'd3-scale';
import peruGeo from '../../data/peru_departamentos.json';

interface RegionData {
  nombre: string;
  valor: number;
}

interface Props {
  title: string;
  data: RegionData[];
}

export default function ChoroplethMap({ title, data }: Props) {
  const maxValor = Math.max(...data.map(d => d.valor), 1);

  const colorScale = scaleQuantize()
    .domain([0, maxValor])
    .range(['#e0f2fe', '#bae6fd', '#7dd3fc', '#38bdf8', '#0ea5e9', '#0369a1']);

  return (
    <div className="bg-white p-4 rounded-xl shadow-md w-full max-w-[700px] mx-auto">
      <h2 className="text-lg font-semibold mb-4 text-center text-gray-800">{title}</h2>

      <div className="relative w-full h-[350px]">
        <ComposableMap
          projection="geoMercator"
          projectionConfig={{ scale: 1100, center: [-75, -9] }}
          width={500}
          height={600}
          style={{ width: '100%', height: '100%' }}
        >
          <Geographies geography={peruGeo}>
            {({ geographies }: { geographies: any[] }) =>
              geographies.map((geo) => {
                const nombreGeo = geo.properties?.NAME_1;
                if (!nombreGeo) return null;

                const region = data.find(
                  (d) => d.nombre?.toLowerCase() === nombreGeo.toLowerCase()
                );

                const valor = region?.valor ?? 0;

                return (
                  <Geography
                    key={geo.rsmKey}
                    geography={geo}
                    fill={colorScale(valor)}
                    stroke="#ffffff"
                    strokeWidth={0.5}
                    onMouseEnter={() => {
                      const tooltip = document.getElementById('tooltip');
                      if (tooltip) tooltip.innerHTML = `<strong>${nombreGeo}</strong>: ${valor}`;
                    }}
                    onMouseLeave={() => {
                      const tooltip = document.getElementById('tooltip');
                      if (tooltip) tooltip.innerHTML = '';
                    }}
                    style={{
                      default: { outline: 'none' },
                      hover: { outline: 'none', opacity: 0.9 },
                      pressed: { outline: 'none' },
                    }}
                  />
                );
              })
            }
          </Geographies>
        </ComposableMap>
      </div>

      <div
        id="tooltip"
        className="mt-3 px-3 py-2 text-sm rounded bg-gray-100 text-gray-700 shadow-inner h-10 text-center"
      />
    </div>
  );
}
