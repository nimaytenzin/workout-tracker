import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import type { BmiChartPoint } from '@/types'
import { USERS } from '@/data/users'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface BmiChartProps {
  data: BmiChartPoint[]
}

export function BmiChart({ data }: BmiChartProps) {
  if (data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">BMI Trend</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="py-8 text-center text-sm text-muted-foreground">
            Log daily weight to see BMI trends.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">BMI Trend</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis
                dataKey="label"
                tick={{ fontSize: 11 }}
                tickLine={false}
                axisLine={false}
                interval="preserveStartEnd"
              />
              <YAxis
                tick={{ fontSize: 11 }}
                tickLine={false}
                axisLine={false}
                domain={[16, 35]}
                unit=""
              />
              <ReferenceLine y={18.5} stroke="#94a3b8" strokeDasharray="4 4" label="" />
              <ReferenceLine y={25} stroke="#94a3b8" strokeDasharray="4 4" label="" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1a2332',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '0.75rem',
                  fontSize: 12,
                  color: '#f1f5f9',
                }}
                formatter={(value) => [typeof value === 'number' ? value.toFixed(1) : value, 'BMI']}
              />
              <Legend wrapperStyle={{ fontSize: 12, paddingTop: 12 }} />
              {USERS.map((user) => (
                <Line
                  key={user.id}
                  type="monotone"
                  dataKey={user.id}
                  name={user.name}
                  stroke={user.color}
                  strokeWidth={2}
                  dot={{ r: 3, fill: user.color }}
                  activeDot={{ r: 5 }}
                  connectNulls
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
        <p className="mt-2 text-center text-[10px] text-muted-foreground">
          Dashed lines: 18.5 (underweight) · 25 (overweight)
        </p>
      </CardContent>
    </Card>
  )
}
