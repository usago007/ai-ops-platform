import { Card, Row, Col, Statistic, Table, Tag, Button } from 'antd'
import {
  InboxOutlined,
  TagsOutlined,
  FileTextOutlined,
  CustomerServiceOutlined,
  EditOutlined,
  ShopOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
  EyeOutlined,
} from '@ant-design/icons'
import styles from './DashboardPage.module.css'
import { CHART_COLORS, STATUS_COLORS } from '../../styles/chartColors'

const quickAccessCards = [
  {
    title: '询报价归类',
    icon: <InboxOutlined />,
    path: '/inquiry/list',
    description: 'AI 自动识别并归类询报价邮件',
    color: CHART_COLORS[1],
    todayCount: 128,
    trend: '+12%',
  },
  {
    title: '商品结构化',
    icon: <TagsOutlined />,
    path: '/product/list',
    description: '提取商品关键属性生成结构化数据',
    color: STATUS_COLORS.success,
    todayCount: 56,
    trend: '+8%',
  },
  {
    title: '规则归纳',
    icon: <FileTextOutlined />,
    path: '/rules',
    description: '从复杂文档中提取业务规则',
    color: CHART_COLORS[5],
    todayCount: 34,
    trend: '+15%',
  },
  {
    title: '内容生成',
    icon: <EditOutlined />,
    path: '/marketing/create',
    description: '一键生成营销文案和推广素材',
    color: STATUS_COLORS.warning,
    todayCount: 89,
    trend: '+22%',
  },
  {
    title: '卖点提炼',
    icon: <ShopOutlined />,
    path: '/selling-point',
    description: 'AI 智能分析并提炼产品核心卖点',
    color: CHART_COLORS[2],
    todayCount: 42,
    trend: '+5%',
  },
  {
    title: '客服辅助',
    icon: <CustomerServiceOutlined />,
    path: '/cs/workspace',
    description: '智能辅助客服提升响应效率',
    color: CHART_COLORS[2],
    todayCount: 215,
    trend: '+18%',
  },
]

const recentTasks = [
  {
    key: '1',
    task: '询报价邮件批量处理',
    type: '询报价归类',
    status: 'completed',
    time: '2 分钟前',
    confidence: '98%',
  },
  {
    key: '2',
    task: '商品 SKU 属性提取',
    type: '商品结构化',
    status: 'processing',
    time: '5 分钟前',
    confidence: '--',
  },
  {
    key: '3',
    task: '售后规则文档分析',
    type: '规则归纳',
    status: 'completed',
    time: '12 分钟前',
    confidence: '95%',
  },
  {
    key: '4',
    task: '产品详情页文案生成',
    type: '内容生成',
    status: 'completed',
    time: '28 分钟前',
    confidence: '92%',
  },
  {
    key: '5',
    task: '客服对话智能回复',
    type: '客服辅助',
    status: 'processing',
    time: '1 小时前',
    confidence: '--',
  },
]

const columns = [
  {
    title: '任务',
    dataIndex: 'task',
    key: 'task',
  },
  {
    title: '类型',
    dataIndex: 'type',
    key: 'type',
    render: (text: string) => <Tag color="blue">{text}</Tag>,
  },
  {
    title: '状态',
    dataIndex: 'status',
    key: 'status',
    render: (text: string) =>
      text === 'completed' ? (
        <Tag color="green">已完成</Tag>
      ) : (
        <Tag color="processing">处理中</Tag>
      ),
  },
  {
    title: '置信度',
    dataIndex: 'confidence',
    key: 'confidence',
  },
  {
    title: '时间',
    dataIndex: 'time',
    key: 'time',
  },
  {
    title: '操作',
    key: 'action',
    render: () => <a><EyeOutlined /> 查看</a>,
  },
]

export const DashboardPage = () => {
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>工作台</h1>
        <p className={styles.subtitle}>
          欢迎使用智能商业平台，AI 正在为您高效处理业务任务
        </p>
      </div>

      <Row gutter={[16, 16]} className={styles.statsRow}>
        <Col span={6}>
          <Card className={`${styles.statCard} ${styles.statCardChart1}`}>
            <Statistic
              title="今日处理任务"
              value={564}
              precision={0}
              valueStyle={{ color: 'var(--chart-1)' }}
              prefix={<ArrowUpOutlined />}
              suffix="件"
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card className={`${styles.statCard} ${styles.statCardSuccess}`}>
            <Statistic
              title="平均置信度"
              value={95.2}
              precision={1}
              valueStyle={{ color: 'var(--success)' }}
              suffix="%"
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card className={`${styles.statCard} ${styles.statCardChart5}`}>
            <Statistic
              title="节省人力工时"
              value={48.5}
              precision={1}
              valueStyle={{ color: 'var(--chart-5)' }}
              suffix="小时"
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card className={`${styles.statCard} ${styles.statCardWarning}`}>
            <Statistic
              title="待处理任务"
              value={23}
              precision={0}
              valueStyle={{ color: 'var(--warning)' }}
            />
          </Card>
        </Col>
      </Row>

      <h2 className={styles.sectionTitle}>快捷入口</h2>
      <Row gutter={[16, 16]} className={styles.quickAccessRow}>
        {quickAccessCards.map((card) => (
          <Col xs={24} sm={12} md={8} lg={8} key={card.path}>
            <Card
              hoverable
              className={styles.quickCard}
              style={{ borderTop: `3px solid ${card.color}` }}
            >
              <div className={styles.quickCardInner}>
                <div
                  className={styles.iconWrapper}
                  style={{ background: `${card.color}15`, color: card.color }}
                >
                  {card.icon}
                </div>
                <div className={styles.quickCardContent}>
                  <div className={styles.quickTitle}>{card.title}</div>
                  <div className={styles.quickDesc}>{card.description}</div>
                  <div className={styles.quickStats}>
                    <span className={styles.quickCount}>今日 {card.todayCount} 件</span>
                    <span className={styles.quickTrend}>
                      <ArrowUpOutlined /> {card.trend}
                    </span>
                  </div>
                </div>
              </div>
            </Card>
          </Col>
        ))}
      </Row>

      <h2 className={styles.sectionTitle}>最近任务</h2>
      <Card className={styles.tableCard}>
        <Table columns={columns} dataSource={recentTasks} pagination={false} />
      </Card>
    </div>
  )
}
