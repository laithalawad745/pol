// app/super-admin/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Users, UserPlus, Calendar, LogOut, Check, X, Eye, EyeOff, RefreshCw } from 'lucide-react'

export default function SuperAdminDashboard() {
  const router = useRouter()
  const [admins, setAdmins] = useState<any[]>([])
  const [showAddForm, setShowAddForm] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(true)
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    durationType: 'months', // days, weeks, months
    durationValue: 1
  })

  useEffect(() => {
    fetchAdmins()
  }, [])

  const fetchAdmins = async () => {
    try {
      const response = await fetch('/api/super-admin/admins')
      if (response.ok) {
        const data = await response.json()
        setAdmins(data)
      } else if (response.status === 401) {
        router.push('/super-admin/login')
      }
    } catch (error) {
      console.error('Error fetching admins:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddAdmin = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // حساب تاريخ انتهاء الاشتراك
    const now = new Date()
    let planExpiry = new Date()
    
    switch (formData.durationType) {
      case 'days':
        planExpiry.setDate(now.getDate() + formData.durationValue)
        break
      case 'weeks':
        planExpiry.setDate(now.getDate() + (formData.durationValue * 7))
        break
      case 'months':
        planExpiry.setMonth(now.getMonth() + formData.durationValue)
        break
    }

    try {
      const response = await fetch('/api/super-admin/admins', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: formData.username,
          password: formData.password,
          email: null, // لا نحتاج email
          planExpiry: planExpiry.toISOString(),
          isActive: true,
          isPaid: true
        })
      })

      if (response.ok) {
        await fetchAdmins()
        setShowAddForm(false)
        setFormData({
          username: '',
          password: '',
          durationType: 'months',
          durationValue: 1
        })
        alert('✅ تم إنشاء الحساب بنجاح!')
      } else {
        const error = await response.json()
        alert(`❌ خطأ: ${error.error}`)
      }
    } catch (error) {
      alert('❌ حدث خطأ في إنشاء الحساب')
    }
  }

  const renewSubscription = async (adminId: string) => {
    const durationType = prompt('نوع المدة؟ (days/weeks/months)', 'months')
    const durationValue = prompt('كم؟', '1')
    
    if (!durationType || !durationValue) return
    
    const now = new Date()
    let newExpiry = new Date()
    
    switch (durationType) {
      case 'days':
        newExpiry.setDate(now.getDate() + parseInt(durationValue))
        break
      case 'weeks':
        newExpiry.setDate(now.getDate() + (parseInt(durationValue) * 7))
        break
      case 'months':
        newExpiry.setMonth(now.getMonth() + parseInt(durationValue))
        break
    }

    try {
      const response = await fetch(`/api/super-admin/admins/${adminId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          planExpiry: newExpiry.toISOString(),
          isActive: true,
          isPaid: true
        })
      })

      if (response.ok) {
        await fetchAdmins()
        alert('✅ تم تجديد الاشتراك')
      }
    } catch (error) {
      alert('❌ حدث خطأ في التجديد')
    }
  }

  const toggleAdminStatus = async (adminId: string, isActive: boolean) => {
    try {
      const response = await fetch(`/api/super-admin/admins/${adminId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !isActive })
      })

      if (response.ok) {
        await fetchAdmins()
      }
    } catch (error) {
      console.error('Error updating admin:', error)
    }
  }

  const deleteAdmin = async (adminId: string) => {
    if (!confirm('هل أنت متأكد من حذف هذا الحساب؟')) return

    try {
      const response = await fetch(`/api/super-admin/admins/${adminId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        await fetchAdmins()
        alert('✅ تم حذف الحساب')
      }
    } catch (error) {
      alert('❌ حدث خطأ في الحذف')
    }
  }

  const handleLogout = async () => {
    await fetch('/api/super-admin/logout', { method: 'POST' })
    router.push('/super-admin/login')
  }

  const generateRandomPassword = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%'
    let password = ''
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    setFormData({ ...formData, password })
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-white text-xl">جاري التحميل...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white" dir="rtl">
      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-indigo-500 ml-2" />
              <h1 className="text-xl font-bold">إدارة حسابات أصحاب القنوات</h1>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center text-gray-300 hover:text-white px-3 py-2"
            >
              <LogOut className="h-5 w-5 ml-2" />
              تسجيل الخروج
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* الإحصائيات */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">إجمالي الحسابات</p>
                <p className="text-3xl font-bold">{admins.length}</p>
              </div>
              <Users className="h-10 w-10 text-blue-500" />
            </div>
          </div>

          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">الحسابات النشطة</p>
                <p className="text-3xl font-bold text-green-400">
                  {admins.filter(a => a.isActive && (!a.planExpiry || new Date(a.planExpiry) > new Date())).length}
                </p>
              </div>
              <Check className="h-10 w-10 text-green-500" />
            </div>
          </div>

          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">الاشتراكات المنتهية</p>
                <p className="text-3xl font-bold text-red-400">
                  {admins.filter(a => a.planExpiry && new Date(a.planExpiry) <= new Date()).length}
                </p>
              </div>
              <X className="h-10 w-10 text-red-500" />
            </div>
          </div>
        </div>

        {/* زر إضافة حساب جديد */}
        <div className="mb-6">
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            <UserPlus className="h-5 w-5 ml-2" />
            إنشاء حساب جديد
          </button>
        </div>

        {/* نموذج إضافة حساب */}
        {showAddForm && (
          <div className="bg-gray-800 rounded-lg p-6 mb-8 border border-gray-700">
            <h3 className="text-lg font-bold mb-4">إنشاء حساب جديد</h3>
            <form onSubmit={handleAddAdmin} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    اسم المستخدم *
                  </label>
                  <input
                    type="text"
                    required
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:border-indigo-500"
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    placeholder="username"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    كلمة المرور *
                  </label>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <input
                        type={showPassword ? "text" : "password"}
                        required
                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:border-indigo-500 pl-10"
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        placeholder="كلمة مرور قوية"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                      >
                        {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                      </button>
                    </div>
                    <button
                      type="button"
                      onClick={generateRandomPassword}
                      className="px-3 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-500"
                      title="توليد كلمة مرور عشوائية"
                    >
                      🎲
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    نوع المدة
                  </label>
                  <select
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:border-indigo-500"
                    value={formData.durationType}
                    onChange={(e) => setFormData({ ...formData, durationType: e.target.value })}
                  >
                    <option value="days">أيام</option>
                    <option value="weeks">أسابيع</option>
                    <option value="months">شهور</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    المدة
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:border-indigo-500"
                    value={formData.durationValue}
                    onChange={(e) => setFormData({ ...formData, durationValue: parseInt(e.target.value) })}
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 mt-4">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="px-4 py-2 border border-gray-600 rounded-md text-gray-300 hover:bg-gray-700"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                >
                  إنشاء الحساب
                </button>
              </div>
            </form>
          </div>
        )}

        {/* قائمة الحسابات */}
        <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-700">
            <h3 className="text-lg font-bold">الحسابات المسجلة</h3>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-700">
              <thead className="bg-gray-900">
                <tr>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase">
                    اسم المستخدم
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase">
                    القناة
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase">
                    تاريخ الانتهاء
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase">
                    المتبقي
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase">
                    الحالة
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase">
                    الإجراءات
                  </th>
                </tr>
              </thead>
              <tbody className="bg-gray-800 divide-y divide-gray-700">
                {admins.map((admin) => {
                  const expiry = admin.planExpiry ? new Date(admin.planExpiry) : null
                  const now = new Date()
                  const daysLeft = expiry ? Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)) : null
                  const isExpired = expiry && daysLeft! <= 0

                  return (
                    <tr key={admin.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-white">
                          {admin.username}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-300">
                          {admin.channelName || admin.channelId || 'غير محدد'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-300">
                          {expiry ? expiry.toLocaleDateString('ar-EG') : 'غير محدد'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className={`text-sm font-medium ${
                          isExpired ? 'text-red-400' : 
                          daysLeft && daysLeft <= 7 ? 'text-yellow-400' : 
                          'text-green-400'
                        }`}>
                          {!expiry ? 'دائم' : isExpired ? 'منتهي' : `${daysLeft} يوم`}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          onClick={() => toggleAdminStatus(admin.id, admin.isActive)}
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                            ${admin.isActive && !isExpired ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}
                        >
                          {admin.isActive && !isExpired ? 'نشط' : 'معطل'}
                        </button>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <button
                          onClick={() => renewSubscription(admin.id)}
                          className="text-green-400 hover:text-green-300 ml-3"
                          title="تجديد الاشتراك"
                        >
                          <RefreshCw className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => deleteAdmin(admin.id)}
                          className="text-red-400 hover:text-red-300"
                          title="حذف"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
            
            {admins.length === 0 && (
              <div className="text-center py-8 text-gray-400">
                لا يوجد حسابات حالياً
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}