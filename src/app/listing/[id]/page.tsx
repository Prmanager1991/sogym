import { supabase, Listing, CATEGORY_LABELS, FRESHNESS_LABELS, waLink } from '@/lib/supabase'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'

export const revalidate = 60

async function getListing(id: string): Promise<Listing | null> {
  const { data } = await supabase
    .from('listings')
    .select('*, seller:sellers(*)')
    .eq('id', id)
    .single()
  return data as Listing | null
}

export default async function ListingPage({ params }: { params: { id: string } }) {
  const listing = await getListing(params.id)
  if (!listing) return notFound()

  const fresh = listing.freshness ? FRESHNESS_LABELS[listing.freshness] : null
  const wa = waLink(listing.seller?.phone ?? '')

  return (
    <div className="min-h-screen bg-[#F4F2EF] pb-28">
      {/* Photo */}
      <div className="relative h-64 bg-[#EDE5DC] flex items-center justify-center">
        {listing.photos?.[0] ? (
          <Image src={listing.photos[0]} alt={listing.title} fill className="object-cover"/>
        ) : (
          <span className="text-8xl">{['🐴','🐄','🐑','🐓'][['horse','beef','lamb','chicken'].indexOf(listing.category)] ?? '🥩'}</span>
        )}
        <Link href="/listings" className="absolute top-3 left-3 w-9 h-9 bg-white/90 rounded-full flex items-center justify-center shadow-sm">
          <svg width="20" height="20" fill="none" stroke="#1A1A1A" strokeWidth="2" viewBox="0 0 24 24"><path d="m15 18-6-6 6-6"/></svg>
        </Link>
        {fresh && (
          <div className={`absolute bottom-0 left-0 right-0 py-1.5 text-center text-[11px] font-bold ${fresh.color}`}>
            {fresh.label}
          </div>
        )}
      </div>

      <div className="px-4 pt-4">
        {/* Title & price */}
        <h1 className="text-[20px] font-extrabold text-gray-900">{listing.title}</h1>
        <div className="text-[24px] font-extrabold text-burgundy mt-0.5 mb-3">
          {listing.price.toLocaleString()} ₸
          <span className="text-[14px] font-normal text-gray-400">/{listing.unit === 'kg' ? 'кг' : listing.unit === 'piece' ? 'шт' : 'туша'}</span>
        </div>

        {/* Chips */}
        <div className="flex flex-wrap gap-1.5 mb-4">
          <span className="bg-gray-100 text-gray-600 rounded-full px-3 py-1 text-[11px] font-semibold">
            {CATEGORY_LABELS[listing.category]}
          </span>
          <span className="bg-gray-100 text-gray-600 rounded-full px-3 py-1 text-[11px] font-semibold">
            📦 {listing.quantity} кг
          </span>
          <span className="bg-gray-100 text-gray-600 rounded-full px-3 py-1 text-[11px] font-semibold">
            📍 {listing.city}{listing.district ? `, ${listing.district}` : ''}
          </span>
          {listing.delivery && <span className="bg-green-50 text-green-800 rounded-full px-3 py-1 text-[11px] font-semibold">✓ Доставка</span>}
          {listing.halal && <span className="bg-green-50 text-green-800 rounded-full px-3 py-1 text-[11px] font-semibold">☪ Халал</span>}
          {listing.organic && <span className="bg-green-50 text-green-800 rounded-full px-3 py-1 text-[11px] font-semibold">🌿 Домашний откорм</span>}
        </div>

        {/* Description */}
        {listing.description && (
          <div className="mb-4">
            <div className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide mb-1.5">Описание</div>
            <p className="text-[14px] text-gray-600 leading-relaxed">{listing.description}</p>
          </div>
        )}

        {/* Seller */}
        {listing.seller && (
          <div className="mb-4">
            <div className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide mb-1.5">Продавец</div>
            <Link href={`/profile/${listing.seller.id}`} className="bg-white rounded-xl p-3 flex items-center gap-3 border border-gray-100">
              <div className="w-12 h-12 rounded-full bg-[#F9F0F2] flex items-center justify-center text-[18px] font-bold text-burgundy flex-shrink-0">
                {listing.seller.name.slice(0, 2).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[14px] font-bold text-gray-900">{listing.seller.name}</div>
                <div className="text-[12px] text-gray-500">📍 {listing.seller.city}</div>
                <div className="text-[12px] text-amber-800 font-semibold mt-0.5">
                  ⭐ {listing.seller.rating} · {listing.seller.reviews_count} отзывов
                </div>
              </div>
              <svg width="18" height="18" fill="none" stroke="#D1D5DB" strokeWidth="2" viewBox="0 0 24 24"><path d="m9 18 6-6-6-6"/></svg>
            </Link>
          </div>
        )}
      </div>

      {/* CTA */}
      <div className="fixed bottom-0 left-0 right-0 max-w-[480px] mx-auto bg-white border-t border-gray-100 p-3 flex gap-2.5 z-50">
        <a href={wa} className="flex-[1.6]">
          <button className="btn-wa w-full text-[14px]">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
            </svg>
            Написать в WhatsApp
          </button>
        </a>
        <a href={`tel:+${listing.seller?.phone}`} className="flex-1">
          <button className="btn-outline w-full text-[14px]">
            <svg width="17" height="17" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.81a19.79 19.79 0 01-3.07-8.72A2 2 0 012 0h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.09 7.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 14.92z"/>
            </svg>
            Позвонить
          </button>
        </a>
      </div>
    </div>
  )
}
