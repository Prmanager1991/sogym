import { supabase, Seller, Listing } from '@/lib/supabase'
import ListingCard from '@/components/ListingCard'
import BottomNav from '@/components/BottomNav'
import Link from 'next/link'
import { notFound } from 'next/navigation'

export const revalidate = 60

async function getSeller(id: string) {
  const [{ data: seller }, { data: listings }, { data: reviews }] = await Promise.all([
    supabase.from('sellers').select('*').eq('id', id).single(),
    supabase.from('listings').select('*, seller:sellers(*)').eq('seller_id', id).eq('status', 'active'),
    supabase.from('reviews').select('*').eq('seller_id', id).order('created_at', { ascending: false }),
  ])
  return { seller: seller as Seller | null, listings: (listings ?? []) as Listing[], reviews: reviews ?? [] }
}

export default async function SellerProfilePage({ params }: { params: { id: string } }) {
  const { seller, listings, reviews } = await getSeller(params.id)
  if (!seller) return notFound()

  return (
    <div className="min-h-screen bg-[#F4F2EF] pb-16">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-4 pt-3 pb-4 sticky top-0 z-40">
        <div className="flex items-center gap-3 mb-1">
          <Link href="/listings">
            <svg width="22" height="22" fill="none" stroke="#1A1A1A" strokeWidth="2" viewBox="0 0 24 24"><path d="m15 18-6-6 6-6"/></svg>
          </Link>
          <span className="text-[15px] font-bold text-gray-900">Профиль продавца</span>
        </div>
      </div>

      <div className="bg-white px-4 py-4 border-b border-gray-100">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-16 h-16 rounded-full bg-[#F9F0F2] flex items-center justify-center text-2xl font-bold text-burgundy">
            {seller.name.slice(0, 2).toUpperCase()}
          </div>
          <div>
            <div className="text-[18px] font-bold text-gray-900">{seller.name}</div>
            <div className="text-[12px] text-gray-500">📍 {seller.city}{seller.district ? `, ${seller.district}` : ''}</div>
            <div className="text-[11px] text-gray-400 mt-0.5">На сайте с {new Date(seller.created_at).getFullYear()}</div>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {[
            { val: `⭐ ${seller.rating}`, label: 'Рейтинг' },
            { val: seller.reviews_count, label: 'Отзывов' },
            { val: listings.length, label: 'Объявлений' },
          ].map(s => (
            <div key={s.label} className="bg-gray-50 rounded-xl py-2.5 text-center">
              <div className="text-[16px] font-bold text-gray-900">{s.val}</div>
              <div className="text-[10px] text-gray-500 mt-0.5">{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Listings */}
      {listings.length > 0 && (
        <div className="px-3 pt-3">
          <div className="text-[13px] font-semibold text-gray-500 uppercase tracking-wide mb-2 px-1">Объявления</div>
          <div className="flex flex-col gap-2">
            {listings.map(l => <ListingCard key={l.id} listing={l}/>)}
          </div>
        </div>
      )}

      {/* Reviews */}
      <div className="px-4 pt-4">
        <div className="text-[13px] font-semibold text-gray-500 uppercase tracking-wide mb-3">
          Отзывы ({reviews.length})
        </div>
        {reviews.length === 0 && <div className="text-[13px] text-gray-400">Пока нет отзывов</div>}
        {reviews.map((r: { id: string; reviewer_name: string; rating: number; text?: string; created_at: string }) => (
          <div key={r.id} className="bg-white rounded-xl p-3 mb-2 border border-gray-100">
            <div className="flex items-center gap-2 mb-1.5">
              <div className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center text-[10px] font-bold text-gray-600">
                {r.reviewer_name.slice(0, 2).toUpperCase()}
              </div>
              <div>
                <div className="text-[12px] font-semibold text-gray-800">{r.reviewer_name}</div>
                <div className="text-[11px] text-amber-500">{'⭐'.repeat(r.rating)}</div>
              </div>
              <div className="ml-auto text-[10px] text-gray-400">
                {new Date(r.created_at).toLocaleDateString('ru-RU')}
              </div>
            </div>
            {r.text && <p className="text-[12px] text-gray-600 leading-relaxed">{r.text}</p>}
          </div>
        ))}
      </div>

      <BottomNav/>
    </div>
  )
}
