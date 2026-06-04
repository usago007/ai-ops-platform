/**
 * SystemHealth generator — computed from generated data counts.
 */
import type { SystemHealth } from '../../../contracts'
import type { Lead } from '../../../contracts'
import type { Outcome } from '../../../contracts'
import type { KnowledgeItem } from '../../../contracts'
import type { MetricSnapshot } from '../../../contracts'

export function generateSystemHealth(
  leads: Lead[],
  outcomes: Outcome[],
  knowledgeItems: KnowledgeItem[],
  metricSnapshots: MetricSnapshot[],
  auditCount: number,
  modelCallCount: number,
): SystemHealth {
  const totalCalls = modelCallCount

  return {
    id: `sys-health-001`,
    totalModelCalls: totalCalls,
    modelCallsByStep: {
      intent_parse: Math.round(totalCalls * 0.35),
      product_recommend: Math.round(totalCalls * 0.25),
      reply_generate: Math.round(totalCalls * 0.20),
      quotation_generate: Math.round(totalCalls * 0.10),
      outcome_loopback: Math.round(totalCalls * 0.10),
    },
    workflowRuns: leads.length,
    auditEntries: auditCount,
    knowledgeItemCount: knowledgeItems.length,
    metricSnapshotCount: metricSnapshots.length,
    avgLatencyMs: 320,
    errorRate: 0.023,
    updatedAt: new Date(2025, 0, 150).toISOString(),
    activeConnections: 12,
  }
}
