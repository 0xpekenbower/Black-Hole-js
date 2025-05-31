import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import './globals.css'
import { LangProviderSSR } from '@/context/langContext'
import { ThemeProvider } from '@/context/themeContext'
import Header from '@/components/header'
import { headers } from 'next/headers'
import ThemeScript from './theme-script'
import { AuthProvider } from '@/context/AuthContext'

// const geistSans = Geist({
//   variable: '--font-geist-sans',
//   subsets: ['latin'],
// })

// const geistMono = Geist_Mono({
//   variable: '--font-geist-mono',
//   subsets: ['latin'],
// })

export const metadata: Metadata = {
  title: 'BlackHole.Js',
  description: 'A blazing fast web experience',
}

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const headersList = await headers()
  const acceptLang = headersList.get('accept-language') || 'en'
  const initialLang = acceptLang.startsWith('fr') ? 'fr' : 'en'

  return (
    <html lang={initialLang} className="no-scrollbar" suppressHydrationWarning>
      <head>
        <ThemeScript />
      </head>
      {/* ${geistSans.variable} ${geistMono.variable} */}
      <body suppressHydrationWarning className="antialiased no-scrollbar">
        <ThemeProvider>
          <LangProviderSSR initialLang={initialLang}>
            <AuthProvider>
              <Header />
              {children}
            </AuthProvider>
          </LangProviderSSR>
        </ThemeProvider>
      </body>
    </html>
  )
}
