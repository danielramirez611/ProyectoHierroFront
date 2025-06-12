// src/components/charts/LineChart.tsx
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend
} from 'chart.js';

ChartJS.register(LineElement, PointElement, CategoryScale, LinearScale, Tooltip, Legend);

interface Props {
  title: string;
  data: { fecha: string; total: number }[];
}

export default function LineChart({ title, data }: Props) {
  return (
    <div className="bg-white p-4 rounded-lg shadow-md">
      <h2 className="text-lg font-semibold mb-2">{title}</h2>
      <Line
        data={{
          labels: data.map(d => d.fecha),
          datasets: [
            {
              label: title,
              data: data.map(d => d.total),
              fill: false,
              borderColor: '#6366f1',
              tension: 0.4
            }
          ]
        }}
      />
    </div>
  );
}
