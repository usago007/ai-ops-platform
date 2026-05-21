import React, { useState, useEffect } from 'react'
import { Card, Table, Button, Tag, Progress, Space, message, Modal, Spin, Row, Col, Typography, Divider, Descriptions } from 'antd'
import { ThunderboltOutlined, ReloadOutlined, InboxOutlined, TrophyOutlined, CheckCircleOutlined, PlusOutlined, AppstoreOutlined, EyeOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import { productService } from '../../services'
import styles from './ProductListPage.module.css'
import { EmptyState } from '../../components/EmptyState'

const { Text } = Typography

export const ProductListPage: React.FC = () => {
  const navigate = useNavigate()
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [batchLoading, setBatchLoading] = useState(false)

  useEffect(() => {
    loadProducts()
  }, [])

  const loadProducts = async () => {
    setLoading(true)
    try {
      const result = await productService.getProductList()
      if (result.success) {
        setProducts(result.data.items)
      }
    } catch (e) {
      message.error('加载失败')
    } finally {
      setLoading(false)
    }
  }

  const handleBatchStructure = async () => {
    setBatchLoading(true)
    try {
      const result = await productService.batchStructure()
      if (result.success) {
        message.success(`已创建批量结构化任务，共 ${result.data.total} 个商品`)
      }
    } catch (e) {
      message.error('任务创建失败')
    } finally {
      setBatchLoading(false)
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return '#52c41a'
    if (score >= 60) return '#faad14'
    return '#ff4d4f'
  }

  const getSourceTag = (source?: string) => {
    const map: Record<string, { color: string; label: string }> = {
      text: { color: 'default', label: '文本提取' },
      ocr: { color: 'purple', label: 'OCR识别' },
      ai: { color: 'cyan', label: 'AI推理' },
      manual: { color: 'blue', label: '手动录入' },
    }
    const config = map[source || 'text'] || map.text
    return <Tag color={config.color} style={{ fontSize: 11 }}>{config.label}</Tag>
  }

  const columns = [
    { title: 'SKU', dataIndex: 'id', key: 'id', width: 140,
      render: (text: string, record: any) => (
        record.source_inquiry ? (
          <Space>
            <Text style={{ fontSize: 12 }}>{text}</Text>
            <Tag color="orange" style={{ fontSize: 10, margin: 0 }}>待结构化</Tag>
          </Space>
        ) : text
      ),
    },
    { title: '商品名称', dataIndex: 'name', key: 'name',
      render: (text: string, record: any) => (
        <div>
          <Text strong>{text}</Text>
          {record.source_inquiry && (
            <div>
              <a style={{ fontSize: 11 }} onClick={() => navigate(`/inquiry/result?leadId=${record.source_inquiry}`)}>
                来自询价 {record.source_inquiry}（点击查看原始询价）
              </a>
            </div>
          )}
        </div>
      ),
    },
    { title: '品类', dataIndex: 'category', key: 'category', width: 120 },
    { title: '品牌', dataIndex: 'brand', key: 'brand', width: 100 },
    {
      title: '信息完整度',
      dataIndex: 'completenessScore',
      key: 'completenessScore',
      width: 180,
      render: (score: number) => (
        <Progress
          percent={score}
          strokeColor={getScoreColor(score)}
          size="small"
          format={(p) => `${p}%`}
        />
      ),
    },
    {
      title: '处理来源',
      dataIndex: 'source',
      key: 'source',
      width: 110,
      render: getSourceTag,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: string) => (
        <Tag color={status === '待结构化' ? 'orange' : status === '待审核' ? 'purple' : 'green'}>{status}</Tag>
      ),
    },
    {
      title: '操作',
      key: 'action',
      width: 100,
      render: (_: any, record: any) => (
        <Button
          type="link"
          size="small"
          icon={<EyeOutlined />}
          onClick={() => navigate(`/product/${record.id}`)}
        >
          {record.source_inquiry ? '去结构化' : '查看详情'}
        </Button>
      ),
    },
  ]

  const standardItems = products.filter((p: any) => !p.source_inquiry)
  const pendingItems = products.filter((p: any) => p.source_inquiry)

  const getStatusTag = (status: string) => {
    if (status === 'confirmed') return <Tag color="green">已确认</Tag>
    if (status === 'pending') return <Tag color="orange">待确认</Tag>
    return <Tag color="blue">AI建议</Tag>
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2 className={styles.title}>商品信息结构化</h2>
        <Space>
          <Button type="primary" icon={<PlusOutlined />} onClick={() => navigate('/product/new')}>
            新增商品
          </Button>
          <Button type="primary" icon={<ThunderboltOutlined />} onClick={handleBatchStructure} loading={batchLoading}>
            批量结构化
          </Button>
        </Space>
      </div>

      <Row gutter={[16, 16]} className={styles.overviewBar}>
        <Col span={6}>
          <Card size="small" className={styles.overviewCard}>
            <div className={styles.overviewItem}>
              <Text type="secondary">总商品数</Text>
              <div className={styles.overviewValue}>{products.length.toLocaleString()}</div>
            </div>
          </Card>
        </Col>
        <Col span={6}>
          <Card size="small" className={styles.overviewCard}>
            <div className={styles.overviewItem}>
              <Text type="secondary">已结构化</Text>
              <div className={styles.overviewValue} style={{ color: '#52c41a' }}>{standardItems.length}</div>
            </div>
          </Card>
        </Col>
        <Col span={6}>
          <Card size="small" className={styles.overviewCard}>
            <div className={styles.overviewItem}>
              <Text type="secondary">待结构化</Text>
              <div className={styles.overviewValue} style={{ color: pendingItems.length > 0 ? '#faad14' : '#999' }}>
                {pendingItems.length}
              </div>
            </div>
          </Card>
        </Col>
        <Col span={6}>
          <Card size="small" className={styles.overviewCard}>
            <div className={styles.overviewItem}>
              <Text type="secondary">AI提取准确率</Text>
              <div className={styles.overviewValue} style={{ color: '#1890ff' }}>87.3%</div>
            </div>
          </Card>
        </Col>
      </Row>

      {pendingItems.length > 0 && (
        <Card
          title={<Space><InboxOutlined style={{ color: '#faad14' }} /><Text strong>待结构化商品（来自询价解析）</Text></Space>}
          size="small"
          className={styles.pendingCard}
          extra={<Text type="secondary">确认归类后自动进入此列表，点击展开查看完整参数</Text>}
        >
          <Table
            columns={columns.filter(c => c.key !== 'source' && c.key !== 'brand' && c.key !== 'completenessScore')}
            dataSource={pendingItems}
            rowKey="id"
            size="small"
            pagination={false}
            expandable={{
              expandedRowRender: (record: any) => (
                <div style={{ padding: '8px 16px' }}>
                  <Descriptions column={3} size="small" bordered>
                    <Descriptions.Item label="SKU">{record.id}</Descriptions.Item>
                    <Descriptions.Item label="品类">{record.category}</Descriptions.Item>
                    <Descriptions.Item label="品牌">{record.brand}</Descriptions.Item>
                    <Descriptions.Item label="型号">{record.model}</Descriptions.Item>
                    <Descriptions.Item label="来源询价">{record.source_inquiry}</Descriptions.Item>
                    <Descriptions.Item label="提取来源">{getSourceTag(record.source)}</Descriptions.Item>
                    <Descriptions.Item label="信息完整度">
                      <Progress percent={record.completenessScore} strokeColor={getScoreColor(record.completenessScore)} size="small" />
                    </Descriptions.Item>
                    <Descriptions.Item label="创建时间">{record.created_at}</Descriptions.Item>
                    <Descriptions.Item label="状态">
                      <Tag color="orange">{record.status}</Tag>
                    </Descriptions.Item>
                  </Descriptions>
                  <Divider style={{ margin: '12px 0' }} />
                  <Text strong style={{ fontSize: 12 }}>原始询价文本：</Text>
                  <div style={{ background: '#fafafa', padding: 12, borderRadius: 4, marginTop: 8, fontSize: 13, lineHeight: 1.6 }}>
                    {record.original_text || '无原始文本信息'}
                  </div>
                  <Divider style={{ margin: '12px 0' }} />
                  <Text strong style={{ fontSize: 12 }}>提取属性明细：</Text>
                  <Table
                    dataSource={record.attributes || []}
                    rowKey="name"
                    size="small"
                    pagination={false}
                    style={{ marginTop: 8 }}
                    columns={[
                      { title: '属性名', dataIndex: 'name', key: 'name', width: 120 },
                      { title: '属性值', dataIndex: 'value', key: 'value' },
                      { title: '置信度', dataIndex: 'confidence', key: 'confidence', width: 100,
                        render: (c: number) => <span style={{ color: c > 0.9 ? '#52c41a' : c > 0.8 ? '#faad14' : '#ff4d4f' }}>{(c * 100).toFixed(0)}%</span>
                      },
                      { title: '来源', dataIndex: 'source', key: 'source', width: 100, render: getSourceTag },
                      { title: '状态', dataIndex: 'status', key: 'status', width: 100, render: getStatusTag },
                    ]}
                  />
                </div>
              ),
              rowExpandable: () => true,
            }}
          />
          <Divider style={{ margin: '16px 0' }} />
        </Card>
      )}

      <Card title="标准商品库" size="small"
        extra={
          <Space>
            <Button type="link" icon={<AppstoreOutlined />} size="small" onClick={() => navigate('/product/categories')}>
              品类字典
            </Button>
          </Space>
        }
      >
        {standardItems.length === 0 && !loading ? (
          <EmptyState
            icon={<InboxOutlined />}
            title="暂无商品数据"
            description={'点击 "新增商品" 或 "批量结构化" 开始处理'}
            actionButton={
              <Button type="primary" icon={<PlusOutlined />} onClick={() => navigate('/product/new')}>
                新增商品
              </Button>
            }
          />
        ) : (
          <Table
            columns={columns}
            dataSource={standardItems}
            rowKey="id"
            loading={loading}
            pagination={{ pageSize: 10 }}
          />
        )}
      </Card>
    </div>
  )
}
