import React from 'react'
import { BarChart, Bar, Cell, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts'

interface FunnelDataItem {
  stage: string
  count: number
}

interface FunnelChartProps {
  data: FunnelDataItem[]
  colors: string[]
  height?: number
}

const CustomBarShape = (props: { x: number; y: number; width: number; height: number; fill: string; payload: { percent: number } }) => {
  const { x, y, width, height: barHeight, fill, payload } = props
  const barWidth = width * payload.percent
  const xOffset = (width - barWidth) / 2

  return (
    <path
      d={`M${x + xOffset},${y} L${x + xOffset + barWidth},${y} L${x + width},${y + barHeight} L${x},${y + barHeight} Z`}
      fill={fill}
      opacity={0.85}
    />
  )
}

export const FunnelChart: React.FC<FunnelChartProps> = ({ data, colors, height = 300 }) => {
  if (data.length === 0) {
    return (
      <div style={{ height, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-tertiary)', fontSize: 14 }}>
        暂无转化数据
      </div>
    )
  }

  const maxCount = Math.max(...data.map(d => d.count))

  const barData = data.map((d, i) => ({
    ...d,
    percent: d.count / maxCount,
    fill: colors[i % colors.length],
  }))

  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart
        data={barData}
        layout="vertical"
        barCategoryGap={8}
        margin={{ top: 10, right: 10, left: 80, bottom: 10 }}
      >
        <XAxis type="number" hide />
        <YAxis type="category" dataKey="stage" tick={{ fill: 'var(--text-tertiary)' }} width={80} />
        <Tooltip
          formatter={(value: number) => [value.toLocaleString(), '数量']}
        />
        <Bar dataKey="count" shape={<CustomBarShape />}>
          {barData.map((entry, index) => (
            <Cell key={index} fill={entry.fill} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}
