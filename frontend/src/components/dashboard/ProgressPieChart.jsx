import React from 'react';
import { Chart } from 'react-google-charts';
import { useDarkMode } from '../../contexts/DarkModeContextSimple';

const ProgressPieChart = ({ chartData = [], onSectionClick }) => {
  const { isDarkMode } = useDarkMode();

  // Extract data and colors
  const data = [['Status', 'Number of Applications']];
  const colors = [];
  const filterKeys = [];

  chartData.forEach(item => {
    // Only add sections with value > 0 so they show up, 
    // or just add them all, but typically pie charts ignore 0 anyway.
    data.push([item.label, item.value || 0]);
    colors.push(item.color);
    filterKeys.push(item.filterKey);
  });

  const textColor = isDarkMode ? '#F3F4F6' : '#1f2937';
  const legendColor = isDarkMode ? '#D1D5DB' : '#4b5563';

  const options = {
    title: 'Overall Growth Progress',
    is3D: true,
    backgroundColor: 'transparent',
    colors: colors,
    chartArea: { width: '90%', height: '80%' },
    legend: { position: 'bottom', textStyle: { color: legendColor, fontSize: 14 } },
    titleTextStyle: { color: textColor, fontSize: 18, bold: true },
    tooltip: { showColorCode: true },
  };

  const chartEvents = [
    {
      eventName: "select",
      callback: ({ chartWrapper }) => {
        const chart = chartWrapper.getChart();
        const selection = chart.getSelection();
        if (selection.length === 1) {
          const [selectedItem] = selection;
          // row is 0-indexed relative to data rows (omitting header)
          const filterKey = filterKeys[selectedItem.row];
          if (onSectionClick && filterKey) {
            onSectionClick(filterKey);
          }
        }
      }
    }
  ];

  return (
    <div className="bg-white dark:bg-[#2A1E2E] p-6 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 mt-6 flex justify-center items-center h-80">
      <Chart
        chartType="PieChart"
        data={data}
        options={options}
        width={"100%"}
        height={"300px"}
        chartEvents={chartEvents}
      />
    </div>
  );
};

export default ProgressPieChart;
