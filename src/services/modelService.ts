import { demoApi } from './demoApi'
import { modelDataStore, type ModelConfig } from './modelData'

export const modelService = {
  getModels: () =>
    demoApi.get(modelDataStore.getModels(), 300),

  updateModel: (id: string, data: Partial<ModelConfig>) =>
    demoApi.post(modelDataStore.updateModel(id, data), 400),

  testModel: (id: string) =>
    demoApi.post(modelDataStore.testModel(id), 500),

  createModel: (data: Omit<ModelConfig, 'id' | 'latency' | 'costPerCall'> | ModelConfig) =>
    demoApi.post(modelDataStore.createModel(data), 400),

  toggleModelStatus: (id: string) =>
    demoApi.post(modelDataStore.toggleModelStatus(id), 300),
}

export type { ModelConfig }
