import React, { useState, useEffect } from 'react'
import { Card, Table, Button, Tag, Space, Input, Typography, Row, Col, Select, message, Checkbox, Divider } from 'antd'
import {
  InboxOutlined,
  PlusOutlined,
  ThunderboltOutlined,
  SearchOutlined,
  EyeOutlined,
  ReloadOutlined,
  CheckCircleOutlined,
} from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import { inquiryService } from '../../services'
import styles from './InquiryListPage.module.css'

const { Title, Text } = Typography

const SOURCE_CONFIG: Record<string, { color: string; icon: string }> = {
  '官网表单': { color: 'blue', icon: '🌐' },
  '邮件': { color: 'purple', icon: '📧' },
  '系统API': { color: 'cyan', icon: '🔗' },
  '微信': { color: 'green', icon: '💬' },
  '其他': { color: 'default', icon: '📋' },
}

const STATUS_CONFIG: Record<string, { color: string; label: string }> = {
  'pending': { color: 'orange', label: '待处理' },
  'processing': { color: 'blue', label: '处理中' },
  'confirmed': { color: 'purple', label: '已确认' },
  'quoting': { color: 'cyan', label: '报价中' },
  'quoted': { color: 'geekblue', label: '已报价' },
  'won': { color: 'green', label: '成单' },
  'lost': { color: 'red', label: '丢单' },
  'completed': { color: 'green', label: '已完成' },
  'anomaly': { color: 'red', label: '异常' },
}

const PRIORITY_CONFIG: Record<string, { color: string; label: string }> = {
  'high': { color: 'red', label: '高' },
  'medium': { color: 'orange', label: '中' },
  'low': { color: 'default', label: '低' },
}

export const InquiryListPage: React.FC = () => {
  const navigate = useNavigate()
  const [leads, setLeads] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([])
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [searchText, setSearchText] = useState('')

  useEffect(() => { loadLeads() }, [])

  const loadLeads = async () => {
    setLoading(true)
    try {
      const result = await inquiryService.getInquiryList()
      if (result.success) setLeads(result.data.items)
    } catch (e) {
      message.error('加载失败')
    } finally {
      setLoading(false)
    }
  }

  const handleBatchTransform = async () => {
    if (selectedRowKeys.length === 0) {
      message.warning('请先选择要转化的线索')
      return
    }
    try {
      const result = await inquiryService.batchTransform(selectedRowKeys.map(String))
      if (result.success) {
        message.success(`已创建 ${result.data.total} 个AI转化任务`)
        setSelectedRowKeys([])
        loadLeads()
      }
    } catch (e) {
      message.error('批量转化失败')
    }
  }

  const handleTransform = (lead: any) => {
    navigate(`/inquiry/transform?ids=${lead.id}`)
  }

  const handleViewResult = async (record: any) => {
    try {
      const result = await inquiryService.getInquiryDetail(record.id)
      if (result.success) {
        const lead = result.data
        navigate('/inquiry/result', {
          state: {
            leadId: lead.id,
            parseResult: {
              raw_text: lead.full_text,
              category: '待查看',
              spec: '请查看完整解析结果',
              quantity: { value: 0, unit: '' },
              delivery: '-',
              region: '-',
              payment: '-',
              confidence: 0,
              risk_level: 'low',
            },
            engineType: 'rule_engine',
            totalDuration: 0,
          },
        })
      }
    } catch (e) {
      message.error('加载失败')
    }
  }

  const handleView = async (lead: any) => {
    handleViewResult(lead)
  }

  const filteredLeads = leads.filter(lead => {
    if (filterStatus !== 'all' && lead.status !== filterStatus) return false
    if (searchText) {
      const search = searchText.toLowerCase()
      return (
        lead.customer.toLowerCase().includes(search) ||
        lead.company.toLowerCase().includes(search) ||
        lead.summary.toLowerCase().includes(search)
      )
    }
    return true
  })

  const columns = [
    {
      title: '优先级',
      dataIndex: 'priority',
      key: 'priority',
      width: 70,
      render: (p: string) => <Tag color={PRIORITY_CONFIG[p]?.color}>{PRIORITY_CONFIG[p]?.label}</Tag>,
    },
    {
      title: '来源',
      dataIndex: 'source',
      key: 'source',
      width: 90,
      render: (s: string) => {
        const cfg = SOURCE_CONFIG[s] || SOURCE_CONFIG['其他']
        return <Tag color={cfg.color}>{s}</Tag>
      },
    },
    {
      title: '客户信息',
      dataIndex: 'customer',
      key: 'customer',
      render: (_: string, record: any) => (
        <div>
          <div><Text strong>{record.customer}</Text></div>
          <Text type="secondary" style={{ fontSize: 12 }}>{record.company}</Text>
        </div>
      ),
    },
    {
      title: '询价摘要',
      dataIndex: 'summary',
      key: 'summary',
      width: 400,
      render: (text: string, record: any) => (
        <div>
          <Text style={{ fontSize: 13, display: 'block', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
            {text}
          </Text>
          {record.full_text && record.full_text !== text && (
            <Text type="secondary" style={{ fontSize: 11, display: 'block', marginTop: 4 }}>
              原始文本: {record.full_text}
            </Text>
          )}
        </div>
      ),
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 90,
      render: (s: string) => {
        const cfg = STATUS_CONFIG[s] || STATUS_CONFIG['pending']
        return <Tag color={cfg.color}>{cfg.label}</Tag>
      },
    },
    {
      title: '时间',
      dataIndex: 'created_at',
      key: 'created_at',
      width: 80,
      render: (t: string) => <Text type="secondary" style={{ fontSize: 12 }}>{t}</Text>,
    },
    {
      title: '操作',
      key: 'action',
      width: 120,
      render: (_: any, record: any) => {
        if (record.status === 'pending') {
          return <Button type="link" size="small" icon={<ThunderboltOutlined />} onClick={() => handleTransform(record)}>AI转化</Button>
        }
        if (record.status === 'processing' || record.status === 'confirmed') {
          return <Button type="link" size="small" icon={<EyeOutlined />} onClick={() => handleViewResult(record)}>查看结果</Button>
        }
        if (record.status === 'quoting' || record.status === 'quoted') {
          return <Button type="link" size="small" icon={<EyeOutlined />} onClick={() => navigate(`/inquiry/quotation-detail/${record.id}`)}>报价详情</Button>
        }
        if (record.status === 'won' || record.status === 'lost') {
          return <Button type="link" size="small" icon={<EyeOutlined />} onClick={() => navigate(`/inquiry/quotation-detail/${record.id}`)}>查看详情</Button>
        }
        if (record.status === 'anomaly') {
          return <Button type="link" size="small" icon={<ReloadOutlined />} onClick={() => handleTransform(record)}>重试</Button>
        }
        return <Button type="link" size="small" icon={<CheckCircleOutlined />} onClick={() => handleViewResult(record)}>详情</Button>
      },
    },
  ]

  const rowSelection = {
    selectedRowKeys,
    onChange: (keys: React.Key[]) => setSelectedRowKeys(keys),
    getCheckboxProps: (record: any) => ({
      disabled: record.status === 'completed',
    }),
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <Title level={3} style={{ marginBottom: 4 }}>询价线索池</Title>
          <Text type="secondary">管理所有渠道汇入的询价线索，选择线索进行AI智能转化</Text>
        </div>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => navigate('/inquiry/manual-entry')}>
          手动录入
        </Button>
      </div>

      <div className={styles.toolbar}>
        <Space wrap>
          <Space.Compact>
            <Input
              placeholder="搜索客户名、公司名、产品关键词..."
              prefix={<SearchOutlined />}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              style={{ width: 280 }}
              allowClear
            />
          </Space.Compact>
          <Select
            value={filterStatus}
            onChange={setFilterStatus}
            style={{ width: 120 }}
            options={[
              { label: '全部', value: 'all' },
              { label: '待处理', value: 'pending' },
              { label: '处理中', value: 'processing' },
              { label: '已确认', value: 'confirmed' },
              { label: '报价中', value: 'quoting' },
              { label: '已报价', value: 'quoted' },
              { label: '成单', value: 'won' },
              { label: '丢单', value: 'lost' },
              { label: '异常', value: 'anomaly' },
            ]}
          />
          {selectedRowKeys.length > 0 && (
            <Button type="primary" icon={<ThunderboltOutlined />} onClick={handleBatchTransform}>
              批量AI转化 ({selectedRowKeys.length})
            </Button>
          )}
        </Space>
      </div>

      <Card className={styles.tableCard}>
        <Table
          columns={columns}
          dataSource={filteredLeads}
          rowKey="id"
          rowSelection={rowSelection}
          loading={loading}
          pagination={{ pageSize: 10 }}
          className={styles.table}
        />
      </Card>

      <div className={styles.footer}>
        <Space size="large">
          <Text>共 <Text strong>{filteredLeads.length}</Text> 条线索</Text>
          <Divider type="vertical" />
          <Tag color="orange">待处理 {filteredLeads.filter(l => l.status === 'pending').length}</Tag>
          <Tag color="blue">处理中 {filteredLeads.filter(l => l.status === 'processing').length}</Tag>
          <Tag color="purple">已确认 {filteredLeads.filter(l => l.status === 'confirmed').length}</Tag>
          <Tag color="cyan">报价中 {filteredLeads.filter(l => l.status === 'quoting').length}</Tag>
          <Tag color="geekblue">已报价 {filteredLeads.filter(l => l.status === 'quoted').length}</Tag>
          <Tag color="green">成单 {filteredLeads.filter(l => l.status === 'won').length}</Tag>
          <Tag color="red">丢单 {filteredLeads.filter(l => l.status === 'lost').length}</Tag>
        </Space>
      </div>
    </div>
  )
}
