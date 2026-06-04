/**
 * ModelConfigPage — 模型配置（每模型映射到主链步骤）
 */
import React, { useState, useEffect } from 'react'
import { Alert, Table, Tag, Switch, Typography } from 'antd'
import { InboxOutlined, ThunderboltOutlined } from '@/iconMap'
import { useNavigate } from 'react-router-dom'
import { mockModelConfigAdapter } from '../../adapters'
import { PageShell } from '../shared/SharedUI'
import sharedStyles from '../shared/SharedUI.module.css'
import { MetricRibbon } from '../shared/MetricRibbon'
import type { ModelConfig } from '../../contracts'

const { Text } = Typography

export const ModelConfigPage: React.FC = () => {
  const [models, setModels] = useState<ModelConfig[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const navigate = useNavigate()

  useEffect(() => {
    mockModelConfigAdapter.list()
      .then(m => { setModels(m); setLoading(false) })
      .catch(() => { setError('加载模型配置失败，请刷新重试'); setLoading(false) })
  }, [])

  if (error) return <PageShell><Alert type="error" title={error} showIcon style={{ marginTop: 16 }} /></PageShell>

  const enabledCount = models.filter(m => m.enabled).length

  return (
    <PageShell icon={<InboxOutlined />} title="AI 模型配置 — 主链步骤映射" loading={loading}>
      <div className={sharedStyles.systemStack}>
        <MetricRibbon items={[
          { label: '已启用模型', value: `${enabledCount}/${models.length}`, prefix: <InboxOutlined /> },
          { label: '平均延迟', value: `${Math.round(models.reduce((s, m) => s + m.avgLatencyMs, 0) / Math.max(1, models.length))}ms`, prefix: <ThunderboltOutlined /> },
        ]} />

        <div className={sharedStyles.systemTableWrap}>
          <Table size="small"
            pagination={false}
            dataSource={models.map(m => ({ ...m, key: m.id }))}
            columns={[
              { title: '名称', dataIndex: 'name', width: 140, render: (name: string, record: ModelConfig) => (
                <Text style={{ color: 'var(--brand-primary)', cursor: 'pointer' }} onClick={() => navigate(`/sys/model-config/${record.id}`)}>{name}</Text>
              ) },
              { title: '主链步骤', dataIndex: 'step', width: 100, render: (s: string) => <Tag color="blue">{s}</Tag> },
              { title: '模型', dataIndex: 'modelId', width: 160 },
              { title: '提供商', dataIndex: 'provider', width: 100 },
              { title: '延迟', dataIndex: 'avgLatencyMs', width: 80, render: (v: number) => `${v}ms` },
              { title: '调用', dataIndex: 'callCount', width: 80, render: (v: number) => v.toLocaleString() },
              { title: '版本', dataIndex: 'version', width: 80 },
              { title: '状态', dataIndex: 'enabled', width: 70, render: (v: boolean) => <Switch checked={v} disabled size="small" /> },
            ]}
          />
        </div>
      </div>
    </PageShell>
  )
}

export default ModelConfigPage
