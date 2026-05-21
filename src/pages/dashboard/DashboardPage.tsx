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

const quickAccessCards = [
  {
    title: '询报价归类',
    icon: <InboxOutlined />,
    path: '/inquiry/list',
    description: 'AI 自动识别并归类询报价邮件',
    color: '#1890ff',
    todayCount: 128,
    trend: '+12%',
  },
  {
    title: '商品结构化',
    icon: <TagsOutlined />,
    path: '/product/list',
    description: '提取商品关键属性生成结构化数据',
    color: '#52c41a',
    todayCount: 56,
    trend: '+8%',
  },
  {
    title: '规则归纳',
    icon: <FileTextOutlined />,
    path: '/rules',
    description: '从复杂文档中提取业务规则',
    color: '#722ed1',
    todayCount: 34,
    trend: '+15%',
  },
  {
    title: '内容生成',
    icon: <EditOutlined />,
    path: '/marketing/create',
    description: '一键生成营销文案和推广素材',
    color: '#fa8c16',
    todayCount: 89,
    trend: '+22%',
  },
  {
    title: '卖点提炼',
    icon: <ShopOutlined />,
    path: '/selling-point',
    description: 'AI 智能分析并提炼产品核心卖点',
    color: '#eb2f96',
    todayCount: 42,
    trend: '+5%',
  },
  {
    title: '客服辅助',
    icon: <CustomerServiceOutlined />,
    path: '/cs/workspace',
    description: '智能辅助客服提升响应效率',
    color: '#13c2c2',
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

      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col span={6}>
          <Card className={styles.statCard}>
            <Statistic
              title="今日处理任务"
              value={564}
              precision={0}
              valueStyle={{ color: '#1890ff' }}
              prefix={<ArrowUpOutlined />}
              suffix="件"
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card className={styles.statCard}>
            <Statistic
              title="平均置信度"
              value={95.2}
              precision={1}
              valueStyle={{ color: '#52c41a' }}
              suffix="%"
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card className={styles.statCard}>
            <Statistic
              title="节省人力工时"
              value={48.5}
              precision={1}
              valueStyle={{ color: '#722ed1' }}
              suffix="小时"
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card className={styles.statCard}>
            <Statistic
              title="待处理任务"
              value={23}
              precision={0}
              valueStyle={{ color: '#fa8c16' }}
            />
          </Card>
        </Col>
      </Row>

      <h2 className={styles.sectionTitle}>快捷入口</h2>
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        {quickAccessCards.map((card) => (
          <Col xs={24} sm={12} md={8} lg={8} key={card.path}>
            <Card
              hoverable
              className={styles.quickCard}
              style={{ borderTop: `3px solid ${card.color}` }}
              bodyStyle={{ padding: '16px 20px' }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                <div
                  className={styles.iconWrapper}
                  style={{ background: `${card.color}15`, color: card.color }}
                >
                  {card.icon}
                </div>
                <div style={{ flex: 1 }}>
                  <div className={styles.quickTitle}>{card.title}</div>
                  <div className={styles.quickDesc}>{card.description}</div>
                  <div className={styles.quickStats}>
                    <span className={styles.quickCount}>今日 {card.todayCount} 件</span>
                    <span className={styles.quickTrend} style={{ color: '#52c41a' }}>
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
