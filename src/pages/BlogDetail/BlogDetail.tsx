import { useEffect, useState, useMemo } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import blogApi from '../../apis/blog.api'
import path from '../../constants/path'
import ButtonPrimary from '../../components/ButtonPrimary'

interface Blog {
  _id: string
  title: string
  image?: string
  content: string
  createdAt: string
  updatedAt: string
}

export default function BlogDetail() {
  const { id } = useParams<{ id: string }>()
  const [relatedBlogs, setRelatedBlogs] = useState<Blog[]>([])

  // Scroll to top
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [id])

  const { data, isLoading, error } = useQuery({
    queryKey: ['blog-detail', id],
    queryFn: async () => {
      if (!id) throw new Error('No blog ID')
      const response = await blogApi.getBlogById(id)
      return response.data
    },
    enabled: !!id
  })

  // Also fetch related blogs (latest ones, excluding current)
  const { data: allBlogsData } = useQuery({
    queryKey: ['blogs'],
    queryFn: () => blogApi.getBlogs(),
    select: (response) => response.data.metadata || []
  })

  const blog = data?.metadata as unknown as Blog

  // Use useMemo instead of useEffect + setState to avoid cascading renders
  const computedRelatedBlogs = useMemo(() => {
    if (!allBlogsData || !id) return []
    return allBlogsData.filter((b: Blog) => b._id !== id).slice(0, 3)
  }, [allBlogsData, id])

  useEffect(() => {
    setRelatedBlogs(computedRelatedBlogs)
  }, [computedRelatedBlogs])

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    })
  }

  if (isLoading) {
    return (
      <div className='flex min-h-screen items-center justify-center pt-[74px]'>
        <div className='h-12 w-12 animate-spin rounded-full border-4 border-amber-500 border-t-transparent'></div>
      </div>
    )
  }

  if (error || !blog) {
    return (
      <div className='flex min-h-screen flex-col items-center justify-center pt-[74px]'>
        <div className='text-6xl'>📝</div>
        <h2 className='mt-4 text-2xl font-bold text-stone-800'>Không tìm thấy bài viết</h2>
        <p className='mt-2 text-stone-500'>Bài viết này có thể không còn tồn tại hoặc đã bị xóa.</p>
        <Link to={path.blog} className='mt-6 text-amber-600 hover:underline'>
          ← Quay lại trang Blog
        </Link>
      </div>
    )
  }

  return (
    <div className='min-h-screen bg-stone-50 pt-[74px]'>
      {/* Breadcrumb */}
      <div className='bg-white border-b border-stone-200'>
        <div className='mx-auto max-w-7xl px-6 py-4'>
          <nav className='flex items-center gap-2 text-sm text-stone-500'>
            <Link to={path.home} className='hover:text-amber-600'>
              Trang chủ
            </Link>
            <span>/</span>
            <Link to={path.blog} className='hover:text-amber-600'>
              Blog
            </Link>
            <span>/</span>
            <span className='line-clamp-1 max-w-[200px] text-stone-800 font-medium sm:max-w-none'>{blog.title}</span>
          </nav>
        </div>
      </div>

      {/* Hero Image */}
      {blog.image && (
        <div className='relative h-[400px] w-full overflow-hidden'>
          <img src={blog.image} alt={blog.title} className='h-full w-full object-cover' />
          <div className='absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent' />
          <div className='absolute bottom-0 left-0 right-0 p-8'>
            <div className='mx-auto max-w-4xl'>
              <div className='flex items-center gap-3 text-white/90 mb-4'>
                <span className='bg-amber-500 px-3 py-1 rounded-full text-xs font-bold text-white uppercase tracking-wider'>
                  Blog
                </span>
                <span className='flex items-center gap-1 text-sm'>
                  <svg className='h-4 w-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth='2'
                      d='M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z'
                    />
                  </svg>
                  {formatDate(blog.createdAt)}
                </span>
              </div>
              <h1 className='font-serif text-4xl font-bold text-white md:text-5xl leading-tight'>{blog.title}</h1>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className='mx-auto max-w-7xl px-6 py-12'>
        <div className='grid gap-12 lg:grid-cols-12'>
          {/* Article Render */}
          <div className='lg:col-span-8'>
            {!blog.image && (
              <div className='mb-8'>
                <h1 className='font-serif text-4xl font-bold text-stone-800 md:text-5xl leading-tight mb-4'>
                  {blog.title}
                </h1>
                <div className='flex items-center gap-3 text-stone-500'>
                  <span className='bg-amber-100 px-3 py-1 rounded-full text-xs font-bold text-amber-600 uppercase tracking-wider'>
                    Blog
                  </span>
                  <span className='flex items-center gap-1 text-sm'>
                    <svg className='h-4 w-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                      <path
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        strokeWidth='2'
                        d='M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z'
                      />
                    </svg>
                    {formatDate(blog.createdAt)}
                  </span>
                </div>
              </div>
            )}

            <div className='bg-white p-8 rounded-3xl shadow-sm border border-stone-100'>
              <div
                className='prose prose-lg max-w-none prose-headings:font-serif prose-headings:text-stone-800 prose-p:text-stone-600 prose-a:text-amber-600 hover:prose-a:text-amber-700 prose-strong:text-stone-900 prose-img:rounded-2xl prose-img:shadow-md'
                dangerouslySetInnerHTML={{ __html: blog.content }}
              />
            </div>
          </div>

          {/* Sidebar */}
          <div className='lg:col-span-4 space-y-8'>
            {/* CTA Widget */}
            <div className='bg-stone-900 text-white p-8 rounded-3xl overflow-hidden relative'>
              <div className='absolute top-0 right-0 -mt-8 -mr-8 w-32 h-32 bg-amber-500 rounded-full blur-3xl opacity-20'></div>
              <div className='relative z-10'>
                <h3 className='font-serif text-2xl font-bold mb-4'>Đói bụng chưa?</h3>
                <p className='text-stone-300 mb-6'>Đặt bàn ngay để thưởng thức những món ăn tuyệt vời của chúng tôi.</p>
                <ButtonPrimary to={path.booking} className='w-full justify-center'>
                  Đặt bàn ngay
                </ButtonPrimary>
              </div>
            </div>

            {/* Related Blogs */}
            {relatedBlogs.length > 0 && (
              <div>
                <h3 className='font-serif text-xl font-bold text-stone-800 mb-6'>Bài viết liên quan</h3>
                <div className='space-y-6'>
                  {relatedBlogs.map((item) => (
                    <Link key={item._id} to={`/blog/${item._id}`} className='group flex gap-4 items-start'>
                      <div className='w-24 h-24 flex-shrink-0 rounded-xl overflow-hidden bg-stone-200'>
                        {item.image ? (
                          <img
                            src={item.image}
                            alt={item.title}
                            className='w-full h-full object-cover transition-transform duration-500 group-hover:scale-110'
                          />
                        ) : (
                          <div className='w-full h-full flex items-center justify-center text-2xl'>📝</div>
                        )}
                      </div>
                      <div>
                        <h4 className='font-bold text-stone-800 line-clamp-2 group-hover:text-amber-600 transition-colors mb-2'>
                          {item.title}
                        </h4>
                        <span className='text-xs text-stone-500 block'>{formatDate(item.createdAt)}</span>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Share / Tags could go here */}
          </div>
        </div>
      </div>
    </div>
  )
}
