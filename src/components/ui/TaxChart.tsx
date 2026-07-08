'use client'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'

interface Props {
  chartData: Array<{ month: string; cgst: number; sgst: number; igst: number; cess: number; revenue: number }>
  pieData: Array<{ name: string; value: number; color: string }>
}

const fmt = (v: number) => `₹${(v / 1000).toFixed(0)}K`

export default function TaxChart({ chartData, pieData }: Props) {
  return (
    <div className="grid grid-cols-3 gap-6">
      {/* Bar chart - monthly tax */}
      <div className="col-span-2 bg-[var(--surface)] border border-[var(--border)] rounded-xl p-6">
        <h2 className="font-semibold text-[var(--ink)] mb-6">Monthly Tax Collection</h2>
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={chartData} barSize={20}>
            <XAxis dataKey="month" tick={{ fill: '#6B7280', fontSize: 12 }} axisLine={false} tickLine={false} />
            <YAxis tickFormatter={fmt} tick={{ fill: '#6B7280', fontSize: 12 }} axisLine={false} tickLine={false} />
            <Tooltip
              contentStyle={{ background: '#1C2128', border: '1px solid #30363D', borderRadius: 8 }}
              labelStyle={{ color: '#E6EDF3', fontWeight: 600 }}
              itemStyle={{ color: '#8B949E' }}
              formatter={(v) => [`₹${Number(v).toLocaleString('en-IN')}`, '']}
            />
            <Bar dataKey="cgst" name="CGST" stackId="tax" fill="#2DD4BF" radius={[0, 0, 0, 0]} />
            <Bar dataKey="sgst" name="SGST" stackId="tax" fill="#14B8A6" />
            <Bar dataKey="igst" name="IGST" stackId="tax" fill="#58A6FF" />
            <Bar dataKey="cess" name="Cess" stackId="tax" fill="#F59E0B" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Pie chart - tax distribution */}
      <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-6">
        <h2 className="font-semibold text-[var(--ink)] mb-4">Tax Distribution</h2>
        {pieData.length === 0 ? (
          <div className="flex items-center justify-center h-40 text-[var(--ink-faint)] text-sm">No data</div>
        ) : (
          <>
            <ResponsiveContainer width="100%" height={160}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={45} outerRadius={70} paddingAngle={3} dataKey="value">
                  {pieData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                </Pie>
                <Tooltip
                  contentStyle={{ background: '#1C2128', border: '1px solid #30363D', borderRadius: 8 }}
                  formatter={(v) => [`₹${Number(v).toLocaleString('en-IN')}`, '']}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-2 mt-2">
              {pieData.map(d => (
                <div key={d.name} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ background: d.color }} />
                    <span className="text-[var(--ink-soft)]">{d.name}</span>
                  </div>
                  <span className="font-mono text-[var(--ink)] text-xs">₹{d.value.toLocaleString('en-IN')}</span>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
