import { Link } from 'react-router-dom'
import path from '../../constants/path'

// Team members data
const teamMembers = [
  {
    name: 'Trần Văn Anh',
    role: 'Head Chef',
    image: 'https://images.unsplash.com/photo-1577219491135-ce391730fb2c?w=400&h=400&fit=crop',
    description: 'Với hơn 15 năm kinh nghiệm, đầu bếp Anh đã mang đến những món ăn tinh tế nhất.'
  },
  {
    name: 'Nguyễn Thị Hương',
    role: 'Pastry Chef',
    image: 'https://images.unsplash.com/photo-1595273670150-bd0c3c392e46?w=400&h=400&fit=crop',
    description: 'Chuyên gia về các món tráng miệng và bánh ngọt truyền thống Việt Nam.'
  },
  {
    name: 'Lê Minh Tuấn',
    role: 'Sous Chef',
    image: 'https://images.unsplash.com/photo-1556909114-44e3e70034e2?w=400&h=400&fit=crop',
    description: 'Đam mê sáng tạo những món ăn fusion độc đáo kết hợp Đông - Tây.'
  }
]

// Features/Values
const features = [
  {
    icon: '🌿',
    title: 'Nguyên liệu tươi ngon',
    description:
      'Chúng tôi chỉ sử dụng nguyên liệu tươi nhất, được lựa chọn kỹ càng mỗi ngày từ các nhà cung cấp uy tín.'
  },
  {
    icon: '👨‍🍳',
    title: 'Đầu bếp chuyên nghiệp',
    description: 'Đội ngũ đầu bếp giàu kinh nghiệm, được đào tạo bài bản với tình yêu ẩm thực Việt Nam.'
  },
  {
    icon: '🏠',
    title: 'Không gian ấm cúng',
    description: 'Thiết kế theo phong cách Việt Nam hiện đại, mang lại cảm giác thân thuộc như ở nhà.'
  },
  {
    icon: '❤️',
    title: 'Phục vụ tận tâm',
    description: 'Đội ngũ nhân viên nhiệt tình, chu đáo, luôn sẵn sàng phục vụ quý khách.'
  }
]

// Stats
const stats = [
  { value: '10+', label: 'Năm kinh nghiệm' },
  { value: '50+', label: 'Món ăn đặc sắc' },
  { value: '10K+', label: 'Khách hàng hài lòng' },
  { value: '4.9', label: 'Đánh giá trung bình' }
]

export default function About() {
  return (
    <div className='min-h-screen bg-white pt-[74px]'>
      {/* Hero Section */}
      <section className='relative h-[500px] overflow-hidden'>
        <div
          className='absolute inset-0 bg-cover bg-center bg-no-repeat'
          style={{
            backgroundImage: 'url(https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1920&q=80)'
          }}
        >
          <div className='absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/70' />
        </div>

        <div className='relative flex h-full flex-col items-center justify-center px-6 text-center'>
          <span className='mb-4 inline-block rounded-full bg-amber-500/20 px-6 py-2 text-sm font-medium text-amber-300 backdrop-blur'>
            Về chúng tôi
          </span>
          <h1 className='mb-6 font-serif text-5xl font-bold text-white md:text-6xl lg:text-7xl'>
            TS <span className='text-amber-400'>Restaurant</span>
          </h1>
          <p className='max-w-2xl text-lg leading-relaxed text-white/80'>
            Nơi hội tụ tinh hoa ẩm thực Việt Nam, mang đến những trải nghiệm ẩm thực đáng nhớ nhất
          </p>
        </div>
      </section>

      {/* Story Section */}
      <section className='mx-auto max-w-7xl px-6 py-20'>
        <div className='grid gap-16 lg:grid-cols-2 lg:items-center'>
          {/* Image */}
          <div className='relative'>
            <div className='overflow-hidden rounded-3xl shadow-2xl'>
              <img
                src='https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&q=80'
                alt='Restaurant interior'
                className='h-[500px] w-full object-cover'
              />
            </div>
            {/* Decorative element */}
            <div className='absolute -bottom-6 -right-6 -z-10 h-full w-full rounded-3xl bg-amber-500/20' />
          </div>

          {/* Content */}
          <div>
            <span className='mb-4 inline-block rounded-full bg-amber-100 px-4 py-1 text-sm font-semibold text-amber-700'>
              Câu chuyện của chúng tôi
            </span>
            <h2 className='mb-6 font-serif text-4xl font-bold text-stone-800'>
              Hành trình từ <span className='text-amber-600'>đam mê</span> đến{' '}
              <span className='text-amber-600'>thương hiệu</span>
            </h2>
            <p className='mb-6 text-lg leading-relaxed text-stone-600'>
              TS Restaurant được thành lập vào năm 2014 với mong muốn mang đến cho thực khách những món ăn Việt Nam
              truyền thống được chế biến từ những nguyên liệu tươi ngon nhất.
            </p>
            <p className='mb-8 text-lg leading-relaxed text-stone-600'>
              Qua hơn 10 năm hoạt động, chúng tôi tự hào là điểm đến tin cậy của hàng ngàn thực khách trong và ngoài
              nước, những người yêu thích ẩm thực Việt Nam đích thực.
            </p>
            <Link
              to={path.menu}
              className='inline-flex items-center gap-2 rounded-full bg-amber-500 px-8 py-4 text-base font-semibold text-white transition-all hover:bg-amber-600 hover:shadow-lg'
            >
              Khám phá thực đơn
              <svg className='h-5 w-5' fill='none' stroke='currentColor' viewBox='0 0 24 24' strokeWidth='2'>
                <path strokeLinecap='round' strokeLinejoin='round' d='M17 8l4 4m0 0l-4 4m4-4H3' />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className='bg-gradient-to-r from-amber-500 to-orange-500 py-16'>
        <div className='mx-auto max-w-7xl px-6'>
          <div className='grid grid-cols-2 gap-8 md:grid-cols-4'>
            {stats.map((stat, index) => (
              <div key={index} className='text-center'>
                <div className='mb-2 font-serif text-5xl font-bold text-white'>{stat.value}</div>
                <div className='text-white/80'>{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className='bg-stone-50 py-20'>
        <div className='mx-auto max-w-7xl px-6'>
          <div className='mb-16 text-center'>
            <span className='mb-4 inline-block rounded-full bg-amber-100 px-4 py-1 text-sm font-semibold text-amber-700'>
              Tại sao chọn chúng tôi
            </span>
            <h2 className='font-serif text-4xl font-bold text-stone-800'>
              Điều làm nên <span className='text-amber-600'>sự khác biệt</span>
            </h2>
          </div>

          <div className='grid gap-8 md:grid-cols-2 lg:grid-cols-4'>
            {features.map((feature, index) => (
              <div
                key={index}
                className='group rounded-2xl bg-white p-8 shadow-lg transition-all duration-300 hover:-translate-y-2 hover:shadow-xl'
              >
                <div className='mb-4 flex h-16 w-16 items-center justify-center rounded-xl bg-amber-100 text-3xl transition-colors group-hover:bg-amber-500'>
                  {feature.icon}
                </div>
                <h3 className='mb-3 text-xl font-bold text-stone-800'>{feature.title}</h3>
                <p className='text-stone-600'>{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className='py-20'>
        <div className='mx-auto max-w-7xl px-6'>
          <div className='mb-16 text-center'>
            <span className='mb-4 inline-block rounded-full bg-amber-100 px-4 py-1 text-sm font-semibold text-amber-700'>
              Đội ngũ của chúng tôi
            </span>
            <h2 className='font-serif text-4xl font-bold text-stone-800'>
              Gặp gỡ <span className='text-amber-600'>các đầu bếp</span>
            </h2>
            <p className='mx-auto mt-4 max-w-2xl text-lg text-stone-600'>
              Những nghệ nhân đứng sau mỗi món ăn, mang đến hương vị tuyệt vời cho bạn
            </p>
          </div>

          <div className='grid gap-8 md:grid-cols-3'>
            {teamMembers.map((member, index) => (
              <div
                key={index}
                className='group overflow-hidden rounded-2xl bg-white shadow-lg transition-all duration-300 hover:-translate-y-2 hover:shadow-xl'
              >
                <div className='relative h-80 overflow-hidden'>
                  <img
                    src={member.image}
                    alt={member.name}
                    className='h-full w-full object-cover transition-transform duration-500 group-hover:scale-110'
                  />
                  <div className='absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 transition-opacity group-hover:opacity-100' />
                </div>
                <div className='p-6 text-center'>
                  <h3 className='mb-1 text-xl font-bold text-stone-800'>{member.name}</h3>
                  <p className='mb-3 font-medium text-amber-600'>{member.role}</p>
                  <p className='text-sm text-stone-600'>{member.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className='relative overflow-hidden bg-stone-900 py-20'>
        <div className='absolute inset-0 opacity-10'>
          <div className='absolute left-0 top-0 h-96 w-96 rounded-full bg-amber-500 blur-3xl' />
          <div className='absolute bottom-0 right-0 h-96 w-96 rounded-full bg-orange-500 blur-3xl' />
        </div>

        <div className='relative mx-auto max-w-4xl px-6 text-center'>
          <h2 className='mb-6 font-serif text-4xl font-bold text-white md:text-5xl'>
            Sẵn sàng trải nghiệm <span className='text-amber-400'>ẩm thực tuyệt vời</span>?
          </h2>
          <p className='mb-10 text-lg text-white/70'>
            Đặt bàn ngay hôm nay để thưởng thức những món ăn đặc sắc nhất của chúng tôi
          </p>
          <div className='flex flex-col items-center justify-center gap-4 sm:flex-row'>
            <Link
              to={path.booking}
              className='inline-flex items-center gap-2 rounded-full bg-amber-500 px-8 py-4 text-base font-semibold text-white transition-all hover:bg-amber-600 hover:shadow-lg'
            >
              <svg className='h-5 w-5' fill='none' stroke='currentColor' viewBox='0 0 24 24' strokeWidth='2'>
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  d='M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z'
                />
              </svg>
              Đặt bàn ngay
            </Link>
            <Link
              to={path.menu}
              className='inline-flex items-center gap-2 rounded-full border border-white/30 px-8 py-4 text-base font-semibold text-white transition-all hover:bg-white/10'
            >
              Xem thực đơn
              <svg className='h-5 w-5' fill='none' stroke='currentColor' viewBox='0 0 24 24' strokeWidth='2'>
                <path strokeLinecap='round' strokeLinejoin='round' d='M17 8l4 4m0 0l-4 4m4-4H3' />
              </svg>
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
