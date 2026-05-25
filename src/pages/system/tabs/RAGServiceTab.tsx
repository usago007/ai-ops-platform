import React from 'react'
import { Card, Row, Col, Form, Select, InputNumber, Slider, Button, Badge, Statistic, Tag, Space, Table, Progress, message } from 'antd'
import {
  ReloadOutlined,
  CheckOutlined,
} from '@/iconMap'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import styles from '../AgentOrchestrationPage.module.css'
import type { RAGService, RagIndex, RetrievalMetrics, DocumentHistory } from '../AgentOrchestrationPage.types'
import { getStatusColor, getStatusText } from '../AgentOrchestrationPage.types'
import { CHART_COLORS, CHART_LABEL_COLOR, STATUS_COLORS } from '../../../styles/chartColors'

const { Option } = Select

interface RAGServiceTabProps {
  ragService: RAGService
  ragIndices: RagIndex[]
  retrievalMetrics: RetrievalMetrics
  documentHistory: DocumentHistory[]
}

export const RAGServiceTab: React.FC<RAGServiceTabProps> = ({
  ragService,
  ragIndices,
  retrievalMetrics,
  documentHistory,
}) => {
  return (
    <div className={styles.container}>
      <Card title="RAG 服务配置" className={styles.card}>
        <Row gutter={[16, 16]}>
          <Col span={8}>
            <Card title="向量数据库" size="small" className={styles.subCard}>
              <Form layout="vertical">
                <Form.Item label="数据库类型">
                  <Select defaultValue={ragService.vectorDb}>
                    <Option value="Milvus">Milvus</Option>
                    <Option value="Pinecone">Pinecone</Option>
                    <Option value="Weaviate">Weaviate</Option>
                    <Option value="Qdrant">Qdrant</Option>
                  </Select>
                </Form.Item>
                <Form.Item label="状态">
                  <Badge status={getStatusColor(ragService.status) as any} text={getStatusText(ragService.status)} />
                </Form.Item>
                <Form.Item label="索引数量">
                  <Statistic value={ragService.indexCount} />
                </Form.Item>
                <Form.Item label="文档总数">
                  <Statistic value={ragService.documentCount} />
                </Form.Item>
              </Form>
            </Card>
          </Col>

          <Col span={8}>
            <Card title="Embedding 配置" size="small" className={styles.subCard}>
              <Form layout="vertical">
                <Form.Item label="Embedding 模型">
                  <Select defaultValue={ragService.embeddingModel}>
                    <Option value="text-embedding-3-large">text-embedding-3-large</Option>
                    <Option value="text-embedding-3-small">text-embedding-3-small</Option>
                    <Option value="bge-large-zh">bge-large-zh</Option>
                    <Option value="m3e">m3e</Option>
                  </Select>
                </Form.Item>
                <Form.Item label="Chunk 大小">
                  <InputNumber min={128} max={2048} defaultValue={ragService.chunkSize} />
                </Form.Item>
                <Form.Item label="重叠大小">
                  <InputNumber min={0} max={512} defaultValue={ragService.overlap} />
                </Form.Item>
                <Form.Item label="Top K">
                  <InputNumber min={1} max={100} defaultValue={ragService.topK} />
                </Form.Item>
              </Form>
            </Card>
          </Col>

          <Col span={8}>
            <Card title="重排服务" size="small" className={styles.subCard}>
              <Form layout="vertical">
                <Form.Item label="重排模型">
                  <Select defaultValue={ragService.rerankModel}>
                    <Option value="bge-reranker-v2">bge-reranker-v2</Option>
                    <Option value="jina-reranker-v2">jina-reranker-v2</Option>
                    <Option value="colbert-v2">colbert-v2</Option>
                  </Select>
                </Form.Item>
                <Form.Item label="重排阈值">
                  <Slider min={0} max={1} step={0.01} defaultValue={0.75} />
                </Form.Item>
                <Form.Item label="重排数量">
                  <InputNumber min={1} max={50} defaultValue={10} />
                </Form.Item>
              </Form>
            </Card>
          </Col>
        </Row>

        <div className={styles.formActions}>
          <Button icon={<ReloadOutlined />} onClick={() => message.info('RAG 配置已重置')}>重置</Button>
          <Button type="primary" icon={<CheckOutlined />} className={styles.saveButton} onClick={() => message.success('RAG 服务配置已保存')}>
            保存配置
          </Button>
        </div>
      </Card>

      <Card title="知识库索引管理" className={styles.card}>
        {ragIndices.map(index => (
          <div className={styles.indexItem} key={index.id}>
            <div className={styles.indexHeader}>
              <div>
                <span className={styles.indexName}>{index.name}</span>
                <Tag color={index.status === 'active' ? 'success' : index.status === 'building' ? 'processing' : 'error'} className={styles.modalTagMargin}>
                  {index.status === 'active' ? '就绪' : index.status === 'building' ? '构建中' : '异常'}
                </Tag>
              </div>
              <Space>
                <Tag color="blue">{index.businessModule}</Tag>
                <Tag>{index.embeddingModel}</Tag>
                <span className={styles.indexUpdateTime}>更新于: {index.lastUpdated}</span>
              </Space>
            </div>
            <div className={styles.indexStats}>
              <div className={styles.indexStat}>
                <div className={styles.indexStatValue}>{index.documentCount.toLocaleString()}</div>
                <div className={styles.indexStatLabel}>文档数</div>
              </div>
              <div className={styles.indexStat}>
                <div className={styles.indexStatValue}>{index.vectorCount.toLocaleString()}</div>
                <div className={styles.indexStatLabel}>向量数</div>
              </div>
            </div>
          </div>
        ))}
      </Card>

      <Row gutter={16}>
        <Col span={8}>
          <Card title="检索效果指标" className={`${styles.card} ${styles.evaluationCard}`}>
            <div className={`${styles.executionStatsRow} ${styles.retrievalStatsColumn}`}>
              <div className={styles.executionStatCard}>
                <div className={`${styles.executionStatValue} ${styles.statValueSuccess}`}>{retrievalMetrics.accuracy}%</div>
                <div className={styles.executionStatLabel}>准确率 (Accuracy)</div>
                <Progress percent={Math.round(retrievalMetrics.accuracy)} strokeColor={STATUS_COLORS.success} showInfo={false} />
              </div>
              <div className={styles.executionStatCard}>
                <div className={`${styles.executionStatValue} ${styles.statValueChart1}`}>{retrievalMetrics.recall}%</div>
                <div className={styles.executionStatLabel}>召回率 (Recall)</div>
                <Progress percent={Math.round(retrievalMetrics.recall)} strokeColor={CHART_COLORS[1]} showInfo={false} />
              </div>
              <div className={styles.executionStatCard}>
                <div className={`${styles.executionStatValue} ${styles.statValueWarning}`}>{retrievalMetrics.avgLatency}ms</div>
                <div className={styles.executionStatLabel}>平均检索延迟</div>
              </div>
            </div>
          </Card>
        </Col>
        <Col span={16}>
          <Card title="检索效果趋势" className={`${styles.card} ${styles.evaluationCard}`}>
            <div className={styles.successRateChartContainer}>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={retrievalMetrics.trend.map(t => ({
                  day: t.day,
                  '准确率': t.accuracy,
                  '召回率': t.recall,
                }))}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                  <XAxis dataKey="day" tick={{ fill: CHART_LABEL_COLOR }} />
                  <YAxis tick={{ fill: CHART_LABEL_COLOR }} />
                  <Tooltip formatter={(value: number) => [`${value}%`, '']} />
                  <Legend />
                  <Line type="monotone" dataKey="准确率" stroke={STATUS_COLORS.success} dot={{ r: 3 }} activeDot={{ r: 5 }} />
                  <Line type="monotone" dataKey="召回率" stroke={CHART_COLORS[1]} dot={{ r: 3 }} activeDot={{ r: 5 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </Col>
      </Row>

      <Card title="文档处理历史" className={`${styles.card} ${styles.documentHistoryCard}`}>
        <Table
          dataSource={documentHistory}
          rowKey="id"
          pagination={false}
          size="small"
          columns={[
            { title: '文档名称', dataIndex: 'name', key: 'name' },
            { title: '类型', dataIndex: 'type', key: 'type', render: (t: string) => <Tag>{t}</Tag> },
            { title: '状态', dataIndex: 'status', key: 'status', render: (s: string) => <Badge status={s === 'completed' ? 'success' : s === 'processing' ? 'processing' : 'error'} text={s === 'completed' ? '已完成' : s === 'processing' ? '处理中' : '失败'} /> },
            { title: '分块数', dataIndex: 'chunks', key: 'chunks' },
            { title: '上传时间', dataIndex: 'uploadedAt', key: 'uploadedAt', width: 180 },
            { title: '处理完成时间', dataIndex: 'processedAt', key: 'processedAt', width: 180, render: (v: string) => v || '-' },
          ]}
        />
      </Card>
    </div>
  )
}
