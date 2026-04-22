import React from 'react';
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

const NegotiationChart = ({ sales, loss }) => {
  const safeSales = Number(sales) || 0;
  const safeLoss = Number(loss) || 0;
  const hasData = safeSales > 0 || safeLoss > 0;
  const data = {
    labels: ['Actual Revenue', 'AI Bargain Loss'],
    datasets: [
      {
        data: [safeSales, safeLoss],
        backgroundColor: ['#2563eb', '#f87171'],
        hoverBackgroundColor: ['#1d4ed8', '#ef4444'],
        borderWidth: 0,
      },
    ],
  };

  const options = {
    cutout: '75%',
    plugins: {
      legend: { position: 'bottom', labels: { font: { family: 'Inter', weight: 'bold', size: 10 } } },
    },
  };

  return (
    <div className="bg-surface p-8 rounded-[2.5rem] shadow-xl border border-app flex flex-col h-full">
      <h3 className="text-sm font-black uppercase text-muted tracking-widest mb-6">Bargain Impact</h3>
      <div className="flex-1 min-h-[200px] flex items-center justify-center">
        {hasData ? (
          <Doughnut data={data} options={options} />
        ) : (
          <div className="text-xs font-black uppercase tracking-widest text-muted">No bargaining data yet</div>
        )}
      </div>
      <div className="mt-6 border-t border-app pt-6 flex justify-between items-center">
        <div>
          <p className="text-[10px] font-black text-muted uppercase">Total Discounted</p>
          <p className="text-xl font-black text-red-500">₹{safeLoss.toLocaleString('en-IN')}</p>
        </div>
        <div className="text-right">
          <p className="text-[10px] font-black text-muted uppercase">Loss Rate</p>
          <p className="text-xl font-black text-foreground">
            {safeSales > 0 ? ((safeLoss / safeSales) * 100).toFixed(1) : '0.0'}%
          </p>
        </div>
      </div>
    </div>
  );
};

export default NegotiationChart;