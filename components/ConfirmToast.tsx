import { toast } from 'react-toastify'

interface ConfirmToastProps {
  message: string
  subMessage?: string
  onConfirm: () => void | Promise<void>
  confirmText?: string
  cancelText?: string
  confirmStyle?: 'danger' | 'warning' | 'success'
}

export const confirmToast = ({
  message,
  subMessage,
  onConfirm,
  confirmText = 'تأكيد',
  cancelText = 'إلغاء',
  confirmStyle = 'danger'
}: ConfirmToastProps) => {
  const styles = {
    danger: 'bg-red-600 hover:bg-red-700',
    warning: 'bg-amber-600 hover:bg-amber-700',
    success: 'bg-emerald-600 hover:bg-emerald-700'
  }

  toast(
    <div className="text-sm text-white">
      <p className="font-medium text-white">{message}</p>
      {subMessage && (
        <p className="text-xs mt-1 text-gray-300">{subMessage}</p>
      )}
      <div className="flex gap-2 mt-3">
        <button
          onClick={async () => {
            toast.dismiss()
            await onConfirm()
          }}
          className={`px-3 py-1.5 text-white rounded-lg text-xs font-medium transition-all ${styles[confirmStyle]} shadow-lg`}
        >
          {confirmText}
        </button>
        <button
          onClick={() => toast.dismiss()}
          className="px-3 py-1.5 bg-gray-600 hover:bg-gray-700 text-white rounded-lg text-xs font-medium transition-all shadow-lg"
        >
          {cancelText}
        </button>
      </div>
    </div>,
    {
      autoClose: false,
      closeButton: false,
      draggable: false,
      closeOnClick: false,
      theme: "dark",
      position: "top-right",
      rtl: true
    }
  )
}

// دالة مساعدة للإشعارات المتقدمة
export const showToast = {
  success: (message: string, options?: any) => 
    toast.success(message, { theme: "dark", position: "top-right", rtl: true, ...options }),
    
  error: (message: string, options?: any) => 
    toast.error(message, { theme: "dark", position: "top-right", rtl: true, ...options }),
    
  info: (message: string, options?: any) => 
    toast.info(message, { theme: "dark", position: "top-right", rtl: true, ...options }),
    
  warning: (message: string, options?: any) => 
    toast.warning(message, { theme: "dark", position: "top-right", rtl: true, ...options }),
    
  loading: (message: string = 'جاري التحميل...') => 
    toast.loading(message, { theme: "dark", position: "top-right", rtl: true }),
    
  promise: <T,>(
    promise: Promise<T>,
    messages: {
      pending?: string
      success?: string | ((data: T) => string)
      error?: string | ((error: any) => string)
    }
  ) => {
    const toastMessages: any = {
      pending: messages.pending || 'جاري المعالجة...',
      success: messages.success || 'تمت العملية بنجاح ✅',
      error: messages.error || 'حدث خطأ ❌'
    };
    
    return toast.promise(promise, toastMessages, {
      theme: "dark",
      position: "top-right",
      rtl: true
    });
  }
}