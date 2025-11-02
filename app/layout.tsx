import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'JWT Auth App',
  description: 'Full-stack JWT authentication',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}

