'use client';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis, Cell } from 'recharts';
import type { WeeklyOccupancy } from '@/lib/types';

export function OccupancyChart({ data }: { data: WeeklyOccupancy[] }) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={data} margin={{ top: 10, right: 8, left: -18, bottom: 0 }} barCategoryGap="28%">
        <CartesianGrid strokeDasharray="3 3" stroke="#ece5d6" vertical={false} />
        <XAxis dataKey="label" tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: '#7c918d', fontWeight: 600 }} />
        <YAxis domain={[0, 100]} tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: '#7c918d' }} unit="%" />
        <Tooltip
          cursor={{ fill: '#0d948810' }}
          contentStyle={{ borderRadius: 12, border: '1px solid #ece5d6', boxShadow: '0 8px 24px -12px rgba(19,33,31,0.3)', fontSize: 13 }}
          formatter={(v: number, _n, p: any) => [`${v}% (${p.payload.occupied}/${p.payload.total})`, 'Ocupación']}
          labelStyle={{ fontWeight: 700, color: '#13211f' }}
        />
        <Bar dataKey="occupancy" radius={[6, 6, 0, 0]} maxBarSize={46}>
          {data.map((d, i) => (
            <Cell key={i} fill={d.occupancy >= 75 ? '#0a766e' : d.occupancy >= 40 ? '#0d9488' : '#67d3c3'} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
