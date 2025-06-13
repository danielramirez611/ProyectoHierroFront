// src/components/charts/DoughnutChart.tsx
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

interface Props {
  title: string;
  data: { label: string; total: number }[];
}

export default function DoughnutChart({ title, data }: Props) {
  return (
    <div className="bg-white p-4 rounded-lg shadow-md">
      <h2 className="text-lg font-semibold mb-2">{title}</h2>
      <Doughnut
        data={{
          labels: data.map(d => d.label),
          datasets: [
            {
              data: data.map(d => d.total),
              backgroundColor: ['#4f46e5', '#06b6d4', '#22c55e', '#facc15', '#f87171']
            }
          ]
        }}
      />
    </div>
  );
}
