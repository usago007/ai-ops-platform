import React, { useEffect, useState } from 'react'
import { Card, Table, Button, Tag, DatePicker, Space, Spin, Statistic, Row, Col, Tabs, Input, Typography } from 'antd'
import { DownloadOutlined, ReloadOutlined, SearchOutlined } from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'
import { systemService } from '../../services'
import styles from './AuditLogPage.module.css'

const { Search } = Input
const { Text } = Typography

interface AuditLog {
  id: string
  timestamp: string
  user: string
  action: string
  module: string
  result: string
  duration: number
  details: string
}

interface AuditTrailLog {
  id: string
  timestamp: string
  user: string
  type: string
  description: string
  ip: string
}

const resultColors: Record<string, string> = {
  success: 'success',
  warning: 'warning',
  error: 'error',
}

const typeColors: Record<string, string> = {
  login: 'green',
  permission_change: 'orange',
  config_change: 'blue',
  data_export: 'purple',
}

export const AuditLogPage: React.FC = () => {
  const [loading, setLoading] = useState(true)
  const [auditLoading, setAuditLoading] = useState(true)
  const [logs, setLogs] = useState<AuditLog[]>([])
  const [auditLogs, setAuditLogs] = useState<AuditTrailLog[]>([])
  const [total, setTotal] = useState(0)
  const [auditTotal, setAuditTotal] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)
  const [auditCurrentPage, setAuditCurrentPage] = useState(1)
  const [auditSearch, setAuditSearch] = useState('')

  useEffect(() => {
    fetchLogs()
  }, [currentPage])

  useEffect(() => {
    fetchAuditLogs()
  }, [auditCurrentPage, auditSearch])

  const fetchLogs = () => {
    setLoading(true)
    systemService.getAuditLogs(currentPage, 10)
      .then(res => {
        setLogs(res.data.items || [])
        setTotal(res.data.total || 0)
      })
      .finally(() => setLoading(false))
  }

  const fetchAuditLogs = () => {
    setAuditLoading(true)
    systemService.getAuditTrailLogs(auditCurrentPage, 10, auditSearch)
      .then(res => {
        setAuditLogs(res.data.items || [])
        setAuditTotal(res.data.total || 0)
      })
      .finally(() => setAuditLoading(false))
  }

  const handleExport = () => {
    systemService.exportAuditLogs()
      .then(csv => {
        const blob = new Blob([csv], { type: 'text/csv' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = 'audit-logs.csv'
        a.click()
      })
  }

  const columns: ColumnsType<AuditLog> = [
    {
      title: '时间',
      dataIndex: 'timestamp',
      key: 'timestamp',
      width: 180,
      render: (text: string) => new Date(text).toLocaleString('zh-CN'),
    },
    {
      title: '用户',
      dataIndex: 'user',
      key: 'user',
      width: 100,
    },
    {
      title: '操作',
      dataIndex: 'action',
      key: 'action',
    },
    {
      title: '模块',
      dataIndex: 'module',
      key: 'module',
      width: 100,
      render: (text: string) => <Tag color="blue">{text}</Tag>,
    },
    {
      title: '结果',
      dataIndex: 'result',
      key: 'result',
      width: 100,
      render: (result: string) => (
        <Tag color={resultColors[result] || 'default'}>{result}</Tag>
      ),
    },
    {
      title: '耗时 (ms)',
      dataIndex: 'duration',
      key: 'duration',
      width: 120,
    },
  ]

  const auditColumns: ColumnsType<AuditTrailLog> = [
    {
      title: '时间',
      dataIndex: 'timestamp',
      key: 'timestamp',
      width: 180,
      render: (text: string) => new Date(text).toLocaleString('zh-CN'),
    },
    {
      title: '用户',
      dataIndex: 'user',
      key: 'user',
      width: 100,
    },
    {
      title: '类型',
      dataIndex: 'type',
      key: 'type',
      width: 120,
      render: (type: string) => {
        const labelMap: Record<string, string> = {
          login: '登录',
          permission_change: '权限变更',
          config_change: '配置修改',
          data_export: '数据导出',
        }
        return <Tag color={typeColors[type] || 'default'}>{labelMap[type] || type}</Tag>
      },
    },
    {
      title: '描述',
      dataIndex: 'description',
      key: 'description',
    },
    {
      title: 'IP 地址',
      dataIndex: 'ip',
      key: 'ip',
      width: 160,
      render: (ip: string) => <Text code>{ip}</Text>,
    },
  ]

  const tabItems = [
    {
      key: 'operation',
      label: '操作日志',
      children: (
        <div>
          <Row gutter={16} style={{ marginBottom: 16 }}>
            <Col span={6}>
              <Card>
                <Statistic title="总日志数" value={total} />
              </Card>
            </Col>
            <Col span={6}>
              <Card>
                <Statistic title="成功率" value={95.2} precision={1} suffix="%" />
              </Card>
            </Col>
            <Col span={6}>
              <Card>
                <Statistic title="平均耗时" value={856} suffix="ms" />
              </Card>
            </Col>
            <Col span={6}>
              <Card>
                <Statistic title="今日操作" value={128} />
              </Card>
            </Col>
          </Row>

          <Card
            title="操作日志"
            extra={
              <Space>
                <Button icon={<ReloadOutlined />} onClick={fetchLogs}>
                  刷新
                </Button>
                <Button type="primary" icon={<DownloadOutlined />} onClick={handleExport}>
                  导出 CSV
                </Button>
              </Space>
            }
          >
            <Table<AuditLog>
              dataSource={logs}
              columns={columns}
              rowKey="id"
              loading={loading}
              pagination={{
                current: currentPage,
                total,
                pageSize: 10,
                onChange: setCurrentPage,
              }}
            />
          </Card>
        </div>
      ),
    },
    {
      key: 'audit',
      label: '审计日志',
      children: (
        <div>
          <Row gutter={16} style={{ marginBottom: 16 }}>
            <Col span={6}>
              <Card>
                <Statistic title="总审计记录" value={auditTotal} />
              </Card>
            </Col>
            <Col span={6}>
              <Card>
                <Statistic title="登录事件" value={45} />
              </Card>
            </Col>
            <Col span={6}>
              <Card>
                <Statistic title="权限变更" value={12} />
              </Card>
            </Col>
            <Col span={6}>
              <Card>
                <Statistic title="配置修改" value={38} />
              </Card>
            </Col>
          </Row>

          <Card
            title="审计轨迹（用户登录/权限变更/配置修改）"
            extra={
              <Space>
                <Search
                  placeholder="按用户/模块/关键词搜索"
                  allowClear
                  onSearch={(value) => setAuditSearch(value)}
                  style={{ width: 260 }}
                  enterButton={<SearchOutlined />}
                />
                <Button icon={<ReloadOutlined />} onClick={fetchAuditLogs}>
                  刷新
                </Button>
              </Space>
            }
          >
            <Table<AuditTrailLog>
              dataSource={auditLogs}
              columns={auditColumns}
              rowKey="id"
              loading={auditLoading}
              pagination={{
                current: auditCurrentPage,
                total: auditTotal,
                pageSize: 10,
                onChange: setAuditCurrentPage,
              }}
            />
          </Card>
        </div>
      ),
    },
  ]

  return (
    <div className={styles.container}>
      <Card title="审计日志与操作记录">
        <Tabs items={tabItems} defaultActiveKey="operation" />
      </Card>
    </div>
  )
}
