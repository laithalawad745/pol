'use client'

import { useState } from 'react'
import { X } from 'lucide-react'

interface AddSubscriberFormProps {
  onSubmit: (data: any) => void
  onCancel: () => void
}

export default function AddSubscriberForm({ onSubmit, onCancel }: AddSubscriberFormProps) {
  const [formData, setFormData] = useState({
    telegramId: '',
    telegramUsername: '',
    firstName: '',
    lastName: '',
    durationType: 'days',
    durationValue: 30
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">إضافة مشترك جديد</h3>
        <button onClick={onCancel} className="text-gray-500 hover:text-gray-700">
          <X className="h-5 w-5" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            معرف التلغرام (ID) *
          </label>
          <input
            type="text"
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            value={formData.telegramId}
            onChange={(e) => setFormData({ ...formData, telegramId: e.target.value })}
            placeholder="123456789"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            اسم المستخدم
          </label>
          <input
            type="text"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            value={formData.telegramUsername}
            onChange={(e) => setFormData({ ...formData, telegramUsername: e.target.value })}
            placeholder="@username"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            الاسم الأول
          </label>
          <input
            type="text"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            value={formData.firstName}
            onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            الاسم الأخير
          </label>
          <input
            type="text"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            value={formData.lastName}
            onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            نوع المدة
          </label>
          <select
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            value={formData.durationType}
            onChange={(e) => setFormData({ ...formData, durationType: e.target.value })}
          >
            <option value="minutes">دقائق</option>
            <option value="hours">ساعات</option>
            <option value="days">أيام</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            المدة
          </label>
          <input
            type="number"
            min="1"
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            value={formData.durationValue}
            onChange={(e) => setFormData({ ...formData, durationValue: parseInt(e.target.value) })}
          />
        </div>

        <div className="md:col-span-2 flex justify-end gap-2 mt-4">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
          >
            إلغاء
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
          >
            إضافة المشترك
          </button>
        </div>
      </form>
    </div>
  )
}