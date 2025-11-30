import { useLocation, useNavigate } from 'react-router-dom'
import path from '../../constants/path'

export default function Payment() {
    const location = useLocation()
    const navigate = useNavigate()
    const bookingData = location.state

    if (!bookingData) {
        return (
            <div className='min-h-screen bg-neutral-950 pt-[74px]'>
                <div className='mx-auto max-w-4xl px-6 py-12 text-center'>
                    <h1 className='mb-4 text-2xl font-bold text-white'>Không tìm thấy thông tin đặt bàn</h1>
                    <button
                        onClick={() => navigate(path.booking)}
                        className='text-savoria-gold hover:underline'
                    >
                        Quay lại trang đặt bàn
                    </button>
                </div>
            </div>
        )
    }

    return (
        <div className='min-h-screen bg-neutral-950 pt-[74px]'>
            <div className='mx-auto max-w-4xl px-6 py-12'>
                <div className='rounded-2xl border border-neutral-800 bg-neutral-900/50 p-12'>
                    <h1 className='mb-8 font-serif text-4xl font-bold text-white text-center'>
                        Xác nhận thanh toán
                    </h1>

                    <div className='space-y-6 text-neutral-300'>
                        <div className='grid grid-cols-2 gap-4 border-b border-neutral-800 pb-6'>
                            <div>
                                <p className='text-sm text-neutral-500'>Khách hàng</p>
                                <p className='font-semibold text-white'>{bookingData.customerInfo.fullName}</p>
                                <p>{bookingData.customerInfo.phone}</p>
                                <p>{bookingData.customerInfo.email}</p>
                            </div>
                            <div className='text-right'>
                                <p className='text-sm text-neutral-500'>Thời gian</p>
                                <p className='font-semibold text-white'>{bookingData.bookingTime}</p>
                                <p className='text-savoria-gold'>Bàn: {bookingData.tableId}</p>
                            </div>
                        </div>

                        <div>
                            <p className='mb-4 text-sm text-neutral-500'>Món ăn đã chọn</p>
                            {bookingData.cartItems.map((item: any) => (
                                <div key={item.dish._id} className='flex justify-between py-2'>
                                    <span>{item.dish.name} x {item.quantity}</span>
                                    <span>{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(item.dish.finalPrice * item.quantity)}</span>
                                </div>
                            ))}
                        </div>

                        <div className='border-t border-neutral-800 pt-6'>
                            <div className='flex justify-between text-xl font-bold text-savoria-gold'>
                                <span>Tổng thanh toán</span>
                                <span>{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(bookingData.totalAmount)}</span>
                            </div>
                        </div>

                        <button className='mt-8 w-full rounded-xl bg-savoria-gold py-4 font-bold text-neutral-900 shadow-lg transition-all hover:scale-105'>
                            Thanh toán ngay
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}
