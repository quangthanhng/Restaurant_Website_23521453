import { motion } from 'framer-motion'

export default function PageLoader() {
    return (
        <div className='flex items-center justify-center min-h-[400px] w-full'>
            <div className='flex flex-col items-center gap-4'>
                <motion.div
                    className='relative'
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3 }}
                >
                    <motion.div
                        className='h-12 w-12 rounded-full border-4 border-amber-200'
                        animate={{
                            rotate: 360
                        }}
                        transition={{
                            duration: 1,
                            repeat: Infinity,
                            ease: 'linear'
                        }}
                    />
                    <motion.div
                        className='absolute inset-0 h-12 w-12 rounded-full border-4 border-transparent border-t-amber-600'
                        animate={{
                            rotate: 360
                        }}
                        transition={{
                            duration: 0.8,
                            repeat: Infinity,
                            ease: 'linear'
                        }}
                    />
                </motion.div>
                <motion.p
                    className='text-sm text-gray-500'
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                >
                    Đang tải...
                </motion.p>
            </div>
        </div>
    )
}
