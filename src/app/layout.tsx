import type { Metadata } from 'next'
import './globals.css'
import { LanguageProvider } from '@/contexts/LanguageContext'
import { ThemeProvider } from '@/contexts/ThemeContext'
import { CartProvider } from '@/contexts/CartContext'
import { AuthProvider } from '@/contexts/AuthContext'
import { ToastProvider } from '@/contexts/ToastContext'

export const metadata: Metadata = {
  title: 'StudentCraft — Student Marketplace',
  description: 'Sell your extensions, apps, tools and websites. Built by students, for students.'
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ur" dir="rtl">
      <body>
        <AuthProvider>
          <LanguageProvider>
            <ThemeProvider>
              <CartProvider>
                <ToastProvider>
                  {children}
                </ToastProvider>
              </CartProvider>
            </ThemeProvider>
          </LanguageProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
