import React from 'react'
import RegisterHeader from '../../components/RegisterHeader'
import Footer from '../../components/Footer'

interface RegisterLayoutProps {
  children: React.ReactNode
}

export default function RegisterLayout({ children }: RegisterLayoutProps) {
  return (
    <div className='flex min-h-screen flex-col'>
      <RegisterHeader />
      <main className='flex-1'>{children}</main>
      <Footer />
    </div>
  )
}
