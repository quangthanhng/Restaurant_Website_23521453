import { motion, useSpring, useTransform } from 'framer-motion'
import { useEffect } from 'react'

interface AnimatedNumberProps {
    value: number
    duration?: number
    formatFn?: (value: number) => string
}

export default function AnimatedNumber({ value, duration = 1, formatFn }: AnimatedNumberProps) {
    const spring = useSpring(0, { duration: duration * 1000 })
    const display = useTransform(spring, (current) => {
        if (formatFn) {
            return formatFn(Math.round(current))
        }
        return Math.round(current).toLocaleString('vi-VN')
    })

    useEffect(() => {
        spring.set(value)
    }, [spring, value])

    return <motion.span>{display}</motion.span>
}
