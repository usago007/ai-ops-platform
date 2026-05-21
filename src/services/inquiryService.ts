import { demoApi } from './demoApi'
import { inquiryDataStore } from './inquiryData'

export const inquiryService = {
  getInquiryList: () => demoApi.get(inquiryDataStore.getInquiryList(), 300),
  getInquiryDetail: (id: string) => demoApi.get(inquiryDataStore.getInquiryDetail(id), 250),
  parseInquiry: async (text: string, options?: { isManual?: boolean; source?: string }) =>
    demoApi.post(await inquiryDataStore.parseInquiry(text, options), 600),
  batchTransform: (ids: string[]) => demoApi.post(inquiryDataStore.batchTransform(ids), 400),
  classifyInquiry: () => demoApi.post(inquiryDataStore.classifyInquiry(), 400),
  getSimilarInquiries: () => demoApi.get(inquiryDataStore.getSimilarInquiries(), 300),
  confirmInquiry: (leadId: string, classification: any, parseResult?: any) =>
    demoApi.post(inquiryDataStore.confirmInquiry(leadId, classification, parseResult), 300),
  getFollowUps: (leadId: string) => demoApi.get(inquiryDataStore.getFollowUps(leadId), 250),
  addFollowUp: (leadId: string, payload: { content: string; type?: string }) =>
    demoApi.post(inquiryDataStore.addFollowUp(leadId, payload), 250),
  getQuotationHistory: (leadId: string) => demoApi.get(inquiryDataStore.getQuotationHistory(leadId), 250),
  getSimilarQuotations: (leadId: string) => demoApi.get(inquiryDataStore.getSimilarQuotations(), 300),
  saveQuotation: (leadId: string, quotation: any) => demoApi.post(inquiryDataStore.saveQuotation(leadId, quotation), 400),
  markResult: (leadId: string, result: 'won' | 'lost', reason?: string, amount?: number) =>
    demoApi.post(inquiryDataStore.markResult(leadId, result, reason, amount), 300),
  getAttributionFunnel: () => demoApi.get(inquiryDataStore.getAttributionFunnel(), 300),
  getAttributionSource: () => demoApi.get(inquiryDataStore.getAttributionSource(), 300),
  getAttributionCategory: () => demoApi.get(inquiryDataStore.getAttributionCategory(), 300),
  getKnowledgeBase: () => demoApi.get(inquiryDataStore.getKnowledgeBase(), 300),
  getAttributionTrend: () => demoApi.get(inquiryDataStore.getAttributionTrend(), 300),
}
