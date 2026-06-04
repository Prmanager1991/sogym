'use client'
import { useState, useEffect } from 'react'
import { supabase, Listing, Seller } from '@/lib/supabase'
import BottomNav from '@/components/BottomNav'
import ListingCard from '@/components/ListingCard'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function MyProfilePage() {
  const router = useRouter()
  const [phone, setPhone] = useState('')
  const [seller, setSeller] = useState<Seller | null>(null)
  const [listings, setListings] = useState<Listing[]>([])
  const [tab, setTab] = useState<'active' | 'sold' | 'archived'>('active')
  const [loading, setLoading] = useState(false)
  const [loginStep, setLoginStep] = useState<'phone' | 'done'>('phone')

  async function login() {
    if (!phone) return
    setLoading(true)
    const clean = phone.replace(/\D/g, '')
    const { data } = await supabase.from('sellers').select('*').eq('phone', clean).single()
    if (data) { setSeller(data); setLoginStep('done'); loadListings(data.id) }
    else setLoading(false)
    setLoading(false)
  }

  async function loadListings(sellerId: string) {
    const { data } = await supabase
      .from('listings').select('*, seller:sellers(*)')
      .eq('seller_id', sellerId).order('created_at', { ascending: false })
    setListings((data ?? []) as Listing[])
  }

  async function changeStatus(id: string, status: 'active' | 'sold' | 'archived') {
    await supabase.from('listings').update({ status }).eq('id', id)
    setListings(l => l.map(x => x.id === id ? { ...x, status } : x))
  }

  const filtered = listings.filter(l => l.status === tab)

  if (!seller) {
    return (
      <div className="min-h-screen bg-[#F4F2EF] pb-16 flex flex-col">
        <div className="bg-white border-b border-gray-100 px-4 py-3 flex items-center gap-3">
          <span className="text-[17px] font-extrabold text-burgundy">Soǵym</span>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center px-6 text-center">
          <div className="text-4xl mb-4">👤</div>
          <h2 className="text-[18px] font-bold text-gray-900 mb-2">Войти как продавец</h2>
          <p className="text-[13px] text-gray-500 mb-6">Покупатели могут смотреть объявления без входа</p>
          <div className="w-full flex flex-col gap-3">
            <div className="flex border border-gray-200 rounded-xl overflow-hidden bg-white">
              <span className="px-3 py-3 bg-gray-50 text-[13px] font-semibold text-gray-500 border-r border-gray-200">🇰🇿 +7</span>
              <input
                type="tel"
                placeholder="777 123 45 67"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                className="flex-1 px-3 py-3 text-[14px] outline-none"
                onKeyDown={e => e.key === 'Enter' && login()}
              />
            </div>
            <button onClick={login} disabled={loading} className="btn-burgundy text-[15px]">
              {loading ? 'Ищем...' : 'Найти мой профиль'}
            </button>
            <Link href="/create" className="btn-outline text-[15px] text-center no-underline">
              + Создать объявление
            </Link>
          </div>
        </div>
        <BottomNav/>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#F4F2EF] pb-16">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-4 py-4">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-14 h-14 rounded-full bg-[#F9F0F2] flex items-center justify-center text-xl font-bold text-burgundy">
            {seller.name.slice(0, 2).toUpperCase()}
          </div>
          <div className="flex-1">
            <div className="text-[17px] font-bold text-gray-900">{seller.name}</div>
            <div className="text-[12px] text-gray-500">{seller.phone} · {seller.city}</div>
            <div className="text-[11px] text-gray-400 mt-0.5">На сайте с {new Date(seller.created_at).getFullYear()}</div>
          </div>
          <button onClick={() => setSeller(null)} className="text-[12px] text-gray-400">Выйти</button>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {[
            { val: `⭐ ${seller.rating}`, label: 'Рейтинг' },
            { val: seller.reviews_count, label: 'Отзывов' },
            { val: listings.filter(l => l.status === 'active').length, label: 'Активных' },
          ].map(s => (
            <div key={s.label} className="bg-gray-50 rounded-xl py-2.5 text-center">
              <div className="text-[16px] font-bold text-gray-900">{s.val}</div>
              <div className="text-[10px] text-gray-500 mt-0.5">{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Add button */}
      <div className="px-4 pt-3 pb-2">
        <Link href="/create" className="btn-burgundy text-[14px]">+ Добавить объявление</Link>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b border-gray-100 flex">
        {([['active','Активные'],['sold','Продано'],['archived','Архив']] as const).map(([k, l]) => (
          <button key={k} onClick={() => setTab(k)}
            className={`flex-1 py-3 text-[13px] font-semibold border-b-2 transition-colors ${tab === k ? 'border-burgundy text-burgundy' : 'border-transparent text-gray-400'}`}>
            {l} ({listings.filter(x => x.status === k).length})
          </button>
        ))}
      </div>

      {/* Listings */}
      <div className="px-3 pt-3 flex flex-col gap-2">
        {filtered.length === 0 && (
          <div className="text-center py-12 text-gray-400 text-sm">Нет объявлений</div>
        )}
        {filtered.map(l => (
          <div key={l.id}>
            <ListingCard listing={l}/>
            <div className="flex gap-2 mt-1.5 px-1">
              <button onClick={() => router.push(`/listing/${l.id}`)}
                className="flex-1 text-[11px] py-1.5 border border-gray-200 rounded-lg text-gray-600 bg-white">Открыть</button>
              {l.status === 'active' && <>
                <button onClick={() => changeStatus(l.id, 'sold')}
                  className="flex-1 text-[11px] py-1.5 border border-gray-200 rounded-lg text-gray-600 bg-white">Продано</button>
                <button onClick={() => changeStatus(l.id, 'archived')}
                  className="flex-1 text-[11px] py-1.5 border border-gray-200 rounded-lg text-gray-600 bg-white">Скрыть</button>
              </>}
              {l.status !== 'active' && (
                <button onClick={() => changeStatus(l.id, 'active')}
                  className="flex-1 text-[11px] py-1.5 border border-burgundy rounded-lg text-burgundy bg-white">Активировать</button>
              )}
            </div>
          </div>
        ))}
      </div>
      <BottomNav/>
    </div>
  )
}
