import { demoApi } from './demoApi'
import { bizDataStore } from './bizData'
import { inquiryDataStore } from './inquiryData'

export const bizService = {
  getOverviewStats: () => demoApi.get(bizDataStore.getOverviewStats(), 300),
  getCases: () => demoApi.get(bizDataStore.getCases(), 300),
  getAttributionFunnel: () => demoApi.get(inquiryDataStore.getAttributionFunnel(), 300),
  getAttributionSource: () => demoApi.get(inquiryDataStore.getAttributionSource(), 300),
  getAttributionCategory: () => demoApi.get(inquiryDataStore.getAttributionCategory(), 300),
  getKnowledgeBase: () => demoApi.get(inquiryDataStore.getKnowledgeBase(), 300),
  getAttributionTrend: () => demoApi.get(inquiryDataStore.getAttributionTrend(), 300),
}
