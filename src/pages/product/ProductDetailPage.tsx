import React, { useState, useEffect } from 'react'
import { Card, Descriptions, Tag, Button, Space, Spin, Table, message, Typography, Divider, Alert, Input, Modal, Form } from 'antd'
import { CheckOutlined, CloseOutlined, EditOutlined, ScanOutlined, ArrowLeftOutlined, LinkOutlined } from '@/iconMap'
import { useParams, useNavigate } from 'react-router-dom'
import { productService } from '../../services'
import styles from './ProductDetailPage.module.css'
import { STATUS_COLORS } from '../../styles/chartColors'

const { Text, Title } = Typography

interface ProductAttribute {
  name: string
  value: string
  confidence: number
  status: 'confirmed' | 'pending' | 'suggested'
  source: string
}

interface ProductData {
  id: string
  category: string
  brand: string
  model: string
  description?: string
  unit: string
  price?: string
  completenessScore: number
  attributes: ProductAttribute[]
  source_inquiry?: string
  original_text?: string
}

export const ProductDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [product, setProduct] = useState<ProductData | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [editModalVisible, setEditModalVisible] = useState(false)
  const [editingAttr, setEditingAttr] = useState<ProductAttribute | null>(null)
  const [attrValue, setAttrValue] = useState('')

  useEffect(() => {
    loadProduct()
  }, [id])

  const loadProduct = async () => {
    setLoading(true)
    try {
      const result = await productService.getProductStructured(id!)
      if (result.success) {
        setProduct({ ...result.data, id })
      }
    } catch {
      message.error('加载失败')
    } finally {
      setLoading(false)
    }
  }

  const handleConfirm = async () => {
    setSubmitting(true)
    try {
      const result = await productService.confirmProduct(id!, {
        category: product?.category,
        brand: product?.brand,
        model: product?.model,
        attributes: product?.attributes,
      })
      if (result.success) {
        message.success('结构化结果已确认并保存')
        loadProduct()
      }
    } catch {
      message.error('保存失败')
    } finally {
      setSubmitting(false)
    }
  }

  const handleEditAttr = (attr: ProductAttribute) => {
    setEditingAttr(attr)
    setAttrValue(attr.value)
    setEditModalVisible(true)
  }

  const handleSaveAttr = () => {
    if (!editingAttr) return
    const updatedAttrs = (product.attributes || []).map((a: ProductAttribute) =>
      a.name === editingAttr.name ? { ...a, value: attrValue, status: 'confirmed' } : a
    )
    setProduct({ ...product, attributes: updatedAttrs })
    setEditModalVisible(false)
    setEditingAttr(null)
    setAttrValue('')
  }

  const getStatusTag = (status: string) => {
    if (status === 'confirmed') return <Tag color="green"><CheckOutlined /> 已确认</Tag>
    if (status === 'pending') return <Tag color="orange"><EditOutlined /> 待确认</Tag>
    return <Tag color="blue"><ScanOutlined /> AI建议</Tag>
  }

  const getSourceTag = (source: string) => {
    const map: Record<string, { color: string; label: string }> = {
      text: { color: 'default', label: '文本提取' },
      ocr: { color: 'purple', label: 'OCR识别' },
      ai: { color: 'cyan', label: 'AI推理' },
      manual: { color: 'blue', label: '手动录入' },
    }
    const config = map[source] || map.text
    return <Tag color={config.color}>{config.label}</Tag>
  }

  const isPending = product?.id?.includes('PENDING')

  const attrColumns = [
    { title: '属性名', dataIndex: 'name', key: 'name', width: 120 },
    {
      title: '属性值', dataIndex: 'value', key: 'value',
      render: (v: string, record: ProductAttribute) => (
        <Button type="link" size="small" className={styles.noPadding} onClick={() => handleEditAttr(record)}>
          {v} <EditOutlined className={styles.editIcon} />
        </Button>
      ),
    },
    { title: '置信度', dataIndex: 'confidence', key: 'confidence', width: 100,
      render: (c: number) => <span className={c > 0.9 ? styles.confidenceHigh : c > 0.8 ? styles.confidenceMedium : styles.confidenceLow}>
        {(c * 100).toFixed(0)}%
      </span>
    },
    { title: '来源', dataIndex: 'source', key: 'source', width: 100, render: getSourceTag },
    { title: '状态', dataIndex: 'status', key: 'status', width: 120, render: getStatusTag },
  ]

  if (loading) {
    return (
      <div className={styles.center}>
        <Spin size="large" tip="加载商品信息..." />
      </div>
    )
  }

  if (!product) return null

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <Button type="link" icon={<ArrowLeftOutlined />} onClick={() => navigate('/product/list')} className={styles.noPadding}>
          返回商品库
        </Button>
        <div className={styles.headerContent}>
          <Title level={3} className={styles.titleMargin}>
            {isPending ? '待结构化商品' : '商品详情'}
          </Title>
          <Space size="middle">
            {product.brand && <Tag color="blue">{product.brand}</Tag>}
            {product.category && <Tag>{product.category}</Tag>}
            {product.model && <Tag color="purple">{product.model}</Tag>}
          </Space>
        </div>
      </div>

      {isPending && (
        <Alert
          message="此商品来自询价解析"
          description="请审核AI提取的商品信息，确认无误后点击「确认保存」将其加入标准商品库"
          type="warning"
          showIcon
          className={styles.alertMargin}
        />
      )}

      {product.source_inquiry && (
        <Card title={<Space><LinkOutlined /><Text strong>关联询价线索</Text></Space>} size="small" className={styles.cardMarginBottom}>
          <Button type="link" onClick={() => navigate(`/inquiry/result?leadId=${product.source_inquiry}`)}>
            查看原始询价 {product.source_inquiry}
          </Button>
          <div className={styles.metaRow}>
            <Text type="secondary" className={styles.smallFont}>原始文本：</Text>
            <Text type="secondary">{product.original_text}</Text>
          </div>
        </Card>
      )}

      <div className={styles.grid}>
        <Card title="商品信息" size="small" className={styles.leftCard}>
          <Descriptions column={2} size="small" bordered>
            <Descriptions.Item label="SKU">{product.id}</Descriptions.Item>
            <Descriptions.Item label="完整度">
              <Tag color={product.completenessScore >= 80 ? 'green' : 'orange'}>{product.completenessScore}%</Tag>
            </Descriptions.Item>
            <Descriptions.Item label="品类">{product.category}</Descriptions.Item>
            <Descriptions.Item label="品牌">{product.brand}</Descriptions.Item>
            <Descriptions.Item label="型号">{product.model}</Descriptions.Item>
            <Descriptions.Item label="描述">{product.description || '-'}</Descriptions.Item>
            <Descriptions.Item label="单位">{product.unit}</Descriptions.Item>
            <Descriptions.Item label="价格">{product.price ? `¥${product.price}` : '-'}</Descriptions.Item>
          </Descriptions>
        </Card>

        <Card title="属性提取结果" size="small" className={styles.rightCard}
          extra={
            <Text type="secondary" className={styles.smallFont}>点击属性值可编辑</Text>
          }
        >
          <Table
            dataSource={product.attributes || []}
            rowKey="name"
            size="small"
            pagination={false}
            columns={attrColumns}
          />
        </Card>
      </div>

      <div className={styles.actions}>
        <Space>
          <Button onClick={() => navigate('/product/list')}>返回</Button>
          {isPending && (
            <Button type="primary" icon={<CheckOutlined />} onClick={handleConfirm} loading={submitting}>
              确认保存
            </Button>
          )}
        </Space>
      </div>

      <Modal
        title={`编辑属性：${editingAttr?.name}`}
        open={editModalVisible}
        onOk={handleSaveAttr}
        onCancel={() => setEditModalVisible(false)}
      >
        <Form layout="vertical">
          <Form.Item label="属性值" rules={[{ required: true, message: '请输入备注内容' }]}>
            <Input.TextArea
              rows={2}
              value={attrValue}
              onChange={(e) => setAttrValue(e.target.value)}
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}
