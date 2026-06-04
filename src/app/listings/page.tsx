'use client'
import { useEffect, useState, useCallback } from 'react'
import { supabase, Listing, CATEGORY_LABELS, CATEGORY_EMOJI } from '@/lib/supabase'
import BottomNav from '@/components/BottomNav'
import ListingCard from '@/components/ListingCard'
import { useSearchParams, useRouter } from 'next/navigation'

const CITIES = ['Астана', 'Алматы', 'Шымкент', 'Атырау', 'Актобе', 'Тараз']

export default function ListingsPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
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
            <input
              type="text"
              placeholder="Мясо, продавец, район..."
              value={query}
              onChange={e => setQuery(e.target.value)}
              className="bg-transparent border-none outline-none text-[12px] text-gray-800 flex-1"
            />
          </div>
        </div>

        {/* City selector */}
        <button
          onClick={() => setShowCity(true)}
          className="flex items-center gap-1 text-[12px] font-semibold text-gray-800 mb-2 ml-1"
        >
          <svg width="11" height="14" viewBox="0 0 13 16" fill="none"><path d="M6.5 0C3.46 0 1 2.46 1 5.5c0 4.25 5.5 10.5 5.5 10.5S12 9.75 12 5.5C12 2.46 9.54 0 6.5 0zm0 7.5a2 2 0 110-4 2 2 0 010 4z" fill="#7B1C2E"/></svg>
          {city}
          <svg width="12" height="12" fill="none" stroke="#9CA3AF" strokeWidth="2" viewBox="0 0 24 24"><path d="m6 9 6 6 6-6"/></svg>
        </button>

        {/* Category chips */}
        <div className="flex gap-2 overflow-x-auto pb-3 scrollbar-hide">
          {[['', 'Все'], ...Object.entries(CATEGORY_LABELS)].map(([key, label]) => (
            <button key={key} onClick={() => setCategory(key)}
              className={`whitespace-nowrap rounded-full px-3 py-[5px] text-[12px] font-semibold border-none ${
                category === key ? 'bg-burgundy text-white' : 'bg-gray-100 text-gray-700'
              }`}>
              {key && CATEGORY_EMOJI[key]+' '}{label}
            </button>
          ))}
          <button onClick={() => setDelivery(d => !d)}
            className={`whitespace-nowrap rounded-full px-3 py-[5px] text-[12px] font-semibold border-none ${delivery ? 'bg-burgundy text-white' : 'bg-gray-100 text-gray-700'}`}>
            🚚 Доставка
          </button>
          <button onClick={() => setHalal(h => !h)}
            className={`whitespace-nowrap rounded-full px-3 py-[5px] text-[12px] font-semibold border-none ${halal ? 'bg-burgundy text-white' : 'bg-gray-100 text-gray-700'}`}>
            ☪ Халал
          </button>
        </div>
      </div>

      {/* Sort bar */}
      <div className="bg-white border-b border-gray-100 px-4 py-1.5 flex justify-between items-center">
        <span className="text-[11px] text-gray-400">{listings.length} объявлений</span>
        <span className="text-[11px] text-burgundy font-semibold">Сначала свежие</span>
      </div>

      {/* Feed */}
      <div className="px-3 pt-2 flex flex-col gap-2">
        {loading && (
          <div className="flex flex-col gap-2">
            {[1,2,3,4].map(i => (
              <div key={i} className="card h-[114px] animate-pulse bg-gray-100"/>
            ))}
          </div>
        )}
        {!loading && listings.length === 0 && (
          <div className="text-center py-16 text-gray-400 text-sm">Объявлений не найдено</div>
        )}
        {!loading && listings.map(l => <ListingCard key={l.id} listing={l}/>)}
      </div>

      {/* City sheet */}
      {showCity && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-end" onClick={() => setShowCity(false)}>
          <div className="bg-white w-full rounded-t-2xl p-5 max-w-[480px] mx-auto" onClick={e => e.stopPropagation()}>
            <div className="w-9 h-1 bg-gray-200 rounded mx-auto mb-4"/>
            <div className="text-[16px] font-bold mb-3">Выберите город</div>
            {CITIES.map(c => (
              <button key={c} onClick={() => { setCity(c); setShowCity(false) }}
                className={`w-full text-left px-3 py-3 rounded-xl text-[14px] flex justify-between items-center ${c === city ? 'font-bold text-burgundy' : 'text-gray-800'}`}>
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
