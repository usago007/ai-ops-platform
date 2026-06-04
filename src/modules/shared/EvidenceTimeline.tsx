/**
 * EvidenceTimeline — 统一顺序事件时间线
 *
 * 替换 ROIOverviewPage 结果驱动/知识回流 List 和 ObservabilityPage 失败事件 List。
 */
import React from 'react'
import { Timeline, Tag, Space, Typography } from 'antd'
import type { TimelineItemProps } from 'antd'

const { Text } = Typography

export interface EvidenceItem {
  timestamp?: string
  title: string
  description?: string
  status?: 'positive' | 'negative' | 'neutral'
  tags?: { label: string; color?: string }[]
  onClick?: () => void
}

interface EvidenceTimelineProps {
  items: EvidenceItem[]
  emptyText?: string
}

const STATUS_COLOR: Record<string, string> = {
  positive: 'green',
  negative: 'red',
  neutral: 'blue',
}

export const EvidenceTimeline: React.FC<EvidenceTimelineProps> = ({
  items,
  emptyText = '暂无数据',
}) => {
  if (items.length === 0) {
    return <Text type="secondary">{emptyText}</Text>
  }

  const timelineItems: TimelineItemProps[] = items.map((item, i) => ({
    key: i,
    color: item.status ? STATUS_COLOR[item.status] : undefined,
    content: (
      <div
        onClick={item.onClick}
        style={item.onClick ? { cursor: 'pointer' } : undefined}
      >
        <Space orientation="vertical" size={2}>
          <Space size={4} wrap>
            <Text strong>{item.title}</Text>
            {item.tags?.map((tag, j) => (
              <Tag key={j} color={tag.color || 'default'}>{tag.label}</Tag>
            ))}
          </Space>
          {item.description && (
            <Text type="secondary">{item.description}</Text>
          )}
          {item.timestamp && (
            <Text type="secondary" style={{ fontSize: 'var(--font-size-sm)' }}>{item.timestamp}</Text>
          )}
        </Space>
      </div>
    ),
  }))

  return <Timeline items={timelineItems} />
}

export default EvidenceTimeline
