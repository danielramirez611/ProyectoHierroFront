// src/components/charts/GaugeChart.tsx
import { useEffect, useRef } from 'react';
import Chart from 'chart.js/auto';

interface Props {
  title: string;
  value: number;
  max: number;
}

export default function GaugeChart({ title, value, max }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const chart = new Chart(canvas, {
      type: 'doughnut',
      data: {
        labels: ['Progreso', 'Restante'],
        datasets: [
          {
            data: [value, max - value],
            backgroundColor: ['#22c55e', '#e5e7eb'],
            borderWidth: 0,
            hoverOffset: 4
          }
        ]
      },
      options: {
        cutout: '75%',
        rotation: -90,
        circumference: 180,
        plugins: {
          tooltip: { enabled: false },
          legend: { display: false }
        }
      }
    });

    return () => chart.destroy();
  }, [value, max]);

  return (
    <div className="bg-white p-4 rounded-xl shadow-lg w-full max-w-xs mx-auto text-center">
      <h2 className="text-lg font-semibold mb-3">{title}</h2>
      <div className="relative w-full aspect-square max-w-[200px] mx-auto">
        <canvas ref={canvasRef} className="w-full h-full" />
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-2xl font-bold text-gray-800">{value}%</span>
        </div>
      </div>
    </div>
  );
}
