import { supabase, Listing, CATEGORY_LABELS, CATEGORY_EMOJI } from '@/lib/supabase'
import BottomNav from '@/components/BottomNav'
import ListingCard from '@/components/ListingCard'
import Link from 'next/link'

export const revalidate = 60

async function getListings(): Promise<Listing[]> {
  const { data } = await supabase
    .from('listings')
    .select('*, seller:sellers(*)')
    .eq('status', 'active')
    .order('created_at', { ascending: false })
    .limit(6)
  return (data ?? []) as Listing[]
}

export default async function HomePage() {
  const listings = await getListings()

  return (
    <div className="min-h-screen pb-16">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-4 pt-3 pb-0">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1 text-[13px] font-bold text-gray-900">
            <svg width="13" height="16" viewBox="0 0 13 16" fill="none">
              <path d="M6.5 0C3.46 0 1 2.46 1 5.5c0 4.25 5.5 10.5 5.5 10.5S12 9.75 12 5.5C12 2.46 9.54 0 6.5 0zm0 7.5a2 2 0 110-4 2 2 0 010 4z" fill="#7B1C2E"/>
            </svg>
            Астана
            <svg width="12" height="12" fill="none" stroke="#9CA3AF" strokeWidth="2" viewBox="0 0 24 24"><path d="m6 9 6 6 6-6"/></svg>
          </div>
          <span className="text-[17px] font-extrabold text-burgundy tracking-tight">Soǵym</span>
          <div className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center">
            <svg width="15" height="15" fill="none" stroke="#6B7280" strokeWidth="1.8" viewBox="0 0 24 24">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/>
            </svg>
          </div>
        </div>

        {/* Search */}
        <Link href="/listings" className="flex items-center bg-gray-100 rounded-xl px-3 py-2 gap-2 mb-3">
          <svg width="15" height="15" fill="none" stroke="#9CA3AF" strokeWidth="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
          <span className="text-[12px] text-gray-400">Мясо, продавец, район...</span>
        </Link>

        {/* Categories */}
        <div className="flex gap-2 overflow-x-auto pb-3 scrollbar-hide">
          <Link href="/listings" className="whitespace-nowrap bg-burgundy text-white rounded-full px-3 py-[5px] text-[12px] font-semibold">Все</Link>
          {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
            <Link key={key} href={`/listings?category=${key}`}
              className="whitespace-nowrap bg-gray-100 text-gray-700 rounded-full px-3 py-[5px] text-[12px] font-semibold flex items-center gap-1">
              {CATEGORY_EMOJI[key]} {label}
            </Link>
          ))}
        </div>
      </div>

      {/* Hero */}
      <div className="bg-[#7B1C2E] px-4 py-5">
        <h1 className="text-white text-xl font-extrabold mb-0.5">Soǵym</h1>
        <p className="text-white/80 text-[13px]">Домашнее мясо напрямую от хозяина</p>
      </div>

      {/* Fresh listings */}
      <div className="px-3 pt-3">
        <div className="flex items-center justify-between mb-2.5">
          <span className="text-[14px] font-bold text-gray-900">Свежие объявления</span>
          <Link href="/listings" className="text-[12px] text-burgundy font-semibold">Все →</Link>
        </div>
        <div className="flex flex-col gap-2">
          {listings.length === 0 && (
            <div className="text-center py-10 text-gray-400 text-sm">Пока нет объявлений</div>
          )}
          {listings.map(l => <ListingCard key={l.id} listing={l}/>)}
        </div>
      </div>

      <BottomNav/>
    </div>
  )
}
