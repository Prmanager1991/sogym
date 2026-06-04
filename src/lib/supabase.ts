import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type Seller = {
  id: string
  name: string
  phone: string
  city: string
  district: string | null
  avatar_url: string | null
  rating: number
  reviews_count: number
  created_at: string
}

export type Listing = {
  id: string
  seller_id: string
  title: string
  category: 'horse' | 'beef' | 'lamb' | 'chicken'
  price: number
  unit: 'kg' | 'piece' | 'whole'
  quantity: number
  city: string
  district: string | null
  delivery: boolean
  halal: boolean
  organic: boolean
  freshness: 'today' | 'tomorrow' | 'fresh' | null
  description: string | null
  status: 'active' | 'sold' | 'archived'
  photos: string[]
  created_at: string
  seller?: Seller
}

export const CATEGORY_LABELS: Record<string, string> = {
  horse: 'Конина',
  beef: 'Говядина',
  lamb: 'Баранина',
  chicken: 'Домашняя курица',
}

export const CATEGORY_EMOJI: Record<string, string> = {
  horse: '🐴',
  beef: '🐄',
  lamb: '🐑',
  chicken: '🐓',
}

export const FRESHNESS_LABELS: Record<string, { label: string; color: string }> = {
  today:    { label: 'Режем сегодня', color: 'bg-burgundy text-white' },
  tomorrow: { label: 'Режем завтра',  color: 'bg-[#C94558] text-white' },
  fresh:    { label: 'Свежий забой',  color: 'bg-[#1B5E20] text-[#E8F5E9]' },
}

export const UNIT_LABELS: Record<string, string> = {
  kg: 'кг', piece: 'шт', whole: 'туша',
}

export const WA_MESSAGE = 'Здравствуйте! Увидел ваше объявление в Soǵym. Подскажите, пожалуйста, ещё актуально?'

export function waLink(phone: string) {
  const clean = phone.replace(/\D/g, '')
  return `https://wa.me/${clean}?text=${encodeURIComponent(WA_MESSAGE)}`
}
