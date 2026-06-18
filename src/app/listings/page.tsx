'use client'
import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@supabase/supabase-js'
import BottomNav from '@/components/BottomNav'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter, useSearchParams } from 'next/navigation'
import { Suspense } from 'react'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

const CATEGORY_LABELS: Record<string, string> = {
  horse: 'Конина', beef: 'Говядина', lamb: 'Баранина', chicken: 'Домашняя курица',
}
const CATEGORY_EMOJI: Record<string, string> = {
  horse: '🐴', beef: '🐄', lamb: '🐑', chicken: '🐓',
}
const FRESHNESS: Record<string, { label: string; color: string }> = {
  today:    { label: 'Режем сегодня', color: 'bg-[#7B1C2E] text-white' },
  tomorrow: { label: 'Режем завтра',  color: 'bg-[#C94558] text-white' },
  fresh:    { label: 'Свежий забой',  color: 'bg-[#1B5E20] text-[#E8F5E9]' },
}
const CITIES = ['Астана', 'Алматы', 'Шымкент', 'Атырау', 'Актобе', 'Тараз']
const WA_MSG = encodeURIComponent('Здравствуйте! Увидел ваше объявление в Soǵym. Подскажите, пожалуйста, ещё актуально?')

type Listing = {
  id: string
  title: string
  category: string
  price: number
  unit: string
  quantity: number
  city: string
  district: string | null
  delivery: boolean
  halal: boolean
  organic: boolean
  freshness: string | null
  photos: string[]
  seller: { name: string; phone: string; rating: number; reviews_count: number } | null
}

function ListingCard({ l }: { l: Listing }) {
  const fresh = l.freshness ? FRESHNESS[l.freshness] : null
  const photo = l.photos?.[0] ?? null
  const phone = l.seller?.phone?.replace(/\D/g, '') ?? ''

  return (
    <div className="bg-white rounded-xl border border-gray-100 overflow-hidden flex h-[114px]">
      <Link href={`/listing/${l.id}`} className="relative flex-shrink-0 bg-[#EDE5DC] flex items-center justify-center overflow-hidden" style={{ width: '42%' }}>
        {photo
          ? <Image src={photo} alt={l.title} fill className="object-cover" sizes="134px"/>
          : <span className="text-5xl">{CATEGORY_EMOJI[l.category]}</span>
        }
        {fresh && (
          <div className={`absolute bottom-0 left-0 right-0 py-[3px] text-center text-[9px] font-bold ${fresh.color}`}>
            {fresh.label}
          </div>
        )}
      </Link>
      <div className="flex-1 flex flex-col justify-between px-2.5 py-2 min-w-0">
        <div>
          <Link href={`/listing/${l.id}`}>
            <div className="text-[13px] font-bold text-gray-900 truncate">{l.title}</div>
            <div className="text-[15px] font-extrabold text-[#7B1C2E]">
              {l.price.toLocaleString()} ₸<span className="text-[10px] font-normal text-gray-400"> /{l.unit === 'kg' ? 'кг' : l.unit === 'piece' ? 'шт' : 'туша'}</span>
            </div>
          </Link>
        </div>
        <div className="flex flex-wrap gap-1 text-[10px] text-gray-500">
          <span>📦 {l.quantity} кг</span>
          <span>📍 {l.district ?? l.city}</span>
        </div>
        <div className="flex gap-1.5 text-[10px]">
          {l.delivery ? <span className="text-[#1B5E20] font-semibold">✓ Доставка</span> : <span className="text-gray-400">Самовывоз</span>}
          {l.halal && <span className="text-[#1B5E20] font-semibold">☪ Халал</span>}
          {l.organic && <span className="text-gray-500">🌿</span>}
        </div>
        <div className="flex items-center justify-between pt-[5px] border-t border-gray-100">
          <div className="flex items-center gap-1">
            <div className="w-[17px] h-[17px] rounded-full bg-[#F9F0F2] flex items-center justify-center text-[7px] font-bold text-[#7B1C2E]">
              {l.seller?.name?.slice(0, 2).toUpperCase() ?? '?'}
            </div>
            <span className="text-[10px] text-gray-500">{l.seller?.name?.split(' ')[0]}</span>
            {l.seller && (
              <span className="text-[10px] font-bold text-amber-800">
                ⭐ {l.seller.rating} <span className="text-gray-400 font-normal">({l.seller.reviews_count})</span>
              </span>
            )}
          </div>
          <a href={`https://wa.me/${phone}?text=${WA_MSG}`} onClick={e => e.stopPropagation()}
            className="w-6 h-6 bg-[#25D366] rounded-md flex items-center justify-center flex-shrink-0" aria-label="WhatsApp">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="white">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
            </svg>
          </a>
        </div>
      </div>
    </div>
  )
}

function ListingsInner() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [listings, setListings] = useState<Listing[]>([])
  const [loading, setLoading] = useState(true)
  const [city, setCity] = useState('Астана')
  const [category, setCategory] = useState(searchParams.get('category') ?? '')
  const [query, setQuery] = useState('')
  const [delivery, setDelivery] = useState(false)
  const [halal, setHalal] = useState(false)
  const [showCity, setShowCity] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    let q = supabase
      .from('listings')
      .select('*, seller:sellers(*)')
      .eq('status', 'active')
      .order('created_at', { ascending: false })
    if (category) q = q.eq('category', category)
    if (delivery) q = q.eq('delivery', true)
    if (halal) q = q.eq('halal', true)
    if (query) q = q.ilike('title', `%${query}%`)
    const { data } = await q
    setListings((data ?? []) as Listing[])
    setLoading(false)
  }, [category, delivery, halal, query])

  useEffect(() => { load() }, [load])

  return (
    <div className="min-h-screen pb-16 bg-[#F4F2EF]">
      {/* Topbar */}
      <div className="bg-white border-b border-gray-100 px-3 pt-3 pb-0 sticky top-0 z-40">
        <div className="flex items-center gap-2 mb-2">
          <button onClick={() => router.back()} className="w-8 h-8 flex items-center justify-center">
            <svg width="20" height="20" fill="none" stroke="#1A1A1A" strokeWidth="2" viewBox="0 0 24 24"><path d="m15 18-6-6 6-6"/></svg>
          </button>
          <div className="flex-1 flex items-center bg-gray-100 rounded-xl px-3 py-2 gap-2">
            <svg width="15" height="15" fill="none" stroke="#9CA3AF" strokeWidth="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
            <input type="text" placeholder="Мясо, продавец, район..."
              value={query} onChange={e => setQuery(e.target.value)}
              className="bg-transparent border-none outline-none text-[12px] text-gray-800 flex-1"/>
          </div>
        </div>
        <button onClick={() => setShowCity(true)} className="flex items-center gap-1 text-[12px] font-semibold text-gray-800 mb-2 ml-1">
          <svg width="11" height="14" viewBox="0 0 13 16" fill="none"><path d="M6.5 0C3.46 0 1 2.46 1 5.5c0 4.25 5.5 10.5 5.5 10.5S12 9.75 12 5.5C12 2.46 9.54 0 6.5 0zm0 7.5a2 2 0 110-4 2 2 0 010 4z" fill="#7B1C2E"/></svg>
          {city}
          <svg width="12" height="12" fill="none" stroke="#9CA3AF" strokeWidth="2" viewBox="0 0 24 24"><path d="m6 9 6 6 6-6"/></svg>
        </button>
        <div className="flex gap-2 overflow-x-auto pb-3" style={{ scrollbarWidth: 'none' }}>
          {[['', 'Все'], ...Object.entries(CATEGORY_LABELS)].map(([key, label]) => (
            <button key={key} onClick={() => setCategory(key)}
              className={`whitespace-nowrap rounded-full px-3 py-[5px] text-[12px] font-semibold border-none ${category === key ? 'bg-[#7B1C2E] text-white' : 'bg-gray-100 text-gray-700'}`}>
              {key && CATEGORY_EMOJI[key] + ' '}{label}
            </button>
          ))}
          <button onClick={() => setDelivery(d => !d)}
            className={`whitespace-nowrap rounded-full px-3 py-[5px] text-[12px] font-semibold border-none ${delivery ? 'bg-[#7B1C2E] text-white' : 'bg-gray-100 text-gray-700'}`}>
            🚚 Доставка
          </button>
          <button onClick={() => setHalal(h => !h)}
            className={`whitespace-nowrap rounded-full px-3 py-[5px] text-[12px] font-semibold border-none ${halal ? 'bg-[#7B1C2E] text-white' : 'bg-gray-100 text-gray-700'}`}>
            ☪ Халал
          </button>
        </div>
      </div>

      <div className="bg-white border-b border-gray-100 px-4 py-1.5 flex justify-between">
        <span className="text-[11px] text-gray-400">{listings.length} объявлений</span>
        <span className="text-[11px] text-[#7B1C2E] font-semibold">Сначала свежие</span>
      </div>

      <div className="px-3 pt-2 flex flex-col gap-2">
        {loading && [1,2,3,4].map(i => <div key={i} className="rounded-xl h-[114px] bg-gray-100 animate-pulse"/>)}
        {!loading && listings.length === 0 && <div className="text-center py-16 text-gray-400 text-sm">Объявлений не найдено</div>}
        {!loading && listings.map(l => <ListingCard key={l.id} l={l}/>)}
      </div>

      {showCity && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-end" onClick={() => setShowCity(false)}>
          <div className="bg-white w-full rounded-t-2xl p-5 max-w-[480px] mx-auto" onClick={e => e.stopPropagation()}>
            <div className="w-9 h-1 bg-gray-200 rounded mx-auto mb-4"/>
            <div className="text-[16px] font-bold mb-3">Выберите город</div>
            {CITIES.map(c => (
              <button key={c} onClick={() => { setCity(c); setShowCity(false) }}
                className={`w-full text-left px-3 py-3 rounded-xl text-[14px] flex justify-between ${c === city ? 'font-bold text-[#7B1C2E]' : 'text-gray-800'}`}>
                {c}
                {c === city && <svg width="16" height="16" fill="none" stroke="#7B1C2E" strokeWidth="2.5" viewBox="0 0 24 24"><path d="m20 6-11 11-5-5"/></svg>}
              </button>
            ))}
          </div>
        </div>
      )}
      <BottomNav/>
    </div>
  )
}

export default function ListingsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#F4F2EF] flex items-center justify-center text-gray-400">Загрузка...</div>}>
      <ListingsInner/>
    </Suspense>
  )
}
