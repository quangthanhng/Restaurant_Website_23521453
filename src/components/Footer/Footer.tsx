import { useState } from 'react'
import { Link } from 'react-router-dom'
import path from '../../constants/path'
import contactApi from '../../apis/contact.api'

export default function Footer() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState('')
  const [fieldErrors, setFieldErrors] = useState<{ name?: string; email?: string; message?: string }>({})

  // Validate form based on backend rules (contact.validate.ts)
  const validateForm = (): boolean => {
    const errors: { name?: string; email?: string; message?: string } = {}

    // Name validation: required, max 100 characters
    if (!name.trim()) {
      errors.name = 'Vui lòng nhập họ tên'
    } else if (name.trim().length > 100) {
      errors.name = 'Họ tên không được vượt quá 100 ký tự'
    }

    // Email validation: valid format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!email.trim()) {
      errors.email = 'Vui lòng nhập email'
    } else if (!emailRegex.test(email.trim())) {
      errors.email = 'Email không đúng định dạng (ví dụ: example@example.com)'
    }

    // Message validation: required, 10-1000 characters
    if (!message.trim()) {
      errors.message = 'Vui lòng nhập nội dung'
    } else if (message.trim().length < 10) {
      errors.message = 'Nội dung phải có ít nhất 10 ký tự'
    } else if (message.trim().length > 1000) {
      errors.message = 'Nội dung không được vượt quá 1000 ký tự'
    }

    setFieldErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmitContact = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validate form
    if (!validateForm()) {
      setSubmitStatus('error')
      setErrorMessage('Vui lòng kiểm tra lại thông tin')
      setTimeout(() => {
        setSubmitStatus('idle')
        setErrorMessage('')
      }, 3000)
      return
    }

    setIsSubmitting(true)
    setSubmitStatus('idle')
    setErrorMessage('')
    setFieldErrors({})

    try {
      await contactApi.createContact({
        name: name.trim(),
        email: email.trim(),
        message: message.trim()
      })
      setSubmitStatus('success')
      setName('')
      setEmail('')
      setMessage('')
      setTimeout(() => setSubmitStatus('idle'), 3000)
    } catch (error) {
      console.error('Error submitting contact:', error)
      const axiosError = error as { response?: { data?: { message?: string } } }
      const serverMessage = axiosError?.response?.data?.message
      setErrorMessage(serverMessage || 'Có lỗi xảy ra, vui lòng thử lại!')
      setSubmitStatus('error')
      setTimeout(() => {
        setSubmitStatus('idle')
        setErrorMessage('')
      }, 3000)
    } finally {
      setIsSubmitting(false)
    }
  }

  const quickLinks = [
    { to: path.home, label: 'Trang chủ' },
    { to: path.menu, label: 'Thực đơn' },
    { to: path.about, label: 'Giới thiệu' },
    { to: path.booking, label: 'Đặt bàn' },
    { to: path.blog, label: 'Tin tức' }
  ]

  const socialLinks = [
    {
      href: 'https://facebook.com',
      label: 'Facebook',
      icon: 'M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z'
    },
    {
      href: 'https://instagram.com',
      label: 'Instagram',
      icon: 'M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z'
    },
    {
      href: 'https://twitter.com',
      label: 'Twitter',
      icon: 'M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z'
    }
  ]

  return (
    <footer className='relative overflow-hidden bg-gradient-to-b from-stone-900 to-stone-950 text-white'>
      {/* Background decoration */}
      <div className='absolute inset-0 opacity-5'>
        <div className='absolute left-0 top-0 h-96 w-96 rounded-full bg-amber-500 blur-3xl' />
        <div className='absolute bottom-0 right-0 h-96 w-96 rounded-full bg-orange-500 blur-3xl' />
      </div>

      <div className='relative mx-auto max-w-7xl px-6 py-16'>
        <div className='grid gap-12 lg:grid-cols-4'>
          {/* Brand Column */}
          <div className='lg:col-span-1'>
            <Link to={path.home} className='group inline-flex items-center gap-3'>
              <div className='flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 shadow-lg transition-transform group-hover:scale-105'>
                <span className='text-2xl'>🍜</span>
              </div>
              <div>
                <span className='block text-xl font-bold text-white'>TS Restaurant</span>
                <span className='block text-xs text-stone-400'>Ẩm thực Việt Nam</span>
              </div>
            </Link>
            <p className='mt-6 text-sm leading-relaxed text-stone-400'>
              Khám phá hương vị đậm đà của ẩm thực Việt Nam với những món ăn truyền thống được chế biến từ tâm huyết.
            </p>

            {/* Social Links */}
            <div className='mt-6 flex gap-3'>
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target='_blank'
                  rel='noopener noreferrer'
                  className='flex h-10 w-10 items-center justify-center rounded-full bg-stone-800 text-stone-400 transition-all hover:bg-amber-500 hover:text-white'
                  aria-label={social.label}
                >
                  <svg className='h-5 w-5' fill='currentColor' viewBox='0 0 24 24'>
                    <path d={social.icon} />
                  </svg>
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className='mb-6 text-lg font-semibold text-white'>Liên kết nhanh</h3>
            <ul className='space-y-3'>
              {quickLinks.map((link) => (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                    className='group flex items-center gap-2 text-stone-400 transition-colors hover:text-amber-400'
                  >
                    <svg
                      className='h-4 w-4 text-amber-500 transition-transform group-hover:translate-x-1'
                      fill='none'
                      stroke='currentColor'
                      viewBox='0 0 24 24'
                      strokeWidth='2'
                    >
                      <path strokeLinecap='round' strokeLinejoin='round' d='M9 5l7 7-7 7' />
                    </svg>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className='mb-6 text-lg font-semibold text-white'>Thông tin liên hệ</h3>
            <ul className='space-y-4'>
              <li className='flex items-start gap-3'>
                <div className='flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-stone-800 text-amber-500'>
                  <svg className='h-5 w-5' fill='none' stroke='currentColor' viewBox='0 0 24 24' strokeWidth='2'>
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      d='M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z'
                    />
                    <path strokeLinecap='round' strokeLinejoin='round' d='M15 11a3 3 0 11-6 0 3 3 0 016 0z' />
                  </svg>
                </div>
                <div>
                  <span className='block text-sm font-medium text-white'>Địa chỉ</span>
                  <span className='text-sm text-stone-400'>165 Phạm Ngũ Lão, Quận 1, TP.HCM</span>
                </div>
              </li>
              <li className='flex items-start gap-3'>
                <div className='flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-stone-800 text-amber-500'>
                  <svg className='h-5 w-5' fill='none' stroke='currentColor' viewBox='0 0 24 24' strokeWidth='2'>
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      d='M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z'
                    />
                  </svg>
                </div>
                <div>
                  <span className='block text-sm font-medium text-white'>Điện thoại</span>
                  <span className='text-sm text-stone-400'>0876 717 278</span>
                </div>
              </li>
              <li className='flex items-start gap-3'>
                <div className='flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-stone-800 text-amber-500'>
                  <svg className='h-5 w-5' fill='none' stroke='currentColor' viewBox='0 0 24 24' strokeWidth='2'>
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      d='M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z'
                    />
                  </svg>
                </div>
                <div>
                  <span className='block text-sm font-medium text-white'>Giờ mở cửa</span>
                  <span className='text-sm text-stone-400'>8:00 - 22:00 (Hàng ngày)</span>
                </div>
              </li>
            </ul>
          </div>

          {/* Contact Form */}
          <div>
            <h3 className='mb-6 text-lg font-semibold text-white'>Gửi phản hồi</h3>
            <form onSubmit={handleSubmitContact} className='space-y-3'>
              <div>
                <input
                  type='text'
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value)
                    if (fieldErrors.name) setFieldErrors((prev) => ({ ...prev, name: undefined }))
                  }}
                  placeholder='Họ và tên'
                  className={`w-full rounded-lg border bg-stone-800/50 px-4 py-3 text-sm text-white placeholder:text-stone-500 transition-colors focus:outline-none focus:ring-1 ${
                    fieldErrors.name
                      ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                      : 'border-stone-700 focus:border-amber-500 focus:ring-amber-500'
                  }`}
                />
                {fieldErrors.name && <p className='mt-1 text-xs text-red-400'>{fieldErrors.name}</p>}
              </div>
              <div>
                <input
                  type='email'
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value)
                    if (fieldErrors.email) setFieldErrors((prev) => ({ ...prev, email: undefined }))
                  }}
                  placeholder='Email của bạn'
                  className={`w-full rounded-lg border bg-stone-800/50 px-4 py-3 text-sm text-white placeholder:text-stone-500 transition-colors focus:outline-none focus:ring-1 ${
                    fieldErrors.email
                      ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                      : 'border-stone-700 focus:border-amber-500 focus:ring-amber-500'
                  }`}
                />
                {fieldErrors.email && <p className='mt-1 text-xs text-red-400'>{fieldErrors.email}</p>}
              </div>
              <div>
                <textarea
                  value={message}
                  onChange={(e) => {
                    setMessage(e.target.value)
                    if (fieldErrors.message) setFieldErrors((prev) => ({ ...prev, message: undefined }))
                  }}
                  placeholder='Nhận xét của bạn (tối thiểu 10 ký tự)...'
                  rows={3}
                  className={`w-full resize-none rounded-lg border bg-stone-800/50 px-4 py-3 text-sm text-white placeholder:text-stone-500 transition-colors focus:outline-none focus:ring-1 ${
                    fieldErrors.message
                      ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                      : 'border-stone-700 focus:border-amber-500 focus:ring-amber-500'
                  }`}
                />
                <div className='mt-1 flex justify-between'>
                  {fieldErrors.message ? <p className='text-xs text-red-400'>{fieldErrors.message}</p> : <span></span>}
                  <span
                    className={`text-xs ${message.length < 10 ? 'text-stone-500' : message.length > 1000 ? 'text-red-400' : 'text-green-400'}`}
                  >
                    {message.length}/1000
                  </span>
                </div>
              </div>
              <button
                type='submit'
                disabled={isSubmitting || !name.trim() || !email.trim() || !message.trim()}
                className='flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-amber-500 to-orange-500 py-3 text-sm font-semibold text-white transition-all hover:from-amber-600 hover:to-orange-600 disabled:cursor-not-allowed disabled:opacity-50'
              >
                {isSubmitting ? (
                  <>
                    <svg className='h-4 w-4 animate-spin' fill='none' viewBox='0 0 24 24'>
                      <circle className='opacity-25' cx='12' cy='12' r='10' stroke='currentColor' strokeWidth='4' />
                      <path
                        className='opacity-75'
                        fill='currentColor'
                        d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z'
                      />
                    </svg>
                    Đang gửi...
                  </>
                ) : (
                  <>
                    Gửi phản hồi
                    <svg className='h-4 w-4' fill='none' stroke='currentColor' viewBox='0 0 24 24' strokeWidth='2'>
                      <path strokeLinecap='round' strokeLinejoin='round' d='M14 5l7 7m0 0l-7 7m7-7H3' />
                    </svg>
                  </>
                )}
              </button>

              {submitStatus === 'success' && (
                <p className='text-center text-sm text-green-400'>✓ Cảm ơn bạn đã gửi phản hồi!</p>
              )}
              {submitStatus === 'error' && (
                <p className='text-center text-sm text-red-400'>{errorMessage || 'Có lỗi xảy ra, vui lòng thử lại!'}</p>
              )}
            </form>
          </div>
        </div>
      </div>

      {/* Copyright Bar */}
      <div className='border-t border-stone-800'>
        <div className='mx-auto max-w-7xl flex flex-col items-center justify-between gap-4 px-6 py-6 md:flex-row'>
          <p className='text-sm text-stone-500'>© 2025 TS Restaurant. All rights reserved.</p>
          <div className='flex items-center gap-6'>
            <Link to='/terms' className='text-sm text-stone-500 transition-colors hover:text-amber-400'>
              Điều khoản
            </Link>
            <Link to='/privacy' className='text-sm text-stone-500 transition-colors hover:text-amber-400'>
              Chính sách
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
