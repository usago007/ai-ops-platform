import { demoApi } from './demoApi'
import { productDataStore } from './productData'

interface CreateProductPayload {
  category?: string
  brand?: string
  model?: string
  description?: string
  unit?: string
  price?: string
  source?: string
  raw_text?: string
  [key: string]: unknown
}

interface ConfirmProductPayload {
  category?: string
  brand?: string
  model?: string
  attributes?: Array<{ name: string; value: string; status: string }>
  [key: string]: unknown
}

export const productService = {
  getProducts: () => demoApi.get(productDataStore.getProducts(), 300),
  getProductList: () => demoApi.get(productDataStore.getProducts(), 300),
  getProductDetail: (id: string) => demoApi.get(productDataStore.getProductDetail(id), 350),
  getProductStructured: (id: string) => demoApi.get(productDataStore.getProductDetail(id), 350),
  parseProductText: (text: string) => demoApi.post(productDataStore.parseProductText(text), 400),
  batchStructure: () => demoApi.post(productDataStore.batchStructure(), 500),
  getCategories: () => demoApi.get(productDataStore.getCategories(), 250),
  createCategory: (data: { level1?: string; parent_id?: string | null; name: string; brand?: string }) =>
    demoApi.post(productDataStore.createCategory(data), 250),
  createProduct: (payload: CreateProductPayload) => demoApi.post(productDataStore.createProduct(payload), 350),
  confirmProduct: (id: string, payload: ConfirmProductPayload) => demoApi.post(productDataStore.confirmProduct(id, payload), 300),
}
