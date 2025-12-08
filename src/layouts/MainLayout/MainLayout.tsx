import React from 'react'
import Footer from '../../components/Footer'
import Header from '../../components/Header'
import PageTransition from '../../components/PageTransition'

interface MainLayoutProps {
  children: React.ReactNode
}

export default function MainLayout({ children }: MainLayoutProps) {
  return (
    <div className='flex min-h-screen flex-col'>
      <Header />
      <main className='flex-1'>
        <PageTransition>{children}</PageTransition>
      </main>
      <Footer />
    </div>
  )
}
