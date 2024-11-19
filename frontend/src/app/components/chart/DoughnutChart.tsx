// components/DoughnutChart.tsx
import React, { useEffect, useState } from 'react';
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { generateColor } from '../../../../utils/colorUtils';  // Import generateColor

ChartJS.register(ArcElement, Tooltip, Legend);

interface DoughnutChartProps {
  data: Array<{ label: string; value: number }>;
}

const DoughnutChart: React.FC<DoughnutChartProps> = ({ data }) => {
  const [chartData, setChartData] = useState<{
    labels: string[];
    datasets: Array<{
      label: string;
      data: number[];
      backgroundColor: string[];
      hoverOffset: number;
    }>;
  } | null>(null);

  useEffect(() => {
    const labels = data.map((item) => item.label);
    const values = data.map((item) => item.value);
    const backgroundColors = labels.map((label) => generateColor(label)); // Gunakan generateColor

    setChartData({
      labels,
      datasets: [
        {
          label: 'Chart Data',
          data: values,
          backgroundColor: backgroundColors,
          hoverOffset: 4,
        },
      ],
    });
  }, [data]);

  return chartData ? <Doughnut data={chartData} /> : null;
};

export default DoughnutChart;
