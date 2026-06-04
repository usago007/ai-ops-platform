/**
 * ModelDetailPage — 模型配置详情
 */
import React, { useEffect, useState } from 'react'
import { Alert, Card, Tag, Typography, Empty, Descriptions } from 'antd'
import { InboxOutlined } from '@/iconMap'
import { useParams } from 'react-router-dom'
import { mockModelConfigAdapter } from '../../adapters'
import { PageShell, InfoStrip } from '../shared/SharedUI'
import { DetailHeader } from '../shared/DetailHeader'
import type { ModelConfig } from '../../contracts'

const { Text } = Typography

export const ModelDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const [model, setModel] = useState<ModelConfig | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (!id) { setLoading(false); return }
    mockModelConfigAdapter.getById(id).then(async (found) => {
      if (!found) {
        const all = await mockModelConfigAdapter.list()
        setModel(all.find(m => m.id === id) || null)
      } else {
        setModel(found)
      }
      setLoading(false)
    }).catch(() => { setError('加载模型详情失败，请刷新重试'); setLoading(false) })
  }, [id])

  if (error) return <PageShell><Alert type="error" title={error} showIcon style={{ marginTop: 16 }} /></PageShell>

  if (loading) return <PageShell loading />
  if (!model) return <PageShell><Empty description="模型配置未找到" /></PageShell>

  return (
    <PageShell>
      <DetailHeader
        backTo={{ label: '返回模型配置', path: '/sys/model-config' }}
        title={<><InboxOutlined /> 模型详情 — {model.name}</>}
      />
      <Card>
        <InfoStrip
          bordered
          items={[
            { label: 'ID', value: model.id },
            { label: '名称', value: <Text strong>{model.name}</Text> },
            { label: '步骤', value: <Tag color="blue">{model.step}</Tag> },
            { label: '模型 ID', value: <Tag>{model.modelId}</Tag> },
            { label: '提供商', value: model.provider },
            { label: '状态', value: <Tag color={model.enabled ? 'green' : 'default'}>{model.enabled ? '启用' : '禁用'}</Tag> },
            { label: '版本', value: model.version },
            { label: '平均延迟', value: `${model.avgLatencyMs}ms` },
            { label: '调用次数', value: model.callCount.toLocaleString() },
            { label: '更新时间', value: model.updatedAt },
          ]}
        />
      </Card>

      <Card title="配置参数" style={{ marginTop: 16 }}>
        {Object.keys(model.params).length > 0 ? (
          <Descriptions size="small" bordered column={1}>
            {Object.entries(model.params).map(([key, value]) => (
              <Descriptions.Item key={key} label={key}>
                <Tag>{String(value)}</Tag>
              </Descriptions.Item>
            ))}
          </Descriptions>
        ) : (
          <Text type="secondary">无配置参数</Text>
        )}
      </Card>
    </PageShell>
  )
}

export default ModelDetailPage
