import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import dishApi from '../../apis/dish.api'
import ButtonPrimary from '../../components/ButtonPrimary'
import { Link } from 'react-router-dom'
import path from '../../constants/path'
import { FadeIn, StaggerContainer, StaggerItem } from '../../components/Animations'

// Hero images - high quality Vietnamese food photos
const heroImages = [
  'https://images.unsplash.com/photo-1503764654157-72d979d9af2f?w=1920&q=90', // Phở đẹp
  'https://images.unsplash.com/photo-1555126634-323283e090fa?w=1920&q=90', // Vietnamese food
  'https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?w=1920&q=90' // Noodles
]

interface Dish {
  _id: string
  name: string
  image: string
  price: number
  description?: string
  bestSeller?: boolean
  status?: string
  deleted?: boolean
}

// Stats data
const stats = [
  { number: '50+', label: 'Món ăn đặc sắc' },
  { number: '10+', label: 'Năm kinh nghiệm' },
  { number: '5000+', label: 'Khách hàng hài lòng' },
  { number: '4.9', label: 'Đánh giá trung bình' }
]

// Features data
const features = [
  {
    icon: '🍜',
    title: 'Ẩm thực Việt Nam',
    description: 'Món ăn truyền thống được chế biến từ công thức gia truyền, giữ nguyên hương vị đặc trưng.'
  },
  {
    icon: '🌿',
    title: 'Nguyên liệu tươi sạch',
    description: 'Chỉ sử dụng nguyên liệu tươi ngon nhất, được tuyển chọn kỹ lưỡng mỗi ngày.'
  },
  {
    icon: '👨‍🍳',
    title: 'Đầu bếp chuyên nghiệp',
    description: 'Đội ngũ đầu bếp giàu kinh nghiệm, đam mê với nghệ thuật ẩm thực.'
  },
  {
    icon: '🎯',
    title: 'Dịch vụ tận tâm',
    description: 'Phục vụ chu đáo, tạo trải nghiệm ẩm thực tuyệt vời cho mọi khách hàng.'
  }
]

// Testimonials data
const testimonials = [
  {
    name: 'Trần Văn Cường',
    avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
    rating: 5,
    comment: 'Phở ở đây ngon tuyệt vời! Nước dùng đậm đà, thịt bò tươi. Chắc chắn sẽ quay lại.'
  },
  {
    name: 'Nguyễn Ngọc Bảo Quốc',
    avatar: 'https://randomuser.me/api/portraits/men/44.jpg',
    rating: 5,
    comment: 'Không gian nhà hàng rất đẹp và ấm cúng. Nhân viên phục vụ nhiệt tình, chu đáo.'
  },
  {
    name: 'Nguyễn Đình Hiếu',
    avatar: 'https://randomuser.me/api/portraits/men/67.jpg',
    rating: 5,
    comment: 'Đồ ăn tuyệt vời, giá cả hợp lý. Đặc biệt là bún chả Hà Nội rất ngon!'
  }
]

export default function Homepage() {
  const [dishes, setDishes] = useState<Dish[]>([])
  const [currentHeroImage, setCurrentHeroImage] = useState(0)

  useEffect(() => {
    // Sử dụng API /dishes/all để lấy TẤT CẢ món ăn (không phân trang)
    dishApi.getAllDishes().then((res) => {
      const data = res.data?.metadata || []
      // Lọc tất cả các món có bestSeller = true và status = active
      const bestSellerDishes = (data as Dish[]).filter(
        (dish) => dish.bestSeller === true && dish.status === 'active' && !dish.deleted
      )
      // Hiển thị tất cả bestSeller, nếu không có thì lấy 6 món đầu
      setDishes(bestSellerDishes.length > 0 ? bestSellerDishes : (data as Dish[]).slice(0, 6))
    })
  }, [])

  // Hero image carousel
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentHeroImage((prev) => (prev + 1) % heroImages.length)
    }, 5000)
    return () => clearInterval(interval)
  }, [])

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN').format(price) + 'đ'
  }

  return (
    <div className='min-h-screen w-full bg-stone-50'>
      {/* ========== HERO SECTION ========== */}
      <section className='relative min-h-screen w-full overflow-hidden pt-[74px]'>
        {/* Background with gradient overlay */}
        <div className='absolute inset-0 bg-linear-to-br from-stone-900 via-stone-800 to-amber-900'>
          <div
            className='absolute inset-0 bg-cover bg-center transition-all duration-1000 ease-in-out'
            style={{
              backgroundImage: `url(${heroImages[currentHeroImage]})`,
              opacity: 0.4
            }}
          />
          {/* Animated overlay pattern */}
          <div className='absolute inset-0 opacity-30'>
            <div className='absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(217,119,6,0.1),transparent_50%)]' />
          </div>
        </div>

        {/* Content */}
        <div className='relative z-10 mx-auto flex min-h-[calc(100vh-74px)] max-w-7xl flex-col items-center justify-center px-6 py-20 text-center'>
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className='mb-6 inline-flex items-center gap-2 rounded-full bg-amber-500/20 px-4 py-2 backdrop-blur-sm'
          >
            <span className='text-amber-400'>✦</span>
            <span className='text-sm font-medium text-amber-200'>Nhà hàng Việt Nam đích thực</span>
            <span className='text-amber-400'>✦</span>
          </motion.div>

          {/* Main Title */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className='mb-6 text-4xl font-bold leading-tight text-white sm:text-5xl md:text-6xl lg:text-7xl'
          >
            Trải Nghiệm
            <br />
            <span className='bg-linear-to-r from-amber-400 via-amber-500 to-orange-500 bg-clip-text text-transparent'>
              Ẩm Thực Tinh Hoa
            </span>
          </motion.h1>

          {/* Description */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className='mb-10 max-w-2xl text-lg text-stone-300 sm:text-xl'
          >
            Khám phá hương vị đậm đà của ẩm thực Việt Nam với những món ăn truyền thống được chế biến từ tâm huyết và
            nguyên liệu tươi ngon nhất.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
            className='flex flex-col items-center gap-4 sm:flex-row'
          >
            <ButtonPrimary to={path.booking} className='group px-8 py-4 text-lg'>
              <span>Đặt Bàn Ngay</span>
              <svg
                className='ml-2 h-5 w-5 transition-transform group-hover:translate-x-1'
                fill='none'
                stroke='currentColor'
                viewBox='0 0 24 24'
              >
                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M17 8l4 4m0 0l-4 4m4-4H3' />
              </svg>
            </ButtonPrimary>
            <Link
              to={path.menu}
              className='group flex items-center gap-2 rounded-full border-2 border-white/30 bg-white/10 px-8 py-4 text-lg font-semibold text-white backdrop-blur-sm transition-all hover:border-amber-500 hover:bg-amber-500/20'
            >
              Xem Thực Đơn
              <svg
                className='h-5 w-5 transition-transform group-hover:translate-x-1'
                fill='none'
                stroke='currentColor'
                viewBox='0 0 24 24'
              >
                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M9 5l7 7-7 7' />
              </svg>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ========== FEATURED DISHES SECTION ========== */}
      <section className='relative bg-white py-20'>
        {/* Decorative background */}
        <div className='absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(217,119,6,0.05),transparent_70%)]' />

        <div className='relative mx-auto max-w-7xl px-6'>
          {/* Section Header */}
          <FadeIn className='mb-16 text-center'>
            <span className='mb-4 inline-block rounded-full bg-amber-100 px-4 py-1 text-sm font-semibold text-amber-700'>
              Thực đơn nổi bật
            </span>
            <h2 className='mb-4 text-3xl font-bold text-stone-800 sm:text-4xl md:text-5xl'>
              Món Ăn <span className='text-amber-600'>Được Yêu Thích</span>
            </h2>
            <p className='mx-auto max-w-2xl text-lg text-stone-600'>
              Những món ăn đặc sắc nhất của chúng tôi, được khách hàng đánh giá cao và yêu thích
            </p>
          </FadeIn>

          {/* Dishes Grid */}
          <StaggerContainer className='grid gap-8 sm:grid-cols-2 lg:grid-cols-3'>
            {dishes.map((dish) => (
              <StaggerItem key={dish._id}>
                <div className='group relative overflow-hidden rounded-2xl bg-white shadow-lg transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl'>
                  {/* Image */}
                  <div className='relative aspect-4/3 overflow-hidden'>
                    <img
                      src={dish.image}
                      alt={dish.name}
                      className='h-full w-full object-cover transition-transform duration-500 group-hover:scale-110'
                    />
                    {/* Overlay on hover */}
                    <div className='absolute inset-0 bg-linear-to-t from-black/60 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100' />
                    {/* Quick view button */}
                    <Link
                      to={`/dish/${dish._id}`}
                      className='absolute bottom-4 left-1/2 -translate-x-1/2 translate-y-10 rounded-full bg-amber-500 px-6 py-2 text-sm font-semibold text-white opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100 hover:bg-amber-600'
                    >
                      Xem chi tiết
                    </Link>
                  </div>

                  {/* Content */}
                  <div className='p-6'>
                    <h3 className='mb-2 text-xl font-bold text-stone-800 transition-colors group-hover:text-amber-600'>
                      {dish.name}
                    </h3>
                    <p className='mb-4 line-clamp-2 text-sm text-stone-500'>
                      {dish.description || 'Món ăn truyền thống được chế biến từ nguyên liệu tươi ngon'}
                    </p>
                    <div className='flex items-center justify-between'>
                      <span className='text-xl font-bold text-amber-600'>{formatPrice(dish.price)}</span>
                      <div className='flex items-center gap-1 text-amber-500'>
                        {[...Array(5)].map((_, i) => (
                          <svg key={i} className='h-4 w-4 fill-current' viewBox='0 0 20 20'>
                            <path d='M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z' />
                          </svg>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </StaggerItem>
            ))}
          </StaggerContainer>

          {/* View All Button */}
          <div className='mt-12 text-center'>
            <Link
              to={path.menu}
              className='inline-flex items-center gap-2 rounded-full border-2 border-amber-500 px-8 py-3 font-semibold text-amber-600 transition-all hover:bg-amber-500 hover:text-white'
            >
              Xem Tất Cả Món Ăn
              <svg className='h-5 w-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M17 8l4 4m0 0l-4 4m4-4H3' />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* ========== ABOUT SECTION WITH STATS ========== */}
      <section className='relative overflow-hidden bg-stone-900 py-20'>
        {/* Background decoration */}
        <div className='absolute inset-0 opacity-10'>
          <div className='absolute left-0 top-0 h-96 w-96 rounded-full bg-amber-500 blur-3xl' />
          <div className='absolute bottom-0 right-0 h-96 w-96 rounded-full bg-orange-500 blur-3xl' />
        </div>

        <div className='relative mx-auto max-w-7xl px-6'>
          <div className='grid items-center gap-12 lg:grid-cols-2'>
            {/* Image Side */}
            <div className='relative'>
              <div className='relative overflow-hidden rounded-3xl'>
                <img
                  src='https://images.unsplash.com/photo-1555126634-323283e090fa?w=1920&q=90'
                  alt='About our restaurant'
                  className='aspect-4/3 w-full object-cover'
                />
                {/* Floating badge */}
                <div className='absolute bottom-4 right-4 rounded-2xl bg-amber-500 px-6 py-4 shadow-2xl'>
                  <div className='text-center text-white'>
                    <div className='text-3xl font-bold'>10+</div>
                    <div className='text-xs font-medium whitespace-nowrap'>Năm kinh nghiệm</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Content Side */}
            <div className='text-white'>
              <span className='mb-4 inline-block rounded-full bg-amber-500/20 px-4 py-1 text-sm font-semibold text-amber-400'>
                Về chúng tôi
              </span>
              <h2 className='mb-6 text-3xl font-bold sm:text-4xl md:text-5xl'>
                Hương Vị Truyền Thống,
                <br />
                <span className='text-amber-400'>Phong Cách Hiện Đại</span>
              </h2>
              <p className='mb-8 text-lg text-stone-300'>
                Với hơn 10 năm kinh nghiệm, chúng tôi tự hào mang đến những món ăn Việt Nam đích thực với hương vị độc
                đáo và chất lượng tuyệt vời. Mỗi món ăn là một tác phẩm nghệ thuật, được chế biến từ những nguyên liệu
                tươi ngon nhất.
              </p>

              {/* Stats */}
              <div className='mb-8 grid grid-cols-2 gap-6 sm:grid-cols-4'>
                {stats.map((stat, index) => (
                  <div key={index} className='text-center'>
                    <div className='text-3xl font-bold text-amber-400'>{stat.number}</div>
                    <div className='text-sm text-stone-400'>{stat.label}</div>
                  </div>
                ))}
              </div>

              <ButtonPrimary to={path.about}>
                Tìm Hiểu Thêm
                <svg className='ml-2 h-5 w-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                  <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M17 8l4 4m0 0l-4 4m4-4H3' />
                </svg>
              </ButtonPrimary>
            </div>
          </div>
        </div>
      </section>

      {/* ========== WHY CHOOSE US SECTION ========== */}
      <section className='bg-linear-to-b from-stone-50 to-white py-20'>
        <div className='mx-auto max-w-7xl px-6'>
          {/* Section Header */}
          <FadeIn className='mb-16 text-center'>
            <span className='mb-4 inline-block rounded-full bg-amber-100 px-4 py-1 text-sm font-semibold text-amber-700'>
              Tại sao chọn chúng tôi
            </span>
            <h2 className='mb-4 text-3xl font-bold text-stone-800 sm:text-4xl md:text-5xl'>
              Điều Làm Nên <span className='text-amber-600'>Sự Khác Biệt</span>
            </h2>
            <p className='mx-auto max-w-2xl text-lg text-stone-600'>
              Chúng tôi cam kết mang đến trải nghiệm ẩm thực tuyệt vời nhất cho quý khách
            </p>
          </FadeIn>

          {/* Features Grid */}
          <StaggerContainer className='grid gap-8 sm:grid-cols-2 lg:grid-cols-4'>
            {features.map((feature, index) => (
              <StaggerItem key={index}>
                <div className='group rounded-2xl bg-white p-8 shadow-lg transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl'>
                  {/* Icon */}
                  <div className='mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-linear-to-br from-amber-400 to-orange-500 text-3xl shadow-lg transition-transform duration-300 group-hover:scale-110'>
                    {feature.icon}
                  </div>
                  <h3 className='mb-3 text-xl font-bold text-stone-800'>{feature.title}</h3>
                  <p className='text-stone-600'>{feature.description}</p>
                </div>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>

      {/* ========== TESTIMONIALS SECTION ========== */}
      <section className='bg-amber-50 py-20'>
        <div className='mx-auto max-w-7xl px-6'>
          {/* Section Header */}
          <FadeIn className='mb-16 text-center'>
            <span className='mb-4 inline-block rounded-full bg-amber-100 px-4 py-1 text-sm font-semibold text-amber-700'>
              Đánh giá khách hàng
            </span>
            <h2 className='mb-4 text-3xl font-bold text-stone-800 sm:text-4xl md:text-5xl'>
              Khách Hàng <span className='text-amber-600'>Nói Gì</span>
            </h2>
          </FadeIn>

          {/* Testimonials Grid */}
          <StaggerContainer className='grid gap-8 md:grid-cols-3'>
            {testimonials.map((testimonial, index) => (
              <StaggerItem key={index}>
                <div className='rounded-2xl bg-white p-8 shadow-lg transition-all duration-300 hover:-translate-y-2 hover:shadow-xl'>
                  {/* Stars */}
                  <div className='mb-4 flex gap-1'>
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <svg key={i} className='h-5 w-5 fill-amber-400' viewBox='0 0 20 20'>
                        <path d='M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z' />
                      </svg>
                    ))}
                  </div>

                  {/* Quote */}
                  <p className='mb-6 text-lg italic text-stone-600'>"{testimonial.comment}"</p>

                  {/* Author */}
                  <div className='flex items-center gap-4'>
                    <img
                      src={testimonial.avatar}
                      alt={testimonial.name}
                      className='h-12 w-12 rounded-full object-cover'
                    />
                    <div>
                      <div className='font-semibold text-stone-800'>{testimonial.name}</div>
                      <div className='text-sm text-stone-500'>Khách hàng thân thiết</div>
                    </div>
                  </div>
                </div>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>

      {/* ========== CTA SECTION ========== */}
      <section className='relative overflow-hidden bg-linear-to-r from-amber-600 via-amber-500 to-orange-500 py-20'>
        {/* Background decoration */}
        <div className='absolute inset-0 opacity-20'>
          <svg className='h-full w-full' viewBox='0 0 100 100' preserveAspectRatio='none'>
            <defs>
              <pattern id='cta-pattern' x='0' y='0' width='20' height='20' patternUnits='userSpaceOnUse'>
                <circle cx='10' cy='10' r='2' fill='white' />
              </pattern>
            </defs>
            <rect fill='url(#cta-pattern)' width='100' height='100' />
          </svg>
        </div>

        <div className='relative mx-auto max-w-4xl px-6 text-center'>
          <h2 className='mb-6 text-3xl font-bold text-white sm:text-4xl md:text-5xl'>Sẵn Sàng Trải Nghiệm?</h2>
          <p className='mb-10 text-lg text-white/90'>
            Đặt bàn ngay hôm nay và tận hưởng những món ăn ngon nhất cùng không gian ấm cúng của chúng tôi
          </p>
          <div className='flex flex-col items-center justify-center gap-4 sm:flex-row'>
            <Link
              to={path.booking}
              className='inline-flex items-center gap-2 rounded-full bg-white px-8 py-4 text-lg font-bold text-amber-600 shadow-lg transition-all hover:scale-105 hover:shadow-xl'
            >
              Đặt Bàn Ngay
              <svg className='h-5 w-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M17 8l4 4m0 0l-4 4m4-4H3' />
              </svg>
            </Link>
            <Link
              to={path.menu}
              className='inline-flex items-center gap-2 rounded-full border-2 border-white px-8 py-4 text-lg font-bold text-white transition-all hover:bg-white hover:text-amber-600'
            >
              Xem Thực Đơn
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
