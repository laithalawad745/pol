'use client'

import { useState } from 'react'
import { format } from 'date-fns'
import { ar } from 'date-fns/locale'
import { Trash2, Edit, Clock, CheckCircle, XCircle, RefreshCw } from 'lucide-react'

interface Subscriber {
  id: string
  telegramId: string
  telegramUsername?: string
  firstName?: string
  lastName?: string
  subscriptionStart: string
  subscriptionEnd: string
  isActive: boolean
  createdAt: string
}

interface SubscribersListProps {
  subscribers: Subscriber[]
  onDelete: (id: string) => void
  onUpdate: (id: string, data: any) => void
}

export default function SubscribersList({ subscribers, onDelete, onUpdate }: SubscribersListProps) {
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editData, setEditData] = useState({
    durationType: 'days',
    durationValue: 30
  })

  const handleRenew = (subscriber: Subscriber) => {
    setEditingId(subscriber.id)
  }

  const handleSaveRenewal = (id: string) => {
    onUpdate(id, editData)
    setEditingId(null)
    setEditData({ durationType: 'days', durationValue: 30 })
  }

  const getStatusColor = (subscriber: Subscriber) => {
    if (!subscriber.isActive) return 'text-red-600 bg-red-50'
    const endDate = new Date(subscriber.subscriptionEnd)
    const now = new Date()
    const daysLeft = Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    
    if (daysLeft <= 0) return 'text-red-600 bg-red-50'
    if (daysLeft <= 3) return 'text-yellow-600 bg-yellow-50'
    return 'text-green-600 bg-green-50'
  }

  const getTimeRemaining = (endDate: string) => {
    const end = new Date(endDate)
    const now = new Date()
    const diff = end.getTime() - now.getTime()
    
    if (diff <= 0) return 'منتهي'
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
    
    if (days > 0) return `${days} يوم`
    if (hours > 0) return `${hours} ساعة`
    return `${minutes} دقيقة`
  }

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="px-6 py-4 border-b">
        <h3 className="text-lg font-semibold">قائمة المشتركين</h3>
      </div>
      
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                المشترك
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                معرف التلغرام
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                بداية الاشتراك
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                نهاية الاشتراك
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                المتبقي
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                الحالة
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                الإجراءات
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {subscribers.map((subscriber) => (
              <tr key={subscriber.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div>
                    <div className="text-sm font-medium text-gray-900">
                      {subscriber.firstName} {subscriber.lastName}
                    </div>
                    {subscriber.telegramUsername && (
                      <div className="text-sm text-gray-500">
                        {subscriber.telegramUsername}
                      </div>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {subscriber.telegramId}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {format(new Date(subscriber.subscriptionStart), 'dd/MM/yyyy HH:mm', { locale: ar })}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {format(new Date(subscriber.subscriptionEnd), 'dd/MM/yyyy HH:mm', { locale: ar })}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center text-sm">
                    <Clock className="h-4 w-4 ml-1" />
                    {getTimeRemaining(subscriber.subscriptionEnd)}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(subscriber)}`}>
                    {subscriber.isActive ? (
                      <>
                        <CheckCircle className="h-3 w-3 ml-1" />
                        نشط
                      </>
                    ) : (
                      <>
                        <XCircle className="h-3 w-3 ml-1" />
                        غير نشط
                      </>
                    )}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  {editingId === subscriber.id ? (
                    <div className="flex items-center gap-2">
                      <select
                        className="px-2 py-1 border rounded text-xs"
                        value={editData.durationType}
                        onChange={(e) => setEditData({ ...editData, durationType: e.target.value })}
                      >
                        <option value="minutes">دقائق</option>
                        <option value="hours">ساعات</option>
                        <option value="days">أيام</option>
                      </select>
                      <input
                        type="number"
                        min="1"
                        className="w-16 px-2 py-1 border rounded text-xs"
                        value={editData.durationValue}
                        onChange={(e) => setEditData({ ...editData, durationValue: parseInt(e.target.value) })}
                      />
                      <button
                        onClick={() => handleSaveRenewal(subscriber.id)}
                        className="text-green-600 hover:text-green-900"
                      >
                        حفظ
                      </button>
                      <button
                        onClick={() => setEditingId(null)}
                        className="text-gray-600 hover:text-gray-900"
                      >
                        إلغاء
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleRenew(subscriber)}
                        className="text-indigo-600 hover:text-indigo-900"
                        title="تجديد"
                      >
                        <RefreshCw className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => onDelete(subscriber.id)}
                        className="text-red-600 hover:text-red-900"
                        title="حذف"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {subscribers.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            لا يوجد مشتركون حالياً
          </div>
        )}
      </div>
    </div>
  )
}