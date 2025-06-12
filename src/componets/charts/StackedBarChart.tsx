// src/components/charts/StackedBarChart.tsx
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

interface Props {
  title: string;
  labels: string[];
  datasets: { label: string; data: number[]; backgroundColor: string }[];
}

export default function StackedBarChart({ title, labels, datasets }: Props) {
  return (
    <div className="bg-white p-4 rounded-lg shadow-md">
      <h2 className="text-lg font-semibold mb-2">{title}</h2>
      <Bar
        data={{ labels, datasets }}
        options={{
          responsive: true,
          plugins: { legend: { position: 'bottom' } },
          scales: {
            x: { stacked: true },
            y: { stacked: true }
          }
        }}
      />
    </div>
  );
}
