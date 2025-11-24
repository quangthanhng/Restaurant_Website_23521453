import React from 'react'
import Header from '../../components/Header'

export default function homepage() {
  return (
    <div className='min-h-screen bg-neutral-50'>
      <Header />
      <main className='pt-20'>
        <div className='mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8'>
          <h1 className='text-4xl font-bold text-neutral-900'>Homepage Content</h1>
          <p className='mt-4 text-neutral-600'>
            Your restaurant content goes here...
          </p>
        </div>
      </main>
    </div>
  )
}
