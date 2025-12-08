import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link, useNavigate } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import authApi from '../../apis/auth.api'
import { rules } from '../../utils/rules'
import type { RegisterFormData } from '../../types/auth.type'
import type { ErrorResponse } from '../../types/user.type'
import { AxiosError } from 'axios'
import path from '../../constants/path'
import { useToast } from '../../components/Toast'

export default function Register() {
  const navigate = useNavigate()
  const { success, error: showError } = useToast()
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const {
    register,
    handleSubmit,
    setError,
    watch,
    formState: { errors }
  } = useForm<RegisterFormData>()

  const password = watch('password')

  const registerMutation = useMutation({
    mutationFn: (body: Omit<RegisterFormData, 'confirmPassword'>) => authApi.register(body)
  })

  const onSubmit = handleSubmit((data) => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { confirmPassword: _confirmPassword, ...registerData } = data
    registerMutation.mutate(registerData, {
      onSuccess: () => {
        success('Đăng ký thành công! Vui lòng đăng nhập.')
        navigate(path.login)
      },
      onError: (err) => {
        if (err instanceof AxiosError) {
          const errorData = err.response?.data as ErrorResponse
          if (errorData?.message) {
            if (errorData.message.toLowerCase().includes('email')) {
              setError('email', {
                type: 'server',
                message: errorData.message
              })
            } else if (errorData.message.toLowerCase().includes('username')) {
              setError('username', {
                type: 'server',
                message: errorData.message
              })
            } else {
              showError(errorData.message)
            }
          }
        }
      }
    })
  })

  const handleGoogleLogin = () => {
    window.location.href = authApi.getGoogleAuthUrl()
  }

  return (
    <div className='relative min-h-screen overflow-hidden bg-white pt-[74px]'>
      {/* Background Decorations */}
      <div className='pointer-events-none absolute inset-0 overflow-hidden'>
        <div className='absolute -left-40 -top-40 h-80 w-80 rounded-full bg-amber-500/10 blur-[100px]' />
        <div className='absolute -bottom-40 -right-40 h-80 w-80 rounded-full bg-amber-500/10 blur-[100px]' />
        <div className='absolute left-0 top-0 h-full w-full opacity-[0.02]'>
          <svg className='h-full w-full' xmlns='http://www.w3.org/2000/svg'>
            <defs>
              <pattern id='grid' width='60' height='60' patternUnits='userSpaceOnUse'>
                <path d='M 60 0 L 0 0 0 60' fill='none' stroke='white' strokeWidth='1' />
              </pattern>
            </defs>
            <rect width='100%' height='100%' fill='url(#grid)' />
          </svg>
        </div>
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
                      d='M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z'
                    />
                  </svg>
                </div>
                <h1 className='font-serif text-3xl font-medium text-gray-900'>Tạo Tài Khoản</h1>
                <p className='mt-2 text-sm text-gray-500'>Đăng ký để trải nghiệm TS Restaurant</p>
              </div>

              {/* Register Form */}
              <form onSubmit={onSubmit} className='space-y-4' noValidate>
                {/* Username Field */}
                <div>
                  <label htmlFor='username' className='mb-2 block text-sm font-medium text-gray-600'>
                    Tên người dùng
                  </label>
                  <div className='relative'>
                    <div className='pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4'>
                      <svg className='h-5 w-5 text-gray-400' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                        <path
                          strokeLinecap='round'
                          strokeLinejoin='round'
                          strokeWidth='2'
                          d='M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z'
                        />
                      </svg>
                    </div>
                    <input
                      type='text'
                      id='username'
                      placeholder='Nhập tên của bạn'
                      className={`w-full rounded-xl border bg-gray-100/50 py-3.5 pl-12 pr-4 text-gray-900 placeholder:text-gray-400 transition-all duration-300 focus:outline-none focus:ring-2 ${
                        errors.username
                          ? 'border-red-500/50 focus:border-red-500 focus:ring-red-500/20'
                          : 'border-stone-200/50 focus:border-amber-500 focus:ring-amber-500/20 hover:border-stone-300'
                      }`}
                      {...register('username', { required: 'Vui lòng nhập tên người dùng' })}
                    />
                  </div>
                  {errors.username && (
                    <p className='mt-2 flex items-center gap-1 text-sm text-red-500'>
                      <svg className='h-4 w-4' fill='currentColor' viewBox='0 0 20 20'>
                        <path
                          fillRule='evenodd'
                          d='M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z'
                          clipRule='evenodd'
                        />
                      </svg>
                      {errors.username.message}
                    </p>
                  )}
                </div>

                {/* Email Field */}
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
                      placeholder='example@email.com'
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

                {/* Password Field */}
                <div>
                  <label htmlFor='password' className='mb-2 block text-sm font-medium text-gray-600'>
                    Mật khẩu
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
                      id='password'
                      placeholder='Tối thiểu 6 ký tự'
                      className={`w-full rounded-xl border bg-gray-100/50 py-3.5 pl-12 pr-12 text-gray-900 placeholder:text-gray-400 transition-all duration-300 focus:outline-none focus:ring-2 ${
                        errors.password
                          ? 'border-red-500/50 focus:border-red-500 focus:ring-red-500/20'
                          : 'border-stone-200/50 focus:border-amber-500 focus:ring-amber-500/20 hover:border-stone-300'
                      }`}
                      {...register('password', rules.password)}
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
                  {errors.password && (
                    <p className='mt-2 flex items-center gap-1 text-sm text-red-500'>
                      <svg className='h-4 w-4' fill='currentColor' viewBox='0 0 20 20'>
                        <path
                          fillRule='evenodd'
                          d='M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z'
                          clipRule='evenodd'
                        />
                      </svg>
                      {errors.password.message}
                    </p>
                  )}
                </div>

                {/* Confirm Password Field */}
                <div>
                  <label htmlFor='confirmPassword' className='mb-2 block text-sm font-medium text-gray-600'>
                    Xác nhận mật khẩu
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
                      placeholder='Nhập lại mật khẩu'
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
                  disabled={registerMutation.isPending}
                  className='group relative mt-6 w-full overflow-hidden rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 py-4 text-base font-semibold text-white shadow-lg shadow-amber-500/25 transition-all duration-300 hover:shadow-xl hover:shadow-amber-500/30 disabled:cursor-not-allowed disabled:opacity-70'
                >
                  <span className='absolute inset-0 bg-gradient-to-r from-amber-600 to-amber-700 opacity-0 transition-opacity duration-300 group-hover:opacity-100' />
                  {registerMutation.isPending ? (
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
                    <span className='relative'>Đăng Ký</span>
                  )}
                </button>

                {/* Divider */}
                <div className='relative my-6'>
                  <div className='absolute inset-0 flex items-center'>
                    <div className='w-full border-t border-stone-200/50'></div>
                  </div>
                  <div className='relative flex justify-center'>
                    <span className='bg-gray-50 px-4 text-sm text-gray-400'>hoặc đăng ký với</span>
                  </div>
                </div>

                {/* Google Login Button */}
                <button
                  type='button'
                  onClick={handleGoogleLogin}
                  className='flex w-full items-center justify-center gap-3 rounded-xl border border-stone-200/50 bg-gray-100/30 py-3.5 text-sm font-medium text-gray-900 transition-all duration-300 hover:border-stone-300 hover:bg-gray-100/50'
                >
                  <svg className='h-5 w-5' viewBox='0 0 24 24'>
                    <path
                      fill='#EA4335'
                      d='M5.26620003,9.76452941 C6.19878754,6.93863203 8.85444915,4.90909091 12,4.90909091 C13.6909091,4.90909091 15.2181818,5.50909091 16.4181818,6.49090909 L19.9090909,3 C17.7818182,1.14545455 15.0545455,0 12,0 C7.27006974,0 3.1977497,2.69829785 1.23999023,6.65002441 L5.26620003,9.76452941 Z'
                    />
                    <path
                      fill='#34A853'
                      d='M16.0407269,18.0125889 C14.9509167,18.7163016 13.5660892,19.0909091 12,19.0909091 C8.86648613,19.0909091 6.21911939,17.076871 5.27698177,14.2678769 L1.23746264,17.3349879 C3.19279051,21.2936293 7.26500293,24 12,24 C14.9328362,24 17.7353462,22.9573905 19.834192,20.9995801 L16.0407269,18.0125889 Z'
                    />
                    <path
                      fill='#4A90E2'
                      d='M19.834192,20.9995801 C22.0291676,18.9520994 23.4545455,15.903663 23.4545455,12 C23.4545455,11.2909091 23.3454545,10.5272727 23.1818182,9.81818182 L12,9.81818182 L12,14.4545455 L18.4363636,14.4545455 C18.1187732,16.013626 17.2662994,17.2212117 16.0407269,18.0125889 L19.834192,20.9995801 Z'
                    />
                    <path
                      fill='#FBBC05'
                      d='M5.27698177,14.2678769 C5.03832634,13.556323 4.90909091,12.7937589 4.90909091,12 C4.90909091,11.2182781 5.03443647,10.4668121 5.26620003,9.76452941 L1.23999023,6.65002441 C0.43658717,8.26043162 0,10.0753848 0,12 C0,13.9195484 0.444780743,15.7390622 1.23746264,17.3349879 L5.27698177,14.2678769 Z'
                    />
                  </svg>
                  Tiếp tục với Google
                </button>

                {/* Login Link */}
                <p className='mt-6 text-center text-sm text-gray-500'>
                  Đã có tài khoản?{' '}
                  <Link to={path.login} className='font-semibold text-amber-600 transition-colors hover:text-amber-700'>
                    Đăng nhập ngay
                  </Link>
                </p>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
