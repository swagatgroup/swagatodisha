import {useState, useEffect} from 'react';
import { motion } from 'framer-motion';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

const InteractivePieChart = ({ data, title, onSegmentClick, colors = ['#8B5CF6', '#06B6D4', '#10B981', '#F59E0B', '#EF4444'] }) => {
    const [hoveredSegment, setHoveredSegment] = useState(null);
    const [selectedSegment, setSelectedSegment] = useState(null);

    const handleSegmentClick = (data, index) => {
        setSelectedSegment(data);
        if (onSegmentClick) {
            onSegmentClick(data, index);
        }
    };

    const handleSegmentHover = (data, index) => {
        setHoveredSegment(data);
    };

    const handleSegmentLeave = () => {
        setHoveredSegment(null);
    };

    const CustomTooltip = ({ active, payload }) => {
        if (active && payload && payload.length) {
            const data = payload[0].payload;
            return (
                <div className="bg-white dark:bg-[#2A1E2E] p-3 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg">
                    <p className="font-medium text-gray-900 dark:text-gray-100">{data.name}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                        Value: <span className="font-medium dark:text-white">{data.value}</span>
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                        Percentage: <span className="font-medium dark:text-white">{((data.value / data.total) * 100).toFixed(1)}%</span>
                    </p>
                </div>
            );
        }
        return null;
    };

    const CustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, name }) => {
        if (percent < 0.05) return null; // Don't show labels for segments less than 5%

        const RADIAN = Math.PI / 180;
        const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
        const x = cx + radius * Math.cos(-midAngle * RADIAN);
        const y = cy + radius * Math.sin(-midAngle * RADIAN);

        return (
            <text
                x={x}
                y={y}
                fill="white"
                textAnchor={x > cx ? 'start' : 'end'}
                dominantBaseline="central"
                fontSize={12}
                fontWeight="bold"
            >
                {`${(percent * 100).toFixed(0)}%`}
            </text>
        );
    };

    return (
        <div className="bg-white dark:bg-[#2A1E2E] rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h3>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                    Total: {data.reduce((sum, item) => sum + item.value, 0)}
                </div>
            </div>

            <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={data}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={CustomLabel}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="value"
                            onClick={handleSegmentClick}
                            onMouseEnter={handleSegmentHover}
                            onMouseLeave={handleSegmentLeave}
                        >
                            {data.map((entry, index) => (
                                <Cell
                                    key={`cell-${index}`}
                                    fill={colors[index % colors.length]}
                                    stroke={hoveredSegment === entry ? '#374151' : 'none'}
                                    strokeWidth={hoveredSegment === entry ? 2 : 0}
                                    style={{
                                        filter: selectedSegment === entry ? 'brightness(1.1)' : 'none',
                                        cursor: 'pointer'
                                    }}
                                />
                            ))}
                        </Pie>
                        <Tooltip content={<CustomTooltip />} />
                        <Legend wrapperStyle={{ color: '#9CA3AF' }} />
                    </PieChart>
                </ResponsiveContainer>
            </div>

            {/* Legend with clickable items */}
            <div className="mt-4 space-y-2">
                {data.map((item, index) => (
                    <motion.div
                        key={item.name}
                        className={`flex items-center justify-between p-2 rounded-lg cursor-pointer transition-colors ${selectedSegment === item ? 'bg-gray-100 dark:bg-gray-700' : 'hover:bg-gray-50 dark:hover:bg-[#1A1212]'
                            }`}
                        onClick={() => handleSegmentClick(item, index)}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                    >
                        <div className="flex items-center space-x-2">
                            <div
                                className="w-3 h-3 rounded-full"
                                style={{ backgroundColor: colors[index % colors.length] }}
                            />
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{item.name}</span>
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                            {item.value} ({((item.value / data.reduce((sum, d) => sum + d.value, 0)) * 100).toFixed(1)}%)
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
};

export default InteractivePieChart;
