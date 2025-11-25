import React from 'react'
import Footer from '../../components/Footer'
import Header from '../../components/Header'

interface RegisterLayoutProps {
  children: React.ReactNode
}

export default function RegisterLayout({ children }: RegisterLayoutProps) {
  return (
    <div className='flex min-h-screen flex-col'>
      <Header />
      <main className='flex-1'>{children}</main>
      <Footer />
    </div>
  )
}
