import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Earnify',
  description: 'AI-powered labor marketplace connecting workers with clients in Bangladesh',
  icons: {
    icon: '/Earnify-Logo - Copy.png',
    shortcut: '/Earnify-Logo.png',
    apple: '/Earnify-Logo.png',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
