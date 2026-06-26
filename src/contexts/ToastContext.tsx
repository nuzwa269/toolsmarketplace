'use client'

import { createContext, useContext, useState, useCallback, ReactNode } from 'react'

type ToastType = 'success' | 'warning' | 'error' | 'info'

interface Toast {
  id: number
  message: string
  type: ToastType
}

interface ToastContextType {
  show: (message: string, type?: ToastType) => void
  toasts: Toast[]
}

const ToastContext = createContext<ToastContextType | null>(null)

let nextId = 0

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const show = useCallback((message: string, type: ToastType = 'info') => {
    const id = ++nextId
    setToasts(prev => [...prev, { id, message, type }])
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3000)
  }, [])

  return (
    <ToastContext.Provider value={{ show, toasts }}>
      {children}
      <div className="fixed bottom-6 left-6 z-[9999] flex flex-col gap-2">
        {toasts.map(toast => {
          const icons: Record<ToastType, string> = {
            success: 'fas fa-check-circle text-emerald-400',
            warning: 'fas fa-exclamation-triangle text-amber-400',
            error: 'fas fa-times-circle text-red-400',
            info: 'fas fa-info-circle text-blue-400'
          }
          return (
            <div key={toast.id} className="flex items-center gap-3 px-5 py-3 rounded-xl border shadow-2xl animate-slide-in" style={{background:'var(--card)',borderColor:'var(--border)',color:'var(--fg)'}}>
              <i className={icons[toast.type]}></i>
              <span className="text-sm">{toast.message}</span>
            </div>
          )
        })}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be inside ToastProvider')
  return ctx
}
