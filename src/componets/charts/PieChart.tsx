import { Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend
} from 'chart.js';
import React from 'react';

ChartJS.register(ArcElement, Tooltip, Legend);

interface PieData {
  label: string;
  total: number;
}

interface Props {
  title: string;
  data: PieData[];
}

export default function PieChart({ title, data }: Props) {
  // 🔁 Agrupar los datos por label y sumar totales si se repiten
  const groupedData: PieData[] = data.reduce((acc: PieData[], curr: PieData) => {
    const existing = acc.find((item: PieData) => item.label === curr.label);
    if (existing) {
      existing.total += curr.total;
    } else {
      acc.push({ ...curr });
    }
    return acc;
  }, []);

  // 🎨 Colores base (se expanden automáticamente si hay más labels)
  const colors = [
    '#6366f1', '#60a5fa', '#34d399', '#facc15', '#f87171',
    '#a78bfa', '#f472b6', '#fb923c', '#2dd4bf', '#4ade80'
  ];

  return (
    <div className="bg-white p-4 rounded-lg shadow-md w-full max-w-[400px] mx-auto">
      <h2 className="text-lg font-semibold mb-2 text-center">{title}</h2>

      {/* 🕵️ Mostrar mensaje si no hay datos */}
      {groupedData.length === 0 ? (
        <div className="text-center text-gray-500 mt-20">
          No hay datos disponibles
        </div>
      ) : (
        <div className="w-full h-[300px]">
          <Pie
            data={{
              labels: groupedData.map((d) => d.label),
              datasets: [
                {
                  data: groupedData.map((d) => d.total),
                  backgroundColor: colors.slice(0, groupedData.length)
                }
              ]
            }}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                legend: { position: 'bottom' }
              }
            }}
          />
        </div>
      )}
    </div>
  );
}
