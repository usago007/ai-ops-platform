import React, { useState, useEffect, useRef } from 'react'
import { Card, Tooltip, Typography } from 'antd'
import { ArrowUpOutlined, ArrowDownOutlined } from '@ant-design/icons'
import styles from './MetricCard.module.css'

const { Text } = Typography

interface MetricCardProps {
  title: string
  value: number
  suffix?: string
  prefix?: React.ReactNode
  trend?: { value: number; positive: boolean }
  animate?: boolean
  tooltip?: string
  duration?: number
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  suffix = '',
  prefix,
  trend,
  animate = true,
  tooltip,
  duration = 1500,
}) => {
  const [displayValue, setDisplayValue] = useState(0)
  const [hovered, setHovered] = useState(false)
  const animationRef = useRef<number | null>(null)

  useEffect(() => {
    if (!animate) {
      setDisplayValue(value)
      return
    }

    const startTime = Date.now()
    const animateNumber = () => {
      const elapsed = Date.now() - startTime
      const progress = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setDisplayValue(Math.floor(eased * value))

      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animateNumber)
      } else {
        setDisplayValue(value)
      }
    }

    animationRef.current = requestAnimationFrame(animateNumber)

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [value, animate, duration])

  const content = (
    <Card
      className={styles.card}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div className={styles.inner}>
        {prefix && <div className={styles.prefix}>{prefix}</div>}
        <div className={styles.value}>
          {displayValue.toLocaleString()}{suffix}
        </div>
        <div className={styles.title}>{title}</div>
        {trend && (
          <div className={`${styles.trend} ${trend.positive ? styles.positive : styles.negative}`}>
            {trend.positive ? <ArrowUpOutlined /> : <ArrowDownOutlined />}
            {trend.value}%
          </div>
        )}
      </div>
    </Card>
  )

  if (tooltip) {
    return (
      <Tooltip title={tooltip} open={hovered}>
        {content}
      </Tooltip>
    )
  }

  return content
}
