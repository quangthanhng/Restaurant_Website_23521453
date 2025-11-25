# 📚 Hướng Dẫn React Query và AppProvider (Context API)

> Tài liệu giải thích chi tiết về cách sử dụng **React Query** và **AppProvider** trong dự án TS Restaurant Website.

---

## 📖 Mục Lục

1. [Tổng Quan](#1-tổng-quan)
2. [React Query (@tanstack/react-query)](#2-react-query-tanstackreact-query)
3. [AppProvider (React Context API)](#3-appprovider-react-context-api)
4. [So Sánh Hai Công Cụ](#4-so-sánh-hai-công-cụ)
5. [Cách Sử Dụng Trong Dự Án](#5-cách-sử-dụng-trong-dự-án)

---

## 1. Tổng Quan

Trong dự án này, chúng ta sử dụng hai công cụ chính để quản lý state:

| Công cụ         | Vai trò                           | Loại State   |
| --------------- | --------------------------------- | ------------ |
| **React Query** | Quản lý dữ liệu từ API            | Server State |
| **AppProvider** | Quản lý trạng thái authentication | Client State |

### 🏗️ Kiến Trúc Tổng Thể

```
┌─────────────────────────────────────────────────────────────┐
│                        main.tsx                             │
│  ┌───────────────────────────────────────────────────────┐ │
│  │                   BrowserRouter                        │ │
│  │  ┌─────────────────────────────────────────────────┐  │ │
│  │  │            QueryClientProvider                   │  │ │
│  │  │  ┌───────────────────────────────────────────┐  │  │ │
│  │  │  │              AppProvider                   │  │  │ │
│  │  │  │  ┌─────────────────────────────────────┐  │  │  │ │
│  │  │  │  │              <App />                 │  │  │  │ │
│  │  │  │  │   (Tất cả components của ứng dụng)  │  │  │  │ │
│  │  │  │  └─────────────────────────────────────┘  │  │  │ │
│  │  │  └───────────────────────────────────────────┘  │  │ │
│  │  └─────────────────────────────────────────────────┘  │ │
│  └───────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

---

## 2. React Query (@tanstack/react-query)

### 2.1. React Query là gì?

**React Query** là một thư viện mạnh mẽ để quản lý **server state** - tức là dữ liệu được lấy từ API backend. Nó giúp đơn giản hóa việc:

- Fetching data (lấy dữ liệu)
- Caching (lưu cache)
- Synchronizing (đồng bộ hóa)
- Updating server state (cập nhật dữ liệu)

### 2.2. Cấu Hình Trong Dự Án

**File:** `src/main.tsx`

```tsx
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,  // Không tự động gọi lại API khi focus tab
      retry: 0                       // Không retry khi API lỗi
    }
  }
})

// Wrap toàn bộ app
<QueryClientProvider client={queryClient}>
  <App />
</QueryClientProvider>
```

### 2.3. Các Tính Năng Chính

| Tính năng                    | Mô tả                                                |
| ---------------------------- | ---------------------------------------------------- |
| **🗄️ Auto Caching**          | Tự động cache dữ liệu, tránh gọi API không cần thiết |
| **🔄 Background Refetching** | Tự động cập nhật dữ liệu ở background                |
| **⏳ Loading States**        | Tự động quản lý `isPending`, `isLoading`             |
| **❌ Error Handling**        | Tự động quản lý `isError`, `error`                   |
| **✅ Success States**        | Tự động quản lý `isSuccess`, `data`                  |
| **🔁 Retry Logic**           | Tự động retry khi request fail                       |
| **📡 Mutations**             | Xử lý POST, PUT, DELETE requests                     |

### 2.4. Hai Hook Chính

#### 📥 `useQuery` - Dùng cho GET requests

```tsx
import { useQuery } from '@tanstack/react-query'

// Ví dụ: Lấy danh sách món ăn
const { data, isPending, isError, error } = useQuery({
  queryKey: ['menu'], // Key unique để cache
  queryFn: () => menuApi.getAll() // Hàm gọi API
})

// Sử dụng
if (isPending) return <Loading />
if (isError) return <Error message={error.message} />
return <MenuList items={data} />
```

#### 📤 `useMutation` - Dùng cho POST/PUT/DELETE requests

```tsx
import { useMutation } from '@tanstack/react-query'

// Ví dụ trong Login.tsx
const loginMutation = useMutation({
  mutationFn: (body: LoginFormData) => authApi.login(body)
})

// Sử dụng
const handleLogin = (data: LoginFormData) => {
  loginMutation.mutate(data, {
    onSuccess: (response) => {
      // Xử lý khi thành công
      console.log('Login success:', response)
    },
    onError: (error) => {
      // Xử lý khi lỗi
      console.log('Login failed:', error)
    }
  })
}

// Trạng thái
loginMutation.isPending // true khi đang gọi API
loginMutation.isError // true khi có lỗi
loginMutation.isSuccess // true khi thành công
loginMutation.data // Dữ liệu trả về khi thành công
loginMutation.error // Thông tin lỗi khi fail
```

### 2.5. Ví Dụ Thực Tế Trong Dự Án

**File:** `src/pages/Login/Login.tsx`

```tsx
import { useMutation } from '@tanstack/react-query'
import authApi from '../../apis/auth.api'

export default function Login() {
  // Khởi tạo mutation
  const loginMutation = useMutation({
    mutationFn: (body: LoginFormData) => authApi.login(body)
  })

  // Handler submit form
  const onSubmit = handleSubmit((data) => {
    loginMutation.mutate(data, {
      onSuccess: (res) => {
        const responseData = res.data
        if (responseData.code === 200 && responseData.data) {
          // Đăng nhập thành công
          setIsAuthenticated(true)
          setProfile(responseData.data.user)
          navigate(path.home)
        }
      },
      onError: (error) => {
        // Xử lý lỗi đăng nhập
        if (error instanceof AxiosError) {
          setError('email', {
            type: 'server',
            message: 'Email hoặc mật khẩu không đúng'
          })
        }
      }
    })
  })

  return (
    <form onSubmit={onSubmit}>
      {/* Form fields */}

      <button disabled={loginMutation.isPending}>{loginMutation.isPending ? 'Đang xử lý...' : 'Đăng Nhập'}</button>
    </form>
  )
}
```

---

## 3. AppProvider (React Context API)

### 3.1. AppProvider là gì?

**AppProvider** là một component wrapper sử dụng **React Context API** để quản lý **global state** cho authentication. Nó cho phép chia sẻ trạng thái đăng nhập và thông tin user trên toàn bộ ứng dụng mà không cần prop drilling.

### 3.2. Cấu Trúc Code

**File:** `src/contexts/app.context.tsx`

```tsx
import { createContext, useState, type ReactNode } from 'react'
import type { User } from '../types/user.type'
import { getAccessTokenFromLS, getProfileFromLS } from '../utils/auth'

// 1. Định nghĩa Interface cho Context
interface AppContextType {
  isAuthenticated: boolean
  setIsAuthenticated: React.Dispatch<React.SetStateAction<boolean>>
  profile: User | null
  setProfile: React.Dispatch<React.SetStateAction<User | null>>
  reset: () => void
}

// 2. Giá trị khởi tạo (lấy từ localStorage nếu có)
const initialAppContext: AppContextType = {
  isAuthenticated: Boolean(getAccessTokenFromLS()),
  setIsAuthenticated: () => null,
  profile: getProfileFromLS(),
  setProfile: () => null,
  reset: () => null
}

// 3. Tạo Context
export const AppContext = createContext<AppContextType>(initialAppContext)

// 4. Tạo Provider Component
export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(initialAppContext.isAuthenticated)
  const [profile, setProfile] = useState<User | null>(initialAppContext.profile)

  // Hàm reset khi logout
  const reset = () => {
    setIsAuthenticated(false)
    setProfile(null)
  }

  return (
    <AppContext.Provider
      value={{
        isAuthenticated,
        setIsAuthenticated,
        profile,
        setProfile,
        reset
      }}
    >
      {children}
    </AppContext.Provider>
  )
}
```

### 3.3. Các Thành Phần Của AppContext

| Tên                  | Kiểu           | Mô tả                                  |
| -------------------- | -------------- | -------------------------------------- |
| `isAuthenticated`    | `boolean`      | Trạng thái đăng nhập (true/false)      |
| `setIsAuthenticated` | `function`     | Hàm cập nhật trạng thái đăng nhập      |
| `profile`            | `User \| null` | Thông tin user đang đăng nhập          |
| `setProfile`         | `function`     | Hàm cập nhật thông tin user            |
| `reset`              | `function`     | Hàm reset về trạng thái chưa đăng nhập |

### 3.4. Cách Sử Dụng

#### 📌 Bước 1: Import và sử dụng `useContext`

```tsx
import { useContext } from 'react'
import { AppContext } from '../contexts/app.context'

function MyComponent() {
  const { isAuthenticated, profile, setIsAuthenticated, setProfile, reset } = useContext(AppContext)

  // Sử dụng...
}
```

#### 📌 Bước 2: Đọc trạng thái

```tsx
function Header() {
  const { isAuthenticated, profile } = useContext(AppContext)

  return <nav>{isAuthenticated ? <span>Xin chào, {profile?.name}</span> : <Link to='/login'>Đăng nhập</Link>}</nav>
}
```

#### 📌 Bước 3: Cập nhật trạng thái (Login)

```tsx
function Login() {
  const { setIsAuthenticated, setProfile } = useContext(AppContext)

  const handleLoginSuccess = (userData: User) => {
    setIsAuthenticated(true)
    setProfile(userData)
  }
}
```

#### 📌 Bước 4: Reset trạng thái (Logout)

```tsx
function LogoutButton() {
  const { reset } = useContext(AppContext)

  const handleLogout = () => {
    // Clear localStorage
    clearLS()
    // Reset context state
    reset()
    // Redirect
    navigate('/login')
  }

  return <button onClick={handleLogout}>Đăng xuất</button>
}
```

### 3.5. Flow Hoạt Động

```
┌─────────────────────────────────────────────────────────────────┐
│                         APP KHỞI ĐỘNG                           │
│                              │                                  │
│                              ▼                                  │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │  AppProvider khởi tạo state từ localStorage:               │ │
│  │  - isAuthenticated = Boolean(getAccessTokenFromLS())       │ │
│  │  - profile = getProfileFromLS()                            │ │
│  └───────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────┐
│                        USER ĐĂNG NHẬP                           │
│                              │                                  │
│                              ▼                                  │
│  1. User nhập email/password                                    │
│  2. Gọi API login qua useMutation                               │
│  3. API trả về success với user data + token                    │
│  4. Lưu token vào localStorage                                  │
│  5. setIsAuthenticated(true)                                    │
│  6. setProfile(userData)                                        │
│  7. Tất cả components đọc isAuthenticated sẽ re-render          │
└─────────────────────────────────────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────┐
│                        USER ĐĂNG XUẤT                           │
│                              │                                  │
│                              ▼                                  │
│  1. User click Logout                                           │
│  2. clearLS() - xóa token và profile khỏi localStorage          │
│  3. reset() - setIsAuthenticated(false), setProfile(null)       │
│  4. Tất cả components sẽ re-render với trạng thái chưa login    │
└─────────────────────────────────────────────────────────────────┘
```

---

## 4. So Sánh Hai Công Cụ

| Tiêu chí            | React Query               | AppProvider (Context)           |
| ------------------- | ------------------------- | ------------------------------- |
| **Mục đích**        | Quản lý dữ liệu từ server | Chia sẻ state giữa components   |
| **Loại state**      | Server state (API data)   | Client state (auth state)       |
| **Nguồn dữ liệu**   | Từ API backend            | Từ localStorage/memory          |
| **Caching**         | ✅ Tự động caching        | ❌ Không có caching             |
| **Loading states**  | ✅ Tự động (`isPending`)  | ❌ Phải tự implement            |
| **Error handling**  | ✅ Tự động (`isError`)    | ❌ Phải tự implement            |
| **Background sync** | ✅ Có                     | ❌ Không                        |
| **DevTools**        | ✅ React Query DevTools   | ❌ React DevTools               |
| **Dùng cho**        | API calls, data fetching  | Authentication, theme, language |

### 🤔 Khi nào dùng gì?

```
📡 Dữ liệu từ API (menu, orders, users list...)
   → Dùng React Query (useQuery, useMutation)

🔐 Trạng thái authentication (login status, user info)
   → Dùng AppContext

🎨 Theme, ngôn ngữ, settings
   → Dùng Context API (tương tự AppContext)

🛒 Shopping cart (có thể)
   → Dùng Context API hoặc Zustand/Redux
```

---

## 5. Cách Sử Dụng Trong Dự Án

### 5.1. Setup Đầy Đủ (main.tsx)

```tsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AppProvider } from './contexts/app.context'

// Cấu hình React Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 0
    }
  }
})

// Render app với đầy đủ providers
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <AppProvider>
          <App />
        </AppProvider>
      </QueryClientProvider>
    </BrowserRouter>
  </StrictMode>
)
```

### 5.2. Ví Dụ Component Hoàn Chỉnh

```tsx
import { useContext } from 'react'
import { useQuery, useMutation } from '@tanstack/react-query'
import { AppContext } from '../contexts/app.context'
import menuApi from '../apis/menu.api'

function MenuPage() {
  // Lấy auth state từ Context
  const { isAuthenticated, profile } = useContext(AppContext)

  // Lấy data từ API với React Query
  const {
    data: menuItems,
    isPending,
    isError
  } = useQuery({
    queryKey: ['menu'],
    queryFn: () => menuApi.getAll()
  })

  // Mutation cho việc đặt món
  const orderMutation = useMutation({
    mutationFn: (itemId: string) => orderApi.create({ itemId, userId: profile?.id })
  })

  if (isPending) return <div>Đang tải menu...</div>
  if (isError) return <div>Có lỗi xảy ra!</div>

  return (
    <div>
      <h1>Menu</h1>
      {menuItems.map((item) => (
        <div key={item.id}>
          <span>{item.name}</span>
          {isAuthenticated && (
            <button onClick={() => orderMutation.mutate(item.id)} disabled={orderMutation.isPending}>
              {orderMutation.isPending ? 'Đang đặt...' : 'Đặt món'}
            </button>
          )}
        </div>
      ))}
    </div>
  )
}
```

---

## 📚 Tài Liệu Tham Khảo

- [TanStack Query Documentation](https://tanstack.com/query/latest)
- [React Context API](https://react.dev/learn/passing-data-deeply-with-context)
- [React Hooks](https://react.dev/reference/react)

---

> 📝 **Tác giả:** TS Restaurant Development Team  
> 📅 **Cập nhật:** November 2025
