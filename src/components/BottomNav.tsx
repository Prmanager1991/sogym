'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function BottomNav() {
  const path = usePathname()
  const active = (href: string) =>
    path === href ? 'text-burgundy' : 'text-gray-400'

  return (
    <nav className="fixed bottom-0 left-0 right-0 max-w-[480px] mx-auto bg-white border-t border-gray-100 grid grid-cols-4 h-14 z-50">
      <Link href="/" className={`flex flex-col items-center justify-center gap-0.5 text-[10px] font-medium ${active('/')}`}>
        <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.6" viewBox="0 0 24 24">
          <path d="M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1H4a1 1 0 01-1-1V9.5z"/><path d="M9 21V12h6v9"/>
        </svg>
        Главная
      </Link>
      <Link href="/listings" className={`flex flex-col items-center justify-center gap-0.5 text-[10px] font-medium ${active('/listings')}`}>
        <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.6" viewBox="0 0 24 24">
          <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
        </svg>
        Поиск
      </Link>
      <Link href="/create" className="flex flex-col items-center justify-center">
        <div className="bg-burgundy w-[38px] h-[38px] rounded-xl flex items-center justify-center -mt-2">
          <svg width="20" height="20" fill="none" stroke="white" strokeWidth="2.2" viewBox="0 0 24 24">
            <path d="M12 5v14M5 12h14"/>
          </svg>
        </div>
      </Link>
      <Link href="/profile" className={`flex flex-col items-center justify-center gap-0.5 text-[10px] font-medium ${active('/profile')}`}>
        <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.6" viewBox="0 0 24 24">
          <circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
        </svg>
        Профиль
      </Link>
    </nav>
  )
}
