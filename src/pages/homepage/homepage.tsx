
import { useEffect, useState } from 'react'
import dishApi from '../../apis/dish.api'
import ButtonPrimary from '../../components/ButtonPrimary'
import { Link } from 'react-router-dom'
import path from '../../constants/path'
import bgImage from '../../assets/background restaurant.jpg'

interface Dish {
  _id: string
  name: string
  image: string
}

export default function Homepage() {
  const [dishes, setDishes] = useState<Dish[]>([])

  useEffect(() => {
    dishApi.getDishes({ page: 1, limit: 3, status: 'active' }).then(res => {
      const data = res.data?.data?.dishes || []
      setDishes(data.slice(0, 3))
    })
  }, [])

  return (
    <div className='min-h-screen w-full bg-neutral-950'>
      <section className='relative flex flex-col lg:flex-row min-h-screen w-full pt-[74px]'>
        {/* Left: Content & Dishes */}
        <div className='relative z-10 flex flex-col justify-center items-start w-full lg:w-1/2 px-6 lg:px-20 pt-28 pb-20 gap-10 bg-neutral-950/95'>
          {/* Dishes Images */}
          <div className='flex flex-row items-center gap-8 mb-4'>
            {dishes.map((dish, idx) => {
              // Xoay trái, phải, giữa khác hướng cho sinh động
              let spinClass = ''
              if (idx === 0) spinClass = 'animate-spin-slow'
              else if (idx === 1) spinClass = 'animate-spin-slow-reverse'
              else spinClass = 'animate-spin-slow'
              return (
                <div
                  key={dish._id}
                  className={`w-32 h-32 rounded-full bg-neutral-900 flex items-center justify-center shadow-xl border-4 border-neutral-800 relative`}
                >
                  <img
                    src={dish.image}
                    alt={dish.name}
                    className={`w-28 h-28 object-cover rounded-full shadow-lg ${spinClass}`}
                  />
                </div>
              )
            })}
          </div>
          {/* Title & Description */}
          <h1 className='text-5xl md:text-6xl font-serif font-semibold text-savoria-gold leading-tight mb-6'>
            The Epitome Of<br />Luxury Dining A<br />Harmony
          </h1>
          <p className='text-lg text-neutral-300 mb-8 max-w-xl'>
            Experience the Art of Fine Dining Meticulously Prepared with the Finest Seasonal Ingredients.
          </p>
          {/* Buttons */}
          <div className='flex flex-row gap-4'>
            <ButtonPrimary to={path.booking}>
              Book A Table
            </ButtonPrimary>
            <Link
              to={path.menu}
              className='group flex items-center gap-2 rounded-lg border border-neutral-700 bg-neutral-950 px-6 py-3 text-sm font-medium text-savoria-gold transition-colors hover:bg-neutral-900 hover:border-savoria-gold'
            >
              Explore Menu
              <span className='flex h-8 w-8 items-center justify-center rounded-full bg-savoria-gold ml-2 transition-colors duration-300 group-hover:bg-savoria-gold/80'>
                <svg className='h-4 w-4 -rotate-45 transition-all duration-500 group-hover:rotate-0 text-neutral-900' fill='none' stroke='currentColor' viewBox='0 0 24 24' strokeWidth='2.5'>
                  <path strokeLinecap='round' strokeLinejoin='round' d='M17 8l4 4m0 0l-4 4m4-4H3' />
                </svg>
              </span>
            </Link>
          </div>
        </div>
        {/* Right: Background Image */}
        <div className='relative w-full lg:w-1/2 min-h-[500px] flex items-stretch'>
          <img
            src={bgImage}
            alt='Restaurant background'
            className='w-full h-full object-cover object-center rounded-none lg:rounded-l-none lg:rounded-r-none shadow-2xl'
            style={{ minHeight: 500 }}
          />
          {/* Overlay for darken effect on mobile */}
          <div className='absolute inset-0 bg-linear-to-t from-neutral-950/80 to-transparent lg:bg-none'></div>
        </div>
      </section>
      {/* Custom spin animation */}
      <style>{`
        @keyframes spin-slow { 100% { transform: rotate(360deg); } }
        @keyframes spin-slow-reverse { 100% { transform: rotate(-360deg); } }
        .animate-spin-slow {
          animation: spin-slow 16s linear infinite;
        }
        .animate-spin-slow-reverse {
          animation: spin-slow-reverse 16s linear infinite;
        }
      `}</style>
    </div>
  )
}
