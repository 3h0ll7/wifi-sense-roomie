import { useMemo } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, ReferenceArea,
} from 'recharts';
import type { ChartDataPoint } from '@/types/wifi-motion';

interface SignalChartProps {
  data: ChartDataPoint[];
  threshold: number;
}

const SignalChart = ({ data, threshold }: SignalChartProps) => {
  const motionRegions = useMemo(() => {
    const regions: { start: number; end: number }[] = [];
    let regionStart: number | null = null;

    data.forEach((point, i) => {
      if (point.motionDetected && regionStart === null) {
        regionStart = point.time;
      } else if (!point.motionDetected && regionStart !== null) {
        regions.push({ start: regionStart, end: data[i - 1].time });
        regionStart = null;
      }
    });

    if (regionStart !== null) {
      regions.push({ start: regionStart, end: data[data.length - 1].time });
    }

    return regions;
  }, [data]);

  return (
    <div className="w-full h-[350px]">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 10, right: 20, left: 10, bottom: 10 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(0 0% 13.3%)" />
          <XAxis
            dataKey="time"
            stroke="hsl(0 0% 33%)"
            tick={{ fill: 'hsl(0 0% 53%)', fontSize: 10, fontFamily: 'JetBrains Mono' }}
            label={{ value: 'Time (s)', position: 'insideBottom', offset: -5, fill: 'hsl(0 0% 53%)', fontSize: 10 }}
          />
          <YAxis
            domain={[-80, -30]}
            stroke="hsl(0 0% 33%)"
            tick={{ fill: 'hsl(0 0% 53%)', fontSize: 10, fontFamily: 'JetBrains Mono' }}
            label={{ value: 'dBm', angle: -90, position: 'insideLeft', fill: 'hsl(0 0% 53%)', fontSize: 10 }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'hsl(0 0% 6.7%)',
              border: '1px solid hsl(0 0% 13.3%)',
              borderRadius: '6px',
              fontFamily: 'JetBrains Mono',
              fontSize: '11px',
              color: 'hsl(0 0% 88%)',
            }}
            labelFormatter={(v) => `${v}s`}
          />

          {motionRegions.map((region, i) => (
            <ReferenceArea
              key={i}
              x1={region.start}
              x2={region.end}
              y1={-80}
              y2={-30}
              fill="hsl(40 100% 50%)"
              fillOpacity={0.08}
              strokeOpacity={0}
            />
          ))}

          <ReferenceLine
            y={threshold}
            stroke="hsl(60 100% 50%)"
            strokeDasharray="6 4"
            strokeWidth={1.5}
            label={{
              value: 'Threshold',
              position: 'right',
              fill: 'hsl(60 100% 50%)',
              fontSize: 10,
              fontFamily: 'JetBrains Mono',
            }}
          />

          <Line
            type="monotone"
            dataKey="rssi"
            stroke="hsl(0 100% 63%)"
            strokeWidth={2}
            dot={false}
            animationDuration={0}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default SignalChart;
