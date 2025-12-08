import { useContext, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import authApi from '../../../../apis/auth.api'
import { AppContext } from '../../../../contexts/app.context'
import { setProfileToLS, setAdminAuthenticatedToLS } from '../../../../utils/auth'
import { rules } from '../../../../utils/rules'
import type { LoginFormData } from '../../../../types/auth.type'
import type { ErrorResponse, LegacyAuthResponse } from '../../../../types/user.type'
import { AxiosError } from 'axios'
import path from '../../../../constants/path'

export default function AdminLogin() {
  const { setIsAuthenticated, setProfile, setIsAdminAuthenticated } = useContext(AppContext)
  const navigate = useNavigate()
  const [showPassword, setShowPassword] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<LoginFormData>()

  const loginMutation = useMutation({
    mutationFn: (body: LoginFormData) => authApi.login(body)
  })

  const onSubmit = handleSubmit((data) => {
    setErrorMessage('')
    loginMutation.mutate(data, {
      onSuccess: (res) => {
        const responseData = res.data
        // Handle new API response structure (statusCode + metadata)
        if (responseData.statusCode === 200 && responseData.metadata) {
          const userData = responseData.metadata.user
          // Check if user is admin
          if (!userData.isAdmin) {
            setErrorMessage('Tài khoản không có quyền admin!')
            return
          }
          // Normalize user data
          const normalizedUser = {
            ...userData,
            _id: userData._id || userData.id || ''
          }
          setIsAuthenticated(true)
          setProfile(normalizedUser)
          setProfileToLS(normalizedUser)
          // Set admin authenticated
          setIsAdminAuthenticated(true)
          setAdminAuthenticatedToLS(true)
          navigate(path.adminStatistics)
        }
        // Handle legacy API response structure
        else {
          const legacyData = responseData as unknown as LegacyAuthResponse
          if (legacyData.code === 200 && legacyData.data) {
            if (!legacyData.data.user.isAdmin) {
              setErrorMessage('Tài khoản không có quyền admin!')
              return
            }
            setIsAuthenticated(true)
            setProfile(legacyData.data.user)
            setProfileToLS(legacyData.data.user)
            setIsAdminAuthenticated(true)
            setAdminAuthenticatedToLS(true)
            navigate(path.adminStatistics)
          }
        }
      },
      onError: (error) => {
        if (error instanceof AxiosError) {
          const errorData = error.response?.data as ErrorResponse
          setErrorMessage(errorData?.message || 'Email hoặc mật khẩu không đúng')
        }
      }
    })
  })

  return (
    <div className='flex min-h-screen items-center justify-center bg-gray-900'>
      {/* Background Pattern */}
      <div className='absolute inset-0 overflow-hidden'>
        <div className='absolute -left-40 -top-40 h-80 w-80 rounded-full bg-amber-500/5 blur-[100px]' />
        <div className='absolute -bottom-40 -right-40 h-80 w-80 rounded-full bg-amber-500/5 blur-[100px]' />
      </div>

      <div className='relative w-full max-w-md px-4'>
        {/* Card */}
        <div className='rounded-2xl border border-gray-700 bg-gray-800 p-8 shadow-2xl'>
          {/* Header */}
          <div className='mb-8 text-center'>
            <div className='mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full border border-amber-500/30 bg-amber-500/10'>
              <svg className='h-8 w-8 text-amber-500' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth='1.5'
                  d='M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z'
                />
              </svg>
            </div>
            <h1 className='text-2xl font-bold text-white'>Admin Panel</h1>
            <p className='mt-2 text-sm text-gray-400'>Đăng nhập để quản lý hệ thống</p>
          </div>

          {/* Error Message */}
          {errorMessage && (
            <div className='mb-4 rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-center text-sm text-red-400'>
              {errorMessage}
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={onSubmit} className='space-y-5' noValidate>
            {/* Email Field */}
            <div>
              <label htmlFor='email' className='mb-2 block text-sm font-medium text-gray-300'>
                Email
              </label>
              <input
                type='email'
                id='email'
                placeholder='admin@example.com'
                className={`w-full rounded-lg border bg-gray-700 px-4 py-3 text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 ${
                  errors.email
                    ? 'border-red-500 focus:ring-red-500/20'
                    : 'border-gray-600 focus:border-amber-500 focus:ring-amber-500/20'
                }`}
                {...register('email', rules.email)}
              />
              {errors.email && <p className='mt-2 text-sm text-red-400'>{errors.email.message}</p>}
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor='password' className='mb-2 block text-sm font-medium text-gray-300'>
                Mật khẩu
              </label>
              <div className='relative'>
                <input
                  type={showPassword ? 'text' : 'password'}
                  id='password'
                  placeholder='••••••••'
                  className={`w-full rounded-lg border bg-gray-700 px-4 py-3 pr-12 text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 ${
                    errors.password
                      ? 'border-red-500 focus:ring-red-500/20'
                      : 'border-gray-600 focus:border-amber-500 focus:ring-amber-500/20'
                  }`}
                  {...register('password', rules.password)}
                />
                <button
                  type='button'
                  onClick={() => setShowPassword(!showPassword)}
                  className='absolute inset-y-0 right-0 flex items-center pr-4 text-gray-400 hover:text-white'
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
              {errors.password && <p className='mt-2 text-sm text-red-400'>{errors.password.message}</p>}
            </div>

            {/* Submit Button */}
            <button
              type='submit'
              disabled={loginMutation.isPending}
              className='w-full rounded-lg bg-amber-500 py-3 font-semibold text-gray-900 transition-colors hover:bg-amber-400 disabled:cursor-not-allowed disabled:opacity-70'
            >
              {loginMutation.isPending ? (
                <div className='flex items-center justify-center gap-2'>
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
                'Đăng Nhập'
              )}
            </button>
          </form>

          {/* Back to Home */}
          <div className='mt-6 text-center'>
            <a href={path.home} className='text-sm text-gray-400 hover:text-amber-500'>
              ← Quay lại trang chủ
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
