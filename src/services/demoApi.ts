async function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

export interface ApiResponse<T> {
  success: boolean
  data: T
  message?: string
}

async function mockRequest<T>(data: T, ms = 300): Promise<ApiResponse<T>> {
  await delay(ms)
  return { success: true, data }
}

export const demoApi = {
  get: <T>(data: T, ms?: number) => mockRequest<T>(data, ms),
  post: <T>(data: T, ms?: number) => mockRequest<T>(data, ms),
}
