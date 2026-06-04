/**
 * ProductAssetDetailPage — 商品资产详情
 *
 * 展示完整的 ProductAsset 视图：
 * - 基础属性 + AI 提取确认状态
 * - 卖点、FAQ、应用场景
 * - 替代型号、捆绑推荐
 * - 历史成交/流失
 * - 被哪些线索/报价调用（显式关系查询）
 */
import React, { useState, useEffect } from 'react'
import { Card, Descriptions, Tag, Space, Typography, Empty, Divider, Table, Alert, Row, Col, Button } from 'antd'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { LinkOutlined, FileTextOutlined, ThunderboltOutlined, CheckCircleOutlined, ReloadOutlined } from '@/iconMap'
import { mockProductAssetAdapter, mockLeadAdapter, mockOutcomeAdapter, mockSolutionRecommendationAdapter, mockKnowledgeItemAdapter } from '../../adapters'
import { PageShell } from '../shared/SharedUI'
import { DetailHeader } from '../shared/DetailHeader'
import sharedStyles from '../shared/SharedUI.module.css'
import type { ProductAsset, Lead, Outcome, SolutionRecommendation, KnowledgeItem } from '../../contracts'

const { Text } = Typography

export const ProductAssetDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [product, setProduct] = useState<ProductAsset | null>(null)
  const [linkedLeads, setLinkedLeads] = useState<Lead[]>([])
  const [linkedOutcomes, setLinkedOutcomes] = useState<Outcome[]>([])
  const [linkedSolutions, setLinkedSolutions] = useState<SolutionRecommendation[]>([])
  const [linkedKnowledge, setLinkedKnowledge] = useState<KnowledgeItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!id) return
    Promise.all([
      mockProductAssetAdapter.getById(id),
      mockLeadAdapter.getByProductId(id),
      mockOutcomeAdapter.getByProductId(id),
      mockSolutionRecommendationAdapter.getByProductId(id),
      mockKnowledgeItemAdapter.getByProductId(id),
    ]).then(([p, leads, outcomes, solutions, knowledge]) => {
      setProduct(p || null)
      setLinkedLeads(leads)
      setLinkedOutcomes(outcomes)
      setLinkedSolutions(solutions)
      setLinkedKnowledge(knowledge)
      setLoading(false)
    })
  }, [id])

  if (loading) return <PageShell loading />
  if (!product) return <PageShell><Empty description="商品未找到" /></PageShell>

  return (
    <PageShell>
      <DetailHeader
        backTo={{ label: '返回商品库', path: '/product/list' }}
        title={product.name}
      />
      <Row gutter={16}>
        <Col xs={24} lg={14}>
          <Card title="基础属性" size="small" className={sharedStyles.sectionBottomMd}>
            <Descriptions column={2} size="small" bordered>
              <Descriptions.Item label="品牌">{product.brand}</Descriptions.Item>
              <Descriptions.Item label="品类">{product.category}</Descriptions.Item>
              <Descriptions.Item label="型号">{product.model}</Descriptions.Item>
              <Descriptions.Item label="SKU">{product.sku}</Descriptions.Item>
            </Descriptions>
            <Divider>AI 提取属性</Divider>
            <Table size="small" pagination={false}
              dataSource={product.baseAttributes.map((a, i) => ({ ...a, key: i }))}
              columns={[
                { title: '属性', dataIndex: 'name', width: 120 },
                { title: '值', dataIndex: 'value', width: 120 },
                { title: '置信度', dataIndex: 'confidence', width: 80, render: (v: number) => `${Math.round(v * 100)}%` },
                { title: '状态', dataIndex: 'source', width: 80,
                  render: (s: string) => <Tag color={s === 'manual' ? 'green' : s === 'ai' ? 'blue' : 'orange'}>{s}</Tag> },
              ]}
            />
          </Card>

          <Card title="规格参数" size="small" className={sharedStyles.sectionBottomMd}>
            <Descriptions column={2} size="small" bordered>
              {product.specs.map(spec => (
                <Descriptions.Item key={spec.key} label={spec.label}>
                  {spec.value}{spec.unit ? ` ${spec.unit}` : ''}
                </Descriptions.Item>
              ))}
            </Descriptions>
          </Card>

          <Card title="AI 卖点提炼" size="small" className={sharedStyles.sectionBottomMd}>
            <div className={sharedStyles.listItemTight}>
              {product.sellingPoints.map((sp: string, i: number) => (
                <div key={i} className={sharedStyles.listItemTight}><Text>{sp}</Text></div>
              ))}
            </div>
          </Card>

          {product.faqItems.length > 0 && (
            <Card title="常见问题" size="small" className={sharedStyles.sectionBottomMd}>
              {product.faqItems.map((faq, i) => (
                <Alert key={i} type="info" title={faq.question} description={faq.answer} className={sharedStyles.sectionBottomMd} />
              ))}
            </Card>
          )}

          <Card title="历史表现" size="small" className={sharedStyles.sectionBottomMd}>
            <Descriptions column={1} size="small" bordered>
              <Descriptions.Item label="历史成交率">
                {product.historicalWinRate != null ? (
                  <Text strong style={{ color: product.historicalWinRate >= 0.7 ? 'var(--success)' : 'var(--warning)' }}>
                    {Math.round(product.historicalWinRate * 100)}%
                  </Text>
                ) : '—'}
              </Descriptions.Item>
            </Descriptions>
            {product.historicalLossReasons.length > 0 && (
              <>
                <Divider>流失原因</Divider>
                {product.historicalLossReasons.map((r, i) => (
                  <Alert key={i} type="warning" title={r} className={sharedStyles.sectionTopSm} />
                ))}
              </>
            )}
          </Card>

          {product.alternativeModels.length > 0 && (
            <Card title="替代型号" size="small" className={sharedStyles.sectionBottomMd}>
              <Space wrap>{product.alternativeModels.map(m => <Tag key={m} color="orange">{m}</Tag>)}</Space>
            </Card>
          )}

          {product.bundleRecommendations.length > 0 && (
            <Card title="捆绑推荐" size="small" className={sharedStyles.sectionBottomMd}>
              {product.bundleRecommendations.map((b, i) => (
                <Alert key={i} type="success" title={b.productName} description={b.reason} className={sharedStyles.sectionBottomMd} />
              ))}
            </Card>
          )}

          <Card title="应用场景" size="small" className={sharedStyles.sectionBottomMd}>
            <Space wrap>{product.applicationScenarios.map((s, i) => <Tag key={i} color="cyan">{s}</Tag>)}</Space>
          </Card>

          {product.riskNotes.length > 0 && (
            <Card title="风险信息" size="small" className={sharedStyles.sectionBottomMd}>
              {product.riskNotes.map((r, i) => (
                <Alert key={i} type="warning" title={r} showIcon className={sharedStyles.sectionTopSm} />
              ))}
            </Card>
          )}

          {product.complianceNotes.length > 0 && (
            <Card title="合规信息" size="small" className={sharedStyles.sectionBottomMd}>
              {product.complianceNotes.map((c, i) => (
                <Text key={i} type="secondary" className={sharedStyles.blockSecondary}>{c}</Text>
              ))}
            </Card>
          )}
        </Col>

        <Col xs={24} lg={10}>
          <Card title={<Space><LinkOutlined /><Text strong>主链关联</Text></Space>} size="small">
            {linkedLeads.length > 0 && (
              <>
                <Text type="secondary">关联线索：</Text>
                {linkedLeads.map(l => (
                  <div key={l.id} className={sharedStyles.refRow}>
                    <Link to={`/leads/${l.id}`}>
                      <Space><FileTextOutlined /><Text>{l.id}</Text><Tag>{l.companyName}</Tag>
                        <Tag color={l.status === 'won' ? 'green' : l.status === 'lost' ? 'red' : 'blue'}>{l.status}</Tag>
                      </Space>
                    </Link>
                  </div>
                ))}
                <Divider className={sharedStyles.compactDivider} />
              </>
            )}

            {linkedSolutions.length > 0 && (
              <>
                <Text type="secondary">关联方案推荐：</Text>
                {linkedSolutions.map(s => (
                  <div key={s.id} className={sharedStyles.refRow}>
                    <Link to={`/leads/${s.leadId}/solution`}>
                      <Space><ThunderboltOutlined /><Text>{s.id}</Text><Tag>{Math.round(s.confidenceScore * 100)}% 置信</Tag></Space>
                    </Link>
                  </div>
                ))}
                <Divider className={sharedStyles.compactDivider} />
              </>
            )}

            {linkedOutcomes.length > 0 && (
              <>
                <Text type="secondary">关联结果：</Text>
                {linkedOutcomes.map(o => (
                  <div key={o.id} className={sharedStyles.refRow}>
                    <Link to={`/leads/${o.leadId}/outcome`}>
                      <Space><CheckCircleOutlined />
                        <Tag color={o.resultType === 'won' ? 'green' : 'red'}>{o.resultType === 'won' ? '赢单' : '丢单'}</Tag>
                        {o.finalAmount && <Text>¥{o.finalAmount.toLocaleString()}</Text>}
                      </Space>
                    </Link>
                  </div>
                ))}
                <Divider className={sharedStyles.compactDivider} />
              </>
            )}

            {linkedKnowledge.length > 0 && (
              <>
                <Text type="secondary">关联知识回流：</Text>
                {linkedKnowledge.map(k => (
                  <div key={k.id} className={sharedStyles.refRow}>
                    <Space size={4}><ReloadOutlined />
                      <Tag color={k.type === 'pricing_strategy' ? 'purple' : k.type === 'loss_analysis' ? 'red' : 'blue'}>{k.type}</Tag>
                      <Text ellipsis className={sharedStyles.ellipsisNarrow}>{k.title}</Text>
                    </Space>
                  </div>
                ))}
                <Divider className={sharedStyles.compactDivider} />
              </>
            )}

            <Button size="small" type="link" icon={<LinkOutlined />} onClick={() => navigate('/product/list')}>
              返回商品资产中心
            </Button>
          </Card>
        </Col>
      </Row>
    </PageShell>
  )
}

export default ProductAssetDetailPage
