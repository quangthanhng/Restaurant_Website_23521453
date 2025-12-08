import { useState, useRef, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import authApi from '../../apis/auth.api'
import path from '../../constants/path'
import { useToast } from '../../components/Toast'

export default function VerifyOtp() {
  const navigate = useNavigate()
  const location = useLocation()
  const { success, error: showError } = useToast()
  const email = (location.state as { email?: string })?.email || ''

  const [otp, setOtp] = useState<string[]>(['', '', '', '', '', ''])
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  // Redirect if no email
  useEffect(() => {
    if (!email) {
      navigate(path.forgot_password)
    }
  }, [email, navigate])

  const verifyOtpMutation = useMutation({
    mutationFn: (data: { email: string; otp: string }) => authApi.verifyOtp(data)
  })

  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return // Only allow numbers

    const newOtp = [...otp]
    newOtp[index] = value.slice(-1) // Only take last character
    setOtp(newOtp)

    // Auto focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    // Handle backspace
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault()
    const pastedData = e.clipboardData.getData('text').slice(0, 6)
    if (!/^\d+$/.test(pastedData)) return

    const newOtp = [...otp]
    pastedData.split('').forEach((char, index) => {
      if (index < 6) newOtp[index] = char
    })
    setOtp(newOtp)

    // Focus last filled input or last input
    const lastIndex = Math.min(pastedData.length - 1, 5)
    inputRefs.current[lastIndex]?.focus()
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const otpString = otp.join('')
    if (otpString.length !== 6) {
      showError('Vui lòng nhập đủ 6 số OTP')
      return
    }

    // Không gọi API verify-otp ở đây, chuyển thẳng sang trang reset-password
    // API reset-password sẽ tự verify OTP
    navigate(path.reset_password, { state: { email, otp: otpString } })
  }

  const handleResendOtp = () => {
    authApi
      .forgotPassword({ email })
      .then(() => {
        success('Mã OTP mới đã được gửi!')
        setOtp(['', '', '', '', '', ''])
        inputRefs.current[0]?.focus()
      })
      .catch(() => {
        showError('Không thể gửi lại mã OTP!')
      })
  }

  return (
    <div className='relative min-h-screen overflow-hidden bg-white pt-[74px]'>
      {/* Background Decorations */}
      <div className='pointer-events-none absolute inset-0 overflow-hidden'>
        <div className='absolute -left-40 -top-40 h-80 w-80 rounded-full bg-amber-500/10 blur-[100px]' />
        <div className='absolute -bottom-40 -right-40 h-80 w-80 rounded-full bg-amber-500/10 blur-[100px]' />
      </div>

      <div className='relative flex min-h-[calc(100vh-74px)] items-center justify-center px-4 py-12'>
        <div className='relative w-full max-w-md'>
          {/* Decorative Corner Elements */}
          <div className='absolute -left-3 -top-3 h-16 w-16 border-l-2 border-t-2 border-amber-500/30' />
          <div className='absolute -bottom-3 -right-3 h-16 w-16 border-b-2 border-r-2 border-amber-500/30' />

          {/* Card Content */}
          <div className='relative rounded-2xl border border-gray-200/50 bg-gray-50 p-8 shadow-2xl backdrop-blur-xl'>
            <div className='absolute inset-0 rounded-2xl bg-linear-to-b from-savoria-gold/5 to-transparent' />

            <div className='relative'>
              {/* Header */}
              <div className='mb-8 text-center'>
                <div className='mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full border border-amber-500/30 bg-amber-500/10'>
                  <svg className='h-8 w-8 text-amber-600' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth='1.5'
                      d='M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z'
                    />
                  </svg>
                </div>
                <h1 className='font-serif text-3xl font-medium text-gray-900'>Xác Thực OTP</h1>
                <p className='mt-2 text-sm text-gray-500'>
                  Nhập mã 6 số đã gửi đến <span className='font-medium text-gray-700'>{email}</span>
                </p>
              </div>

              {/* OTP Form */}
              <form onSubmit={handleSubmit} className='space-y-6'>
                {/* OTP Input */}
                <div className='flex justify-center gap-3'>
                  {otp.map((digit, index) => (
                    <input
                      key={index}
                      ref={(el) => {
                        inputRefs.current[index] = el
                      }}
                      type='text'
                      inputMode='numeric'
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleChange(index, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(index, e)}
                      onPaste={handlePaste}
                      className='h-14 w-12 rounded-xl border border-stone-200 bg-gray-100/50 text-center text-xl font-bold text-gray-900 transition-all duration-300 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20 hover:border-stone-300'
                    />
                  ))}
                </div>

                {/* Timer & Resend */}
                <div className='text-center'>
                  <button
                    type='button'
                    onClick={handleResendOtp}
                    className='text-sm text-amber-600 hover:text-amber-700 transition-colors'
                  >
                    Gửi lại mã OTP
                  </button>
                  <p className='mt-1 text-xs text-gray-400'>Mã OTP có hiệu lực trong 5 phút</p>
                </div>

                {/* Submit Button */}
                <button
                  type='submit'
                  disabled={verifyOtpMutation.isPending || otp.some((d) => !d)}
                  className='group relative w-full overflow-hidden rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 py-4 text-base font-semibold text-white shadow-lg shadow-amber-500/25 transition-all duration-300 hover:shadow-xl hover:shadow-amber-500/30 disabled:cursor-not-allowed disabled:opacity-70'
                >
                  <span className='absolute inset-0 bg-gradient-to-r from-amber-600 to-amber-700 opacity-0 transition-opacity duration-300 group-hover:opacity-100' />
                  {verifyOtpMutation.isPending ? (
                    <div className='relative flex items-center justify-center gap-2'>
                      <svg className='h-5 w-5 animate-spin' viewBox='0 0 24 24'>
                        <circle
                          className='opacity-25'
                          cx='12'
                          cy='12'
                          r='10'
                          stroke='currentColor'
                          strokeWidth='4'
                          fill='none'
                        />
                        <path
                          className='opacity-75'
                          fill='currentColor'
                          d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
                        />
                      </svg>
                      <span>Đang xác thực...</span>
                    </div>
                  ) : (
                    <span className='relative'>Xác Nhận</span>
                  )}
                </button>
              </form>

              {/* Back to Login */}
              <p className='mt-6 text-center text-sm text-gray-500'>
                <Link to={path.login} className='font-semibold text-amber-600 transition-colors hover:text-amber-700'>
                  ← Quay lại đăng nhập
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
