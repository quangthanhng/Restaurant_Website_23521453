const path = {
  home: '/',
  menu: '/menu',
  about: '/about',
  blog: '/blog',
  user: '/user',
  booking: '/booking',
  payment: '/payment',
  profile: '/user/profile',
  changePassword: '/user/password',
  historyPurchase: '/user/purchase',
  login: '/login',
  register: '/register',
  logout: '/logout',
  forgot_password: '/forgot-password',
  productDetail: ':nameId',
  cart: '/cart',
  // Admin routes
  admin: '/admin',
  adminProducts: '/admin/products',
  adminCategories: '/admin/categories',
  adminTables: '/admin/tables',
  adminOrders: '/admin/orders',
  adminUsers: '/admin/users',
  adminCoupons: '/admin/coupons',
  adminBlogs: '/admin/blogs',
  adminContacts: '/admin/contacts',
  notFound: '*'
} as const

export default path
