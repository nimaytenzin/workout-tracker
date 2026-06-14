import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import type { WeightChartPoint } from '@/types'
import { USERS } from '@/data/users'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface WeightChartProps {
  data: WeightChartPoint[]
  title?: string
}

export function WeightChart({ data, title = 'Body Weight Trend' }: WeightChartProps) {
  if (data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="py-8 text-center text-sm text-muted-foreground">
            Log daily weight to see your progress chart.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">{title}</CardTitle>
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
                domain={['dataMin - 2', 'dataMax + 2']}
                unit=" kg"
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1a2332',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '0.75rem',
                  fontSize: 12,
                  color: '#f1f5f9',
                }}
                formatter={(value) => [`${value} kg`, '']}
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
      </CardContent>
    </Card>
  )
}
