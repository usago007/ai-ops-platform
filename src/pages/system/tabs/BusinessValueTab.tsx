import React, { useMemo } from 'react'
import { Card, Row, Col } from 'antd'
import {
  RocketOutlined,
  ClockCircleOutlined,
  TeamOutlined,
  ThunderboltOutlined,
  HeartOutlined,
} from '@ant-design/icons'
import { Column, Line } from '@ant-design/charts'
import { MetricCard } from '../../../components/MetricCard'
import { CHART_COLORS, CHART_LABEL_COLOR, STATUS_COLORS } from '../../../styles/chartColors'
import styles from '../SystemStatusPage.module.css'

export const BusinessValueTab: React.FC = () => {
  const comparisonData = useMemo(
    () => [
      { metric: '处理速度', type: '人工处理', value: 45 },
      { metric: '处理速度', type: 'AI处理', value: 12 },
      { metric: '准确率', type: '人工处理', value: 82 },
      { metric: '准确率', type: 'AI处理', value: 96 },
      { metric: '单笔成本', type: '人工处理', value: 35 },
      { metric: '单笔成本', type: 'AI处理', value: 8 },
    ],
    [],
  )

  const comparisonConfig = useMemo(
    () => ({
      data: comparisonData,
      xField: 'metric',
      yField: 'value',
      seriesField: 'type',
      color: ({ type }: { type: string }) => (type === '人工处理' ? STATUS_COLORS.error : STATUS_COLORS.success),
      columnStyle: {
        radius: [4, 4, 0, 0],
      },
      label: {
        position: 'top' as const,
        style: {
          fill: 'rgba(0,0,0,0.06)',
          fontSize: 11,
        },
      },
      xAxis: {
        label: {
          style: {
            fill: CHART_LABEL_COLOR,
            fontSize: 12,
          },
        },
      },
      yAxis: {
        label: {
          style: {
            fill: CHART_LABEL_COLOR,
          },
        },
      },
      legend: {
        position: 'top-right' as const,
        itemName: {
          style: {
            fill: 'rgba(0,0,0,0.06)',
          },
        },
      },
      animation: {
        appear: {
          animation: 'scale-in-y' as const,
          duration: 600,
        },
      },
    }),
    [comparisonData],
  )

  const roiData = useMemo(
    () => [
      { month: '2025-11', savings: 4200, cumulative: 4200 },
      { month: '2025-12', savings: 6800, cumulative: 11000 },
      { month: '2026-01', savings: 8500, cumulative: 19500 },
      { month: '2026-02', savings: 9200, cumulative: 28700 },
      { month: '2026-03', savings: 10400, cumulative: 39100 },
      { month: '2026-04', savings: 11220, cumulative: 50320 },
    ],
    [],
  )

  const roiConfig = useMemo(
    () => ({
      data: roiData,
      xField: 'month',
      yField: 'cumulative',
      smooth: true,
      color: CHART_COLORS[1],
      point: { size: 4, shape: 'circle' },
      label: {
        style: {
          fill: CHART_LABEL_COLOR,
        },
      },
      xAxis: {
        label: {
          autoRotate: false,
          autoHide: { type: 'equidistance', cfg: { minGap: 6 } },
          style: {
            fill: CHART_LABEL_COLOR,
          },
        },
      },
      yAxis: {
        label: {
          style: {
            fill: CHART_LABEL_COLOR,
          },
        },
      },
      lineStyle: {
        lineWidth: 3,
      },
      areaStyle: {
        fill: 'l(270) 0:rgba(29, 78, 216, 0.3) 1:rgba(29, 78, 216, 0)',
      },
      tooltip: {
        formatter: (datum: { month: string; savings: number; cumulative: number }) => ({
          name: '累计节省',
          value: `$${datum.cumulative.toLocaleString()}`,
        }),
      },
    }),
    [roiData],
  )

  const savingsData = useMemo(
    () => [
      { category: '人力成本', before: 18500, after: 6500 },
      { category: '错误修正', before: 3200, after: 800 },
      { category: '培训成本', before: 2100, after: 400 },
      { category: '时间成本', before: 5800, after: 1900 },
    ],
    [],
  )

  const savingsConfig = useMemo(
    () => ({
      data: savingsData.flatMap((d) => [
        { category: d.category, type: '引入前', value: d.before },
        { category: d.category, type: '引入后', value: d.after },
      ]),
      xField: 'category',
      yField: 'value',
      seriesField: 'type',
      isGroup: true,
      color: ({ type }: { type: string }) => (type === '引入前' ? STATUS_COLORS.warning : STATUS_COLORS.success),
      columnStyle: {
        radius: [4, 4, 0, 0],
      },
      label: {
        position: 'top' as const,
        style: {
          fill: 'rgba(0,0,0,0.06)',
          fontSize: 11,
        },
      },
      xAxis: {
        label: {
          style: {
            fill: CHART_LABEL_COLOR,
            fontSize: 12,
          },
        },
      },
      yAxis: {
        label: {
          style: {
            fill: CHART_LABEL_COLOR,
          },
        },
      },
      legend: {
        position: 'top-right' as const,
        itemName: {
          style: {
            fill: 'rgba(0,0,0,0.06)',
          },
        },
      },
    }),
    [savingsData],
  )

  return (
    <>
      <Row gutter={[16, 16]}>
        <Col span={5}>
          <MetricCard
            title="询价处理效率"
            value={73}
            suffix="%"
            prefix={<RocketOutlined />}
            trend="up"
            trendLabel="效率提升"
            color={CHART_COLORS[1]}
            comparison="人工 45min → AI 12min"
          />
        </Col>
        <Col span={5}>
          <MetricCard
            title="平均响应时间"
            value={85}
            suffix="%"
            prefix={<ClockCircleOutlined />}
            trend="down"
            trendLabel="响应时间缩短"
            color={CHART_COLORS[2]}
            comparison="人工 4h → AI 30min"
          />
        </Col>
        <Col span={4}>
          <MetricCard
            title="人工工作量减少"
            value={68}
            suffix="%"
            prefix={<TeamOutlined />}
            trend="down"
            trendLabel="工作量减少"
            color={CHART_COLORS[3]}
            comparison="释放 12 人/月产能"
          />
        </Col>
        <Col span={5}>
          <MetricCard
            title="月度处理量"
            value="2,450"
            prefix={<ThunderboltOutlined />}
            trend="up"
            trendLabel="环比增长 18%"
            color={CHART_COLORS[4]}
            comparison="日均处理 82 笔"
          />
        </Col>
        <Col span={5}>
          <MetricCard
            title="客户满意度"
            value={94.2}
            suffix="%"
            prefix={<HeartOutlined />}
            trend="up"
            trendLabel="持续提升"
            color={CHART_COLORS[5]}
            comparison="NPS 得分 +42"
          />
        </Col>
      </Row>

      <Row gutter={16} className={styles.rowMarginTop}>
        <Col span={12}>
          <Card title="人工 vs AI 处理对比" className={styles.chartCard}>
            <div className={styles.chartContainer}>
              <Column {...comparisonConfig} containerStyle={{ height: 300 }} />
            </div>
          </Card>
        </Col>
        <Col span={12}>
          <Card title="累计节省趋势" className={styles.chartCard}>
            <div className={styles.chartContainer}>
              <Line {...roiConfig} containerStyle={{ height: 300 }} />
            </div>
          </Card>
        </Col>
      </Row>

      <Row gutter={16} className={styles.rowMarginTop}>
        <Col span={8}>
          <Card title="成本效益分析" className={styles.chartCard}>
            <div className={styles.costBenefitContent}>
              <div className={styles.costItem}>
                <div className={styles.costLabel}>AI 月度成本</div>
                <div className={`${styles.costValue} ${styles.costValueError}`}>$780</div>
              </div>
              <div className={styles.costDivider} />
              <div className={styles.costItem}>
                <div className={styles.costLabel}>人工成本节省</div>
                <div className={`${styles.costValue} ${styles.costValueSuccess}`}>$12,000</div>
              </div>
              <div className={styles.costDivider} />
              <div className={styles.costItem}>
                <div className={styles.costLabel}>净收益 / 月</div>
                <div className={styles.netBenefit}>$11,220</div>
              </div>
              <div className={styles.roiBadge}>
                <span className={styles.roiLabel}>ROI</span>
                <span className={styles.roiValue}>1,339%</span>
              </div>
            </div>
          </Card>
        </Col>
        <Col span={16}>
          <Card title="成本节约明细" className={styles.chartCard}>
            <div className={styles.chartContainer}>
              <Column {...savingsConfig} containerStyle={{ height: 300 }} />
            </div>
          </Card>
        </Col>
      </Row>
    </>
  )
}
