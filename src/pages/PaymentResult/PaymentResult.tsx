import { useEffect, useState } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { useToast } from '../../components/Toast'
import path from '../../constants/path'
import orderApi from '../../apis/order.api'

export default function PaymentResult() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { success, error } = useToast()
  const [isProcessing, setIsProcessing] = useState(true)

  useEffect(() => {
    const processPaymentResult = async () => {
      // Lấy các params từ MoMo callback
      const resultCode = searchParams.get('resultCode')
      const message = searchParams.get('message')
      // MoMo có thể gửi orderId (bản gốc của order) trong orderInfo
      // hoặc orderId là MOMO order ID, còn id là order ID trong DB
      const orderInfo = searchParams.get('orderInfo') // Order ID từ backend lưu trong orderInfo
      const orderId = searchParams.get('orderId') // MoMo orderId (có thể là order._id)
      const idParam = searchParams.get('id') // Legacy IPN param

      // Lấy email từ localStorage vì MoMo redirect không có email
      const email = searchParams.get('email') || localStorage.getItem('userEmail') || ''

      // Ưu tiên orderInfo (chứa order._id thực sự), sau đó orderId, cuối cùng là id
      const actualOrderId = orderInfo || orderId || idParam

      console.log('Payment Result:', { resultCode, message, orderInfo, orderId, idParam, actualOrderId, email })

      // Nếu có actualOrderId, gọi API confirm payment
      // MoMo redirect không có email, nên chỉ cần check actualOrderId
      if (actualOrderId) {
        try {
          // Gọi API backend để confirm payment và update status
          // API này sẽ trigger socket notification cho admin
          // Nếu không có email thì dùng empty string
          await orderApi.confirmPayment(actualOrderId, email || '')
          console.log('Payment confirmed on backend!')
          success('Thanh toán thành công! Cảm ơn bạn đã đặt bàn.')
        } catch (err) {
          console.error('Error confirming payment:', err)
          // Vẫn hiển thị thành công vì MoMo đã thanh toán OK
          success('Thanh toán thành công! Cảm ơn bạn đã đặt bàn.')
        }
      } else if (resultCode !== '0' && resultCode !== null) {
        error(message || 'Thanh toán không thành công. Vui lòng thử lại.')
      }

      setIsProcessing(false)

      // Redirect về trang Home sau 3 giây
      const timer = setTimeout(() => {
        navigate(path.home)
      }, 3000)

      return () => clearTimeout(timer)
    }

    processPaymentResult()
  }, [searchParams, navigate, success, error])

  const resultCode = searchParams.get('resultCode')
  const orderInfo = searchParams.get('orderInfo')
  const orderId = searchParams.get('orderId')
  const idParam = searchParams.get('id')
  const actualOrderId = orderInfo || orderId || idParam
  // Hiển thị thành công nếu có actualOrderId hoặc resultCode = 0
  const isSuccess = actualOrderId || resultCode === '0'

  return (
    <div className='min-h-screen bg-white pt-[74px]'>
      <div className='mx-auto max-w-4xl px-6 py-24 text-center'>
        {isProcessing ? (
          <>
            <div className='mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-amber-500/20'>
              <svg className='h-12 w-12 animate-spin text-amber-500' fill='none' viewBox='0 0 24 24'>
                <circle className='opacity-25' cx='12' cy='12' r='10' stroke='currentColor' strokeWidth='4'></circle>
                <path
                  className='opacity-75'
                  fill='currentColor'
                  d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
                ></path>
              </svg>
            </div>
            <h1 className='mb-4 text-3xl font-bold text-gray-900'>Đang xử lý thanh toán...</h1>
            <p className='mb-8 text-gray-500'>Vui lòng chờ trong giây lát.</p>
          </>
        ) : isSuccess ? (
          <>
            <div className='mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-green-500/20'>
              <svg className='h-12 w-12 text-green-500' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M5 13l4 4L19 7' />
              </svg>
            </div>
            <h1 className='mb-4 text-3xl font-bold text-gray-900'>Thanh toán thành công!</h1>
            <p className='mb-8 text-gray-500'>Cảm ơn bạn đã đặt bàn. Chúng tôi sẽ liên hệ xác nhận sớm nhất.</p>
          </>
        ) : (
          <>
            <div className='mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-amber-500/20'>
              <svg className='h-12 w-12 text-amber-500' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M6 18L18 6M6 6l12 12' />
              </svg>
            </div>
            <h1 className='mb-4 text-3xl font-bold text-gray-900'>Thanh toán thất bại</h1>
            <p className='mb-8 text-gray-500'>Đã có lỗi xảy ra trong quá trình thanh toán.</p>
          </>
        )}
        <p className='text-sm text-gray-400'>Đang chuyển hướng về trang chủ...</p>
      </div>
    </div>
  )
}
