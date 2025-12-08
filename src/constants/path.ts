const path = {
  home: '/',
  menu: '/menu',
  dishDetail: '/dish/:id', // Dish detail page
  about: '/about',
  blog: '/blog',
  blogDetail: '/blog/:id', // Blog detail page
  user: '/user',
  booking: '/booking',
  payment: '/payment',
  paymentResult: '/payment-result', // MoMo redirect route
  paymentResultLegacy: '/restaurant/api/v1/orders/result', // Legacy MoMo callback route (IPN)
  checkout: '/checkout', // Checkout page for cart
  profile: '/profile',
  orders: '/orders', // Order history page
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
  adminLogin: '/admin/login',
  adminStatistics: '/admin/statistics',
  adminProducts: '/admin/products',
  adminCategories: '/admin/categories',
  adminTables: '/admin/tables',
  adminOrders: '/admin/orders',
  adminCoupons: '/admin/coupons',
  adminBlogs: '/admin/blogs',
  adminContacts: '/admin/contacts',
  verify_otp: '/verify-otp',
  reset_password: '/reset-password',
  notFound: '*'
} as const

export default path
