import type { SystemHealth } from '../../../contracts/system-health'

export function generateSystemHealth(): SystemHealth {
  return {
    id: 'sys-health-001',
    totalModelCalls: 1247,
    modelCallsByStep: {
      intent_parse: 340,
      product_recommend: 285,
      reply_generate: 312,
      quotation_generate: 210,
      outcome_loopback: 100,
    },
    workflowRuns: 89,
    auditEntries: 456,
    knowledgeItemCount: 23,
    metricSnapshotCount: 45,
    avgLatencyMs: 320,
    errorRate: 0.023,
    updatedAt: new Date().toISOString(),
    activeConnections: 12,
  }
}
