import { demoApi } from './demoApi'
import { csDataStore } from './csData'

export const csService = {
  getSessions: () => demoApi.get(csDataStore.getSessions(), 300),
  getMarketingSessions: () => demoApi.get(csDataStore.getMarketingSessions(), 300),
  getMessages: () => demoApi.get(csDataStore.getMessages(), 280),
  getReplySuggestions: () => demoApi.post(csDataStore.getReplySuggestions(), 450),
  getMarketingRecommendations: () => demoApi.post(csDataStore.getMarketingRecommendations(), 450),
  captureLead: () => demoApi.post(csDataStore.captureLead(), 250),
  getOrders: () => demoApi.get(csDataStore.getOrders(), 220),
}
