import React, { useState, useEffect } from 'react'
import { Card, Row, Col, Select, Button, Spin, Typography, Tag, Image, Divider } from 'antd'
import { EyeOutlined, ReloadOutlined } from '@/iconMap'
import { marketingService } from '../../services'
import styles from './LandingPagePreviewPage.module.css'

const { Title } = Typography
const { Option } = Select

const sourceOptions = [
  { value: 'direct', label: '直接访问' },
  { value: 'search', label: '搜索引擎' },
  { value: 'social', label: '社交媒体' },
  { value: 'ad', label: '广告投放' },
]

const sourcePageConfig: Record<string, { title: string; subtitle: string; mainImage: string; banner: string; cta: string; highlights: string[] }> = {
  direct: {
    title: 'FX3U PLC 控制器',
    subtitle: '工业自动化核心组件，稳定可靠',
    mainImage: 'https://picsum.photos/seed/landing-hero/600/400',
    banner: 'https://picsum.photos/seed/landing-banner-direct/1200/200',
    cta: '立即询价',
    highlights: ['64路输入/输出', '三菱原装正品', '全国联保2年', '现货当天发货'],
  },
  search: {
    title: 'PLC 控制器 现货供应 - FX3U 系列',
    subtitle: '搜索匹配：PLC控制器 三菱 FX3U 64MT',
    mainImage: 'https://picsum.photos/seed/landing-feature1/600/400',
    banner: 'https://picsum.photos/seed/landing-banner-search/1200/200',
    cta: '查看报价',
    highlights: ['搜索热度 Top1', '2000+ 企业采购', '比价更优惠', '工程师推荐'],
  },
  social: {
    title: '工厂升级必备！FX3U PLC 控制器 🏭',
    subtitle: '10000+ 工厂都在用的自动化神器',
    mainImage: 'https://picsum.photos/seed/landing-feature2/600/400',
    banner: 'https://picsum.photos/seed/landing-banner-social/1200/200',
    cta: '立即抢购',
    highlights: ['爆款热卖', '工厂直采价', '好评率 98%', '免费技术支持'],
  },
  ad: {
    title: '限时特惠 FX3U-64MT 立省 15%',
    subtitle: '广告投放专属优惠，仅限本月',
    mainImage: 'https://picsum.photos/seed/landing-cta/600/400',
    banner: 'https://picsum.photos/seed/landing-banner-ad/1200/200',
    cta: '抢占名额',
    highlights: ['限时 85 折', '前 100 名包邮', '满 10 台送备件', '专属客服'],
  },
}

export const LandingPagePreviewPage: React.FC = () => {
  const [source, setSource] = useState('direct')
  const [loading, setLoading] = useState(true)
  const [config, setConfig] = useState<typeof sourcePageConfig.direct>(sourcePageConfig.direct)

  useEffect(() => {
    marketingService.getLandingPagePreview(source)
      .then(res => {
        if (res.success) {
          const fallback = sourcePageConfig[source] || sourcePageConfig.direct
          setConfig({
            ...fallback,
            title: res.data.title || fallback.title,
            subtitle: res.data.subtitle || fallback.subtitle,
            mainImage: res.data.main_image || fallback.mainImage,
            cta: res.data.cta || fallback.cta,
          })
        }
        setLoading(false)
      })
      .catch(() => {
        setConfig(sourcePageConfig[source] || sourcePageConfig.direct)
        setLoading(false)
      })
  }, [source])

  const handleSourceChange = (value: string) => {
    setSource(value)
    setLoading(true)
  }

  if (loading) {
    return <Spin size="large" className={styles.loading} />
  }

  return (
    <div className={styles.container}>
      <Title level={3}>落地页动态渲染预览</Title>

      <Card className={styles.configCard}>
        <Row gutter={16} align="middle">
          <Col>
            <span>流量来源：</span>
          </Col>
          <Col>
            <Select value={source} onChange={handleSourceChange} className={styles.sourceSelect}>
              {sourceOptions.map(opt => (
                <Option key={opt.value} value={opt.value}>{opt.label}</Option>
              ))}
            </Select>
          </Col>
          <Col>
            <Button icon={<ReloadOutlined />} onClick={() => { setLoading(true); setTimeout(() => setLoading(false), 300) }}>
              刷新预览
            </Button>
          </Col>
          <Col flex="auto">
            <Tag color="blue">来源: {sourceOptions.find(o => o.value === source)?.label}</Tag>
          </Col>
        </Row>
      </Card>

      {/* Banner */}
      <Card className={`${styles.previewCard} ${styles.bannerCard}`}>
        <Image src={config.banner} alt="Banner" className={styles.banner} preview={false} />
      </Card>

      {/* Main Content */}
      <Row gutter={16}>
        <Col span={14}>
          <Card className={styles.previewCard} title={config.title} extra={<Tag color="orange">AI 动态渲染</Tag>}>
            <p className={styles.subtitle}>{config.subtitle}</p>
            <Image src={config.mainImage} alt="Main" className={styles.mainImage} />
            <Divider />
            <Row gutter={[8, 8]}>
              {config.highlights.map((h, i) => (
                <Col key={i}>
                  <Tag color="cyan" className={styles.highlightTag}>{h}</Tag>
                </Col>
              ))}
            </Row>
          </Card>
        </Col>

        <Col span={10}>
          <Card className={styles.previewCard} title="CTA 区域">
            <div className={styles.ctaArea}>
              <Button type="primary" size="large" block icon={<EyeOutlined />}>
                {config.cta}
              </Button>
            </div>
            <Divider />
            <Title level={5}>页面适配策略</Title>
            <ul className={styles.strategyList}>
              <li>标题：根据流量来源关键词自动替换</li>
              <li>主图：搜索流量展示产品图，社交展示场景图</li>
              <li>卖点：广告流量突出价格，直接访问突出品质</li>
              <li>CTA：搜索用"查看报价"，广告用"抢占名额"</li>
            </ul>
          </Card>
        </Col>
      </Row>
    </div>
  )
}
