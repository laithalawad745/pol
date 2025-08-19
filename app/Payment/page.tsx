'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useLanguage, translations } from '@/context/LanguageContext'
import { 
  CreditCard, 
  AlertCircle, 
  Copy, 
  Check, 
  Clock,
  Shield,
  MessageCircle,
  ExternalLink,
  Wallet,
  ChevronDown,
  DollarSign,
  Globe,
  ArrowLeft,
  ArrowRight
} from 'lucide-react'

export default function Payment() {
  const router = useRouter()
  const { language, toggleLanguage, isRTL } = useLanguage()
  const t = translations[language as 'en' | 'ar'].payment
  const afterPaymentT = translations[language as 'en' | 'ar'].afterPayment

  const [selectedMethod, setSelectedMethod] = useState<'usdt' | 'paypal' | null>(null)
  const [copiedAddress, setCopiedAddress] = useState(false)
  const [copiedAmount, setCopiedAmount] = useState(false)
  const [selectedAmount, setSelectedAmount] = useState('30')
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // معلومات الدفع
  const usdtAddress = "TVBDm4dfE7v8QQXwPNfnHKj5DAv5XTbRpx"
  const paypalEmail = "your-paypal@email.com"
  const telegramUsername = "@your_telegram"
  
  // خيارات الأسعار
  const priceOptions = [
    { value: '20', label: '$20', description: language === 'ar' ? 'خطة أساسية' : 'Basic Plan' },
    { value: '30', label: '$30', description: language === 'ar' ? 'خطة متوسطة' : 'Standard Plan' },
    { value: '50', label: '$50', description: language === 'ar' ? 'خطة احترافية' : 'Professional Plan' }
  ]

  // إغلاق dropdown عند النقر خارجه
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const copyToClipboard = (text: string, type: 'address' | 'amount') => {
    navigator.clipboard.writeText(text)
    if (type === 'address') {
      setCopiedAddress(true)
      setTimeout(() => setCopiedAddress(false), 2000)
    } else {
      setCopiedAmount(true)
      setTimeout(() => setCopiedAmount(false), 2000)
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
                  <CreditCard className="h-6 w-6 text-white" />
                </div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                  {t.title}
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
                  <span>العودة للوحة التحكم</span>
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* المحتوى الرئيسي */}
        <div className="max-w-6xl mx-auto px-4 py-12">
          {/* العنوان */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
                {t.title}
              </span>
            </h1>
            <p className="text-gray-300 text-lg">{t.subtitle}</p>
          </div>

          {/* تنبيه مهم */}
          <div className="bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border border-yellow-500/30 rounded-xl p-6 mb-8">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-6 w-6 text-yellow-400 mt-1 flex-shrink-0" />
              <div>
                <h3 className="text-lg font-semibold text-yellow-300 mb-2">{t.warning.title}</h3>
                <p className="text-gray-300 leading-relaxed">
                  {t.warning.text}
                </p>
              </div>
            </div>
          </div>

          {/* خيارات الدفع */}
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            {/* USDT */}
            <div 
              onClick={() => setSelectedMethod('usdt')}
              className={`relative bg-[#1f1237] rounded-2xl p-6 cursor-pointer transition-all duration-300 border-2 ${
                selectedMethod === 'usdt' 
                  ? 'border-purple-500 shadow-lg shadow-purple-500/30' 
                  : 'border-transparent hover:border-purple-500/50'
              }`}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-green-600 rounded-lg flex items-center justify-center">
                    <Wallet className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold">{t.methods.usdt.title}</h3>
                    <p className="text-sm text-gray-400">{t.methods.usdt.subtitle}</p>
                  </div>
                </div>
                {selectedMethod === 'usdt' && (
                  <div className="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center">
                    <Check className="h-4 w-4" />
                  </div>
                )}
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-gray-300">
                  <Shield className="h-4 w-4 text-green-400" />
                  <span>{t.am}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-300">
                  <Clock className="h-4 w-4 text-blue-400" />
                  <span>{t.fast}</span>
                </div>
              </div>
            </div>

            {/* PayPal */}
            <div 
              onClick={() => setSelectedMethod('paypal')}
              className={`relative bg-[#1f1237] rounded-2xl p-6 cursor-pointer transition-all duration-300 border-2 ${
                selectedMethod === 'paypal' 
                  ? 'border-purple-500 shadow-lg shadow-purple-500/30' 
                  : 'border-transparent hover:border-purple-500/50'
              }`}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded-lg flex items-center justify-center">
                    <CreditCard className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold">{t.methods.paypal.title}</h3>
                    <p className="text-sm text-gray-400">{t.methods.paypal.subtitle}</p>
                  </div>
                </div>
                {selectedMethod === 'paypal' && (
                  <div className="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center">
                    <Check className="h-4 w-4" />
                  </div>
                )}
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-gray-300">
                  <Shield className="h-4 w-4 text-green-400" />
                  <span>{t.buyer}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-300">
                  <Clock className="h-4 w-4 text-blue-400" />
                  <span>{t.inst}</span>
                </div>
              </div>
            </div>
          </div>

          {/* تفاصيل الدفع */}
          {selectedMethod && (
            <div className="bg-[#2a1b4a] rounded-2xl p-8 mb-8 animate-fadeIn">
              <h3 className="text-2xl font-semibold mb-6 text-center">
                {t.details} {selectedMethod === 'usdt' ? 'USDT' : 'PayPal'}
              </h3>

              {selectedMethod === 'usdt' ? (
                <div className="space-y-6">
                  {/* اختيار المبلغ */}
                  <div className="bg-[#1a0a33] rounded-lg p-4">
                    <label className="text-sm text-gray-400 block mb-3">
                      {language === 'ar' ? 'اختر المبلغ' : 'Select Amount'}
                    </label>
                    <div className="relative" ref={dropdownRef}>
                      <button
                        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                        className="w-full bg-[#2a1b4a] border-2 border-purple-500/30 hover:border-purple-500/50 rounded-xl px-4 py-3 flex items-center justify-between transition-all duration-200"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center">
                            <DollarSign className="h-5 w-5 text-white" />
                          </div>
                          <div className={isRTL ? "text-right" : "text-left"}>
                            <span className="text-xl font-bold text-green-400">
                              {selectedAmount} USDT
                            </span>
                            <p className="text-xs text-gray-400">
                              {priceOptions.find(opt => opt.value === selectedAmount)?.description}
                            </p>
                          </div>
                        </div>
                        <ChevronDown className={`h-5 w-5 text-gray-400 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} />
                      </button>
                      
                      {/* Dropdown Menu */}
                      {isDropdownOpen && (
                        <div className="absolute top-full left-0 right-0 mt-2 bg-[#2a1b4a] border-2 border-purple-500/30 rounded-xl overflow-hidden z-10">
                          {priceOptions.map((option) => (
                            <button
                              key={option.value}
                              onClick={() => {
                                setSelectedAmount(option.value)
                                setIsDropdownOpen(false)
                              }}
                              className={`w-full px-4 py-3 flex items-center justify-between hover:bg-purple-500/20 transition-colors ${
                                selectedAmount === option.value ? 'bg-purple-500/10' : ''
                              }`}
                            >
                              <div className="flex items-center gap-3">
                                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                                  selectedAmount === option.value 
                                    ? 'bg-gradient-to-br from-green-500 to-green-600' 
                                    : 'bg-[#1a0a33]'
                                }`}>
                                  <DollarSign className="h-5 w-5 text-white" />
                                </div>
                                <div className={isRTL ? "text-right" : "text-left"}>
                                  <span className={`font-bold ${
                                    selectedAmount === option.value ? 'text-green-400' : 'text-white'
                                  }`}>
                                    {option.value} USDT
                                  </span>
                                  <p className="text-xs text-gray-400">{option.description}</p>
                                </div>
                              </div>
                              {selectedAmount === option.value && (
                                <Check className="h-5 w-5 text-green-400" />
                              )}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* زر نسخ المبلغ */}
                  <div className="flex justify-center">
                    <button
                      onClick={() => copyToClipboard(selectedAmount, 'amount')}
                      className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 rounded-lg transition-all transform hover:scale-105"
                    >
                      {copiedAmount ? <Check className="h-5 w-5" /> : <Copy className="h-5 w-5" />}
                      <span className="font-medium">{copiedAmount ? t.copied : t.copy} المبلغ</span>
                    </button>
                  </div>

                  {/* عنوان المحفظة */}
                  <div className="bg-[#1a0a33] rounded-lg p-4">
                    <label className="text-sm text-gray-400 block mb-2">{t.walletLabel}</label>
                    <div className="flex items-center gap-3">
                      <input
                        type="text"
                        value={usdtAddress}
                        readOnly
                        className="flex-1 bg-transparent text-sm font-mono text-gray-300 outline-none"
                        dir="ltr"
                      />
                      <button
                        onClick={() => copyToClipboard(usdtAddress, 'address')}
                        className="flex items-center gap-2 px-3 py-1.5 bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors"
                      >
                        {copiedAddress ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                        <span className="text-sm">{copiedAddress ? t.copied : t.copy}</span>
                      </button>
                    </div>
                  </div>

                  {/* QR Code */}
                  <div className="text-center">
                    <div className="bg-white p-4 rounded-lg inline-block">
                      <div className="w-40 h-40 bg-gray-200 flex items-center justify-center text-gray-500">
                        [QR Code]
                      </div>
                    </div>
                    <p className="text-sm text-gray-400 mt-2">{t.qrNote}</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* اختيار المبلغ لـ PayPal */}
                  <div className="bg-[#1a0a33] rounded-lg p-4">
                    <label className="text-sm text-gray-400 block mb-3">
                      {language === 'ar' ? 'اختر المبلغ' : 'Select Amount'}
                    </label>
                    <div className="relative">
                      <button
                        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                        className="w-full bg-[#2a1b4a] border-2 border-purple-500/30 hover:border-purple-500/50 rounded-xl px-4 py-3 flex items-center justify-between transition-all duration-200"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                            <DollarSign className="h-5 w-5 text-white" />
                          </div>
                          <div className={isRTL ? "text-right" : "text-left"}>
                            <span className="text-xl font-bold text-blue-400">
                              ${selectedAmount} USD
                            </span>
                            <p className="text-xs text-gray-400">
                              {priceOptions.find(opt => opt.value === selectedAmount)?.description}
                            </p>
                          </div>
                        </div>
                        <ChevronDown className={`h-5 w-5 text-gray-400 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} />
                      </button>
                      
                      {/* Dropdown Menu */}
                      {isDropdownOpen && (
                        <div className="absolute top-full left-0 right-0 mt-2 bg-[#2a1b4a] border-2 border-purple-500/30 rounded-xl overflow-hidden z-10">
                          {priceOptions.map((option) => (
                            <button
                              key={option.value}
                              onClick={() => {
                                setSelectedAmount(option.value)
                                setIsDropdownOpen(false)
                              }}
                              className={`w-full px-4 py-3 flex items-center justify-between hover:bg-purple-500/20 transition-colors ${
                                selectedAmount === option.value ? 'bg-purple-500/10' : ''
                              }`}
                            >
                              <div className="flex items-center gap-3">
                                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                                  selectedAmount === option.value 
                                    ? 'bg-gradient-to-br from-blue-500 to-blue-600' 
                                    : 'bg-[#1a0a33]'
                                }`}>
                                  <DollarSign className="h-5 w-5 text-white" />
                                </div>
                                <div className={isRTL ? "text-right" : "text-left"}>
                                  <span className={`font-bold ${
                                    selectedAmount === option.value ? 'text-blue-400' : 'text-white'
                                  }`}>
                                    ${option.value} USD
                                  </span>
                                  <p className="text-xs text-gray-400">{option.description}</p>
                                </div>
                              </div>
                              {selectedAmount === option.value && (
                                <Check className="h-5 w-5 text-blue-400" />
                              )}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* إيميل PayPal */}
                  <div className="bg-[#1a0a33] rounded-lg p-4">
                    <label className="text-sm text-gray-400 block mb-2">{t.paypalLabel}</label>
                    <div className="flex items-center gap-3">
                      <span className="text-lg font-medium" dir="ltr">{paypalEmail}</span>
                      <button
                        onClick={() => copyToClipboard(paypalEmail, 'address')}
                        className="flex items-center gap-2 px-3 py-1.5 bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors"
                      >
                        <Copy className="h-4 w-4" />
                        <span className="text-sm">{t.copy}</span>
                      </button>
                    </div>
                  </div>

                  {/* زر PayPal */}
                  <div className="text-center">
                    <a
                      href={`https://paypal.me/yourusername/${selectedAmount}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
                    >
                      <ExternalLink className="h-5 w-5" />
                      <span>{t.payWithPaypal}</span>
                    </a>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* خطوات ما بعد الدفع */}
          <div className="bg-gradient-to-r from-purple-500/10 to-blue-500/10 rounded-2xl p-8 border border-purple-500/30">
            <h3 className="text-2xl font-semibold mb-6 text-center">
              <span className="bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                {afterPaymentT.title}
              </span>
            </h3>
            
            <div className="space-y-4">
              <div className="flex gap-4">
                <div className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="font-bold">1</span>
                </div>
                <div>
                  <h4 className="font-semibold mb-1">{afterPaymentT.step1Title}</h4>
                  <p className="text-gray-400 text-sm">
                    {afterPaymentT.step1Text}
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="font-bold">2</span>
                </div>
                <div>
                  <h4 className="font-semibold mb-1">{afterPaymentT.step2Title}</h4>
                  <p className="text-gray-400 text-sm">
                    {afterPaymentT.step2Text}
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="font-bold">3</span>
                </div>
                <div>
                  <h4 className="font-semibold mb-1">{afterPaymentT.step3Title}</h4>
                  <p className="text-gray-400 text-sm">
                    {afterPaymentT.step3Text} {telegramUsername}
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center flex-shrink-0">
                  <Check className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="font-semibold mb-1">{afterPaymentT.step4Title}</h4>
                  <p className="text-gray-400 text-sm">
                    {afterPaymentT.step4Text}
                  </p>
                </div>
              </div>
            </div>

            {/* زر التواصل عبر التلغرام */}
            <div className="text-center mt-8">
              <a
                href={`https://t.me/${telegramUsername.replace('@', '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 rounded-xl transition-all transform hover:scale-105"
              >
                <MessageCircle className="h-6 w-6" />
                <span className="text-lg font-semibold">{afterPaymentT.contactButton}</span>
              </a>
              <p className="text-sm text-gray-400 mt-3">
                {afterPaymentT.responseTime}
              </p>
            </div>
          </div>

          {/* معلومات إضافية */}
          <div className="grid md:grid-cols-3 gap-6 mt-12">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center mx-auto mb-3">
                <Shield className="h-8 w-8 text-white" />
              </div>
              <h4 className="font-semibold mb-2">
                {language === 'ar' ? 'دفع آمن 100%' : '100% Secure Payment'}
              </h4>
              <p className="text-sm text-gray-400">
                {language === 'ar' ? 'جميع المعاملات مشفرة ومحمية' : 'All transactions are encrypted and protected'}
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-3">
                <Clock className="h-8 w-8 text-white" />
              </div>
              <h4 className="font-semibold mb-2">
                {language === 'ar' ? 'تفعيل سريع' : 'Fast Activation'}
              </h4>
              <p className="text-sm text-gray-400">
                {language === 'ar' ? 'خلال 3 ساعات كحد أقصى' : 'Within 3 hours maximum'}
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-3">
                <MessageCircle className="h-8 w-8 text-white" />
              </div>
              <h4 className="font-semibold mb-2">
                {language === 'ar' ? 'دعم متواصل' : 'Continuous Support'}
              </h4>
              <p className="text-sm text-gray-400">
                {language === 'ar' ? 'فريق الدعم متاح للمساعدة' : 'Support team available to help'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}