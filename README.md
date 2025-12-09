# 🍜 Vietnam Restaurant Website

<div align="center">

![Vietnam Restaurant](https://img.shields.io/badge/Restaurant-Management-green?style=for-the-badge)
![React](https://img.shields.io/badge/React-19.2.0-blue?style=for-the-badge&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9.3-blue?style=for-the-badge&logo=typescript)
![Node.js](https://img.shields.io/badge/Node.js-Express-green?style=for-the-badge&logo=node.js)
![MongoDB](https://img.shields.io/badge/MongoDB-Database-green?style=for-the-badge&logo=mongodb)

**A modern, full-stack restaurant management system with real-time features**

[Features](#-features) • [Tech Stack](#-tech-stack) • [Installation](#-installation) • [API Documentation](#-api-documentation)

</div>

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Installation](#-installation)
- [Environment Variables](#-environment-variables)
- [API Documentation](#-api-documentation)
- [Usage](#-usage)
- [Development](#-development)
- [Deployment](#-deployment)
- [Contributing](#-contributing)
- [License](#-license)

---

## 🌟 Overview

Vietnam Restaurant Website is a comprehensive restaurant management system built with modern web technologies. The platform provides a seamless experience for both customers and administrators, featuring online ordering, table reservations, real-time order tracking, and a complete admin dashboard.

### Key Highlights

- 🎯 **Real-time Updates** - Live order notifications using Socket.IO
- 🛒 **Smart Shopping Cart** - Persistent cart with discount code support
- 📱 **Responsive Design** - Mobile-first approach with Tailwind CSS
- 🔐 **Secure Authentication** - JWT-based auth with Google OAuth integration
- 🖼️ **Cloud Storage** - Cloudinary integration for image management
- 📊 **Admin Dashboard** - Complete management system with statistics
- 🤖 **AI-Powered Search** - Google Gemini integration for smart search
- 📧 **Email Integration** - Automated notifications and OTP verification

---

## ✨ Features

### Customer Features

#### 🍽️ Menu & Ordering

- Browse menu with advanced filtering and search
- View detailed dish information with images
- Add items to cart with customization options
- Apply discount codes for special offers
- Real-time price calculations

#### 🔐 Authentication & Profile

- User registration and login
- Google OAuth integration
- Email verification with OTP
- Password reset functionality
- Profile management
- Order history tracking

#### 🪑 Table Booking

- Real-time table availability
- Online table reservations
- Booking confirmation via email
- Booking management

#### 💳 Payment & Checkout

- Secure checkout process
- Multiple payment methods support
- Order confirmation
- Payment success/failure handling
- Invoice generation

#### 📱 Additional Features

- Blog section with restaurant updates
- Contact form for inquiries
- Responsive design for all devices
- Real-time order status updates

### Admin Features

#### 📊 Dashboard & Statistics

- Revenue analytics and charts
- Order statistics
- Customer insights
- Best-selling dishes tracking
- Real-time data visualization

#### 🍕 Product Management

- CRUD operations for dishes
- Category management
- Image upload and management
- Bulk operations
- Inventory tracking

#### 🎫 Discount Management

- Create and manage discount codes
- Set validity periods
- Usage limits and tracking
- Percentage or fixed amount discounts

#### 📋 Order Management

- Real-time order notifications
- Order status updates (Pending, Confirmed, Preparing, Completed, Cancelled)
- Order details and customer information
- Order history and filtering
- Socket.IO integration for live updates

#### 🪑 Table Management

- Table status tracking (Available, Reserved, Occupied)
- Reservation management
- Table capacity configuration

#### 📝 Content Management

- Blog post creation and editing
- Rich text editor (TinyMCE) integration
- Contact message handling
- Customer feedback management

#### 👥 User Management

- View all registered users
- User role management (Admin/Customer)
- Account status control

---

## 🛠️ Tech Stack

### Frontend

#### Core Technologies

- **React 19.2.0** - Latest version with concurrent features
- **TypeScript 5.9.3** - Type-safe development
- **Vite 7.2.2** - Lightning-fast build tool
- **React Router DOM 7.9.6** - Client-side routing

#### UI & Styling

- **Tailwind CSS 4.1.17** - Utility-first CSS framework
- **Framer Motion 12.23.25** - Animation library
- **PostCSS** - CSS processing

#### State Management & Data Fetching

- **React Query (@tanstack/react-query 5.90.10)** - Powerful async state management
- **React Hook Form 7.66.1** - Performant form handling
- **Axios 1.13.2** - HTTP client

#### Rich Text Editor

- **TinyMCE 8.2.2** - WYSIWYG editor for blog content
- **@tinymce/tinymce-react 6.3.0** - React integration

#### Real-time Communication

- **Socket.IO Client 4.8.1** - Real-time bidirectional communication

#### Development Tools

- **ESLint 9.39.1** - Code linting
- **Prettier 3.6.2** - Code formatting
- **TypeScript ESLint** - TypeScript linting rules
- **React Compiler (Babel Plugin)** - Performance optimization

### Backend

#### Core Technologies

- **Node.js** - JavaScript runtime
- **Express 5.1.0** - Web application framework
- **TypeScript 5.9.3** - Type-safe development
- **MongoDB 6.20.0** - NoSQL database
- **Mongoose 8.19.2** - MongoDB ODM

#### Authentication & Security

- **JWT (jsonwebtoken 9.0.2)** - Token-based authentication
- **bcrypt 6.0.0** - Password hashing
- **cookie-parser 1.4.7** - Cookie handling
- **Google OAuth2** - Social authentication

#### File Upload & Storage

- **Cloudinary 2.8.0** - Cloud image storage and management
- **Multer 2.0.2** - Multipart/form-data handling
- **Streamifier 0.1.1** - Stream conversion

#### Email Services

- **Nodemailer 7.0.10** - Email sending
- **Resend 6.5.2** - Modern email API

#### Real-time Features

- **Socket.IO 4.8.1** - WebSocket server
- **HTTP Server** - Socket.IO integration

#### AI Integration

- **Google Generative AI** - Gemini API for AI-powered search

#### API Documentation

- **Swagger UI Express 5.0.1** - Interactive API documentation
- **Swagger JSDoc 6.2.8** - API documentation from comments
- **YAML 2.8.1** - Swagger YAML parsing

#### Development Tools

- **Nodemon 3.1.10** - Auto-restart on file changes
- **ts-node 10.9.2** - TypeScript execution
- **dotenv 17.2.3** - Environment variables

---

## 📁 Project Structure

```
Restaurant_Website_23521453/
│
├── VietNam Restaurant Website/     # Frontend Application
│   ├── src/
│   │   ├── apis/                  # API service calls
│   │   ├── assets/                # Static assets (images, fonts)
│   │   ├── components/            # Reusable React components
│   │   │   ├── ProtectedRoute/    # Route guards
│   │   │   └── ...
│   │   ├── contexts/              # React Context providers
│   │   ├── hooks/                 # Custom React hooks
│   │   ├── layouts/               # Layout components
│   │   │   ├── MainLayout/        # Customer layout
│   │   │   └── RegisterLayout/    # Auth layout
│   │   ├── pages/                 # Page components
│   │   │   ├── homepage/          # Landing page
│   │   │   ├── Menu/              # Menu listing
│   │   │   ├── DishDetail/        # Dish details
│   │   │   ├── Cart/              # Shopping cart
│   │   │   ├── Checkout/          # Checkout process
│   │   │   ├── Payment/           # Payment handling
│   │   │   ├── Booking/           # Table reservations
│   │   │   ├── Blog/              # Blog listing
│   │   │   ├── BlogDetail/        # Blog post detail
│   │   │   ├── Profile/           # User profile
│   │   │   ├── OrderHistory/      # Order tracking
│   │   │   ├── Login/             # Authentication
│   │   │   ├── Register/          # User registration
│   │   │   ├── ForgotPassword/    # Password recovery
│   │   │   ├── VerifyOtp/         # OTP verification
│   │   │   ├── ResetPassword/     # Password reset
│   │   │   └── admin/             # Admin section
│   │   │       ├── AdminLayout/   # Admin layout
│   │   │       └── pages/         # Admin pages
│   │   │           ├── AdminLogin/          # Admin authentication
│   │   │           ├── Statistics/          # Dashboard
│   │   │           ├── ProductManagement/   # Dish management
│   │   │           ├── CategoryManagement/  # Category management
│   │   │           ├── OrderManagement/     # Order management
│   │   │           ├── TableManagement/     # Table management
│   │   │           ├── DiscountManagement/  # Discount codes
│   │   │           ├── BlogManagement/      # Blog management
│   │   │           └── ContactManagement/   # Contact messages
│   │   ├── services/              # Business logic
│   │   ├── types/                 # TypeScript type definitions
│   │   ├── utils/                 # Utility functions
│   │   ├── constants/             # App constants
│   │   ├── App.tsx                # Root component
│   │   ├── main.tsx               # Entry point
│   │   └── useRouteElement.tsx    # Route configuration
│   ├── public/
│   │   └── tinymce/               # TinyMCE assets
│   ├── docs/                      # Documentation
│   ├── package.json               # Frontend dependencies
│   ├── vite.config.ts             # Vite configuration
│   ├── tailwind.config.js         # Tailwind configuration
│   ├── tsconfig.json              # TypeScript configuration
│   └── vercel.json                # Vercel deployment config
│
└── backend/                        # Backend Application
    ├── src/
    │   ├── config/
    │   │   └── database.config.ts  # MongoDB connection
    │   ├── models/                # Mongoose models
    │   │   ├── user.model.ts      # User schema
    │   │   ├── dish.model.ts      # Dish schema
    │   │   ├── category.model.ts  # Category schema
    │   │   ├── cart.model.ts      # Cart schema
    │   │   ├── order.model.ts     # Order schema
    │   │   ├── table.model.ts     # Table schema
    │   │   ├── discount.model.ts  # Discount schema
    │   │   ├── blog.model.ts      # Blog schema
    │   │   ├── contact.model.ts   # Contact schema
    │   │   ├── otp.model.ts       # OTP schema
    │   │   └── apiKey.model.ts    # API key schema
    │   ├── controllers/           # Request handlers
    │   │   ├── user.controller.ts
    │   │   ├── dish.controller.ts
    │   │   ├── category.controller.ts
    │   │   ├── cart.controller.ts
    │   │   ├── order.controller.ts
    │   │   ├── table.controller.ts
    │   │   ├── discount.controller.ts
    │   │   ├── blog.controller.ts
    │   │   └── contact.controller.ts
    │   ├── routes/                # API routes
    │   │   ├── index.route.ts     # Route aggregator
    │   │   ├── user.route.ts
    │   │   ├── dish.route.ts
    │   │   ├── category.route.ts
    │   │   ├── cart.route.ts
    │   │   ├── order.route.ts
    │   │   ├── table.route.ts
    │   │   ├── discount.route.ts
    │   │   ├── blog.route.ts
    │   │   └── contact.route.ts
    │   ├── auth/                  # Authentication
    │   │   └── checkAuth.auth.ts  # Auth middleware
    │   ├── middlewares/           # Express middlewares
    │   │   └── uploadCloud.middleware.ts  # Cloudinary upload
    │   ├── services/              # Business services
    │   │   └── socket.service.ts  # Socket.IO service
    │   ├── utils/                 # Utilities
    │   │   ├── AISearch/          # AI search integration
    │   │   ├── auth/              # Auth helpers
    │   │   └── SendMail/          # Email utilities
    │   ├── helpers/               # Helper functions
    │   │   ├── generate.helper.ts # Code generation
    │   │   ├── pagination.helper.ts # Pagination
    │   │   └── storageMulter.ts   # File storage
    │   ├── validates/             # Validation rules
    │   ├── core/                  # Core utilities
    │   │   ├── error.response.ts  # Error handling
    │   │   ├── success.response.ts # Success responses
    │   │   ├── statusCodes.ts     # HTTP status codes
    │   │   └── reasonPhrases.ts   # Status messages
    │   ├── data/                  # Seed data
    │   │   └── european_menu_en_100_clean.json
    │   └── index.ts               # Server entry point
    ├── uploads/                   # Local file uploads
    ├── views/                     # HTML templates
    │   └── socket_test.html       # Socket testing page
    ├── package.json               # Backend dependencies
    ├── tsconfig.json              # TypeScript config
    ├── restaurant_swagger.yaml    # API documentation
    ├── SOCKET_GUIDE.md           # Socket.IO guide
    ├── UPLOAD_GUIDE.md           # File upload guide
    └── FRONTEND-FIX-GUIDE.md     # Frontend integration guide
```

---

## 🚀 Installation

### Prerequisites

- **Node.js** (v18 or higher)
- **npm** or **yarn**
- **MongoDB** (local or cloud instance)
- **Cloudinary Account** (for image storage)
- **Google Cloud Console** (for OAuth)
- **Google Gemini API Key** (for AI features)

### Backend Setup

1. **Clone the repository**

   ```bash
   git clone https://github.com/quangthanhng/Restaurant_Website_23521453.git
   cd Restaurant_Website_23521453/backend
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Configure environment variables**

   Create a `.env` file in the `backend` directory:

   ```env
   # Server Configuration
   PORT=3000
   NODE_ENV=development
   PREFIX=/restaurant/api/v1

   # Database
   MONGODB_URL=your_mongodb_connection_string

   # JWT Secret
   JWT_SECRET=your_jwt_secret_key

   # Cloudinary Configuration
   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret

   # Google OAuth
   GOOGLE_CLIENT_ID=your_google_client_id
   GOOGLE_CLIENT_SECRET=your_google_client_secret
   GOOGLE_REDIRECT_URI=http://localhost:3000/restaurant/api/v1/users/auth/google/callback

   # Google Gemini AI
   GOOGLE_API_KEY=your_gemini_api_key

   # Email Configuration (Choose one)
   # Option 1: Gmail
   EMAIL_USER=your_email@gmail.com
   EMAIL_PASSWORD=your_app_password

   # Option 2: Resend
   RESEND_API_KEY=your_resend_api_key
   ```

4. **Start the development server**

   ```bash
   npm run dev
   ```

   The backend will run on `http://localhost:3000`

5. **Build for production**
   ```bash
   npm run build
   npm start
   ```

### Frontend Setup

1. **Navigate to frontend directory**

   ```bash
   cd "../VietNam Restaurant Website"
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Configure environment variables**

   Create a `.env` file in the frontend directory:

   ```env
   VITE_API_URL=http://localhost:3000/restaurant/api/v1
   VITE_SOCKET_URL=http://localhost:3000
   ```

4. **Start the development server**

   ```bash
   npm run dev
   ```

   The frontend will run on `http://localhost:3000`

5. **Build for production**
   ```bash
   npm run build
   npm run preview
   ```

### Docker Setup (Optional)

If you prefer using Docker:

```bash
# Build and run with Docker Compose
docker-compose up -d

# Stop containers
docker-compose down
```

---

## 🔐 Environment Variables

### Backend Environment Variables

| Variable                | Description                | Required | Default            |
| ----------------------- | -------------------------- | -------- | ------------------ |
| `PORT`                  | Server port                | No       | 3000               |
| `NODE_ENV`              | Environment mode           | No       | development        |
| `PREFIX`                | API route prefix           | Yes      | /restaurant/api/v1 |
| `MONGODB_URL`           | MongoDB connection string  | Yes      | -                  |
| `JWT_SECRET`            | JWT signing key            | Yes      | -                  |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name      | Yes      | -                  |
| `CLOUDINARY_API_KEY`    | Cloudinary API key         | Yes      | -                  |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret      | Yes      | -                  |
| `GOOGLE_CLIENT_ID`      | Google OAuth client ID     | Yes      | -                  |
| `GOOGLE_CLIENT_SECRET`  | Google OAuth client secret | Yes      | -                  |
| `GOOGLE_REDIRECT_URI`   | Google OAuth redirect URI  | Yes      | -                  |
| `GOOGLE_API_KEY`        | Google Gemini API key      | Yes      | -                  |
| `EMAIL_USER`            | Email sender address       | No       | -                  |
| `EMAIL_PASSWORD`        | Email app password         | No       | -                  |
| `RESEND_API_KEY`        | Resend API key             | No       | -                  |

### Frontend Environment Variables

| Variable          | Description          | Required | Default |
| ----------------- | -------------------- | -------- | ------- |
| `VITE_API_URL`    | Backend API URL      | Yes      | -       |
| `VITE_SOCKET_URL` | Socket.IO server URL | Yes      | -       |

---

## 📚 API Documentation

### Interactive Documentation

The API documentation is available via Swagger UI when the backend server is running:

**Development:** `http://localhost:3000/restaurant/api/v1/docs`

**Production:** `https://restaurant-website-s8zb.onrender.com/restaurant/api/v1/docs`

### API Endpoints Overview

#### Authentication & Users

- `POST /users/register` - User registration
- `POST /users/login` - User login
- `POST /users/logout` - User logout
- `POST /users/forgot-password` - Request password reset
- `POST /users/verify-otp` - Verify OTP code
- `POST /users/reset-password` - Reset password
- `GET /users/auth/google` - Google OAuth login
- `GET /users/auth/google/callback` - Google OAuth callback
- `GET /users/profile` - Get user profile
- `PATCH /users/profile` - Update user profile
- `GET /users` - Get all users (Admin)

#### Dishes

- `GET /dishes` - Get all dishes (with filters)
- `GET /dishes/:id` - Get dish details
- `POST /dishes` - Create dish (Admin)
- `PATCH /dishes/:id` - Update dish (Admin)
- `DELETE /dishes/:id` - Delete dish (Admin)

#### Categories

- `GET /categories` - Get all categories
- `GET /categories/:id` - Get category details
- `POST /categories` - Create category (Admin)
- `PATCH /categories/:id` - Update category (Admin)
- `DELETE /categories/:id` - Delete category (Admin)

#### Cart

- `GET /carts` - Get user cart
- `POST /carts` - Add item to cart
- `PATCH /carts/:id` - Update cart item
- `DELETE /carts/:id` - Remove cart item
- `DELETE /carts` - Clear cart

#### Orders

- `GET /orders` - Get all orders (Admin) or user orders
- `GET /orders/:id` - Get order details
- `POST /orders` - Create order
- `PATCH /orders/:id/status` - Update order status (Admin)
- `DELETE /orders/:id` - Cancel order

#### Tables

- `GET /tables` - Get all tables
- `GET /tables/:id` - Get table details
- `POST /tables` - Create table (Admin)
- `PATCH /tables/:id` - Update table (Admin)
- `DELETE /tables/:id` - Delete table (Admin)
- `POST /tables/reserve` - Reserve table

#### Discounts

- `GET /discounts` - Get all discounts
- `GET /discounts/:code` - Validate discount code
- `POST /discounts` - Create discount (Admin)
- `PATCH /discounts/:id` - Update discount (Admin)
- `DELETE /discounts/:id` - Delete discount (Admin)

#### Blogs

- `GET /blogs` - Get all blog posts
- `GET /blogs/:id` - Get blog post details
- `POST /blogs` - Create blog post (Admin)
- `PATCH /blogs/:id` - Update blog post (Admin)
- `DELETE /blogs/:id` - Delete blog post (Admin)

#### Contacts

- `GET /contacts` - Get all contacts (Admin)
- `GET /contacts/:id` - Get contact details (Admin)
- `POST /contacts` - Submit contact form
- `PATCH /contacts/:id` - Update contact status (Admin)
- `DELETE /contacts/:id` - Delete contact (Admin)

### Real-time Events (Socket.IO)

#### Client → Server

- `join_admin_room` - Join admin room for notifications
- `leave_admin_room` - Leave admin room

#### Server → Client

- `new_order` - New order notification (to admin)
- `order_status_update` - Order status changed
- `connect` - Client connected
- `disconnect` - Client disconnected

---

## 💻 Usage

### For Customers

1. **Browse Menu**

   - Visit the homepage
   - Navigate to Menu section
   - Filter by categories, price, or search

2. **Order Food**

   - Add dishes to cart
   - Apply discount codes
   - Proceed to checkout
   - Complete payment

3. **Book a Table**

   - Go to Booking page
   - Select date, time, and number of guests
   - Choose available table
   - Confirm reservation

4. **Track Orders**
   - View order history in Profile
   - Check real-time order status
   - Receive email notifications

### For Administrators

1. **Access Admin Panel**

   - Navigate to `/admin/login`
   - Login with admin credentials

2. **Dashboard**

   - View statistics and analytics
   - Monitor real-time orders
   - Track revenue and performance

3. **Manage Products**

   - Add/Edit/Delete dishes
   - Upload product images
   - Organize categories
   - Set prices and availability

4. **Process Orders**

   - View incoming orders (real-time)
   - Update order status
   - Manage order fulfillment
   - Generate reports

5. **Manage Discounts**

   - Create promotional codes
   - Set validity periods
   - Track usage statistics

6. **Content Management**
   - Create blog posts
   - Handle customer contacts
   - Update restaurant information

---

## 🔧 Development

### Code Quality

```bash
# Lint code
npm run lint

# Fix linting issues
npm run lint:fix

# Format code with Prettier
npm run prettier:fix
```

### Testing

```bash
# Run tests
npm test

# Run tests with coverage
npm run test:coverage
```

### Building

```bash
# Build frontend
cd "VietNam Restaurant Website"
npm run build

# Build backend
cd ../backend
npm run build
```

---

## 🚢 Deployment

### Frontend (Vercel)

The frontend is configured for Vercel deployment with `vercel.json`:

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

### Backend (Render/Railway)

The backend can be deployed to Render, Railway, or any Node.js hosting:

1. Set environment variables
2. Deploy from Git repository
3. Backend will auto-build and start

### Environment-specific Configuration

- **Development:** Uses local MongoDB and services
- **Production:** Uses cloud services (MongoDB Atlas, Cloudinary)

---

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. **Fork the repository**
2. **Create a feature branch**
   ```bash
   git checkout -b feature/amazing-feature
   ```
3. **Commit your changes**
   ```bash
   git commit -m 'Add some amazing feature'
   ```
4. **Push to the branch**
   ```bash
   git push origin feature/amazing-feature
   ```
5. **Open a Pull Request**

### Coding Standards

- Follow TypeScript best practices
- Use ESLint and Prettier configurations
- Write meaningful commit messages
- Add comments for complex logic
- Update documentation as needed

---

## 📝 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

---

## 👨‍💻 Author

**Nguyen Quang Thanh**

- GitHub: [@quangthanhng](https://github.com/quangthanhng)
- Email: support@restaurant.com

---

## 🙏 Acknowledgments

- React team for the amazing framework
- Tailwind CSS for the utility-first CSS
- MongoDB team for the flexible database
- Cloudinary for image management
- Google for OAuth and Gemini AI
- All contributors and supporters

---

## 📞 Support

If you have any questions or need help, please:

1. Check the [API Documentation](#-api-documentation)
2. Review existing [Issues](https://github.com/quangthanhng/Restaurant_Website_23521453/issues)
3. Create a new issue if needed
4. Contact us via the contact form

---

<div align="center">

**⭐ Star this repository if you find it helpful!**

Made with ❤️ by [Nguyen Quang Thanh](https://github.com/quangthanhng)

</div>
