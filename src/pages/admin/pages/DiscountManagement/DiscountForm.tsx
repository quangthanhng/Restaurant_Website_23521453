import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import * as discountApi from '../../../../apis/discount.api'
import type { Discount } from '../../../../types/discount.type'
import { useToast } from '../../../../components/Toast'
import dayjs from 'dayjs'

interface Props {
    discount: Discount | null
    onClose: () => void
}

type ErrorResponse = { response?: { data?: { message?: string } } }

export default function DiscountForm({ discount, onClose }: Props) {
    const queryClient = useQueryClient()
    const toast = useToast()
    const [form, setForm] = useState({
        code: discount?.code || '',
        description: discount?.description || '',
        percentage: discount?.percentage || 0,
        validFrom: discount ? dayjs(discount.validFrom).format('YYYY-MM-DD') : '',
        validTo: discount ? dayjs(discount.validTo).format('YYYY-MM-DD') : '',
        active: discount?.active ?? true
    })
    const [loading, setLoading] = useState(false)

    const mutation = useMutation<unknown, unknown, Partial<Discount>>({
        mutationFn: (data: Partial<Discount>) =>
            discount
                ? discountApi.editDiscount(discount._id, data)
                : discountApi.createDiscount(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-discounts'] })
            toast.success(discount ? 'Cập nhật thành công!' : 'Tạo mới thành công!')
            onClose()
        },
        onError: (err: unknown) => {
            let message = 'Lỗi';
            if (
                err &&
                typeof err === 'object' &&
                'response' in err &&
                (err as ErrorResponse).response?.data?.message
            ) {
                message = (err as ErrorResponse).response!.data!.message!
            }
            toast.error(message)
            setLoading(false)
        }
    })

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target
        let fieldValue: string | boolean = value
        if (type === 'checkbox' && 'checked' in e.target) {
            fieldValue = (e.target as HTMLInputElement).checked
        }
        setForm((prev) => ({
            ...prev,
            [name]: fieldValue
        }))
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        mutation.mutate({
            ...form,
            percentage: Number(form.percentage),
            validFrom: form.validFrom,
            validTo: form.validTo
        })
    }

    return (
        <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/40'>
            <form onSubmit={handleSubmit} className='bg-neutral-950 rounded-xl p-6 w-full max-w-md border border-neutral-800 shadow-xl space-y-4'>
                <h3 className='text-lg font-bold text-savoria-gold mb-2'>{discount ? 'Cập nhật' : 'Thêm'} mã giảm giá</h3>
                <div>
                    <label className='block text-xs text-neutral-400 mb-1'>Mã giảm giá *</label>
                    <input name='code' value={form.code} onChange={handleChange} required maxLength={50} className='w-full rounded-lg border border-neutral-700 bg-neutral-900 px-3 py-2 text-amber-50' />
                </div>
                <div>
                    <label className='block text-xs text-neutral-400 mb-1'>Mô tả</label>
                    <textarea name='description' value={form.description} onChange={handleChange} className='w-full rounded-lg border border-neutral-700 bg-neutral-900 px-3 py-2 text-amber-50' />
                </div>
                <div>
                    <label className='block text-xs text-neutral-400 mb-1'>Phần trăm giảm *</label>
                    <input name='percentage' type='number' min={0} max={100} value={form.percentage} onChange={handleChange} required className='w-full rounded-lg border border-neutral-700 bg-neutral-900 px-3 py-2 text-amber-50' />
                </div>
                <div className='flex gap-2'>
                    <div className='flex-1'>
                        <label className='block text-xs text-neutral-400 mb-1'>Từ ngày *</label>
                        <input name='validFrom' type='date' value={form.validFrom} onChange={handleChange} required className='w-full rounded-lg border border-neutral-700 bg-neutral-900 px-3 py-2 text-amber-50' />
                    </div>
                    <div className='flex-1'>
                        <label className='block text-xs text-neutral-400 mb-1'>Đến ngày *</label>
                        <input name='validTo' type='date' value={form.validTo} onChange={handleChange} required className='w-full rounded-lg border border-neutral-700 bg-neutral-900 px-3 py-2 text-amber-50' />
                    </div>
                </div>
                <div>
                    <label className='inline-flex items-center gap-2'>
                        <input type='checkbox' name='active' checked={form.active} onChange={handleChange} />
                        <span className='text-xs text-neutral-400'>Kích hoạt</span>
                    </label>
                </div>
                <div className='flex justify-end gap-2'>
                    <button type='button' onClick={onClose} className='px-4 py-2 rounded-lg border border-neutral-700 text-neutral-400'>Hủy</button>
                    <button type='submit' disabled={loading} className='px-4 py-2 rounded-lg bg-savoria-gold text-neutral-900 font-semibold hover:bg-amber-200'>{discount ? 'Cập nhật' : 'Tạo mới'}</button>
                </div>
            </form>
        </div>
    )
}
