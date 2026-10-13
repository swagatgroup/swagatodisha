import React from 'react';
import { Chart } from 'react-google-charts';
import { useDarkMode } from '../../contexts/DarkModeContextSimple';

const PaymentPieChart = ({ paymentStats, onSectionClick, title = "Payment Status Overview" }) => {
  const { isDarkMode } = useDarkMode();

  const completed = paymentStats?.completed || 0;
  const partial = paymentStats?.partial || 0;
  const pending = paymentStats?.pending || 0;
  const overdue = paymentStats?.overdue || 0;
  const total = completed + partial + pending + overdue;

  const data = [
    ['Payment Status', 'Students'],
    ['Completed', completed],
    ['Partial', partial],
    ['Pending', pending],
    ['Overdue', overdue],
  ];

  const colors = ['#22C55E', '#EAB308', '#3B82F6', '#EF4444'];
  const filterKeys = ['COMPLETED', 'PARTIAL', 'PENDING', 'OVERDUE'];

  const textColor = isDarkMode ? '#F3F4F6' : '#1f2937';
  const legendColor = isDarkMode ? '#D1D5DB' : '#4b5563';

  const options = {
    title: title,
    is3D: true,
    backgroundColor: 'transparent',
    colors: colors,
    chartArea: { width: '90%', height: '80%' },
    legend: { position: 'bottom', textStyle: { color: legendColor, fontSize: 13 } },
    titleTextStyle: { color: textColor, fontSize: 16, bold: true },
    tooltip: { showColorCode: true },
  };

  const chartEvents = [
    {
      eventName: "select",
      callback: ({ chartWrapper }) => {
        const chart = chartWrapper.getChart();
        const selection = chart.getSelection();
        if (selection && selection.length === 1) {
          const [selectedItem] = selection;
          if (selectedItem && selectedItem.row !== undefined) {
            const filterKey = filterKeys[selectedItem.row];
            if (onSectionClick && filterKey) {
              onSectionClick(filterKey);
            }
          }
        }
      }
    }
  ];

  return (
    <div className="bg-white dark:bg-[#231A2E] p-6 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 mt-6 flex flex-col justify-center items-center h-80">
      {total === 0 ? (
        <div className="flex flex-col items-center justify-center text-gray-400 text-sm h-full">
          <p className="font-semibold text-gray-700 dark:text-gray-300 mb-2">{title}</p>
          <p className="text-gray-400 dark:text-gray-400">No payment records found for this session</p>
        </div>
      ) : (
        <Chart
          chartType="PieChart"
          data={data}
          options={options}
          width={"100%"}
          height={"300px"}
          chartEvents={chartEvents}
        />
      )}
    </div>
  );
};

export default PaymentPieChart;
