const path = {
  home: '/',
  menu: '/menu',
  about: '/about',
  blog: '/blog',
  user: '/user',
  booking: '/booking',
  profile: '/user/profile',
  changePassword: '/user/password',
  historyPurchase: '/user/purchase',
  login: '/login',
  register: '/register',
  logout: '/logout',
  forgot_password: '/forgot-password',
  productDetail: ':nameId',
  cart: '/cart',
  admin: '/admin',
  notFound: '*'
} as const

export default path
