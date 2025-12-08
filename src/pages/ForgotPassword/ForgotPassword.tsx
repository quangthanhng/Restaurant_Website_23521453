import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link, useNavigate } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import authApi from '../../apis/auth.api'
import { rules } from '../../utils/rules'
import type { ErrorResponse } from '../../types/user.type'
import { AxiosError } from 'axios'
import path from '../../constants/path'
import { useToast } from '../../components/Toast'

interface ForgotPasswordFormData {
  email: string
}

export default function ForgotPassword() {
  const navigate = useNavigate()
  const { success, error: showError } = useToast()
  const [emailSent, setEmailSent] = useState(false)

  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors }
  } = useForm<ForgotPasswordFormData>()

  const forgotPasswordMutation = useMutation({
    mutationFn: (data: ForgotPasswordFormData) => authApi.forgotPassword(data)
  })

  const onSubmit = handleSubmit((data) => {
    forgotPasswordMutation.mutate(data, {
      onSuccess: () => {
        setEmailSent(true)
        success('Mã OTP đã được gửi đến email của bạn!')
      },
      onError: (err) => {
        if (err instanceof AxiosError) {
          const errorData = err.response?.data as ErrorResponse
          showError(errorData?.message || 'Có lỗi xảy ra, vui lòng thử lại!')
        }
      }
    })
  })

  const handleContinue = () => {
    const email = getValues('email')
    navigate(path.verify_otp, { state: { email } })
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
                      d='M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z'
                    />
                  </svg>
                </div>
                <h1 className='font-serif text-3xl font-medium text-gray-900'>Quên Mật Khẩu</h1>
                <p className='mt-2 text-sm text-gray-500'>
                  {emailSent ? 'Mã OTP đã được gửi đến email của bạn' : 'Nhập email để nhận mã xác thực OTP'}
                </p>
              </div>

              {!emailSent ? (
                /* Form nhập email */
                <form onSubmit={onSubmit} className='space-y-5' noValidate>
                  <div>
                    <label htmlFor='email' className='mb-2 block text-sm font-medium text-gray-600'>
                      Email
                    </label>
                    <div className='relative'>
                      <div className='pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4'>
                        <svg className='h-5 w-5 text-gray-400' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                          <path
                            strokeLinecap='round'
                            strokeLinejoin='round'
                            strokeWidth='2'
                            d='M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z'
                          />
                        </svg>
                      </div>
                      <input
                        type='email'
                        id='email'
                        placeholder='Nhập email của bạn'
                        className={`w-full rounded-xl border bg-gray-100/50 py-3.5 pl-12 pr-4 text-gray-900 placeholder:text-gray-400 transition-all duration-300 focus:outline-none focus:ring-2 ${
                          errors.email
                            ? 'border-red-500/50 focus:border-red-500 focus:ring-red-500/20'
                            : 'border-stone-200/50 focus:border-amber-500 focus:ring-amber-500/20 hover:border-stone-300'
                        }`}
                        {...register('email', rules.email)}
                      />
                    </div>
                    {errors.email && (
                      <p className='mt-2 flex items-center gap-1 text-sm text-red-500'>
                        <svg className='h-4 w-4' fill='currentColor' viewBox='0 0 20 20'>
                          <path
                            fillRule='evenodd'
                            d='M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z'
                            clipRule='evenodd'
                          />
                        </svg>
                        {errors.email.message}
                      </p>
                    )}
                  </div>

                  <button
                    type='submit'
                    disabled={forgotPasswordMutation.isPending}
                    className='group relative w-full overflow-hidden rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 py-4 text-base font-semibold text-white shadow-lg shadow-amber-500/25 transition-all duration-300 hover:shadow-xl hover:shadow-amber-500/30 disabled:cursor-not-allowed disabled:opacity-70'
                  >
                    <span className='absolute inset-0 bg-gradient-to-r from-amber-600 to-amber-700 opacity-0 transition-opacity duration-300 group-hover:opacity-100' />
                    {forgotPasswordMutation.isPending ? (
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
                        <span>Đang gửi...</span>
                      </div>
                    ) : (
                      <span className='relative'>Gửi Mã OTP</span>
                    )}
                  </button>
                </form>
              ) : (
                /* Thông báo đã gửi email */
                <div className='space-y-5'>
                  <div className='rounded-xl bg-green-50 border border-green-200 p-4'>
                    <div className='flex items-start gap-3'>
                      <svg className='h-5 w-5 text-green-600 mt-0.5' fill='currentColor' viewBox='0 0 20 20'>
                        <path
                          fillRule='evenodd'
                          d='M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z'
                          clipRule='evenodd'
                        />
                      </svg>
                      <div>
                        <p className='text-sm font-medium text-green-800'>Email đã được gửi!</p>
                        <p className='mt-1 text-sm text-green-700'>
                          Vui lòng kiểm tra hộp thư của bạn và nhập mã OTP để tiếp tục.
                        </p>
                      </div>
                    </div>
                  </div>

                  <button
                    type='button'
                    onClick={handleContinue}
                    className='group relative w-full overflow-hidden rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 py-4 text-base font-semibold text-white shadow-lg shadow-amber-500/25 transition-all duration-300 hover:shadow-xl hover:shadow-amber-500/30'
                  >
                    <span className='absolute inset-0 bg-gradient-to-r from-amber-600 to-amber-700 opacity-0 transition-opacity duration-300 group-hover:opacity-100' />
                    <span className='relative'>Tiếp Tục Nhập OTP</span>
                  </button>

                  <button
                    type='button'
                    onClick={() => setEmailSent(false)}
                    className='w-full text-center text-sm text-gray-500 hover:text-amber-600 transition-colors'
                  >
                    Gửi lại mã OTP
                  </button>
                </div>
              )}

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
