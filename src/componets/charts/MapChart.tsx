import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { CoordenadaVisita } from '../../types/reportes';

interface Props {
  data: CoordenadaVisita[];
}

export default function MapChart({ data }: Props) {
  return (
    <div className="bg-white p-4 rounded-lg shadow-md w-full h-full">
      <h2 className="text-lg font-semibold mb-3 text-center text-gray-800">Mapa de Visitas</h2>
      <div className="w-full h-[300px] rounded overflow-hidden">
        <MapContainer
          center={[-9.189967, -75.015152]}
          zoom={5}
          style={{ height: '100%', width: '100%' }}
          scrollWheelZoom={false}
        >
          <TileLayer
            attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {data.map((item, idx) => (
            <Marker key={idx} position={[item.latitud, item.longitud]}>
              <Popup>
                <div className="text-sm">
                  <strong>ID Paciente:</strong> {item.pacienteId}<br />
                  <strong>Fecha:</strong> {item.fecha}<br />
                  <strong>{item.confirmada ? '✔ Confirmada' : '✖ No confirmada'}</strong>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
    </div>
  );
}
