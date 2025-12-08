import http from '../utils/http'

// Request body cho tạo MoMo payment
export interface CreateMoMoPaymentRequest {
  email: string
  id: string // Order ID
}

// Response từ API create-payment
export interface CreateMoMoPaymentResponse {
  message: string
  data: {
    partnerCode: string
    orderId: string
    requestId: string
    amount: number
    responseTime: number
    message: string
    resultCode: number
    payUrl: string
    shortLink: string
  }
  // Fallback nếu response có cấu trúc khác
  payUrl?: string
}

const paymentApi = {
  // Tạo link thanh toán MoMo
  createMoMoPayment: (body: CreateMoMoPaymentRequest) => {
    return http.post<CreateMoMoPaymentResponse>('/orders/create-payment', body)
  }
}

export default paymentApi
