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
import Image from 'next/image';

const timeRanges = ['24H', '1W', '1M', '1Y'];

const mockData = {
  '24H': [
    { time: '01:00', price: 1.01 },
    { time: '06:00', price: 1.03 },
    { time: '12:00', price: 1.00 },
    { time: '18:00', price: 1.04 },
  ],
  '1W': [
    { time: 'Mon', price: 1.01 },
    { time: 'Tue', price: 1.02 },
    { time: 'Wed', price: 1.00 },
    { time: 'Thu', price: 1.05 },
    { time: 'Fri', price: 1.03 },
  ],
  '1M': [
    { time: 'Week 1', price: 1.02 },
    { time: 'Week 2', price: 1.03 },
    { time: 'Week 3', price: 1.01 },
    { time: 'Week 4', price: 1.04 },
  ],
  '1Y': [
    { time: 'Q1', price: 1.01 },
    { time: 'Q2', price: 1.06 },
    { time: 'Q3', price: 1.03 },
    { time: 'Q4', price: 1.05 },
  ],
};

const formattedDate = new Intl.DateTimeFormat('en-US', {
  month: 'short',     // Apr
  day: 'numeric',     // 27
  year: 'numeric',    // 2023
  hour: 'numeric',    // 1
  minute: '2-digit',  // 00
  hour12: false,      // Optional: 24hr format
  timeZone: 'UTC',
}).format(new Date());

export default function SymbolChartCard() {
  const [range, setRange] = useState('24H');

  return (
    <div className="bg-white shadow-md rounded-xl p-6 w-full">
      {/* Header */}
        <div>
          <p className="flex gap-2 items-center text-base font-bold leading-[24px]">
            <Image src="/logo_big.png" width={24} height={24} alt='logo'/>
            RWA / USDC</p>
        </div>
      <div className="flex justify-between items-start mb-4 mt-4">
        <div>
          <p className='font-bold text-[24px] leading-[30px]'>$100</p>
          <p className="text-[14px] text-gray-300 mt-2">{formattedDate}</p>
        </div>
        <div className="flex gap-2">
          {timeRanges.map((r) => (
            <button
              key={r}
              onClick={() => setRange(r)}
              className={`px-3 py-1 rounded-full text-sm ${
                r === range
                  ? 'bg-[#0A1339] text-white '
                  : 'bg-[#D9DCE7]  text-gray-600 hover:border-[#0A1339] hover:text-[#0A1339]'
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
