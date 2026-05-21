import React, { useState, useEffect } from 'react'
import { Card, Tag, Space, Spin, Typography, Divider, Statistic, Row, Col, Progress, Button } from 'antd'
import { StarOutlined, ArrowUpOutlined, ThunderboltOutlined, RocketOutlined, BulbOutlined } from '@ant-design/icons'
import { useParams, useNavigate } from 'react-router-dom'
import { Line } from '@ant-design/charts'
import { CapabilityBanner } from '../../components/CapabilityBanner/CapabilityBanner'
import { marketingService } from '../../services'
import styles from './SellingPointPage.module.css'

const { Text, Title } = Typography

const SELLING_POINT_SCENES: Record<string, string[]> = {
  '高能效': ['落地页主标题', '产品详情页', '展会宣传海报'],
  '易安装': ['安装指南视频', '客服话术推荐', '短信营销'],
  '长寿命': ['品牌故事营销', '用户案例分享', '行业白皮书'],
}

export const SellingPointPage: React.FC = () => {
  const { productId } = useParams<{ productId: string }>()
  const navigate = useNavigate()
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [productId])

  const loadData = async () => {
    try {
      const response = await marketingService.getSellingPoints(productId)
      if (response.success) setData(response.data)
    } catch (e) { console.error(e) }
    finally { setLoading(false) }
  }

  const handleGenerateContent = () => {
    const sellingPoints = data?.core?.map((sp: any) => sp.text).join('、') || ''
    navigate('/marketing/create', { state: { prefill: { note: `核心卖点: ${sellingPoints}` } } })
  }

  if (loading) {
    return <div className={styles.center}><Spin size="large" tip="AI 正在提炼卖点..." /></div>
  }

  if (!data) return <div className={styles.center}><Text type="secondary">暂无卖点数据</Text></div>

  const chartConfig = {
    data: [
      { type: '第1周', value: 3.2, category: '无AI卖点' },
      { type: '第1周', value: 3.5, category: 'AI卖点' },
      { type: '第2周', value: 3.2, category: '无AI卖点' },
      { type: '第2周', value: 3.8, category: 'AI卖点' },
      { type: '第3周', value: 3.1, category: '无AI卖点' },
      { type: '第3周', value: 4.2, category: 'AI卖点' },
      { type: '第4周', value: 3.2, category: '无AI卖点' },
      { type: '第4周', value: 4.5, category: 'AI卖点' },
      { type: '第5周', value: 3.3, category: '无AI卖点' },
      { type: '第5周', value: 4.8, category: 'AI卖点' },
    ],
    xField: 'type',
    yField: 'value',
    seriesField: 'category',
    smooth: true,
    animation: { appear: { animation: 'path-in', duration: 1000 } },
    color: ['#d9d9d9', '#1890ff'],
    point: { size: 5, shape: 'circle' },
  }

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
          <Card title={<span><StarOutlined style={{ color: '#faad14' }} /> 核心卖点 (Top 3)</span>} className={styles.card}>
            <Space direction="vertical" style={{ width: '100%' }} size="large">
              {data.core.map((sp: any, i: number) => (
                <Card key={i} size="small" className={styles.coreSellingCard}>
                  <div className={styles.coreRank}>#{i + 1}</div>
                  <div className={styles.coreText}>{sp.text}</div>
                  <Text type="secondary" className={styles.coreSupport}>{sp.support}</Text>
                  <Space style={{ marginTop: 8 }}>
                    <Tag color="green"><ArrowUpOutlined /> CTR {sp.ctr_impact}</Tag>
                    {SELLING_POINT_SCENES[sp.text.slice(0, 3)] && (
                      <Space size={4}>
                        {SELLING_POINT_SCENES[sp.text.slice(0, 3)].map((scene: string, j: number) => (
                          <Tag key={j} style={{ fontSize: 11 }}>{scene}</Tag>
                        ))}
                      </Space>
                    )}
                  </Space>
                </Card>
              ))}
            </Space>

            <Button type="primary" icon={<RocketOutlined />} block style={{ marginTop: 16 }} onClick={handleGenerateContent}>
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
            <Statistic title="AI卖点 CTR" value={data.ctr_comparison.with_ai} precision={1} suffix="%" valueStyle={{ color: '#1890ff' }} />
            <Statistic title="无AI卖点 CTR" value={data.ctr_comparison.without_ai} precision={1} suffix="%" style={{ marginTop: 16 }} />
            <Divider />
            <Title level={5} style={{ margin: '8px 0' }}>提升幅度</Title>
            <Statistic value={50} precision={0} suffix="%" valueStyle={{ color: '#52c41a', fontSize: 36 }} prefix={<ArrowUpOutlined />} />
          </Card>

          <Card title="CTR 趋势对比" className={styles.card}>
            <Line {...chartConfig} height={200} />
          </Card>
        </Col>
      </Row>
    </div>
  )
}
