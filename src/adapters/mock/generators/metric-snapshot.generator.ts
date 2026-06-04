/**
 * MetricSnapshot generator — 30 consecutive daily snapshots with realistic trends.
 */
import type { SeededRng } from './seeded-random'
import type { MetricSnapshot } from '../../../contracts'
import type { Lead } from '../../../contracts'
import type { Outcome } from '../../../contracts'
import type { ReplyDraft } from '../../../contracts'

export function generateMetricSnapshots(
  rng: SeededRng,
  leads: Lead[],
  outcomes: Outcome[],
  replyDrafts: ReplyDraft[],
): MetricSnapshot[] {
  const snapshots: MetricSnapshot[] = []

  // Start from Jan 15, 2025 for 30 days
  const startDate = new Date(2025, 0, 15)

  for (let day = 0; day < 30; day++) {
    const date = new Date(startDate.getTime() + day * 86400000)
    const dateStr = date.toISOString().slice(0, 10)

    // Simulate cumulative growth: leads accumulate over time
    const dayFraction = day / 29
    const totalLeads = Math.floor(20 + dayFraction * leads.length * 0.9)

    // Leads that have reached at least 'qualified' by this date
    const qualifiedCount = Math.floor(totalLeads * (0.45 + dayFraction * 0.25))
    const qualifiedRate = totalLeads > 0 ? Math.min(0.95, qualifiedCount / totalLeads) : 0

    // Automated leads
    const automatedCount = Math.floor(totalLeads * (0.25 + dayFraction * 0.35))
    const automationCoverage = totalLeads > 0 ? Math.min(0.85, automatedCount / totalLeads) : 0

    // Won/lost calculation
    const wonCount = outcomes.filter(o => o.resultType === 'won').length
    const lostCount = outcomes.filter(o => o.resultType === 'lost').length
    // Simulate that not all wins/losses happened by early days
    const dayWonCount = Math.floor(wonCount * dayFraction)
    const dayLostCount = Math.floor(lostCount * dayFraction)
    const dayClosed = dayWonCount + dayLostCount
    const winRate = dayClosed > 0 ? dayWonCount / dayClosed : 0.35

    // Average deal amount (won outcomes)
    const wonOutcomes = outcomes.filter(o => o.resultType === 'won' && o.finalAmount != null)
    const avgDeal = wonOutcomes.length > 0
      ? wonOutcomes.reduce((s, o) => s + (o.finalAmount || 0), 0) / wonOutcomes.length
      : 85000

    // Reply adoption
    const sentReplies = replyDrafts.filter(r => r.status === 'sent').length
    const replyAdoptionRate = replyDrafts.length > 0 ? sentReplies / replyDrafts.length : 0.6

    // Other metrics with daily variation
    const dailyNoise = () => rng.nextFloat(-0.05, 0.05)

    snapshots.push({
      date: dateStr,
      leadCount: totalLeads,
      qualifiedRate: Math.round(Math.min(1, Math.max(0, qualifiedRate + dailyNoise())) * 100) / 100,
      replyAdoptionRate: Math.round(Math.min(1, Math.max(0, replyAdoptionRate + dailyNoise())) * 100) / 100,
      quotationCycleHours: Math.round(rng.nextFloat(1.8, 3.5) * 10) / 10,
      winRate: Math.round(Math.min(1, Math.max(0, winRate + dailyNoise())) * 100) / 100,
      avgDealAmount: Math.round(avgDeal * (1 + dailyNoise())),
      automationCoverage: Math.round(Math.min(1, Math.max(0, automationCoverage + dailyNoise())) * 100) / 100,
      manualReviewRate: Math.round(rng.nextFloat(0.25, 0.45) * 100) / 100,
      highRiskInterceptRate: Math.round(rng.nextFloat(0.08, 0.18) * 100) / 100,
      aiSavedHours: Math.round(totalLeads * 0.65 * (1 + dayFraction * 0.2)),
    })
  }

  return snapshots
}
