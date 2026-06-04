/**
 * Shared UI Components — 新主链页面统一基线
 *
 * 所有新架构页面应优先使用这些组件，避免 inline style 堆积。
 * 未来可替换为设计系统组件库（保持相同接口）。
 */
import React from 'react'
import { Typography, Card, Alert, Tag, Empty, Space, Steps, Row, Col, Descriptions, Statistic } from 'antd'
import styles from './SharedUI.module.css'
import { PageLoader } from './PageLoader'

const { Title, Text } = Typography

// ── PageShell ──

interface PageShellProps {
  icon?: React.ReactNode
  title?: React.ReactNode
  extra?: React.ReactNode
  children: React.ReactNode
  loading?: boolean
}
export const PageShell: React.FC<PageShellProps> = ({ icon, title, extra, children, loading }) => {
  if (loading) return <PageLoader />
  return (
    <div className={styles.shell}>
      {title && (
        <div className={styles.shellTitle}>
          <Title level={3} className={styles.shellHeading}>
            {icon && <span className={styles.pageTitleIcon}>{icon}</span>}
            {title}
          </Title>
          {extra}
        </div>
      )}
      {children}
    </div>
  )
}

// ── SectionHeader ──

interface SectionHeaderProps {
  icon?: React.ReactNode
  title: string
  extra?: React.ReactNode
}
export const SectionHeader: React.FC<SectionHeaderProps> = ({ icon, title, extra }) => (
  <div className={styles.sectionHeader}>
    <div className={styles.sectionTitle}>
      {icon && <span className={styles.sectionIcon}>{icon}</span>}
      <Text strong>{title}</Text>
    </div>
    {extra}
  </div>
)

interface CardTitleProps {
  icon?: React.ReactNode
  title: React.ReactNode
  extra?: React.ReactNode
}
export const CardTitle: React.FC<CardTitleProps> = ({ icon, title, extra }) => (
  <div className={styles.cardTitle}>
    <div className={styles.cardTitleMain}>
      {icon && <span className={styles.sectionIcon}>{icon}</span>}
      <Text strong>{title}</Text>
    </div>
    {extra}
  </div>
)

// ── MetricGrid ──

interface MetricGridProps {
  columns?: 2 | 3 | 4
  children: React.ReactNode
}
export const MetricGrid: React.FC<MetricGridProps> = ({ columns = 4, children }) => {
  const cls = columns === 2 ? styles.metricGridCol2 : columns === 3 ? styles.metricGridCol3 : styles.metricGrid
  return <div className={cls}>{children}</div>
}

// ── FlowPanel ──

interface FlowPanelProps {
  children: React.ReactNode
}
export const FlowPanel: React.FC<FlowPanelProps> = ({ children }) => (
  <Card size="small" className={styles.flowPanel}>{children}</Card>
)

// ── EntitySummaryCard ──

interface EntitySummaryCardProps {
  icon?: React.ReactNode
  title: React.ReactNode
  extra?: React.ReactNode
  children: React.ReactNode
}
export const EntitySummaryCard: React.FC<EntitySummaryCardProps> = ({ icon, title, extra, children }) => (
  <Card
    size="small"
    className={styles.entityCard}
    title={<div className={styles.entityCardTitle}>{icon && <span className={styles.sectionIcon}>{icon}</span>}{title}</div>}
    extra={extra}
  >
    {children}
  </Card>
)

// ── InsightCallout ──

interface InsightCalloutProps {
  type?: 'info' | 'success' | 'warning' | 'error'
  title: string
  description?: string
  action?: React.ReactNode
  children?: React.ReactNode
}
export const InsightCallout: React.FC<InsightCalloutProps> = ({ type = 'info', title, description, action, children }) => (
  <Alert
    type={type}
    showIcon
    className={styles.insight}
    title={title}
    description={description || children}
    action={action}
  />
)

// ── ActionBar ──

interface ActionBarProps {
  children: React.ReactNode
}
export const ActionBar: React.FC<ActionBarProps> = ({ children }) => (
  <div className={styles.actionBar}>{children}</div>
)

// ── Spacer ──

export const Spacer: React.FC = () => <div className={styles.spacer} />

// ── PageGrid ──

interface PageGridProps {
  children: React.ReactNode
}
export const PageGrid: React.FC<PageGridProps> = ({ children }) => (
  <div className={styles.grid2}>{children}</div>
)

// ── EmptyState ──

interface EmptyStateProps {
  description?: string
  children?: React.ReactNode
}
export const EmptyState: React.FC<EmptyStateProps> = ({ description, children }) => (
  <Empty description={description} className={styles.emptyState}>
    {children}
  </Empty>
)

// ── StatusStrip ──

interface StatusStripItem {
  label: string
  value: string | number | React.ReactNode
  color?: string
}
interface StatusStripProps {
  items: StatusStripItem[]
}
export const StatusStrip: React.FC<StatusStripProps> = ({ items }) => (
  <div className={styles.statusStrip}>
    <Space size={12} wrap>
      {items.map((item, i) => (
        <div key={i} className={styles.statusStripItem}>
          <Text type="secondary" className={styles.statusLabel}>{item.label}</Text>
          <Text strong style={item.color ? { color: item.color } : undefined}>{item.value}</Text>
        </div>
      ))}
    </Space>
  </div>
)

// ── TracePanel ──

interface TraceStep {
  step: string
  engine?: string
  source?: string
  status: 'used' | 'skipped' | 'pending'
  detail?: string
}
interface TracePanelProps {
  steps: TraceStep[]
}
const statusColor: Record<string, string> = { used: 'green', skipped: 'orange', pending: 'default' }
const statusLabel: Record<string, string> = { used: '已调用', skipped: '跳过', pending: '待执行' }
export const TracePanel: React.FC<TracePanelProps> = ({ steps }) => (
  <Card size="small" className={styles.tracePanel}>
    <Steps
      size="small"
      orientation="vertical"
      current={-1}
      items={steps.map(s => ({
        title: (
          <Space>
            <Text strong>{s.step}</Text>
            {s.engine && <Tag>{s.engine}</Tag>}
            <Tag color={statusColor[s.status]}>{statusLabel[s.status]}</Tag>
          </Space>
        ),
        description: s.source ? (
          <Text type="secondary">{s.source}{s.detail ? ` · ${s.detail}` : ''}</Text>
        ) : s.detail,
      }))}
    />
  </Card>
)

// ── ProcessHeader (breadcrumb + status bar) ──

interface ProcessHeaderProps {
  backTo?: { label: string; onClick: () => void }
  title: string
  status?: React.ReactNode
  actions?: React.ReactNode
}
export const ProcessHeader: React.FC<ProcessHeaderProps> = ({ backTo, title, status, actions }) => (
  <div className={styles.processHeader}>
    <Space size={12} wrap>
      {backTo && <a onClick={backTo.onClick} className={styles.backLink}>← {backTo.label}</a>}
      <Text strong className={styles.strongTextMd}>{title}</Text>
      {status}
      {actions}
    </Space>
  </div>
)

// ── InfoStrip (compact key-value display) ──

interface InfoStripItem { label: string; value: React.ReactNode; span?: number }
interface InfoStripProps { items: InfoStripItem[]; bordered?: boolean }
export const InfoStrip: React.FC<InfoStripProps> = ({ items, bordered }) => (
  <Descriptions size="small" column={2} bordered={bordered}>
    {items.map((item, i) => (
      <Descriptions.Item key={i} label={item.label} span={item.span || 1}>{item.value}</Descriptions.Item>
    ))}
  </Descriptions>
)

// ── KpiCardGroup (responsive KPI card grid) ──

interface KpiCard { title: string; value: React.ReactNode; prefix?: React.ReactNode; color?: string }
interface KpiCardGroupProps { cards: KpiCard[]; columns?: 2 | 3 | 4 }
export const KpiCardGroup: React.FC<KpiCardGroupProps> = ({ cards, columns = 4 }) => {
  const span = Math.max(1, Math.floor(24 / columns))
  return (
    <Row gutter={[12, 12]}>
      {cards.map((c, i) => (
        <Col key={i} xs={24} sm={12} md={span}>
          <Card size="small" className={styles.kpiCard}>
            <Statistic
              title={c.title}
              value={c.value}
              prefix={c.prefix}
              styles={c.color ? { content: { color: c.color } } : undefined}
            />
          </Card>
        </Col>
      ))}
    </Row>
  )
}

// ── ReferenceList (clickable linked-object list) ──

interface ReferenceItem { id: string; label: string; tag?: string; tagColor?: string; onClick?: () => void }
interface ReferenceListProps { items: ReferenceItem[]; title?: string }
export const ReferenceList: React.FC<ReferenceListProps> = ({ items, title }) => (
  <div>
    {title && <Text type="secondary" className={styles.refTitle}>{title}</Text>}
    {items.map((item, i) => (
      <div key={i} className={styles.refItem} onClick={item.onClick} style={item.onClick ? { cursor: 'pointer' } : undefined}>
        <Space size={4}>
          {item.tag && <Tag color={item.tagColor || 'blue'}>{item.tag}</Tag>}
          <Text>{item.label}</Text>
        </Space>
      </div>
    ))}
  </div>
)

// ── TraceSummary (compact engine trace table) ──

interface TraceSummaryItem { step: string; engine: string; source: string; result?: string }
interface TraceSummaryProps { items: TraceSummaryItem[]; title?: string }
export const TraceSummary: React.FC<TraceSummaryProps> = ({ items, title }) => (
  <Card size="small" className={styles.systemInsightPanel} title={title && <Text strong>{title}</Text>}>
    <Space orientation="vertical" size={4} className={styles.traceStack}>
      {items.map((t, i) => (
        <div key={i} className={styles.traceRow}>
          <Text strong className={styles.traceStepLabel}>{t.step}</Text>
          <Tag className={styles.traceEngineTag}>{t.engine}</Tag>
          <Text type="secondary" ellipsis className={styles.traceSource}>{t.source}</Text>
          {t.result && <Tag color="green">{t.result}</Tag>}
        </div>
      ))}
    </Space>
  </Card>
)
