'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const CHART_COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#06B6D4', '#84CC16'];

const BarTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white px-3 py-2 shadow-lg rounded-lg border border-gray-200">
        <p className="text-sm font-medium text-gray-900">{payload[0].payload.name}</p>
        <p className="text-sm text-gray-600">{payload[0].value} articles</p>
      </div>
    );
  }
  return null;
};

export default function CountriesChart({ data, onCountryClick }) {
  const handleBarClick = (data) => {
    if (data && data.id) {
      onCountryClick(data.id.toString());
    }
  };

  return (
    <div className="bg-white rounded-xl p-4 border border-gray-100">
      <h3 className="text-sm font-semibold text-gray-700 mb-4">Top Countries</h3>
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={data} layout="vertical" margin={{ left: 10, right: 20 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={true} vertical={false} />
          <XAxis 
            type="number" 
            tick={{ fontSize: 11, fill: '#6B7280' }} 
            axisLine={{ stroke: '#E5E7EB' }} 
            tickLine={false} 
          />
          <YAxis 
            type="category" 
            dataKey="name" 
            tick={{ fontSize: 11, fill: '#6B7280' }} 
            axisLine={false} 
            tickLine={false} 
            width={80} 
          />
          <Tooltip content={<BarTooltip />} />
          <Bar 
            dataKey="count" 
            radius={[0, 4, 4, 0]} 
            cursor="pointer" 
            onClick={handleBarClick}
          >
            {data.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={CHART_COLORS[index % CHART_COLORS.length]} 
                className="hover:opacity-80 transition-opacity" 
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      <p className="text-xs text-gray-400 mt-2 text-center">Click on a bar to filter by country</p>
    </div>
  );
}