import React, { useRef, useEffect, useState } from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const AdminChart = ({ orders }) => {
  const chartRef = useRef(null);
  const [chartData, setChartData] = useState({ datasets: [] });

  useEffect(() => {
    const chart = chartRef.current;
    if (!chart) return;

    // 🟢 Logic: Aggregate Daily Sales
    const salesData = orders.reduce((acc, order) => {
      const date = new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
      acc[date] = (acc[date] || 0) + order.totalPrice;
      return acc;
    }, {});

    const labels = Object.keys(salesData);
    const dataValues = Object.values(salesData);

    // 🟢 CREATE GRADIENT: Making the chart look modern
    const ctx = chart.ctx;
    const gradient = ctx.createLinearGradient(0, 0, 0, 400);
    gradient.addColorStop(0, 'rgba(37, 99, 235, 0.4)');
    gradient.addColorStop(1, 'rgba(37, 99, 235, 0.0)');

    setChartData({
      labels,
      datasets: [
        {
          label: 'Revenue (₹)',
          data: dataValues,
          fill: true,
          backgroundColor: gradient, // Uses the gradient fill
          borderColor: '#2563eb',
          borderWidth: 3,
          pointBackgroundColor: '#fff',
          pointBorderColor: '#2563eb',
          pointBorderWidth: 2,
          pointRadius: 4,
          pointHoverRadius: 6,
          tension: 0.4, // Smooth curves
        },
      ],
    });
  }, [orders]);

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false }, // Cleaner look without legend
      tooltip: {
        backgroundColor: '#1e293b',
        padding: 12,
        titleFont: { size: 14, weight: 'bold' },
        bodyFont: { size: 13 },
        displayColors: false,
        callbacks: {
          label: (context) => ` Sales: ₹${context.raw.toLocaleString('en-IN')}`,
        },
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { color: '#94a3b8', font: { weight: 'bold', size: 10 } },
      },
      y: {
        beginAtZero: true,
        grid: { color: '#f1f5f9' },
        ticks: { 
          color: '#94a3b8',
          callback: (value) => '₹' + value.toLocaleString('en-IN'),
          font: { size: 10 }
        },
      },
    },
  };

  return (
    <div className="fs-card p-6 rounded-[2rem] animate-fade-in">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-lg font-black text-slate-800 uppercase tracking-tight">Revenue Flow</h3>
          <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-[0.2em]">Daily Performance Metrics</p>
        </div>
        <div className="flex gap-2">
          <span className="w-3 h-3 bg-blue-600 rounded-full"></span>
          <span className="text-[10px] font-black text-blue-600 uppercase tracking-[0.2em] italic">Live Data</span>
        </div>
      </div>
      <div className="h-[300px]">
        <Line ref={chartRef} data={chartData} options={options} />
      </div>
    </div>
  );
};

export default AdminChart;