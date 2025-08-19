// app/settings/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'react-toastify'
import { useLanguage, translations } from '@/context/LanguageContext'
import { 
  Save, AlertCircle, Settings, Globe, ChevronLeft,
  Hash, Bot, Shield, CheckCircle, Users, Link,
  Ban, Clock, Zap, ArrowLeft, ArrowRight
} from 'lucide-react'

export default function ChannelSettingsPage() {
  const router = useRouter()
  const { language, toggleLanguage, isRTL } = useLanguage()
  const t = translations[language as 'en' | 'ar'].settings
  
  const [loading, setLoading] = useState(false)
  const [admin, setAdmin] = useState<any>(null)
  const [formData, setFormData] = useState({
    channelId: '',
    channelName: ''
  })
  const [message, setMessage] = useState({ type: '', text: '' })

  useEffect(() => {
    fetchAdminData()
  }, [])

  const fetchAdminData = async () => {
    try {
      const response = await fetch('/api/auth/me')
      if (response.ok) {
        const data = await response.json()
        setAdmin(data)
        setFormData({
          channelId: data.channelId || '',
          channelName: data.channelName || ''
        })
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
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage({ type: '', text: '' })

    // التحقق من صحة معرف القناة
    if (!formData.channelId.startsWith('-100')) {
      setMessage({ 
        type: 'error', 
        text: t.validation.channelIdFormat
      })
      setLoading(false)
      return
    }

    const loadingToast = toast.loading(t.toasts.saving, {
      theme: "dark",
      position: "top-right",
      rtl: isRTL
    })

    try {
      const response = await fetch('/api/settings/channel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      const data = await response.json()

      if (response.ok) {
        toast.dismiss(loadingToast)
        toast.success(`✅ ${t.toasts.saved}`, {
          theme: "dark",
          position: "top-right",
          rtl: isRTL,
          autoClose: 5000
        })
        setMessage({ 
          type: 'success', 
          text: t.toasts.saved
        })
      } else {
        toast.dismiss(loadingToast)
        toast.error(data.error || t.toasts.saveFailed, {
          theme: "dark",
          position: "top-right",
          rtl: isRTL,
          autoClose: 5000
        })
        setMessage({ 
          type: 'error', 
          text: data.error || t.toasts.saveFailed
        })
      }
    } catch (error) {
      toast.dismiss(loadingToast)
      toast.error(`❌ ${t.toasts.connectionError}`, {
        theme: "dark",
        position: "top-right",
        rtl: isRTL,
        autoClose: 5000
      })
      setMessage({ 
        type: 'error', 
        text: t.toasts.connectionError
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#1a0a33] text-white relative overflow-hidden" dir={isRTL ? "rtl" : "ltr"}>
      {/* خلفية متحركة */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-0 -left-4 w-96 h-96 bg-purple-700 rounded-full mix-blend-multiply filter blur-3xl animate-blob"></div>
        <div className="absolute top-0 -right-4 w-96 h-96 bg-indigo-700 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-20 w-96 h-96 bg-pink-700 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-4000"></div>
      </div>

      <div className="relative z-10">
        {/* Header */}
        <header className="bg-[#1f1237]/80 backdrop-blur-lg shadow-lg border-b border-purple-800/30">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-blue-600 rounded-lg flex items-center justify-center">
                  <Settings className="h-6 w-6 text-white" />
                </div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                  {t.header.title}
                </h1>
              </div>
              
              <div className="flex items-center gap-3">
                {/* زر تبديل اللغة */}
                <button
                  onClick={toggleLanguage}
                  className="cursor-pointer flex items-center gap-2 px-4 py-2 bg-purple-600/20 hover:bg-purple-600/30 rounded-lg transition-all duration-300 border border-purple-500/30"
                >
                  <Globe className="h-5 w-5 text-purple-400" />
                  <span className="text-sm font-medium">{language === 'ar' ? 'EN' : 'العربية'}</span>
                </button>
                
                {/* زر العودة */}
                <button
                  onClick={() => router.push('/dashboard')}
                  className="cursor-pointer flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 rounded-lg transition-all duration-300"
                >
                  {isRTL ? <ArrowRight className="h-5 w-5" /> : <ArrowLeft className="h-5 w-5" />}
                  <span>{t.header.backToDashboard}</span>
                </button>
              </div>
            </div>
          </div>
        </header>

        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* تنبيه للإعدادات المفقودة */}
          {admin && !admin.channelId && (
            <div className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 backdrop-blur-lg border border-yellow-500/30 rounded-xl p-4 mb-6">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-yellow-400 mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="text-sm font-semibold text-yellow-300">
                    {t.alerts.channelRequired}
                  </h3>
                  <p className="mt-1 text-sm text-yellow-200/80">
                    {t.alerts.channelRequiredMessage}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* نموذج الإعدادات */}
          <div className="bg-[#1f1237]/80 backdrop-blur-lg rounded-2xl shadow-2xl p-6 border border-purple-800/30">
            <div className="flex items-center gap-3 mb-6">
              <Hash className="h-6 w-6 text-purple-400" />
              <h2 className="text-lg font-bold text-white">{t.form.title}</h2>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* معرف القناة */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  {t.form.channelId}
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    className="w-full px-4 py-3 bg-[#2a1b4a]/50 border border-purple-700/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white placeholder-gray-500 transition-all duration-300"
                    value={formData.channelId}
                    onChange={(e) => setFormData({ ...formData, channelId: e.target.value })}
                    placeholder="-1001234567890"
                    dir="ltr"
                  />
                  <Hash className={`absolute top-3.5 ${isRTL ? 'left-3' : 'right-3'} h-5 w-5 text-purple-400 opacity-50`} />
                </div>
                <p className="mt-2 text-xs text-gray-400">
                  {t.form.channelIdHint}
                </p>
              </div>

              {/* اسم القناة */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  {t.form.channelName}
                </label>
                <input
                  type="text"
                  className="w-full px-4 py-3 bg-[#2a1b4a]/50 border border-purple-700/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white placeholder-gray-500 transition-all duration-300"
                  value={formData.channelName}
                  onChange={(e) => setFormData({ ...formData, channelName: e.target.value })}
                  placeholder={t.form.channelNamePlaceholder}
                />
              </div>

              {/* خطوات الإعداد */}
              <div className="bg-gradient-to-br from-purple-900/30 to-blue-900/30 backdrop-blur-lg rounded-xl p-5 border border-purple-700/30">
                <div className="flex items-center gap-2 mb-4">
                  <Shield className="h-5 w-5 text-purple-400" />
                  <h4 className="font-semibold text-white">{t.setup.title}</h4>
                </div>
                <div className="space-y-3">
                  {/* خطوة 1 */}
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-purple-600 to-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                      <span className="text-sm font-bold">1</span>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-300">
                        {t.setup.step1.replace('{botUsername}', process.env.NEXT_PUBLIC_BOT_USERNAME || 'YourBot')}
                      </p>
                    </div>
                  </div>

                  {/* خطوة 2 */}
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-purple-600 to-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                      <span className="text-sm font-bold">2</span>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-300 mb-2">{t.setup.step2.title}</p>
                      <div className="space-y-1 ms-2">
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4 text-purple-400" />
                          <span className="text-xs text-gray-400">{t.setup.step2.addMembers}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Ban className="h-4 w-4 text-purple-400" />
                          <span className="text-xs text-gray-400">{t.setup.step2.banMembers}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Link className="h-4 w-4 text-purple-400" />
                          <span className="text-xs text-gray-400">{t.setup.step2.manageInvites}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* خطوة 3 */}
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-purple-600 to-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                      <span className="text-sm font-bold">3</span>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-300">{t.setup.step3}</p>
                    </div>
                  </div>

                  {/* خطوة 4 */}
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-purple-600 to-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                      <span className="text-sm font-bold">4</span>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-300">{t.setup.step4}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* رسائل النجاح/الخطأ */}
              {message.text && (
                <div className={`p-4 rounded-lg flex items-start gap-3 ${
                  message.type === 'success' 
                    ? 'bg-green-500/20 border border-green-500/30' 
                    : 'bg-red-500/20 border border-red-500/30'
                }`}>
                  {message.type === 'success' ? (
                    <CheckCircle className="h-5 w-5 text-green-400 flex-shrink-0 mt-0.5" />
                  ) : (
                    <AlertCircle className="h-5 w-5 text-red-400 flex-shrink-0 mt-0.5" />
                  )}
                  <span className={message.type === 'success' ? 'text-green-300' : 'text-red-300'}>
                    {message.text}
                  </span>
                </div>
              )}

              {/* أزرار الحفظ */}
              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => router.push('/dashboard')}
                  className="cursor-pointer px-6 py-3 bg-gray-600/20 hover:bg-gray-600/30 text-gray-300 rounded-lg transition-all duration-300 border border-gray-600/30"
                >
                  {t.form.cancel}
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="cursor-pointer flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Save className="h-5 w-5" />
                  {loading ? t.form.saving : t.form.save}
                </button>
              </div>
            </form>
          </div>

          {/* معلومات البوت */}
          {/* <div className="mt-6 bg-gradient-to-r from-blue-500/20 to-purple-500/20 backdrop-blur-lg border border-blue-500/30 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <Bot className="h-5 w-5 text-blue-400 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="text-sm font-semibold text-blue-300 mb-1">{t.botInfo.title}</h4>
                <p className="text-sm text-blue-200/80">
                  @{process.env.NEXT_PUBLIC_BOT_USERNAME || 'YourBot'}
                </p>
                <p className="text-xs text-blue-200/60 mt-2">
                  {t.botInfo.description}
                </p>
              </div>
            </div>
          </div> */}
        </main>
      </div>

 
    </div>
  )
}