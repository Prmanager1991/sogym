import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Soǵym — домашнее мясо напрямую от хозяина',
  description: 'Покупайте домашнее мясо напрямую от хозяина. Конина, говядина, баранина, домашняя курица.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru">
      <body>{children}</body>
    </html>
  )
}
