// src/components/charts/RadarChart.tsx
import { Radar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend
} from 'chart.js';

ChartJS.register(RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend);

interface Props {
  title: string;
  labels: string[];
  values: number[];
}

export default function RadarChart({ title, labels, values }: Props) {
  return (
    <div className="bg-white p-4 rounded-lg shadow-md">
      <h2 className="text-lg font-semibold mb-2">{title}</h2>
      <Radar
        data={{
          labels,
          datasets: [
            {
              label: title,
              data: values,
              backgroundColor: 'rgba(99, 102, 241, 0.3)',
              borderColor: '#6366f1'
            }
          ]
        }}
      />
    </div>
  );
}
