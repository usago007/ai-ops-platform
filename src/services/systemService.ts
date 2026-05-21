import { demoApi } from './demoApi'
import { systemDataStore, type SystemSettings, type ComplianceWordsData, type NotificationTemplate } from './systemData'

export const systemService = {
  getSettings: () => demoApi.get(systemDataStore.getSettings(), 300),
  updateSettings: (data: Partial<SystemSettings>) => demoApi.post(systemDataStore.updateSettings(data), 400),
  getComplianceWords: () => demoApi.get(systemDataStore.getComplianceWords(), 300),
  addComplianceWord: (category: keyof Omit<ComplianceWordsData, 'total'>, word: string) => demoApi.post(systemDataStore.addComplianceWord(category, word), 200),
  removeComplianceWord: (category: keyof Omit<ComplianceWordsData, 'total'>, word: string) => demoApi.post(systemDataStore.removeComplianceWord(category, word), 200),
  getNotifications: () => demoApi.get(systemDataStore.getNotifications(), 300),
  toggleNotification: (id: string, enabled: boolean) => demoApi.post(systemDataStore.toggleNotification(id, enabled), 200),
  addNotification: (data: Omit<NotificationTemplate, 'id'>) => demoApi.post(systemDataStore.addNotification(data), 300),
  deleteNotification: (id: string) => demoApi.post(systemDataStore.deleteNotification(id), 200),
  getUsers: () => demoApi.get(systemDataStore.getUsers(), 300),
  getRoles: () => demoApi.get(systemDataStore.getRoles(), 300),
  updateUserRole: (id: string, role: string) => demoApi.post(systemDataStore.updateUserRole(id, role), 250),
  getHealth: () => demoApi.get(systemDataStore.getHealth(), 300),
  getRecentActions: () => demoApi.get(systemDataStore.getRecentActions(), 300),
  getAuditLogs: (page = 1, pageSize = 10) => demoApi.get(systemDataStore.getAuditLogs(page, pageSize), 320),
  getAuditTrailLogs: (page = 1, pageSize = 10, keyword = '') => demoApi.get(systemDataStore.getAuditTrailLogs(page, pageSize, keyword), 320),
  exportAuditLogs: () => Promise.resolve(systemDataStore.exportAuditLogs()),
  getTopology: () => demoApi.get(systemDataStore.getTopology(), 350),
  toggleAgent: (id: string) => demoApi.post(systemDataStore.toggleAgent(id), 240),
  updateAgentWeight: (id: string, weight: number) => demoApi.post(systemDataStore.updateAgentWeight(id, weight), 240),
  getWorkflows: () => demoApi.get(systemDataStore.getWorkflows(), 350),
  getWorkflow: (moduleId: string) => demoApi.get(systemDataStore.getWorkflow(moduleId), 280),
}

export type { SystemSettings, ComplianceWordsData, NotificationTemplate }
