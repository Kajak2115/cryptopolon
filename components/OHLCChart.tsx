import React from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

interface OHLCChartProps {
  data: { t: number; o: number; h: number; l: number; c: number }[];
  height: number;
  last?: number;
}

const OHLCChart: React.FC<OHLCChartProps> = ({ data, height, last }) => {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={data}>
        <XAxis dataKey="t" tickFormatter={(t) => new Date(t).toLocaleTimeString()} />
        <YAxis domain={['auto', 'auto']} />
        <Tooltip />
        <Line type="monotone" dataKey="c" stroke="#8884d8" dot={false} />
        {last && <Line type="monotone" dataKey={() => last} stroke="#ff7300" dot={false} />}
      </LineChart>
    </ResponsiveContainer>
  );
};

export default OHLCChart;