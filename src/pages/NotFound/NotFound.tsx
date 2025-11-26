import path from '../../constants/path'
import ButtonPrimary from '../../components/ButtonPrimary'

export default function NotFound() {
  return (
    <div className='flex min-h-screen flex-col items-center justify-center bg-neutral-950 px-4'>
      {/* 404 Display */}
      <div className='flex items-center justify-center gap-2 md:gap-4'>
        {/* Number 4 */}
        <span className='text-[120px] font-bold leading-none text-white md:text-[200px] lg:text-[280px]'>
          4
        </span>

        {/* Broken Wine Glass SVG */}
        <div className='relative h-[120px] w-20 md:h-[200px] md:w-[130px] lg:h-[280px] lg:w-[180px]'>
          <svg
            viewBox='0 0 100 150'
            fill='none'
            xmlns='http://www.w3.org/2000/svg'
            className='h-full w-full'
          >
            {/* Glass bowl with cracks */}
            <path
              d='M25 10 C25 10, 20 60, 35 80 C40 87, 45 90, 50 90 C55 90, 60 87, 65 80 C80 60, 75 10, 75 10'
              stroke='#E6C2A1'
              strokeWidth='2'
              fill='none'
              strokeLinecap='round'
            />

            {/* Crack lines on glass */}
            <path
              d='M35 25 L45 45 L38 55'
              stroke='#E6C2A1'
              strokeWidth='1.5'
              fill='none'
              strokeLinecap='round'
              strokeLinejoin='round'
            />
            <path
              d='M65 20 L55 35 L60 50 L52 60'
              stroke='#E6C2A1'
              strokeWidth='1.5'
              fill='none'
              strokeLinecap='round'
              strokeLinejoin='round'
            />
            <path
              d='M45 15 L50 30 L45 40'
              stroke='#E6C2A1'
              strokeWidth='1.5'
              fill='none'
              strokeLinecap='round'
              strokeLinejoin='round'
            />
            <path
              d='M55 18 L52 28'
              stroke='#E6C2A1'
              strokeWidth='1.5'
              fill='none'
              strokeLinecap='round'
            />

            {/* Broken pieces floating */}
            <path
              d='M30 5 L35 15 L28 18 Z'
              stroke='#E6C2A1'
              strokeWidth='1.5'
              fill='none'
              strokeLinecap='round'
              strokeLinejoin='round'
            />
            <path
              d='M70 8 L72 18 L65 15 Z'
              stroke='#E6C2A1'
              strokeWidth='1.5'
              fill='none'
              strokeLinecap='round'
              strokeLinejoin='round'
            />
            <path
              d='M42 2 L48 12 L40 10 Z'
              stroke='#E6C2A1'
              strokeWidth='1.5'
              fill='none'
              strokeLinecap='round'
              strokeLinejoin='round'
            />
            <path
              d='M58 5 L62 14 L55 12 Z'
              stroke='#E6C2A1'
              strokeWidth='1.5'
              fill='none'
              strokeLinecap='round'
              strokeLinejoin='round'
            />

            {/* Stem */}
            <path
              d='M50 90 L50 125'
              stroke='#E6C2A1'
              strokeWidth='2'
              strokeLinecap='round'
            />

            {/* Base */}
            <ellipse
              cx='50'
              cy='130'
              rx='20'
              ry='5'
              stroke='#E6C2A1'
              strokeWidth='2'
              fill='none'
            />
          </svg>
        </div>

        {/* Number 4 */}
        <span className='text-[120px] font-bold leading-none text-white md:text-[200px] lg:text-[280px]'>
          4
        </span>
      </div>

      {/* Message */}
      <p className='mt-6 max-w-md text-center text-base text-neutral-400 md:mt-8 md:text-lg'>
        Sorry, we couldn't find the page you were looking for. Click the button below to go back to the home page
      </p>

      {/* Back to Home Button */}
      <div className='mt-8 md:mt-10'>
        <ButtonPrimary to={path.home}>
          Back To Home
        </ButtonPrimary>
      </div>
    </div>
  )
}
