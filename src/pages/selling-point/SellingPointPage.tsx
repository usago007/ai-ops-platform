import React, { useState, useEffect } from 'react'
import { Card, Tag, Space, Spin, Divider, Statistic, Row, Col, Button, Typography } from 'antd'
import { StarOutlined, ArrowUpOutlined, BulbOutlined, RocketOutlined } from '@/iconMap'
import { useParams, useNavigate } from 'react-router-dom'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { CapabilityBanner } from '../../components/CapabilityBanner/CapabilityBanner'
import { marketingService } from '../../services'
import styles from './SellingPointPage.module.css'
import formStyles from '../../styles/form.module.css'
import { CHART_COLORS, CHART_LABEL_COLOR } from '../../styles/chartColors'

const { Text, Title } = Typography

const SELLING_POINT_SCENES: Record<string, string[]> = {
  '高能效': ['落地页主标题', '产品详情页', '展会宣传海报'],
  '易安装': ['安装指南视频', '客服话术推荐', '短信营销'],
  '长寿命': ['品牌故事营销', '用户案例分享', '行业白皮书'],
}

interface SellingPointItem {
  text: string
  support: string
  ctr_impact: string
}

interface SellingPointData {
  core: SellingPointItem[]
  secondary: string[]
  ctr_comparison: {
    with_ai: number
    without_ai: number
    improvement: string
  }
}

export const SellingPointPage: React.FC = () => {
  const { productId } = useParams<{ productId: string }>()
  const navigate = useNavigate()
  const [data, setData] = useState<SellingPointData | null>(null)
  const [loading, setLoading] = useState(true)

  const loadData = async () => {
    try {
      const response = await marketingService.getSellingPoints()
      if (response.success) setData(response.data)
    } catch { console.error(e) }
    finally { setLoading(false) }
  }

  useEffect(() => {
    loadData()
  }, [productId])

  const handleGenerateContent = () => {
    const sellingPoints = data?.core?.map((sp: SellingPointItem) => sp.text).join('、') || ''
    navigate('/marketing/create', { state: { prefill: { note: `核心卖点: ${sellingPoints}` } } })
  }

  if (loading) {
    return <div className={styles.center}><Spin size="large" tip="AI 正在提炼卖点..." /></div>
  }

  if (!data) return <div className={styles.center}><Text type="secondary">暂无卖点数据</Text></div>

  const chartData = [
    { type: '第1周', '无AI卖点': 3.2, 'AI卖点': 3.5 },
    { type: '第2周', '无AI卖点': 3.2, 'AI卖点': 3.8 },
    { type: '第3周', '无AI卖点': 3.1, 'AI卖点': 4.2 },
    { type: '第4周', '无AI卖点': 3.2, 'AI卖点': 4.5 },
    { type: '第5周', '无AI卖点': 3.3, 'AI卖点': 4.8 },
  ]

  return (
    <div className={styles.container}>
      <CapabilityBanner
        title="🎯 卖点智能提炼能力说明"
        icon={<BulbOutlined />}
        capabilities={[
          '基于商品属性 + 竞品分析 + 历史转化数据',
          '提取 Top3 核心卖点 + N个辅助卖点',
          '预估 CTR 提升幅度: 30%~80%',
          '每个卖点提供数据支撑和应用场景建议',
        ]}
        limits={[
          '分析耗时：2-4 秒',
          '需要商品至少有 60% 的信息完整度',
        ]}
        storageKey="selling-point-banner-dismissed"
      />

      <div className={styles.header}>
        <Title level={3}>商品卖点智能提炼</Title>
        <Tag color="blue">SKU-1000 · PLC控制器 FX3U-64MT</Tag>
      </div>

      <Row gutter={[16, 16]}>
        <Col span={16}>
          <Card title={<span><StarOutlined className={styles.iconWarning} /> 核心卖点 (Top 3)</span>} className={styles.card}>
            <Space direction="vertical" className={formStyles.fullWidth} size="large">
              {data.core.map((sp: SellingPointItem, i: number) => (
                <Card key={i} size="small" className={styles.coreSellingCard}>
                  <div className={styles.coreRank}>#{i + 1}</div>
                  <div className={styles.coreText}>{sp.text}</div>
                  <Text type="secondary" className={styles.coreSupport}>{sp.support}</Text>
                  <Space className={styles.marginTopSm}>
                    <Tag color="green"><ArrowUpOutlined /> CTR {sp.ctr_impact}</Tag>
                    {SELLING_POINT_SCENES[sp.text.slice(0, 3)] && (
                      <Space size={4}>
                        {SELLING_POINT_SCENES[sp.text.slice(0, 3)].map((scene: string, j: number) => (
                          <Tag key={j} className={styles.smallTag}>{scene}</Tag>
                        ))}
                      </Space>
                    )}
                  </Space>
                </Card>
              ))}
            </Space>

            <Button type="primary" icon={<RocketOutlined />} block className={styles.marginTopMd} onClick={handleGenerateContent}>
              基于此卖点生成营销内容
            </Button>
          </Card>

          <Card title="辅助卖点" className={styles.card}>
            <div className={styles.tagCloud}>
              {data.secondary.map((sp: string, i: number) => (
                <Tag key={i} className={styles.secondaryTag}>{sp}</Tag>
              ))}
            </div>
          </Card>
        </Col>

        <Col span={8}>
          <Card title="CTR 提升对比" className={styles.card}>
            <Statistic title="AI卖点 CTR" value={data.ctr_comparison.with_ai} precision={1} suffix="%" className={styles.ctrStatValue} />
            <Statistic title="无AI卖点 CTR" value={data.ctr_comparison.without_ai} precision={1} suffix="%" className={styles.marginTopMd} />
            <Divider />
            <Title level={5} className={styles.titleMargin}>提升幅度</Title>
            <Statistic value={50} precision={0} suffix="%" className={styles.liftStatValue} prefix={<ArrowUpOutlined />} />
          </Card>

          <Card title="CTR 趋势对比" className={styles.card}>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                <XAxis dataKey="type" tick={{ fill: CHART_LABEL_COLOR }} />
                <YAxis tick={{ fill: CHART_LABEL_COLOR }} />
                <Tooltip formatter={(value: number) => [`${value.toFixed(1)}%`, 'CTR']} />
                <Legend />
                <Line type="monotone" dataKey="无AI卖点" stroke={CHART_LABEL_COLOR} dot={{ r: 5 }} activeDot={{ r: 7 }} />
                <Line type="monotone" dataKey="AI卖点" stroke={CHART_COLORS[1]} dot={{ r: 5 }} activeDot={{ r: 7 }} />
              </LineChart>
            </ResponsiveContainer>
          </Card>
        </Col>
      </Row>
    </div>
  )
}
