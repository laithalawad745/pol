import { toast, ToastOptions } from 'react-toastify'

// إعدادات افتراضية - Dark Mode + يمين الصفحة
const defaultOptions: ToastOptions = {
  position: "top-right",
  autoClose: 3000,
  hideProgressBar: false,
  closeOnClick: true,
  pauseOnHover: true,
  draggable: true,
  rtl: true,
  theme: "dark"
}

export const useToast = () => {
  // رسائل النجاح
  const success = (message: string, options?: ToastOptions) => {
    return toast.success(message, { ...defaultOptions, ...options })
  }

  // رسائل الخطأ
  const error = (message: string, options?: ToastOptions) => {
    return toast.error(message, { ...defaultOptions, ...options })
  }

  // رسائل المعلومات
  const info = (message: string, options?: ToastOptions) => {
    return toast.info(message, { ...defaultOptions, ...options })
  }

  // رسائل التحذير
  const warning = (message: string, options?: ToastOptions) => {
    return toast.warning(message, { ...defaultOptions, ...options })
  }

  // رسالة تحميل
  const loading = (message: string = 'جاري التحميل...') => {
    return toast.loading(message, {
      rtl: true,
      position: "top-center"
    })
  }

  // رسالة مع Promise
  const promise = <T,>(
    promise: Promise<T>,
    messages: {
      pending?: string
      success?: string | ((data: T) => string)
      error?: string | ((error: any) => string)
    },
    options?: ToastOptions
  ) => {
    const toastMessages: any = {
      pending: messages.pending || 'جاري المعالجة...',
      success: messages.success || 'تمت العملية بنجاح ✅',
      error: messages.error || 'حدث خطأ ❌'
    }
    
    return toast.promise(
      promise,
      toastMessages,
      { ...defaultOptions, ...options }
    )
  }

  // إغلاق toast معين
  const dismiss = (toastId?: string | number) => {
    toast.dismiss(toastId)
  }

  // إغلاق جميع toasts
  const dismissAll = () => {
    toast.dismiss()
  }

  // تحديث toast موجود
  const update = (toastId: string | number, options: any) => {
    toast.update(toastId, options)
  }

  return {
    success,
    error,
    info,
    warning,
    loading,
    promise,
    dismiss,
    dismissAll,
    update
  }
}