'use client';

import { useState } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';

const timeRanges = ['24h', '1w', '1m', '1y'];

const mockData = {
  '24h': [
    { time: '01:00', price: 1.01 },
    { time: '06:00', price: 1.03 },
    { time: '12:00', price: 1.00 },
    { time: '18:00', price: 1.04 },
  ],
  '1w': [
    { time: 'Mon', price: 1.01 },
    { time: 'Tue', price: 1.02 },
    { time: 'Wed', price: 1.00 },
    { time: 'Thu', price: 1.05 },
    { time: 'Fri', price: 1.03 },
  ],
  '1m': [
    { time: 'Week 1', price: 1.02 },
    { time: 'Week 2', price: 1.03 },
    { time: 'Week 3', price: 1.01 },
    { time: 'Week 4', price: 1.04 },
  ],
  '1y': [
    { time: 'Q1', price: 1.01 },
    { time: 'Q2', price: 1.06 },
    { time: 'Q3', price: 1.03 },
    { time: 'Q4', price: 1.05 },
  ],
};

export default function SymbolChartCard() {
  const [range, setRange] = useState('24h');

  return (
    <div className="bg-white shadow-md rounded-xl p-6 w-full">
      {/* Header */}
      <div className="flex justify-between items-start mb-4">
        <div>
          <h2 className="text-xl font-semibold text-heading">RWA / USDC</h2>
          <p className="text-sm text-gray-500">{new Date().toLocaleDateString()}</p>
        </div>

        <div className="flex gap-2">
          {timeRanges.map((r) => (
            <button
              key={r}
              onClick={() => setRange(r)}
              className={`px-3 py-1 rounded-full text-sm border ${
                r === range
                  ? 'bg-green text-white border-green'
                  : 'bg-transparent border-gray-300 text-gray-600 hover:border-green hover:text-green'
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* Chart */}
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={mockData[range]}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="time" />
            <YAxis domain={['dataMin - 0.01', 'dataMax + 0.01']} />
            <Tooltip />
            <Line
              type="monotone"
              dataKey="price"
              stroke="#24BC48"
              strokeWidth={2}
              dot={{ r: 4 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
