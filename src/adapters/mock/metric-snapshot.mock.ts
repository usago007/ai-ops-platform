import type { MetricSnapshot } from '../../contracts'

export function generateMetricSnapshots(): MetricSnapshot[] {
  const base = {
    leadCount: 42,
    qualifiedRate: 0.71,
    replyAdoptionRate: 0.83,
    quotationCycleHours: 2.5,
    winRate: 0.38,
    avgDealAmount: 85600,
    automationCoverage: 0.65,
    manualReviewRate: 0.35,
    highRiskInterceptRate: 0.12,
    aiSavedHours: 28,
  }

  return [
    { date: '2025-01-16', ...base, leadCount: 42, winRate: 0.40, aiSavedHours: 32 },
    { date: '2025-01-15', ...base, leadCount: 38, winRate: 0.35, aiSavedHours: 28 },
    { date: '2025-01-14', ...base, leadCount: 45, winRate: 0.33, aiSavedHours: 25 },
    { date: '2025-01-13', ...base, leadCount: 36, winRate: 0.42, aiSavedHours: 30 },
    { date: '2025-01-12', ...base, leadCount: 40, winRate: 0.38, aiSavedHours: 26 },
    { date: '2025-01-11', ...base, leadCount: 33, winRate: 0.36, aiSavedHours: 24 },
    { date: '2025-01-10', ...base, leadCount: 41, winRate: 0.39, aiSavedHours: 29 },
  ]
}

export function getLatestMetricSnapshot(): MetricSnapshot {
  return generateMetricSnapshots()[0]
}
