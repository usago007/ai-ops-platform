import React, { useState, useEffect } from 'react'
import { Card, Form, Select, Button, Input, Space, message, Spin, Typography, Tag, Divider, Image, Row, Col } from 'antd'
import { RocketOutlined, ScanOutlined, BulbOutlined, HistoryOutlined } from '@/iconMap'
import { useLocation } from 'react-router-dom'
import { CapabilityBanner } from '../../components/CapabilityBanner/CapabilityBanner'
import { marketingService } from '../../services'
import styles from './ContentCreatePage.module.css'
import formStyles from '../../styles/form.module.css'

const { Text } = Typography

const QUICK_TEMPLATES = [
  { id: 'TPL-001', name: '双11大促', scene: 'promotion', style: 'urgent', channels: ['landing', 'sms'] },
  { id: 'TPL-002', name: '新品首发', scene: 'launch', style: 'professional', channels: ['landing', 'push'] },
  { id: 'TPL-003', name: '会员专属', scene: 'vip', style: 'friendly', channels: ['sms', 'push'] },
  { id: 'TPL-004', name: '限时秒杀', scene: 'flash_sale', style: 'urgent', channels: ['push', 'sms'] },
]

interface Violation {
  word: string
  position: [number, number]
  suggestion: string
}

interface ComplianceResult {
  passed: boolean
  violations: Violation[]
}

interface ContentVersion {
  id: string
  title: string
  subtitle: string
  body: string
  style: string
}

interface GenerateResult {
  versions: ContentVersion[]
}

interface Material {
  id: string
  url: string
  name: string
  tag: string
}

export const ContentCreatePage: React.FC = () => {
  const location = useLocation()
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<GenerateResult | null>(null)
  const [complianceResult, setComplianceResult] = useState<ComplianceResult | null>(null)
  const [materials, setMaterials] = useState<Material[]>([])
  const [complianceScanning, setComplianceScanning] = useState(false)

  useEffect(() => {
    const template = (location.state as any)?.template
    const prefill = (location.state as any)?.prefill
    if (template) {
      form.setFieldsValue({
        scene: template.scene,
        style: template.style,
        channel: template.channels,
      })
    }
    if (prefill) {
      form.setFieldsValue(prefill)
    }
  }, [form, location.state])

  const handleGenerate = async () => {
    setLoading(true)
    try {
      const values = form.getFieldsValue()
      const response = await marketingService.generate({ ...values, productName: 'PLC控制器 FX3U-64MT' })
      if (response.success) {
        setResult(response.data)
        loadMaterials()
      }
    } catch { message.error('生成失败') }
    finally { setLoading(false) }
  }

  const loadMaterials = async () => {
    try {
      const response = await marketingService.getMaterials()
      if (response.success) setMaterials(response.data.materials || [])
    } catch { console.error(e) }
  }

  const handleComplianceCheck = async (content: string) => {
    setComplianceScanning(true)
    try {
      const response = await marketingService.complianceCheck({ content })
      if (response.success) setComplianceResult(response.data)
    } catch { console.error(e) }
    finally { setComplianceScanning(false) }
  }

  const renderContent = (content: string) => {
    if (!complianceResult?.violations?.length) return content
    let result = content
    complianceResult.violations.forEach((v: Violation) => {
      const before = result.slice(0, v.position[0])
      const word = result.slice(v.position[0], v.position[1])
      const after = result.slice(v.position[1])
      result = `${before}<mark class="${styles.violation}" title="建议: ${v.suggestion}">${word}</mark>${after}`
    })
    return <span dangerouslySetInnerHTML={{ __html: result }} />
  }

  return (
    <div className={styles.container}>
      <div className={styles.sidebar}>
        <Card title="内容生成配置" size="small">
          <Form form={form} layout="vertical" size="small">
            <Form.Item label="营销场景" name="scene" rules={[{ required: true, message: '请选择营销场景' }]}>
              <Select options={[
                { label: '节日促销', value: 'promotion' },
                { label: '新品发布', value: 'launch' },
                { label: '限时秒杀', value: 'flash_sale' },
                { label: '会员专属', value: 'vip' },
              ]} />
            </Form.Item>
            <Form.Item label="文案风格" name="style" rules={[{ required: true, message: '请选择内容风格' }]}>
              <Select options={[
                { label: '正式专业', value: 'professional' },
                { label: '活泼亲和', value: 'friendly' },
                { label: '紧迫感', value: 'urgent' },
              ]} />
            </Form.Item>
            <Form.Item label="发布渠道" name="channel" rules={[{ required: true, message: '请选择发布渠道' }]}>
              <Select mode="multiple" options={[
                { label: '落地页', value: 'landing' },
                { label: '短信', value: 'sms' },
                { label: 'Push推送', value: 'push' },
              ]} />
            </Form.Item>
            <Form.Item label="补充说明" name="note">
              <Input.TextArea rows={3} placeholder="补充营销重点..." />
            </Form.Item>
            <Button type="primary" icon={<RocketOutlined />} block onClick={handleGenerate} loading={loading}>
              AI 生成内容
            </Button>
          </Form>
        </Card>

        {materials.length > 0 && (
          <Card title="素材推荐" size="small" className={styles.materialCard}>
            <Space direction="vertical" className={formStyles.fullWidth}>
              {materials.map(m => (
                <div key={m.id} className={styles.materialItem}>
                  <Image src={m.url} width={60} height={45} preview={false} />
                  <div>
                    <div className={styles.materialName}>{m.name}</div>
                    <Tag>{m.tag}</Tag>
                  </div>
                </div>
              ))}
            </Space>
          </Card>
        )}
      </div>

      <div className={styles.main}>
        {!result ? (
          <div className={styles.empty}>
            <RocketOutlined className={styles.emptyIcon} />
            <p>配置左侧参数，点击"AI 生成内容"</p>
          </div>
        ) : (
          <>
            <div className={styles.versions}>
              {result.versions.map((v: ContentVersion, i: number) => (
                <Card key={v.id} title={`版本 ${i + 1}`} size="small" className={styles.versionCard}
                  extra={<Tag>{v.style}</Tag>}>
                  <h4 className={styles.versionTitle}>{renderContent(v.title)}</h4>
                  <Text type="secondary">{v.subtitle}</Text>
                  <Divider />
                  <p>{renderContent(v.body)}</p>
                  <Space className={styles.versionActions}>
                    <Button size="small" onClick={() => handleComplianceCheck(v.title + v.body)}>
                      <ScanOutlined /> 合规检测
                    </Button>
                    <Button type="primary" size="small">选用此版本</Button>
                  </Space>
                </Card>
              ))}
            </div>

            {complianceScanning && <div className={styles.scanning}>合规检测中...</div>}
            {complianceResult && (
              <Card title="合规检测结果" size="small" className={styles.complianceCard}>
                {complianceResult.passed ? (
                  <Tag color="green">✅ 检测通过，无违规内容</Tag>
                ) : (
                  <div>
                    <Tag color="red">⚠️ 发现 {complianceResult.violations.length} 处违规</Tag>
                    <ul>
                      {complianceResult.violations.map((v: Violation, i: number) => (
                        <li key={i}>「<strong>{v.word}</strong>」→ 建议改为：{v.suggestion}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </Card>
            )}
          </>
        )}
      </div>
    </div>
  )
}
