import React, { useState, useEffect } from 'react'
import { Card, Table, Button, Tag, Space, Input, Typography, message, Divider } from 'antd'
import { EditOutlined, SearchOutlined, ArrowLeftOutlined } from '@/iconMap'
import { useNavigate } from 'react-router-dom'
import { inquiryService } from '../../services'
import styles from './QuotationListPage.module.css'

const { Title, Text } = Typography

const STATUS_CONFIG: Record<string, { color: string; label: string }> = {
  'quoting': { color: 'blue', label: '报价中' },
  'quoted': { color: 'purple', label: '已报价' },
  'won': { color: 'green', label: '成单' },
  'lost': { color: 'red', label: '丢单' },
}

interface QuotationLead {
  id: string
  customer: string
  company: string
  summary: string
  source: string
  created_at: string
  status: string
}

export const QuotationListPage: React.FC = () => {
  const navigate = useNavigate()
  const [leads, setLeads] = useState<QuotationLead[]>([])
  const [loading, setLoading] = useState(true)
  const [searchText, setSearchText] = useState('')

  useEffect(() => { loadLeads() }, [])

  const loadLeads = async () => {
    setLoading(true)
    try {
      const result = await inquiryService.getInquiryList()
      if (result.success) {
        const quotingLeads = result.data.items.filter((l: QuotationLead) => l.status === 'quoting' || l.status === 'quoted')
        setLeads(quotingLeads)
      }
    } catch (e) {
      message.error('加载失败')
    } finally {
      setLoading(false)
    }
  }

  const filteredLeads = leads.filter(lead => {
    if (!searchText) return true
    const search = searchText.toLowerCase()
    return (
      lead.customer.toLowerCase().includes(search) ||
      lead.company.toLowerCase().includes(search) ||
      lead.summary.toLowerCase().includes(search)
    )
  })

  const columns = [
    {
      title: '线索ID',
      dataIndex: 'id',
      key: 'id',
      width: 140,
    },
    {
      title: '客户信息',
      dataIndex: 'customer',
      key: 'customer',
      render: (_: string, record: QuotationLead) => (
        <div>
          <div><Text strong>{record.customer}</Text></div>
          <Text type="secondary" className={styles.companyText}>{record.company}</Text>
        </div>
      ),
    },
    {
      title: '询价摘要',
      dataIndex: 'summary',
      key: 'summary',
      render: (text: string) => (
        <Text className={styles.summaryText}>
          {text}
        </Text>
      ),
    },
    {
      title: '来源',
      dataIndex: 'source',
      key: 'source',
      width: 90,
    },
    {
      title: '时间',
      dataIndex: 'created_at',
      key: 'created_at',
      width: 80,
      render: (t: string) => <Text type="secondary" className={styles.timeText}>{t}</Text>,
    },
    {
      title: '操作',
      key: 'action',
      width: 120,
      render: (_: any, record: QuotationLead) => (
        <Button type="link" size="small" icon={<EditOutlined />} onClick={() => navigate(`/inquiry/quotation/${record.id}`)}>
          开始报价
        </Button>
      ),
    },
  ]

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <Button type="link" icon={<ArrowLeftOutlined />} onClick={() => navigate('/inquiry/list')} className={styles.backButton}>
            返回线索池
          </Button>
          <Title level={3} className={styles.titleNoMargin}>报价管理</Title>
          <Text type="secondary">管理已确认归类的询价，填写报价并发送给客户</Text>
        </div>
      </div>

      <div className={styles.toolbar}>
        <Input
          placeholder="搜索客户名、公司名、产品关键词..."
          prefix={<SearchOutlined />}
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          className={styles.searchInput}
          allowClear
        />
      </div>

      <Card className={styles.tableCard}>
        {filteredLeads.length === 0 ? (
          <div className={styles.empty}>
            <Text type="secondary">暂无待报价的询价线索</Text>
            <Button type="primary" onClick={() => navigate('/inquiry/list')}>前往线索池</Button>
          </div>
        ) : (
          <Table
            columns={columns}
            dataSource={filteredLeads}
            rowKey="id"
            loading={loading}
            pagination={{ pageSize: 10 }}
          />
        )}
      </Card>

      <div className={styles.footer}>
        <Space size="large">
          <Text>共 <Text strong>{filteredLeads.length}</Text> 条待报价</Text>
        </Space>
      </div>
    </div>
  )
}
