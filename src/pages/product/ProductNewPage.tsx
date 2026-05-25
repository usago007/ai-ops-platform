import React, { useState, useEffect } from 'react'
import { Card, Form, Input, Select, Button, Space, message, Spin, Row, Col, Typography, Divider, Alert } from 'antd'
import { ArrowLeftOutlined, ThunderboltOutlined, SaveOutlined } from '@/iconMap'
import { useNavigate } from 'react-router-dom'
import { productService } from '../../services'
import styles from './ProductNewPage.module.css'

const { Title, Text } = Typography

const CATEGORIES = [
  { value: 'PLC控制器', label: 'PLC控制器', children: ['三菱', '西门子', '欧姆龙'] },
  { value: '变频器', label: '变频器', children: ['ABB', '西门子', '施耐德'] },
  { value: '传感器', label: '传感器', children: ['欧姆龙', '倍加福', 'SMC'] },
  { value: '伺服系统', label: '伺服系统', children: ['安川', '三菱', '松下'] },
  { value: '继电器', label: '继电器', children: ['施耐德', '欧姆龙', 'ABB'] },
  { value: '工业机器人', label: '工业机器人', children: ['ABB', '发那科', '库卡'] },
  { value: '断路器', label: '断路器', children: ['ABB', '施耐德', '西门子'] },
  { value: '其他', label: '其他', children: [] },
]

const ALL_BRANDS = Array.from(new Set(CATEGORIES.flatMap(c => c.children)))

interface CategoryOption {
  value: string
  label: string
  children: string[]
}

interface CategoryNode {
  name: string
  brand?: string
  children?: CategoryNode[]
}

interface ProductFormValues {
  raw_text?: string
  category?: string
  brand?: string
  model?: string
  description?: string
  unit?: string
  price?: string
}

export const ProductNewPage: React.FC = () => {
  const navigate = useNavigate()
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)
  const [extracting, setExtracting] = useState(false)
  const [categories, setCategories] = useState(CATEGORIES)
  const [selectedBrand, setSelectedBrand] = useState<string[]>([])

  useEffect(() => {
    loadCategories()
  }, [])

  const loadCategories = async () => {
    try {
      const result = await productService.getCategories()
      if (result.success) {
        const cats = result.data.categories.flatMap((c: CategoryNode) =>
          c.children?.map((ch: CategoryNode) => ({
            value: ch.name,
            label: ch.name,
            children: ch.brand ? [ch.brand] : [],
          })) || []
        )
        if (cats.length > 0) setCategories(cats)
      }
    } catch (e) {}
  }

  const handleCategoryChange = (value: string) => {
    const cat = categories.find(c => c.value === value)
    if (cat) {
      setSelectedBrand(cat.children || [])
      form.setFieldsValue({ brand: undefined })
    }
  }

  const handleAIExtract = async () => {
    const rawText = form.getFieldValue('raw_text')
    if (!rawText) {
      message.warning('请先输入商品描述文本')
      return
    }
    setExtracting(true)
    try {
      const result = await productService.parseProductText(rawText)
      if (result.success) {
        const parsed = result.data.parsed
        form.setFieldsValue({
          category: parsed.category,
          brand: parsed.spec?.split(' ')?.[0] || '',
          model: parsed.spec,
          description: rawText,
          unit: '台',
        })
        handleCategoryChange(parsed.category)
        message.success('AI 提取成功，已自动填充字段')
      }
    } catch (e) {
      message.error('AI 提取失败')
    } finally {
      setExtracting(false)
    }
  }

  const handleSubmit = async (values: ProductFormValues) => {
    setLoading(true)
    try {
      const result = await productService.createProduct({
        category: values.category,
        brand: values.brand,
        model: values.model,
        description: values.description,
        unit: values.unit,
        price: values.price,
        source: 'manual',
      })
      if (result.success) {
        message.success('商品已创建')
        navigate(`/product/${result.data.product.id}`)
      }
    } catch (e) {
      message.error('创建失败')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <Button type="link" icon={<ArrowLeftOutlined />} onClick={() => navigate('/product/list')} className={styles.noPadding}>
          返回商品库
        </Button>
        <Title level={3} className={styles.titleMargin}>新增商品</Title>
      </div>

      <Alert
        message="AI 辅助填充"
        description="输入商品描述文本，AI 将自动提取品类、品牌、型号等字段，也可手动填写"
        type="info"
        showIcon
        className={styles.alertMargin}
      />

      <Row gutter={24}>
        <Col span={16}>
          <Card title="商品信息" size="small">
            <Form
              form={form}
              layout="vertical"
              onFinish={handleSubmit}
              initialValues={{ unit: '台' }}
            >
              <Form.Item label="原始描述文本" name="raw_text">
                <Input.TextArea rows={3} placeholder="输入商品描述，如：采购西门子PLC控制器S7-1200系列，CPU1214C 10台" />
              </Form.Item>

              <Form.Item>
                <Button
                  type="dashed"
                  icon={<ThunderboltOutlined />}
                  onClick={handleAIExtract}
                  loading={extracting}
                  block
                >
                  AI 自动提取
                </Button>
              </Form.Item>

              <Divider>商品信息</Divider>

              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item label="品类" name="category" rules={[{ required: true, message: '请选择品类' }]}>
                    <Select
                      placeholder="选择品类"
                      onChange={handleCategoryChange}
                      options={categories.map(c => ({ value: c.value, label: c.label }))}
                    />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item label="品牌" name="brand" rules={[{ required: true, message: '请选择品牌' }]}>
                    <Select
                      placeholder="选择品牌"
                      options={selectedBrand.length > 0 ? selectedBrand.map(b => ({ value: b, label: b })) : ALL_BRANDS.map(b => ({ value: b, label: b }))}
                    />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item label="型号" name="model" rules={[{ required: true, message: '请输入型号' }]}>
                    <Input placeholder="如 S7-1200 CPU1214C" />
                  </Form.Item>
                </Col>
                <Col span={6}>
                  <Form.Item label="单位" name="unit">
                    <Select options={[{ value: '台', label: '台' }, { value: '个', label: '个' }, { value: '件', label: '件' }, { value: '套', label: '套' }]} />
                  </Form.Item>
                </Col>
                <Col span={6}>
                  <Form.Item label="参考价格" name="price">
                    <Input addonBefore="¥" placeholder="0.00" />
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item label="详细描述" name="description">
                <Input.TextArea rows={3} placeholder="商品的详细描述" />
              </Form.Item>

              <Form.Item>
                <Space>
                  <Button type="primary" icon={<SaveOutlined />} htmlType="submit" loading={loading}>
                    保存商品
                  </Button>
                  <Button onClick={() => navigate('/product/list')}>取消</Button>
                </Space>
              </Form.Item>
            </Form>
          </Card>
        </Col>

        <Col span={8}>
          <Card title="填写指南" size="small" className={styles.guideCard}>
            <ul className={styles.guideList}>
              <li><Text strong>品类</Text>：选择商品所属分类，如 PLC控制器、变频器等</li>
              <li><Text strong>品牌</Text>：选择制造商品牌，如西门子、ABB、三菱</li>
              <li><Text strong>型号</Text>：填写完整的型号编码</li>
              <li><Text strong>单位</Text>：计量单位，默认为"台"</li>
              <li><Text strong>价格</Text>：参考单价（可选）</li>
            </ul>
            <Divider />
            <Text type="secondary" className={styles.smallFont}>
              提示：使用 AI 自动提取可以快速填充大部分字段
            </Text>
          </Card>
        </Col>
      </Row>
    </div>
  )
}
