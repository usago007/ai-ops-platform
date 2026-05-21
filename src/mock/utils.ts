import { delay, HttpResponse } from 'msw'

export const mockAiDelay = async () => {
  await delay(600 + Math.random() * 600)
}

export const mockConfidence = () => {
  return Number((0.85 + Math.random() * 0.13).toFixed(2))
}

export const mockRiskLevel = () => {
  const rand = Math.random()
  return rand < 0.1 ? 'high' : rand < 0.3 ? 'medium' : 'low'
}

export const successResponse = (data: unknown) => {
  return HttpResponse.json({
    success: true,
    data,
    _meta: {
      model: 'gpt-4-turbo',
      timestamp: new Date().toISOString(),
    },
  })
}

export const errorResponse = (message: string, status = 400) => {
  return HttpResponse.json(
    {
      success: false,
      error: message,
    },
    { status },
  )
}
