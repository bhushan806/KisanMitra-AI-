import React from 'react';
import { ComposedChart, Line, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from 'recharts';

const ForecastChart = ({ data }) => {
  if (!data || data.length === 0) return null;

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-4 border border-gray-200 shadow-lg rounded-xl">
          <p className="font-bold text-gray-800 mb-2">{label}</p>
          <p className="text-sm text-gray-600">
            <span className="inline-block w-3 h-3 rounded-full bg-accent mr-2"></span>
            Predicted: <span className="font-mono font-bold">₹{payload[0].value.toFixed(2)}</span>
          </p>
          {payload[1] && payload[2] && (
            <p className="text-xs text-gray-500 mt-2 border-t pt-2">
              Confidence Range: <br/>
              <span className="font-mono">₹{payload[1].value.toFixed(0)} - ₹{payload[2].value.toFixed(0)}</span>
            </p>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full h-[400px]">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={data} margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" vertical={false} />
          <XAxis 
            dataKey="date" 
            tickFormatter={(tick) => {
              const date = new Date(tick);
              return `${date.getDate()} ${date.toLocaleString('default', { month: 'short' })}`;
            }}
            stroke="#9CA3AF"
            fontSize={12}
            tickLine={false}
            axisLine={false}
            dy={10}
          />
          <YAxis 
            tickFormatter={(tick) => `₹${tick}`} 
            stroke="#9CA3AF" 
            fontSize={12}
            tickLine={false}
            axisLine={false}
            dx={-10}
            domain={['auto', 'auto']}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend wrapperStyle={{ paddingTop: '20px' }} />
          
          <Area type="monotone" dataKey="upper" fill="#1B6B3A" stroke="none" fillOpacity={0.05} legendType="none" />
          <Area type="monotone" dataKey="lower" fill="#ffffff" stroke="none" fillOpacity={1} legendType="none" />
          
          <Line 
            type="monotone" 
            dataKey="price" 
            name="Predicted Price" 
            stroke="#F59E0B" 
            strokeWidth={3} 
            dot={{ r: 4, fill: "#F59E0B", strokeWidth: 2, stroke: "#fff" }} 
            activeDot={{ r: 6 }} 
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ForecastChart;
