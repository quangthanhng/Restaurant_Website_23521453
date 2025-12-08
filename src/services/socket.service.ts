import { io, Socket } from 'socket.io-client'

// Notification sound URL (tiếng chuông)
const NOTIFICATION_SOUND_URL = 'https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3'

// Socket server URL - lấy từ env hoặc mặc định (backend API port)
const SOCKET_SERVER_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:3001'

interface OrderNotification {
  type: string
  message: string
  data: {
    _id: string
    orderId?: string
    userId?: {
      _id: string
      username: string
      email: string
      phoneNumber?: string
    }
    tableId?: {
      _id: string
      tableNumber: number
      position: string
    }
    cartId?: {
      _id: string
      items: Array<{
        dishId: {
          _id: string
          name: string
          price: number
          image?: string
        }
        quantity: number
        price: number
      }>
    }
    totalPrice: number
    status: string
    deliveryOptions: string
    typeOfPayment?: string
    deleveryAddress?: string
    createdAt: string
  }
  timestamp: string
}

class SocketService {
  private socket: Socket | null = null
  private audio: HTMLAudioElement | null = null
  private listeners: Map<string, ((data: OrderNotification) => void)[]> = new Map()
  private isConnecting: boolean = false
  private hasJoinedAdminRoom: boolean = false

  constructor() {
    // Preload notification sound
    if (typeof window !== 'undefined') {
      this.audio = new Audio(NOTIFICATION_SOUND_URL)
      this.audio.volume = 0.7
    }
  }

  // Kết nối tới socket server
  connect(serverUrl: string = SOCKET_SERVER_URL): void {
    // Nếu đã kết nối hoặc đang kết nối thì bỏ qua
    if (this.socket?.connected || this.isConnecting) {
      console.log('Socket already connected or connecting')
      return
    }

    // Nếu có socket cũ đang disconnect, destroy nó
    if (this.socket) {
      this.socket.removeAllListeners()
      this.socket.disconnect()
      this.socket = null
    }

    this.isConnecting = true

    this.socket = io(serverUrl, {
      transports: ['websocket', 'polling'], // Ưu tiên websocket trước
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 2000,
      timeout: 20000,
      forceNew: false,
      autoConnect: true,
      withCredentials: false // Backend dùng origin: "*" nên không cần credentials
    })

    this.socket.on('connect', () => {
      console.log('🔌 Socket connected:', this.socket?.id)
      this.isConnecting = false
      // Auto join admin room khi reconnect
      if (this.hasJoinedAdminRoom) {
        this.socket?.emit('admin:join')
        console.log('👤 Re-joined admin room after reconnect')
      }
    })

    this.socket.on('disconnect', (reason) => {
      console.log('❌ Socket disconnected:', reason)
    })

    this.socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error.message)
      this.isConnecting = false
    })

    // Listen for new order notifications
    this.socket.on('order:new', (data: OrderNotification) => {
      console.log('📦 New order received:', data)
      this.notifyListeners('order:new', data)
    })

    // Listen for payment success notifications
    this.socket.on('payment:success', (data: OrderNotification) => {
      console.log('💰 Payment success:', data)
      this.notifyListeners('payment:success', data)
    })

    // Listen for order status updates
    this.socket.on('order:statusUpdate', (data: OrderNotification) => {
      console.log('🔄 Order status update:', data)
      this.notifyListeners('order:statusUpdate', data)
    })
  }

  // Tham gia admin room để nhận thông báo
  joinAdminRoom(): void {
    this.hasJoinedAdminRoom = true
    if (this.socket?.connected) {
      this.socket.emit('admin:join')
      console.log('👤 Joined admin room')
    } else {
      console.log('⏳ Will join admin room when connected...')
      // Đợi socket connect rồi mới join
      this.socket?.once('connect', () => {
        if (this.hasJoinedAdminRoom) {
          this.socket?.emit('admin:join')
          console.log('👤 Joined admin room after connect')
        }
      })
    }
  }

  // Rời admin room
  leaveAdminRoom(): void {
    this.hasJoinedAdminRoom = false
    if (this.socket?.connected) {
      this.socket.emit('admin:leave')
      console.log('👤 Left admin room')
    }
  }

  // Ngắt kết nối - KHÔNG disconnect socket, chỉ leave room
  disconnect(): void {
    this.leaveAdminRoom()
    // Không disconnect socket để tránh tạo lại connection
    // this.socket?.disconnect()
    // this.socket = null
    console.log('Socket service cleanup (keeping connection)')
    console.log('Socket disconnected')
  }

  // Phát tiếng chuông thông báo
  playNotificationSound(duration: number = 5000): void {
    if (this.audio) {
      this.audio.currentTime = 0
      this.audio.play().catch((err) => console.log('Cannot play audio:', err))

      // Dừng sau duration ms
      setTimeout(() => {
        if (this.audio) {
          this.audio.pause()
          this.audio.currentTime = 0
        }
      }, duration)
    }
  }

  // Dừng tiếng chuông
  stopNotificationSound(): void {
    if (this.audio) {
      this.audio.pause()
      this.audio.currentTime = 0
    }
  }

  // Đăng ký listener
  on(event: string, callback: (data: OrderNotification) => void): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, [])
    }
    this.listeners.get(event)!.push(callback)
  }

  // Hủy listener
  off(event: string, callback: (data: OrderNotification) => void): void {
    const eventListeners = this.listeners.get(event)
    if (eventListeners) {
      const index = eventListeners.indexOf(callback)
      if (index > -1) {
        eventListeners.splice(index, 1)
      }
    }
  }

  // Thông báo listeners
  private notifyListeners(event: string, data: OrderNotification): void {
    const eventListeners = this.listeners.get(event)
    if (eventListeners) {
      eventListeners.forEach((callback) => callback(data))
    }
  }

  // Kiểm tra trạng thái kết nối
  isConnected(): boolean {
    return this.socket?.connected || false
  }
}

// Export singleton instance
const socketService = new SocketService()
export default socketService

export type { OrderNotification }
