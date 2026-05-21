import React, { useState, useEffect } from 'react'
import { Card, Button, Table, Tag, Space, Spin, message, Modal, Form, Input, Select, Typography } from 'antd'
import { ArrowLeftOutlined, PlusOutlined, EditOutlined, DeleteOutlined, AppstoreOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import { productService } from '../../services'
import styles from './CategoryDictPage.module.css'

const { Title, Text } = Typography

export const CategoryDictPage: React.FC = () => {
  const navigate = useNavigate()
  const [categories, setCategories] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [modalVisible, setModalVisible] = useState(false)
  const [editingCategory, setEditingCategory] = useState<any>(null)
  const [form] = Form.useForm()

  useEffect(() => { loadCategories() }, [])

  const loadCategories = async () => {
    setLoading(true)
    try {
      const result = await productService.getCategories()
      if (result.success) {
        setCategories(result.data.categories || [])
      }
    } catch (e) {
      message.error('加载失败')
    } finally {
      setLoading(false)
    }
  }

  const handleAdd = () => {
    setEditingCategory(null)
    form.resetFields()
    setModalVisible(true)
  }

  const handleEdit = (record: any) => {
    setEditingCategory(record)
    form.setFieldsValue({ name: record.name, brand: record.brand })
    setModalVisible(true)
  }

  const handleSubmit = async (values: any) => {
    try {
      const result = await productService.createCategory({
        parent_id: values.level1,
        name: values.name,
        brand: values.brand,
      })
      if (result.success) {
        message.success(editingCategory ? '品类已更新' : '品类已创建')
        setModalVisible(false)
        loadCategories()
      }
    } catch (e) {
      message.error('操作失败')
    }
  }

  const level1Columns = [
    { title: '一级品类', dataIndex: 'name', key: 'name', width: 160,
      render: (text: string) => <Text strong style={{ color: '#1890ff' }}>{text}</Text>,
    },
    {
      title: '二级品类', key: 'level2',
      render: (_: any, record: any) => (
        <Space wrap>
          {(record.children || []).map((ch: any) => (
            <Tag key={ch.id} color="blue">{ch.name} {ch.brand && <span style={{ color: '#999' }}>({ch.brand})</span>}</Tag>
          ))}
        </Space>
      ),
    },
    { title: '商品数', key: 'productCount', width: 100,
      render: (_: any, record: any) => {
        const total = (record.children || []).reduce((sum: number, ch: any) => sum + (ch.productCount || 0), 0)
        return <Text strong>{total}</Text>
      },
    },
    { title: '询价数', key: 'inquiryCount', width: 100,
      render: (_: any, record: any) => {
        const total = (record.children || []).reduce((sum: number, ch: any) => sum + (ch.inquiryCount || 0), 0)
        return <Text>{total}</Text>
      },
    },
    {
      title: '操作', key: 'action', width: 120,
      render: (_: any, record: any) => (
        <Space>
          <Button type="link" size="small" icon={<EditOutlined />} onClick={() => handleEdit(record)}>编辑</Button>
          <Button type="link" size="small" danger icon={<DeleteOutlined />} />
        </Space>
      ),
    },
  ]

  const flatData = categories.map(cat => ({
    id: cat.id,
    name: cat.name,
    children: cat.children || [],
  }))

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <Button type="link" icon={<ArrowLeftOutlined />} onClick={() => navigate('/product/list')} style={{ padding: 0 }}>
          返回商品库
        </Button>
        <div className={styles.headerContent}>
          <Title level={3} style={{ margin: '8px 0' }}>品类字典管理</Title>
          <Text type="secondary">管理标准品类层级：一级品类 → 二级品类 → 品牌 → 常见型号</Text>
        </div>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
          新增品类
        </Button>
      </div>

      <Card size="small">
        <Table
          columns={level1Columns}
          dataSource={flatData}
          rowKey="id"
          loading={loading}
          pagination={false}
          expandable={{
            rowExpandable: () => true,
            expandedRowRender: (record: any) => (
              <Table
                dataSource={record.children || []}
                rowKey="id"
                size="small"
                pagination={false}
                columns={[
                  { title: '二级品类', dataIndex: 'name', key: 'name', width: 150 },
                  { title: '主要品牌', dataIndex: 'brand', key: 'brand', width: 120,
                    render: (b: string) => b ? <Tag color="green">{b}</Tag> : '-',
                  },
                  { title: '商品数', dataIndex: 'productCount', key: 'productCount', width: 80 },
                  { title: '询价数', dataIndex: 'inquiryCount', key: 'inquiryCount', width: 80 },
                  {
                    title: '操作', key: 'action', width: 80,
                    render: (_: any, ch: any) => (
                      <Button type="link" size="small" icon={<EditOutlined />} onClick={() => handleEdit(ch)}>编辑</Button>
                    ),
                  },
                ]}
              />
            ),
          }}
        />
      </Card>

      <Modal
        title={editingCategory ? '编辑品类' : '新增品类'}
        open={modalVisible}
        onOk={() => form.submit()}
        onCancel={() => setModalVisible(false)}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit} style={{ marginTop: 16 }}>
          <Form.Item label="一级品类" name="level1" rules={[{ required: true }]}>
            <Select
              placeholder="选择一级品类"
              options={categories.map(c => ({ value: c.name, label: c.name }))}
            />
          </Form.Item>
          <Form.Item label="二级品类" name="name" rules={[{ required: true }]}>
            <Input placeholder="如 PLC控制器、变频器" />
          </Form.Item>
          <Form.Item label="主要品牌" name="brand">
            <Input placeholder="如 西门子、ABB" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}
