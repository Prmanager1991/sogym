import Link from 'next/link'
import Image from 'next/image'
import { Listing, CATEGORY_EMOJI, FRESHNESS_LABELS, waLink } from '@/lib/supabase'

export default function ListingCard({ listing }: { listing: Listing }) {
  const fresh = listing.freshness ? FRESHNESS_LABELS[listing.freshness] : null
  const photo = listing.photos?.[0] ?? null
  const emoji = CATEGORY_EMOJI[listing.category]
  const phone = listing.seller?.phone ?? ''

  return (
    <div className="card flex h-[114px]">
      {/* Photo */}
      <Link href={`/listing/${listing.id}`} className="relative w-[42%] min-w-[42%] h-full flex-shrink-0 bg-[#EDE5DC] flex items-center justify-center overflow-hidden">
        {photo ? (
          <Image src={photo} alt={listing.title} fill className="object-cover" sizes="134px"/>
        ) : (
          <span className="text-5xl">{emoji}</span>
        )}
        {fresh && (
          <div className={`absolute bottom-0 left-0 right-0 py-[3px] text-center text-[9px] font-bold ${fresh.color}`}>
            {fresh.label}
          </div>
        )}
      </Link>

      {/* Info */}
      <div className="flex-1 flex flex-col justify-between px-2.5 py-2 min-w-0">
        <div>
          <Link href={`/listing/${listing.id}`}>
            <div className="text-[13px] font-bold text-gray-900 truncate">{listing.title}</div>
            <div className="text-[15px] font-extrabold text-burgundy">
              {listing.price.toLocaleString()} ₸
              <span className="text-[10px] font-normal text-gray-400"> /{listing.unit === 'kg' ? 'кг' : listing.unit === 'piece' ? 'шт' : 'туша'}</span>
            </div>
          </Link>
        </div>

        <div className="flex flex-wrap gap-1 text-[10px] text-gray-500">
          <span className="flex items-center gap-0.5">
            <svg width="10" height="10" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/></svg>
            {listing.quantity} кг
          </span>
          <span className="flex items-center gap-0.5">
            <svg width="10" height="10" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>
            {listing.district ?? listing.city}
          </span>
        </div>

        <div className="flex items-center gap-1.5 text-[10px]">
          {listing.delivery
            ? <span className="text-[#1B5E20] font-semibold">✓ Доставка</span>
            : <span className="text-gray-400">Самовывоз</span>
          }
          {listing.halal && <span className="text-[#1B5E20] font-semibold">☪ Халал</span>}
          {listing.organic && <span className="text-gray-500">🌿 Домашний</span>}
        </div>

        {/* Seller + WA */}
        <div className="flex items-center justify-between pt-[5px] border-t border-gray-100">
          <div className="flex items-center gap-1">
            <div className="w-[17px] h-[17px] rounded-full bg-burgundy-pale flex items-center justify-center text-[7px] font-bold text-burgundy flex-shrink-0">
              {listing.seller?.name?.slice(0, 2).toUpperCase() ?? '?'}
            </div>
            <span className="text-[10px] text-gray-500 font-medium">{listing.seller?.name?.split(' ')[0]}</span>
            {listing.seller && (
              <span className="text-[10px] font-bold text-amber-800">
                ⭐ {listing.seller.rating} <span className="text-gray-400 font-normal">({listing.seller.reviews_count})</span>
              </span>
            )}
          </div>
          <a
            href={waLink(phone)}
            onClick={e => e.stopPropagation()}
            className="w-6 h-6 bg-[#25D366] rounded-md flex items-center justify-center flex-shrink-0"
            aria-label="Написать в WhatsApp"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="white">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
            </svg>
          </a>
        </div>
      </div>
    </div>
  )
}
