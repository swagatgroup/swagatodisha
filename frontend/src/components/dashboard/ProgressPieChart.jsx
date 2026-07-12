import React from 'react';
import { Chart } from 'react-google-charts';

const ProgressPieChart = ({ pending, approved, complete }) => {
  const data = [
    ['Status', 'Number of Applications'],
    ['Pending', pending || 0],
    ['Approved', approved || 0],
    ['Complete', complete || 0],
  ];

  const options = {
    title: 'Overall Growth Progress',
    is3D: true,
    backgroundColor: 'transparent',
    colors: ['#eab308', '#22c55e', '#a855f7'], // Yellow, Green, Purple
    chartArea: { width: '90%', height: '80%' },
    legend: { position: 'bottom', textStyle: { color: '#4b5563', fontSize: 14 } },
    titleTextStyle: { color: '#1f2937', fontSize: 18, bold: true },
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 mt-6 flex justify-center items-center h-80">
      <Chart
        chartType="PieChart"
        data={data}
        options={options}
        width={"100%"}
        height={"300px"}
      />
    </div>
  );
};

export default ProgressPieChart;
