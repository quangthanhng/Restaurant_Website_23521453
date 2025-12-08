import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import blogApi from '../../apis/blog.api'
import path from '../../constants/path'
import { FadeIn, StaggerContainer, StaggerItem } from '../../components/Animations'

interface Blog {
  _id: string
  title: string
  image?: string
  content: string
  createdAt: string
  updatedAt: string
}

export default function Blog() {
  const [searchQuery, setSearchQuery] = useState('')

  const { data: blogsData, isLoading } = useQuery({
    queryKey: ['blogs'],
    queryFn: () => blogApi.getBlogs(),
    select: (response) => response.data.metadata || []
  })

  const blogs: Blog[] = blogsData || []

  const filteredBlogs = blogs.filter(
    (blog) =>
      blog.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      blog.content.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    })
  }

  const truncateContent = (content: string, maxLength: number = 120) => {
    // Tạo một element tạm để parse HTML và decode entities
    const tempDiv = document.createElement('div')
    tempDiv.innerHTML = content
    const plainText = tempDiv.textContent || tempDiv.innerText || ''
    if (plainText.length <= maxLength) return plainText
    return plainText.substring(0, maxLength) + '...'
  }

  return (
    <div className='min-h-screen w-full bg-stone-50 pt-[74px]'>
      {/* Hero Section */}
      <section className='relative h-[400px] w-full overflow-hidden'>
        <div
          className='absolute inset-0 bg-cover bg-center bg-no-repeat'
          style={{
            backgroundImage: 'url("https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1920&q=80")'
          }}
        />
        <div className='absolute inset-0 bg-linear-to-b from-black/60 via-black/40 to-black/70' />

        <FadeIn className='relative flex h-full flex-col items-center justify-center px-6 text-center'>
          <span className='mb-4 inline-block rounded-full bg-amber-500/20 px-6 py-2 text-sm font-medium text-amber-300 backdrop-blur'>
            Blog & Tin tức
          </span>
          <h1 className='mb-4 font-serif text-5xl font-bold text-white md:text-6xl lg:text-7xl'>
            Khám Phá <span className='text-amber-400'>Ẩm Thực</span>
          </h1>
          <p className='max-w-2xl text-lg text-white/80'>
            Những câu chuyện thú vị, công thức nấu ăn và bí quyết ẩm thực từ đội ngũ đầu bếp của chúng tôi
          </p>
        </FadeIn>
      </section>

      {/* Main Content */}
      <section className='mx-auto max-w-7xl px-6 py-16'>
        {/* Search Bar */}
        <div className='mb-12'>
          <div className='mx-auto max-w-xl'>
            <div className='relative'>
              <input
                type='text'
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder='Tìm kiếm bài viết...'
                className='w-full rounded-full border border-stone-200 bg-white py-4 pl-6 pr-14 text-gray-900 shadow-lg placeholder:text-gray-400 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20'
              />
              <button className='absolute right-2 top-1/2 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full bg-amber-500 text-white transition-colors hover:bg-amber-600'>
                <svg className='h-5 w-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth='2'
                    d='M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z'
                  />
                </svg>
              </button>
            </div>
            {searchQuery && (
              <p className='mt-3 text-center text-sm text-gray-500'>
                Tìm thấy <span className='font-semibold text-amber-600'>{filteredBlogs.length}</span> bài viết cho "
                {searchQuery}"
              </p>
            )}
          </div>
        </div>

        {/* Loading */}
        {isLoading && (
          <div className='flex min-h-[400px] items-center justify-center'>
            <div className='flex flex-col items-center gap-4'>
              <div className='h-12 w-12 animate-spin rounded-full border-4 border-amber-500 border-t-transparent' />
              <p className='text-gray-500'>Đang tải bài viết...</p>
            </div>
          </div>
        )}

        {/* Empty */}
        {!isLoading && filteredBlogs.length === 0 && (
          <div className='flex min-h-[400px] flex-col items-center justify-center rounded-3xl bg-white p-12 shadow-lg'>
            <div className='mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-amber-100 text-6xl'>📝</div>
            <h3 className='mb-2 text-2xl font-bold text-stone-800'>
              {searchQuery ? 'Không tìm thấy bài viết' : 'Chưa có bài viết nào'}
            </h3>
            <p className='text-center text-gray-500'>
              {searchQuery ? 'Thử tìm kiếm với từ khóa khác' : 'Các bài viết mới sẽ sớm được cập nhật'}
            </p>
          </div>
        )}

        {/* Blog Grid - 2 blogs per row */}
        {!isLoading && filteredBlogs.length > 0 && (
          <StaggerContainer className='grid gap-8 md:grid-cols-2'>
            {filteredBlogs.map((blog) => (
              <StaggerItem key={blog._id}>
                <Link
                  to={`/blog/${blog._id}`}
                  className='group block cursor-pointer overflow-hidden rounded-2xl bg-white shadow-lg transition-all duration-300 hover:-translate-y-2 hover:shadow-xl'
                >
                  <div className='relative h-56 overflow-hidden sm:h-64'>
                    {blog.image ? (
                      <img
                        src={blog.image}
                        alt={blog.title}
                        className='h-full w-full object-cover transition-transform duration-500 group-hover:scale-105'
                      />
                    ) : (
                      <div className='flex h-full items-center justify-center bg-linear-to-br from-amber-100 to-orange-100'>
                        <span className='text-6xl'>📝</span>
                      </div>
                    )}
                    <div className='absolute inset-0 bg-linear-to-t from-black/40 via-transparent to-transparent opacity-0 transition-opacity group-hover:opacity-100' />
                  </div>
                  <div className='p-6'>
                    <div className='mb-3 flex items-center gap-2 text-sm text-gray-500'>
                      <svg className='h-4 w-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                        <path
                          strokeLinecap='round'
                          strokeLinejoin='round'
                          strokeWidth='2'
                          d='M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z'
                        />
                      </svg>
                      {formatDate(blog.createdAt)}
                    </div>
                    <h3 className='mb-3 font-serif text-xl font-bold text-stone-800 transition-colors group-hover:text-amber-600 sm:text-2xl'>
                      {blog.title}
                    </h3>
                    <p className='mb-4 text-sm text-gray-600 line-clamp-3'>{truncateContent(blog.content, 150)}</p>
                    <span className='inline-flex items-center gap-2 text-sm font-semibold text-amber-600'>
                      Đọc thêm
                      <svg
                        className='h-4 w-4 transition-transform group-hover:translate-x-1'
                        fill='none'
                        stroke='currentColor'
                        viewBox='0 0 24 24'
                      >
                        <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M9 5l7 7-7 7' />
                      </svg>
                    </span>
                  </div>
                </Link>
              </StaggerItem>
            ))}
          </StaggerContainer>
        )}
      </section>

      {/* CTA Section */}
      <section className='bg-linear-to-r from-amber-500 to-orange-500 py-16'>
        <div className='mx-auto max-w-4xl px-6 text-center'>
          <h2 className='mb-4 font-serif text-3xl font-bold text-white md:text-4xl'>Muốn thưởng thức món ngon?</h2>
          <p className='mb-8 text-lg text-white/80'>Đặt bàn ngay để trải nghiệm những món ăn tuyệt vời</p>
          <div className='flex flex-col items-center justify-center gap-4 sm:flex-row'>
            <Link
              to={path.booking}
              className='inline-flex items-center gap-2 rounded-full bg-white px-8 py-4 font-semibold text-amber-600 transition-all hover:bg-amber-50 hover:shadow-lg'
            >
              <svg className='h-5 w-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth='2'
                  d='M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z'
                />
              </svg>
              Đặt bàn ngay
            </Link>
            <Link
              to={path.menu}
              className='inline-flex items-center gap-2 rounded-full border-2 border-white px-8 py-4 font-semibold text-white transition-all hover:bg-white/10'
            >
              Xem thực đơn
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
