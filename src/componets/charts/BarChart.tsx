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
  data: { label: string; total: number }[];
}

export default function BarChart({ title, data }: Props) {
  return (
    <div className="bg-white p-4 rounded-lg shadow-md w-full h-full">
      <h2 className="text-lg font-semibold mb-2 text-center text-gray-800">{title}</h2>
      <div className="w-full h-[300px]">
        <Bar
          data={{
            labels: data.map((d) => d.label),
            datasets: [
              {
                label: title,
                data: data.map((d) => d.total),
                backgroundColor: '#4f46e5'
              }
            ]
          }}
          options={{
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: { display: false },
              tooltip: { enabled: true }
            },
            scales: {
              x: {
                ticks: { color: '#475569' }
              },
              y: {
                beginAtZero: true,
                ticks: { color: '#475569' }
              }
            }
          }}
        />
      </div>
    </div>
  );
}
