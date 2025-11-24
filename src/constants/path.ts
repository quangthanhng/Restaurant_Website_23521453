const path = {
  home: '/',
  menu: '/menu',
  about: '/about',
  blog: '/blog',
  user: '/user',
  profile: '/user/profile',
  changePassword: '/user/password',
  historyPurchase: '/user/purchase',
  login: '/login',
  register: '/register',
  logout: '/logout',
  productDetail: ':nameId',
  cart: '/cart',
  admin: '/admin'
} as const

export default path
