'use client'

import { Users, UserCheck, UserX, Clock } from 'lucide-react'

interface StatsCardsProps {
  subscribers: any[]
}

export default function StatsCards({ subscribers }: StatsCardsProps) {
  const activeSubscribers = subscribers.filter(s => s.isActive && new Date(s.subscriptionEnd) > new Date())
  const expiredSubscribers = subscribers.filter(s => !s.isActive || new Date(s.subscriptionEnd) <= new Date())
  const expiringToday = subscribers.filter(s => {
    const end = new Date(s.subscriptionEnd)
    const today = new Date()
    return end.toDateString() === today.toDateString()
  })

  const stats = [
    {
      title: 'إجمالي المشتركين',
      value: subscribers.length,
      icon: Users,
      color: 'bg-blue-500'
    },
    {
      title: 'المشتركون النشطون',
      value: activeSubscribers.length,
      icon: UserCheck,
      color: 'bg-green-500'
    },
    {
      title: 'الاشتراكات المنتهية',
      value: expiredSubscribers.length,
      icon: UserX,
      color: 'bg-red-500'
    },
    {
      title: 'ينتهي اليوم',
      value: expiringToday.length,
      icon: Clock,
      color: 'bg-yellow-500'
    }
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat, index) => (
        <div key={index} className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className={`${stat.color} rounded-lg p-3 text-white`}>
              <stat.icon className="h-6 w-6" />
            </div>
            <div className="mr-4">
              <p className="text-sm text-gray-600">{stat.title}</p>
              <p className="text-2xl font-semibold text-gray-900">{stat.value}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}   