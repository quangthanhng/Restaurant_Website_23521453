import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import authApi from '../../apis/auth.api'
import { rules } from '../../utils/rules'
import type { ErrorResponse } from '../../types/user.type'
import { AxiosError } from 'axios'
import path from '../../constants/path'
import { useToast } from '../../components/Toast'

interface ResetPasswordFormData {
  newPassword: string
  confirmPassword: string
}

export default function ResetPassword() {
  const navigate = useNavigate()
  const location = useLocation()
  const { success, error: showError } = useToast()
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const email = (location.state as { email?: string; otp?: string })?.email || ''
  const otp = (location.state as { email?: string; otp?: string })?.otp || ''

  // Redirect if no email or otp
  useEffect(() => {
    if (!email || !otp) {
      navigate(path.forgot_password)
    }
  }, [email, otp, navigate])

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors }
  } = useForm<ResetPasswordFormData>()

  const password = watch('newPassword')

  const resetPasswordMutation = useMutation({
    mutationFn: (data: { email: string; otp: string; password: string; newPassword: string }) =>
      authApi.resetPassword(data)
  })

  const onSubmit = handleSubmit((data) => {
    resetPasswordMutation.mutate(
      { email, otp, password: data.newPassword, newPassword: data.newPassword },
      {
        onSuccess: () => {
          success('Đặt lại mật khẩu thành công! Vui lòng đăng nhập.')
          navigate(path.login)
        },
        onError: (err) => {
          if (err instanceof AxiosError) {
            const errorData = err.response?.data as ErrorResponse
            showError(errorData?.message || 'Có lỗi xảy ra, vui lòng thử lại!')
          }
        }
      }
    )
  })

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
                      d='M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z'
                    />
                  </svg>
                </div>
                <h1 className='font-serif text-3xl font-medium text-gray-900'>Đặt Lại Mật Khẩu</h1>
                <p className='mt-2 text-sm text-gray-500'>Nhập mật khẩu mới cho tài khoản của bạn</p>
              </div>

              {/* Reset Password Form */}
              <form onSubmit={onSubmit} className='space-y-5' noValidate>
                {/* New Password Field */}
                <div>
                  <label htmlFor='newPassword' className='mb-2 block text-sm font-medium text-gray-600'>
                    Mật khẩu mới
                  </label>
                  <div className='relative'>
                    <div className='pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4'>
                      <svg className='h-5 w-5 text-gray-400' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                        <path
                          strokeLinecap='round'
                          strokeLinejoin='round'
                          strokeWidth='2'
                          d='M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z'
                        />
                      </svg>
                    </div>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      id='newPassword'
                      placeholder='Tối thiểu 6 ký tự'
                      className={`w-full rounded-xl border bg-gray-100/50 py-3.5 pl-12 pr-12 text-gray-900 placeholder:text-gray-400 transition-all duration-300 focus:outline-none focus:ring-2 ${
                        errors.newPassword
                          ? 'border-red-500/50 focus:border-red-500 focus:ring-red-500/20'
                          : 'border-stone-200/50 focus:border-amber-500 focus:ring-amber-500/20 hover:border-stone-300'
                      }`}
                      {...register('newPassword', rules.password)}
                    />
                    <button
                      type='button'
                      onClick={() => setShowPassword(!showPassword)}
                      className='absolute inset-y-0 right-0 flex items-center pr-4 text-gray-400 transition-colors hover:text-amber-600'
                    >
                      {showPassword ? (
                        <svg className='h-5 w-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                          <path
                            strokeLinecap='round'
                            strokeLinejoin='round'
                            strokeWidth='2'
                            d='M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21'
                          />
                        </svg>
                      ) : (
                        <svg className='h-5 w-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                          <path
                            strokeLinecap='round'
                            strokeLinejoin='round'
                            strokeWidth='2'
                            d='M15 12a3 3 0 11-6 0 3 3 0 016 0z'
                          />
                          <path
                            strokeLinecap='round'
                            strokeLinejoin='round'
                            strokeWidth='2'
                            d='M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z'
                          />
                        </svg>
                      )}
                    </button>
                  </div>
                  {errors.newPassword && (
                    <p className='mt-2 flex items-center gap-1 text-sm text-red-500'>
                      <svg className='h-4 w-4' fill='currentColor' viewBox='0 0 20 20'>
                        <path
                          fillRule='evenodd'
                          d='M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z'
                          clipRule='evenodd'
                        />
                      </svg>
                      {errors.newPassword.message}
                    </p>
                  )}
                </div>

                {/* Confirm Password Field */}
                <div>
                  <label htmlFor='confirmPassword' className='mb-2 block text-sm font-medium text-gray-600'>
                    Xác nhận mật khẩu mới
                  </label>
                  <div className='relative'>
                    <div className='pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4'>
                      <svg className='h-5 w-5 text-gray-400' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                        <path
                          strokeLinecap='round'
                          strokeLinejoin='round'
                          strokeWidth='2'
                          d='M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z'
                        />
                      </svg>
                    </div>
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      id='confirmPassword'
                      placeholder='Nhập lại mật khẩu mới'
                      className={`w-full rounded-xl border bg-gray-100/50 py-3.5 pl-12 pr-12 text-gray-900 placeholder:text-gray-400 transition-all duration-300 focus:outline-none focus:ring-2 ${
                        errors.confirmPassword
                          ? 'border-red-500/50 focus:border-red-500 focus:ring-red-500/20'
                          : 'border-stone-200/50 focus:border-amber-500 focus:ring-amber-500/20 hover:border-stone-300'
                      }`}
                      {...register('confirmPassword', {
                        required: 'Vui lòng xác nhận mật khẩu',
                        validate: (value) => value === password || 'Mật khẩu không khớp'
                      })}
                    />
                    <button
                      type='button'
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className='absolute inset-y-0 right-0 flex items-center pr-4 text-gray-400 transition-colors hover:text-amber-600'
                    >
                      {showConfirmPassword ? (
                        <svg className='h-5 w-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                          <path
                            strokeLinecap='round'
                            strokeLinejoin='round'
                            strokeWidth='2'
                            d='M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21'
                          />
                        </svg>
                      ) : (
                        <svg className='h-5 w-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                          <path
                            strokeLinecap='round'
                            strokeLinejoin='round'
                            strokeWidth='2'
                            d='M15 12a3 3 0 11-6 0 3 3 0 016 0z'
                          />
                          <path
                            strokeLinecap='round'
                            strokeLinejoin='round'
                            strokeWidth='2'
                            d='M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z'
                          />
                        </svg>
                      )}
                    </button>
                  </div>
                  {errors.confirmPassword && (
                    <p className='mt-2 flex items-center gap-1 text-sm text-red-500'>
                      <svg className='h-4 w-4' fill='currentColor' viewBox='0 0 20 20'>
                        <path
                          fillRule='evenodd'
                          d='M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z'
                          clipRule='evenodd'
                        />
                      </svg>
                      {errors.confirmPassword.message}
                    </p>
                  )}
                </div>

                {/* Submit Button */}
                <button
                  type='submit'
                  disabled={resetPasswordMutation.isPending}
                  className='group relative w-full overflow-hidden rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 py-4 text-base font-semibold text-white shadow-lg shadow-amber-500/25 transition-all duration-300 hover:shadow-xl hover:shadow-amber-500/30 disabled:cursor-not-allowed disabled:opacity-70'
                >
                  <span className='absolute inset-0 bg-gradient-to-r from-amber-600 to-amber-700 opacity-0 transition-opacity duration-300 group-hover:opacity-100' />
                  {resetPasswordMutation.isPending ? (
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
                      <span>Đang xử lý...</span>
                    </div>
                  ) : (
                    <span className='relative'>Đặt Lại Mật Khẩu</span>
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
