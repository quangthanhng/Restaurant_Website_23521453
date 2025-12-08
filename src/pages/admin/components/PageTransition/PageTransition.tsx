import { motion, AnimatePresence } from 'framer-motion'
import type { ReactNode } from 'react'
import { useLocation } from 'react-router-dom'

interface PageTransitionProps {
  children: ReactNode
}

const pageVariants = {
  initial: {
    opacity: 0,
    x: -20,
    scale: 0.98
  },
  enter: {
    opacity: 1,
    x: 0,
    scale: 1,
    transition: {
      duration: 0.4,
      ease: [0.25, 0.1, 0.25, 1] as [number, number, number, number],
      staggerChildren: 0.1
    }
  },
  exit: {
    opacity: 0,
    x: 20,
    scale: 0.98,
    transition: {
      duration: 0.3,
      ease: [0.25, 0.1, 0.25, 1] as [number, number, number, number]
    }
  }
}

export default function PageTransition({ children }: PageTransitionProps) {
  const location = useLocation()

  return (
    <AnimatePresence mode='wait' initial={false}>
      <motion.div
        key={location.pathname}
        variants={pageVariants}
        initial='initial'
        animate='enter'
        exit='exit'
        className='w-full'
      >
        {children}
      </motion.div>
    </AnimatePresence>
  )
}
