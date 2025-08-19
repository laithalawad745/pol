'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'react-toastify'
import { confirmToast } from '@/components/ConfirmToast'
// import { useLanguage } from '@/context/LanguageContext'
import { useLanguage, translations } from '@/context/LanguageContext'

import { 
  Users, UserPlus, UserCheck, UserX, LogOut, RefreshCw, 
  AlertCircle, Settings, Clock, Trash2, Search, Filter,
  Calendar, Ban, Timer, Shield, TrendingUp, Activity,
  Bell, Menu, X, Home, BarChart3, CreditCard, MessageSquare,
  ChevronRight, Moon, Sun, Zap, Award, Target, DollarSign,
  ArrowUp, ArrowDown, MoreVertical, Edit2, Eye, Globe
} from 'lucide-react'

// نوع المشترك
interface Subscriber {
  id: string
  telegramId: string
  telegramUsername?: string
  firstName?: string
  lastName?: string
  subscriptionStart: string
  subscriptionEnd: string
  isActive: boolean
  amount?: number
  createdAt: string
  inviteLinks?: any[]
  accessLogs?: any[]
}

export default function DashboardPage() {
  const router = useRouter()
  const { language, setLanguage, isRTL } = useLanguage()
const t = translations[language as 'en' | 'ar'].dashboard

  
  const [admin, setAdmin] = useState<any>(null)
  const [subscribers, setSubscribers] = useState<Subscriber[]>([])
  const [filteredSubscribers, setFilteredSubscribers] = useState<Subscriber[]>([])
  const [loading, setLoading] = useState(true)
  const [adminLoading, setAdminLoading] = useState(true)
  const [showAddForm, setShowAddForm] = useState(false)
  const [showExtendModal, setShowExtendModal] = useState(false)
  const [selectedSubscriber, setSelectedSubscriber] = useState<Subscriber | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [sortBy, setSortBy] = useState('createdAt')
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid')
  
  const [formData, setFormData] = useState({
    telegramId: '',
    telegramUsername: '',
    firstName: '',
    lastName: '',
    durationType: 'days',
    durationValue: 30
  })

  const [extendData, setExtendData] = useState({
    durationType: 'days',
    durationValue: 30
  })

  // حساب الإحصائيات
  const activeCount = subscribers.filter(s => s.isActive && new Date(s.subscriptionEnd) > new Date()).length
  const expiredCount = subscribers.filter(s => !s.isActive || new Date(s.subscriptionEnd) <= new Date()).length
  const waitingCount = subscribers.filter(s => {
    const hoursLeft = (new Date(s.subscriptionEnd).getTime() - new Date().getTime()) / (1000 * 60 * 60)
    return s.isActive && hoursLeft > 0 && hoursLeft <= 24
  }).length

  // حساب نسبة النمو (مثال)
  const growthRate = 12.5 // يمكنك حسابها من البيانات الفعلية
  const totalRevenue = subscribers.length * 30 // مثال
  const monthlyGrowth = 8.3

  useEffect(() => {
    fetchAdminData()
    fetchSubscribers()
    
    const handleFocus = () => {
      fetchAdminData()
      fetchSubscribers()
    }
    
    window.addEventListener('focus', handleFocus)
    return () => window.removeEventListener('focus', handleFocus)
  }, [])

  useEffect(() => {
    // تطبيق الفلترة والبحث
    let filtered = [...subscribers]
    
    // فلترة حسب الحالة
    const now = new Date()
    switch (filterStatus) {
      case 'active':
        filtered = filtered.filter(s => s.isActive && new Date(s.subscriptionEnd) > now)
        break
      case 'expired':
        filtered = filtered.filter(s => !s.isActive || new Date(s.subscriptionEnd) <= now)
        break
      case 'waiting':
        filtered = filtered.filter(s => {
          const hoursLeft = (new Date(s.subscriptionEnd).getTime() - now.getTime()) / (1000 * 60 * 60)
          return s.isActive && hoursLeft > 0 && hoursLeft <= 24
        })
        break
    }
    
    // البحث
    if (searchQuery) {
      filtered = filtered.filter(s => 
        s.telegramId.includes(searchQuery) ||
        s.telegramUsername?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.firstName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.lastName?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }
    
    // الترتيب
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'subscriptionEnd':
          return new Date(b.subscriptionEnd).getTime() - new Date(a.subscriptionEnd).getTime()
        case 'firstName':
          return (a.firstName || '').localeCompare(b.firstName || '')
        default:
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      }
    })
    
    setFilteredSubscribers(filtered)
  }, [subscribers, filterStatus, searchQuery, sortBy])

  const fetchAdminData = async () => {
    try {
      setAdminLoading(true)
      const response = await fetch('/api/auth/me')
      if (response.ok) {
        const data = await response.json()
        setAdmin(data)
      } else if (response.status === 401) {
        toast.error(t.toasts.sessionExpired, {
          theme: "dark",
          position: "top-right",
          rtl: isRTL,
          autoClose: 5000
        })
        router.push('/login')
      }
    } catch (error) {
      console.error('Error fetching admin data:', error)
      toast.error(`❌ ${t.toasts.loadingError}`, {
        theme: "dark",
        position: "top-right",
        rtl: isRTL,
        autoClose: 5000
      })
    } finally {
      setAdminLoading(false)
    }
  }

  const fetchSubscribers = async () => {
    try {
      const response = await fetch('/api/subscribers')
      if (response.ok) {
        const data = await response.json()
        setSubscribers(data)
      } else if (response.status === 401) {
        toast.error(t.toasts.sessionExpired, {
          theme: "dark",
          position: "top-right",
          rtl: isRTL,
          autoClose: 5000
        })
        router.push('/login')
      }
    } catch (error) {
      console.error('Error fetching subscribers:', error)
      toast.error(`❌ ${t.toasts.subscribersError}`, {
        theme: "dark",
        position: "top-right",
        rtl: isRTL,
        autoClose: 5000
      })
    } finally {
      setLoading(false)
    }
  }

  const refreshData = async () => {
    const loadingToast = toast.loading(t.toasts.updatingData, {
      theme: "dark",
      position: "top-right",
      rtl: isRTL
    })
    setLoading(true)
    
    try {
      await fetchAdminData()
      await fetchSubscribers()
      toast.dismiss(loadingToast)
      toast.success(`✅ ${t.toasts.dataUpdated}`, {
        theme: "dark",
        position: "top-right",
        rtl: isRTL,
        autoClose: 2000
      })
    } catch (error) {
      toast.dismiss(loadingToast)
      toast.error(`❌ ${t.toasts.updateFailed}`, {
        theme: "dark",
        position: "top-right",
        rtl: isRTL,
        autoClose: 5000
      })
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    const loadingToast = toast.loading(t.toasts.loggingOut, {
      theme: "dark",
      position: "top-right",
      rtl: isRTL
    })
    await fetch('/api/auth/logout', { method: 'POST' })
    toast.dismiss(loadingToast)
    toast.success(`✅ ${t.toasts.loggedOut}`, {
      theme: "dark",
      position: "top-right",
      rtl: isRTL,
      autoClose: 2000
    })
    setTimeout(() => router.push('/login'), 1500)
  }

  const handleAddSubscriber = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!admin?.channelId) {
      toast.error(`❌ ${t.toasts.channelNotSet}`, {
        theme: "dark",
        position: "top-right",
        rtl: isRTL,
        autoClose: 5000
      })
      router.push('/settings')
      return
    }
    
    const telegramId = formData.telegramId.trim()
    
    if (!/^\d+$/.test(telegramId)) {
      toast.error(`❌ ${t.toasts.invalidId}`, {
        theme: "dark",
        position: "top-right",
        rtl: isRTL,
        autoClose: 5000
      })
      return
    }
    
    const loadingToast = toast.loading(t.toasts.addingSubscriber, {
      theme: "dark",
      position: "top-right",
      rtl: isRTL
    })
    
    try {
      const response = await fetch('/api/subscribers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          telegramId: telegramId
        })
      })

      if (response.ok) {
        const result = await response.json()
        await fetchSubscribers()
        setShowAddForm(false)
        setFormData({
          telegramId: '',
          telegramUsername: '',
          firstName: '',
          lastName: '',
          durationType: 'days',
          durationValue: 30
        })
        
        toast.dismiss(loadingToast)
        
        if (result.notificationSent) {
          toast.info(`✅ ${t.toasts.subscriberRenewed}`, {
            theme: "dark",
            position: "top-right",
            rtl: isRTL,
            autoClose: 5000
          })
        } else if (result.inviteSent) {
          toast.success(`✅ ${t.toasts.subscriberAdded}`, {
            theme: "dark",
            position: "top-right",
            rtl: isRTL,
            autoClose: 5000
          })
        } else {
          toast.warning(`✅ ${t.toasts.subscriberAddedNoMessage}`, {
            theme: "dark",
            position: "top-right",
            rtl: isRTL,
            autoClose: 5000
          })
        }
      } else {
        const error = await response.json()
        toast.dismiss(loadingToast)
        toast.error(error.error || t.toasts.addFailed, {
          theme: "dark",
          position: "top-right",
          rtl: isRTL,
          autoClose: 5000
        })
      }
    } catch (error) {
      console.error('Error adding subscriber:', error)
      toast.dismiss(loadingToast)
      toast.error(`❌ ${t.toasts.addError}`, {
        theme: "dark",
        position: "top-right",
        rtl: isRTL,
        autoClose: 5000
      })
    }
  }

  const handleKickSubscriber = async (subscriber: Subscriber) => {
    confirmToast({
      message: `${t.toasts.kickConfirm} ${subscriber.firstName || subscriber.telegramId}؟`,
      subMessage: t.toasts.kickSubMessage,
      confirmText: t.toasts.kickButton,
      confirmStyle: 'warning',
      onConfirm: async () => {
        const promise = fetch(`/api/subscribers/${subscriber.id}/kick`, {
          method: 'POST'
        }).then(async (response) => {
          if (response.ok) {
            await fetchSubscribers()
            return t.toasts.kicked
          }
          throw new Error(t.toasts.kickFailed)
        })
        
        await toast.promise(promise, {
          pending: t.toasts.kicking,
          success: {
            render: `${t.toasts.kicked} ✅`,
            theme: "dark",
            autoClose: 5000
          },
          error: {
            render: `${t.toasts.kickFailed} ❌`,
            theme: "dark",
            autoClose: 5000
          }
        }, {
          theme: "dark",
          position: "top-right",
          rtl: isRTL
        })
      }
    })
  }

  const handleExtendSubscription = async () => {
    if (!selectedSubscriber) return

    const loadingToast = toast.loading(t.toasts.extendingSubscription, {
      theme: "dark",
      position: "top-right",
      rtl: isRTL
    })
    
    try {
      const response = await fetch(`/api/subscribers/${selectedSubscriber.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          durationType: extendData.durationType,
          durationValue: extendData.durationValue,
          isActive: true
        })
      })

      if (response.ok) {
        await fetchSubscribers()
        setShowExtendModal(false)
        setSelectedSubscriber(null)
        
        toast.dismiss(loadingToast)
        
        const isCurrentlyActive = selectedSubscriber.isActive && 
                                 new Date(selectedSubscriber.subscriptionEnd) > new Date()
        
        if (isCurrentlyActive) {
          toast.success(`✅ ${t.toasts.subscriptionExtended}`, {
            theme: "dark",
            position: "top-right",
            rtl: isRTL,
            autoClose: 5000
          })
        } else {
          toast.success(`✅ ${t.toasts.subscriptionRenewed}`, {
            theme: "dark",
            position: "top-right",
            rtl: isRTL,
            autoClose: 5000
          })
        }
      } else {
        toast.dismiss(loadingToast)
        toast.error(`❌ ${t.toasts.extendFailed}`, {
          theme: "dark",
          position: "top-right",
          rtl: isRTL,
          autoClose: 5000
        })
      }
    } catch (error) {
      console.error('Error extending subscription:', error)
      toast.dismiss(loadingToast)
      toast.error(`❌ ${t.toasts.extendError}`, {
        theme: "dark",
        position: "top-right",
        rtl: isRTL,
        autoClose: 5000
      })
    }
  }

  const handleDeleteSubscriber = async (id: string) => {
    confirmToast({
      message: t.toasts.deleteConfirm,
      subMessage: t.toasts.deleteSubMessage,
      confirmText: t.toasts.deleteButton,
      confirmStyle: 'danger',
      onConfirm: async () => {
        const promise = fetch(`/api/subscribers/${id}`, {
          method: 'DELETE'
        }).then(async (response) => {
          if (response.ok) {
            await fetchSubscribers()
            return t.toasts.deleted
          }
          throw new Error(t.toasts.deleteFailed)
        })
        
        await toast.promise(promise, {
          pending: t.toasts.deleting,
          success: {
            render: `${t.toasts.deleted} ✅`,
            theme: "dark",
            autoClose: 5000
          },
          error: {
            render: `${t.toasts.deleteFailed} ❌`,
            theme: "dark",
            autoClose: 5000
          }
        }, {
          theme: "dark",
          position: "top-right",
          rtl: isRTL
        })
      }
    })
  }

  const getStatusBadge = (subscriber: Subscriber) => {
    const now = new Date()
    const endDate = new Date(subscriber.subscriptionEnd)
    const diff = endDate.getTime() - now.getTime()
    const hoursLeft = diff / (1000 * 60 * 60)
    
    if (!subscriber.isActive || diff <= 0) {
      return (
        <span className="px-3 py-1 text-xs rounded-full bg-gradient-to-r from-red-500 to-red-600 text-white font-medium">
          {t.status.expired}
        </span>
      )
    } else if (hoursLeft <= 24) {
      return (
        <span className="px-3 py-1 text-xs rounded-full bg-gradient-to-r from-yellow-500 to-orange-500 text-white font-medium">
          {t.status.expiringSoon}
        </span>
      )
    } else {
      return (
        <span className="px-3 py-1 text-xs rounded-full bg-gradient-to-r from-green-500 to-emerald-500 text-white font-medium">
          {t.status.active}
        </span>
      )
    }
  }

  const getTimeRemaining = (endDate: string) => {
    const end = new Date(endDate)
    const now = new Date()
    const diff = end.getTime() - now.getTime()
    
    if (diff <= 0) return t.status.expired
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
    
    if (days > 0) return `${days} ${t.status.days}`
    if (hours > 0) return `${hours} ${t.status.hours}`
    return `${minutes} ${t.status.minutes}`
  }

  const hasChannel = admin && admin.channelId && admin.channelId.length > 0

  if (loading || adminLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#1a0a33]" dir={isRTL ? "rtl" : "ltr"}>
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
          <div className="text-xl text-white">{language === 'ar' ? 'جاري التحميل...' : 'Loading...'}</div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#1a0a33] text-white relative overflow-hidden" dir={isRTL ? "rtl" : "ltr"}>
      {/* خلفية متحركة */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-0 -left-4 w-96 h-96 bg-purple-700 rounded-full mix-blend-multiply filter blur-3xl animate-blob"></div>
        <div className="absolute top-0 -right-4 w-96 h-96 bg-indigo-700 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-20 w-96 h-96 bg-pink-700 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-4000"></div>
      </div>

      <div className="relative z-10 flex">
        {/* Sidebar */}
        <aside className={`${sidebarOpen ? 'w-64' : 'w-20'} bg-[#1f1237] min-h-screen transition-all duration-300 ${isRTL ? 'border-l' : 'border-r'} border-purple-800/30`}>
          <div className="p-4">
            {/* Logo */}
            <div className="flex items-center justify-between mb-8">
              <div className={`flex items-center gap-3 ${!sidebarOpen && 'justify-center'}`}>
                <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-blue-600 rounded-lg flex items-center justify-center">
                  <Zap className="h-6 w-6 text-white" />
                </div>
                {sidebarOpen && (
                  <span className="text-xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                    {t.sidebar.dashboard}
                  </span>
                )}
              </div>
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
            </div>

            {/* Navigation */}
            <nav className="space-y-2">
              <a href="#" className="flex items-center gap-3 px-3 py-2 rounded-lg bg-gradient-to-r from-purple-600/20 to-blue-600/20 border border-purple-500/30 text-white">
                <Home className="h-5 w-5" />
                {sidebarOpen && <span>{t.sidebar.home}</span>}
              </a>
              <button
                onClick={() => router.push('/settings')}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-purple-600/10 text-gray-400 hover:text-white transition-all"
              >
                <Settings className="h-5 w-5" />
                {sidebarOpen && <span>{t.sidebar.settings}</span>}
              </button>
              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 rounded-lg transition-all"
              >
                <LogOut className="h-5 w-5" />
                {sidebarOpen && <span>{t.sidebar.logout}</span>}
              </button>
            </nav>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-3xl font-bold mb-2">
                  {t.header.welcome}, {admin?.username || (language === 'ar' ? 'المدير' : 'Admin')} 👋
                </h1>
                <p className="text-gray-400">
                  {new Date().toLocaleDateString(language === 'ar' ? 'ar-EG' : 'en-US', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </p>
              </div>
              <div className="flex items-center gap-3">
                {/* Language Toggle Button */}
                <button
                  onClick={() => setLanguage(language === 'ar' ? 'en' : 'ar')}
                  className="p-2 bg-[#2a1b4a] rounded-lg hover:bg-[#322154] transition-colors flex items-center gap-2"
                  title={language === 'ar' ? 'Switch to English' : 'التبديل إلى العربية'}
                >
                  <Globe className="h-5 w-5" />
                  <span className="text-sm font-medium">{language === 'ar' ? 'EN' : 'AR'}</span>
                </button>
                <button className="relative p-2 bg-[#2a1b4a] rounded-lg hover:bg-[#322154] transition-colors">
                  <Bell className="h-5 w-5" />
                  <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
                </button>
                <button
                  onClick={refreshData}
                  className="p-2 bg-[#2a1b4a] rounded-lg hover:bg-[#322154] transition-colors"
                >
                  <RefreshCw className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {/* Total Subscribers */}
              <div className="relative bg-gradient-to-br from-[#2a1b4a] to-[#1f1237] rounded-2xl p-6 border border-purple-800/30 overflow-hidden group hover:scale-105 transition-transform duration-300">
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-600/20 to-transparent rounded-full blur-2xl"></div>
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                      <Users className="h-6 w-6 text-white" />
                    </div>
                    <span className="text-xs text-gray-400">{t.stats.all}</span>
                  </div>
                  <div className="flex items-end justify-between">
                    <div>
                      <p className="text-3xl font-bold">{subscribers.length}</p>
                      <p className="text-sm text-gray-400">{t.stats.subscriber}</p>
                    </div>
                    <div className="flex items-center gap-1 text-green-400 text-sm">
                      <ArrowUp className="h-4 w-4" />
                      <span>{growthRate}%</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Active Subscribers */}
              <div className="relative bg-gradient-to-br from-[#2a1b4a] to-[#1f1237] rounded-2xl p-6 border border-purple-800/30 overflow-hidden group hover:scale-105 transition-transform duration-300">
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-green-600/20 to-transparent rounded-full blur-2xl"></div>
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg">
                      <UserCheck className="h-6 w-6 text-white" />
                    </div>
                    <span className="text-xs text-gray-400">{t.stats.active}</span>
                  </div>
                  <div className="flex items-end justify-between">
                    <div>
                      <p className="text-3xl font-bold">{activeCount}</p>
                      <p className="text-sm text-gray-400">{t.stats.activeSubscriber}</p>
                    </div>
                    <div className="text-green-400">
                      <Activity className="h-5 w-5" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Revenue */}
              <div className="relative bg-gradient-to-br from-[#2a1b4a] to-[#1f1237] rounded-2xl p-6 border border-purple-800/30 overflow-hidden group hover:scale-105 transition-transform duration-300">
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-600/20 to-transparent rounded-full blur-2xl"></div>
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                      <DollarSign className="h-6 w-6 text-white" />
                    </div>
                    <span className="text-xs text-gray-400">{t.stats.revenue}</span>
                  </div>
                  <div className="flex items-end justify-between">
                    <div>
                      <p className="text-3xl font-bold">${totalRevenue}</p>
                      <p className="text-sm text-gray-400">{t.stats.thisMonth}</p>
                    </div>
                    <div className="flex items-center gap-1 text-green-400 text-sm">
                      <TrendingUp className="h-4 w-4" />
                      <span>{monthlyGrowth}%</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Renewal Rate */}
              <div className="relative bg-gradient-to-br from-[#2a1b4a] to-[#1f1237] rounded-2xl p-6 border border-purple-800/30 overflow-hidden group hover:scale-105 transition-transform duration-300">
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-yellow-600/20 to-transparent rounded-full blur-2xl"></div>
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-xl flex items-center justify-center shadow-lg">
                      <Award className="h-6 w-6 text-white" />
                    </div>
                    <span className="text-xs text-gray-400">{t.stats.renewalRate}</span>
                  </div>
                  <div className="flex items-end justify-between">
                    <div>
                      <p className="text-3xl font-bold">85%</p>
                      <p className="text-sm text-gray-400">{t.stats.renewalRate}</p>
                    </div>
                    <div className="text-yellow-400">
                      <Target className="h-5 w-5" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Setup Alert */}
            {!hasChannel && (
              <div className="bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border border-yellow-500/30 rounded-xl p-6 mb-6">
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-6 w-6 text-yellow-400 mt-1" />
                  <div>
                    <h3 className="text-lg font-semibold text-yellow-300 mb-2">{t.alerts.setupRequired}</h3>
                    <p className="text-gray-300">
                      {t.alerts.setupMessage}
                    </p>
                    <button
                      onClick={() => router.push('/settings')}
                      className="mt-3 px-4 py-2 bg-yellow-600 hover:bg-yellow-700 rounded-lg transition-colors"
                    >
                      {t.alerts.goToSettings}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Controls Bar */}
            <div className="bg-[#2a1b4a] rounded-2xl p-6 mb-6 border border-purple-800/30">
              <div className="flex flex-wrap gap-4 items-center justify-between">
                <div className="flex flex-wrap gap-3 items-center">
                  {/* Search */}
                  <div className="relative">
                    <Search className={`absolute ${isRTL ? 'right-3' : 'left-3'} top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400`} />
                    <input
                      type="text"
                      placeholder={t.controls.search}
                      className={`${isRTL ? 'pr-10 pl-4' : 'pl-10 pr-4'} py-2 bg-[#1f1237] border border-purple-800/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-white placeholder-gray-400`}
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>

                  {/* Filter */}
                  <select
                    className="px-4 py-2 bg-[#1f1237] border border-purple-800/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-white"
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                  >
                    <option value="all">{t.controls.allSubscribers}</option>
                    <option value="active">{t.controls.activeOnly}</option>
                    <option value="expired">{t.controls.expiredOnly}</option>
                    <option value="waiting">{t.controls.expiringSoon}</option>
                  </select>

                  {/* View Mode Toggle */}
                  <div className="flex bg-[#1f1237] rounded-lg p-1">
                    <button
                      onClick={() => setViewMode('grid')}
                      className={`px-3 py-1 rounded-md transition-all ${
                        viewMode === 'grid' 
                          ? 'bg-purple-600 text-white' 
                          : 'text-gray-400 hover:text-white'
                      }`}
                    >
                      <BarChart3 className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => setViewMode('table')}
                      className={`px-3 py-1 rounded-md transition-all ${
                        viewMode === 'table' 
                          ? 'bg-purple-600 text-white' 
                          : 'text-gray-400 hover:text-white'
                      }`}
                    >
                      <Users className="h-5 w-5" />
                    </button>
                  </div>
                </div>

                {/* Add Button */}
                <button
                  onClick={() => setShowAddForm(!showAddForm)}
                  disabled={!hasChannel}
                  className={`flex items-center gap-2 px-6 py-3 rounded-xl transition-all transform hover:scale-105 ${
                    hasChannel 
                      ? 'bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white shadow-lg' 
                      : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  <UserPlus className="h-5 w-5" />
                  <span>{t.controls.addSubscriber}</span>
                </button>
              </div>
            </div>

            {/* Subscribers Grid/Table */}
            {viewMode === 'grid' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredSubscribers.map((subscriber) => (
                  <div key={subscriber.id} className="bg-[#2a1b4a] rounded-2xl p-6 border border-purple-800/30 hover:shadow-xl hover:shadow-purple-500/20 transition-all">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                          {subscriber.firstName?.[0] || subscriber.telegramUsername?.[0] || '?'}
                        </div>
                        <div>
                          <h3 className="font-semibold text-white">
                            {subscriber.firstName} {subscriber.lastName}
                          </h3>
                          <p className="text-sm text-gray-400">
                            {subscriber.telegramUsername ? `@${subscriber.telegramUsername}` : subscriber.telegramId}
                          </p>
                        </div>
                      </div>
                      <button className="text-gray-400 hover:text-white">
                        <MoreVertical className="h-5 w-5" />
                      </button>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-400">{t.subscriber.status}</span>
                        {getStatusBadge(subscriber)}
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-400">{t.subscriber.expiresIn}</span>
                        <span className="text-sm font-medium">{getTimeRemaining(subscriber.subscriptionEnd)}</span>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-400">{t.subscriber.date}</span>
                        <span className="text-sm">{new Date(subscriber.subscriptionEnd).toLocaleDateString(language === 'ar' ? 'ar-EG' : 'en-US')}</span>
                      </div>
                    </div>

                    <div className="flex gap-2 mt-4 pt-4 border-t border-purple-800/30">
                      <button
                        onClick={() => {
                          setSelectedSubscriber(subscriber)
                          setShowExtendModal(true)
                        }}
                        className="flex-1 flex items-center justify-center gap-1 py-2 bg-purple-600/20 hover:bg-purple-600/30 rounded-lg transition-colors"
                      >
                        <Timer className="h-4 w-4" />
                        <span className="text-sm">{t.subscriber.extend}</span>
                      </button>
                      <button
                        onClick={() => handleKickSubscriber(subscriber)}
                        className="flex-1 flex items-center justify-center gap-1 py-2 bg-orange-600/20 hover:bg-orange-600/30 rounded-lg transition-colors"
                      >
                        <Ban className="h-4 w-4" />
                        <span className="text-sm">{t.subscriber.kick}</span>
                      </button>
                      <button
                        onClick={() => handleDeleteSubscriber(subscriber.id)}
                        className="flex-1 flex items-center justify-center gap-1 py-2 bg-red-600/20 hover:bg-red-600/30 rounded-lg transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                        <span className="text-sm">{t.subscriber.delete}</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-[#2a1b4a] rounded-2xl overflow-hidden border border-purple-800/30">
                <div className="overflow-x-auto">
                  <table className="min-w-full">
                    <thead className="bg-[#1f1237]">
                      <tr>
                        <th className={`px-6 py-4 ${isRTL ? 'text-right' : 'text-left'} text-xs font-medium text-gray-400 uppercase tracking-wider`}>{t.stats.subscriber}</th>
                        <th className={`px-6 py-4 ${isRTL ? 'text-right' : 'text-left'} text-xs font-medium text-gray-400 uppercase tracking-wider`}>{t.subscriber.telegramId}</th>
                        <th className={`px-6 py-4 ${isRTL ? 'text-right' : 'text-left'} text-xs font-medium text-gray-400 uppercase tracking-wider`}>{t.subscriber.status}</th>
                        <th className={`px-6 py-4 ${isRTL ? 'text-right' : 'text-left'} text-xs font-medium text-gray-400 uppercase tracking-wider`}>{t.subscriber.timeRemaining}</th>
                        <th className={`px-6 py-4 ${isRTL ? 'text-right' : 'text-left'} text-xs font-medium text-gray-400 uppercase tracking-wider`}>{t.subscriber.expiryDate}</th>
                        <th className={`px-6 py-4 ${isRTL ? 'text-right' : 'text-left'} text-xs font-medium text-gray-400 uppercase tracking-wider`}>{t.subscriber.actions}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-purple-800/30">
                      {filteredSubscribers.map((subscriber) => (
                        <tr key={subscriber.id} className="hover:bg-[#322154] transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center text-white font-bold">
                                {subscriber.firstName?.[0] || '?'}
                              </div>
                              <div>
                                <div className="text-sm font-medium">{subscriber.firstName} {subscriber.lastName}</div>
                                <div className="text-sm text-gray-400">
                                  {subscriber.telegramUsername ? `@${subscriber.telegramUsername}` : t.subscriber.noUsername}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">{subscriber.telegramId}</td>
                          <td className="px-6 py-4 whitespace-nowrap">{getStatusBadge(subscriber)}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">{getTimeRemaining(subscriber.subscriptionEnd)}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            {new Date(subscriber.subscriptionEnd).toLocaleDateString(language === 'ar' ? 'ar-EG' : 'en-US')}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => {
                                  setSelectedSubscriber(subscriber)
                                  setShowExtendModal(true)
                                }}
                                className="text-purple-400 hover:text-purple-300"
                              >
                                <Timer className="h-5 w-5" />
                              </button>
                              <button
                                onClick={() => handleKickSubscriber(subscriber)}
                                className="text-orange-400 hover:text-orange-300"
                              >
                                <Ban className="h-5 w-5" />
                              </button>
                              <button
                                onClick={() => handleDeleteSubscriber(subscriber.id)}
                                className="text-red-400 hover:text-red-300"
                              >
                                <Trash2 className="h-5 w-5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>

          {/* Add Subscriber Form */}
          {showAddForm && hasChannel && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
              <div className="bg-[#2a1b4a] rounded-2xl p-8 max-w-2xl w-full border border-purple-800/30">
                <h3 className="text-2xl font-bold mb-6 bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                  {t.addForm.title}
                </h3>
                <form onSubmit={handleAddSubscriber} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      {t.addForm.telegramId}
                    </label>
                    <input
                      type="text"
                      required
                      className="w-full px-4 py-3 bg-[#1f1237] border border-purple-800/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-white"
                      value={formData.telegramId}
                      onChange={(e) => setFormData({ ...formData, telegramId: e.target.value })}
                      placeholder="123456789"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      {t.addForm.username}
                    </label>
                    <input
                      type="text"
                      className="w-full px-4 py-3 bg-[#1f1237] border border-purple-800/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-white"
                      value={formData.telegramUsername}
                      onChange={(e) => setFormData({ ...formData, telegramUsername: e.target.value })}
                      placeholder="username"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      {t.addForm.firstName}
                    </label>
                    <input
                      type="text"
                      className="w-full px-4 py-3 bg-[#1f1237] border border-purple-800/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-white"
                      value={formData.firstName}
                      onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      {t.addForm.lastName}
                    </label>
                    <input
                      type="text"
                      className="w-full px-4 py-3 bg-[#1f1237] border border-purple-800/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-white"
                      value={formData.lastName}
                      onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      {t.addForm.durationType}
                    </label>
                    <select
                      className="w-full px-4 py-3 bg-[#1f1237] border border-purple-800/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-white"
                      value={formData.durationType}
                      onChange={(e) => setFormData({ ...formData, durationType: e.target.value })}
                    >
                      <option value="minutes">{t.addForm.minutes}</option>
                      <option value="hours">{t.addForm.hours}</option>
                      <option value="days">{t.addForm.days}</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      {t.addForm.duration}
                    </label>
                    <input
                      type="number"
                      min="1"
                      required
                      className="w-full px-4 py-3 bg-[#1f1237] border border-purple-800/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-white"
                      value={formData.durationValue}
                      onChange={(e) => setFormData({ ...formData, durationValue: parseInt(e.target.value) })}
                    />
                  </div>

                  <div className="md:col-span-2 flex justify-end gap-3 mt-6">
                    <button
                      type="button"
                      onClick={() => setShowAddForm(false)}
                      className="px-6 py-3 border border-purple-800/30 rounded-lg hover:bg-purple-600/10 transition-colors"
                    >
                      {t.addForm.cancel}
                    </button>
                    <button
                      type="submit"
                      className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all"
                    >
                      {t.addForm.addSubscriber}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Extend Subscription Modal */}
          {showExtendModal && selectedSubscriber && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
              <div className="bg-[#2a1b4a] rounded-2xl p-8 max-w-md w-full border border-purple-800/30">
                <h3 className="text-2xl font-bold mb-6 bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                  {t.extendModal.title}: {selectedSubscriber.firstName || selectedSubscriber.telegramId}
                </h3>
                
                <div className="bg-[#1f1237] rounded-lg p-4 mb-6">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-400">{t.extendModal.status}</span>
                      {getStatusBadge(selectedSubscriber)}
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">{t.extendModal.expiresOn}</span>
                      <span className="font-medium">{new Date(selectedSubscriber.subscriptionEnd).toLocaleDateString(language === 'ar' ? 'ar-EG' : 'en-US')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">{t.extendModal.timeRemaining}</span>
                      <span className="font-medium">{getTimeRemaining(selectedSubscriber.subscriptionEnd)}</span>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      {t.extendModal.durationType}
                    </label>
                    <select
                      className="w-full px-4 py-3 bg-[#1f1237] border border-purple-800/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-white"
                      value={extendData.durationType}
                      onChange={(e) => setExtendData({ ...extendData, durationType: e.target.value })}
                    >
                      <option value="minutes">{t.addForm.minutes}</option>
                      <option value="hours">{t.addForm.hours}</option>
                      <option value="days">{t.addForm.days}</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      {t.extendModal.duration}
                    </label>
                    <input
                      type="number"
                      min="1"
                      className="w-full px-4 py-3 bg-[#1f1237] border border-purple-800/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-white"
                      value={extendData.durationValue}
                      onChange={(e) => setExtendData({ ...extendData, durationValue: parseInt(e.target.value) })}
                    />
                  </div>
                  
                  <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/30 rounded-lg p-4">
                    <p className="text-sm">
                      {selectedSubscriber.isActive && new Date(selectedSubscriber.subscriptionEnd) > new Date()
                        ? t.extendModal.activeNote
                        : t.extendModal.expiredNote}
                    </p>
                  </div>
                </div>

                <div className="flex justify-end gap-3 mt-6">
                  <button
                    onClick={() => {
                      setShowExtendModal(false)
                      setSelectedSubscriber(null)
                    }}
                    className="px-6 py-3 border border-purple-800/30 rounded-lg hover:bg-purple-600/10 transition-colors"
                  >
                    {t.extendModal.cancel}
                  </button>
                  <button
                    onClick={handleExtendSubscription}
                    className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all"
                  >
                    {t.extendModal.extendSubscription}
                  </button>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}