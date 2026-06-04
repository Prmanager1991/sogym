'use client'
import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { supabase, CATEGORY_LABELS } from '@/lib/supabase'
import BottomNav from '@/components/BottomNav'

const CITIES = ['Астана', 'Алматы', 'Шымкент', 'Атырау', 'Актобе', 'Тараз']

export default function CreatePage() {
  const router = useRouter()
  const fileRef = useRef<HTMLInputElement>(null)
  const [photos, setPhotos] = useState<File[]>([])
  const [previews, setPreviews] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [form, setForm] = useState({
    name: '', phone: '',
    title: '', category: 'horse', price: '', unit: 'kg', quantity: '',
    city: 'Астана', district: '', description: '',
    delivery: false, halal: false, organic: false, freshness: '',
  })

  function set(k: string, v: unknown) { setForm(f => ({ ...f, [k]: v })) }

  async function addPhotos(files: FileList) {
    const arr = Array.from(files).slice(0, 8 - photos.length)
    setPhotos(p => [...p, ...arr])
    arr.forEach(f => {
      const reader = new FileReader()
      reader.onload = e => setPreviews(p => [...p, e.target?.result as string])
      reader.readAsDataURL(f)
    })
  }

  async function submit() {
    if (!form.name || !form.phone || !form.title || !form.price) {
      setError('Заполните обязательные поля: имя, телефон, название, цена')
      return
    }
    setLoading(true)
    setError('')
    try {
      // Upsert seller by phone
      const { data: sellerData, error: sErr } = await supabase
        .from('sellers')
        .upsert({ name: form.name, phone: form.phone, city: form.city, district: form.district || null },
          { onConflict: 'phone' })
        .select()
        .single()
      if (sErr) throw sErr

      // Upload photos
      const photoUrls: string[] = []
      for (const file of photos) {
        const ext = file.name.split('.').pop()
        const path = `${sellerData.id}/${Date.now()}.${ext}`
        const { error: upErr } = await supabase.storage.from('listings').upload(path, file)
        if (!upErr) {
          const { data: urlData } = supabase.storage.from('listings').getPublicUrl(path)
          photoUrls.push(urlData.publicUrl)
        }
      }

      // Insert listing
      const { data: listingData, error: lErr } = await supabase.from('listings').insert({
        seller_id: sellerData.id,
        title: form.title,
        category: form.category,
        price: parseInt(form.price),
        unit: form.unit,
        quantity: parseInt(form.quantity) || 0,
        city: form.city,
        district: form.district || null,
        delivery: form.delivery,
        halal: form.halal,
        organic: form.organic,
        freshness: form.freshness || null,
        description: form.description || null,
        photos: photoUrls,
        status: 'active',
      }).select().single()
      if (lErr) throw lErr

      router.push(`/listing/${listingData.id}`)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Ошибка публикации')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen pb-20 bg-[#F4F2EF]">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-4 py-3 flex items-center gap-3 sticky top-0 z-40">
        <button onClick={() => router.back()}>
          <svg width="22" height="22" fill="none" stroke="#1A1A1A" strokeWidth="2" viewBox="0 0 24 24"><path d="m15 18-6-6 6-6"/></svg>
        </button>
        <span className="text-[16px] font-bold text-gray-900">Новое объявление</span>
      </div>

      <div className="px-4 py-4 flex flex-col gap-4">

        {/* Photos */}
        <div>
          <label className="text-[12px] font-semibold text-gray-500 uppercase tracking-wide mb-2 block">Фотографии</label>
          <div className="flex gap-2 flex-wrap">
            {previews.map((p, i) => (
              <div key={i} className="relative w-20 h-20 rounded-xl overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={p} alt="" className="w-full h-full object-cover"/>
                <button onClick={() => { setPhotos(a => a.filter((_, j) => j !== i)); setPreviews(a => a.filter((_, j) => j !== i)) }}
                  className="absolute top-1 right-1 w-5 h-5 bg-black/60 rounded-full flex items-center justify-center text-white text-xs">✕</button>
              </div>
            ))}
            {photos.length < 8 && (
              <button onClick={() => fileRef.current?.click()}
                className="w-20 h-20 border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center text-gray-400 text-xs gap-1">
                <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z"/><circle cx="12" cy="13" r="4"/></svg>
                Фото
              </button>
            )}
          </div>
          <input ref={fileRef} type="file" accept="image/*" multiple className="hidden"
            onChange={e => e.target.files && addPhotos(e.target.files)}/>
        </div>

        {/* Seller info */}
        <div className="bg-white rounded-xl p-4 flex flex-col gap-3">
          <div className="text-[12px] font-semibold text-gray-500 uppercase tracking-wide">Ваши данные</div>
          <input className="input" placeholder="Ваше имя *" value={form.name} onChange={e => set('name', e.target.value)}/>
          <input className="input" placeholder="Телефон: +77771234567 *" value={form.phone} onChange={e => set('phone', e.target.value)} type="tel"/>
        </div>

        {/* Listing info */}
        <div className="bg-white rounded-xl p-4 flex flex-col gap-3">
          <div className="text-[12px] font-semibold text-gray-500 uppercase tracking-wide">Объявление</div>

          <input className="input" placeholder="Название *" value={form.title} onChange={e => set('title', e.target.value)}/>

          <select className="input" value={form.category} onChange={e => set('category', e.target.value)}>
            {Object.entries(CATEGORY_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>

          <div className="grid grid-cols-2 gap-2">
            <input className="input" placeholder="Цена ₸ *" type="number" value={form.price} onChange={e => set('price', e.target.value)}/>
            <select className="input" value={form.unit} onChange={e => set('unit', e.target.value)}>
              <option value="kg">за кг</option>
              <option value="whole">за тушу</option>
              <option value="piece">за штуку</option>
            </select>
          </div>

          <input className="input" placeholder="Количество (кг/шт)" type="number" value={form.quantity} onChange={e => set('quantity', e.target.value)}/>

          <select className="input" value={form.city} onChange={e => set('city', e.target.value)}>
            {CITIES.map(c => <option key={c}>{c}</option>)}
          </select>

          <input className="input" placeholder="Район" value={form.district} onChange={e => set('district', e.target.value)}/>

          <select className="input" value={form.freshness} onChange={e => set('freshness', e.target.value)}>
            <option value="">Срок забоя (необязательно)</option>
            <option value="today">Режем сегодня</option>
            <option value="tomorrow">Режем завтра</option>
            <option value="fresh">Свежий забой (до 3 дней)</option>
          </select>

          <textarea className="input resize-none" rows={3} placeholder="Описание: порода, откорм, условия..."
            value={form.description} onChange={e => set('description', e.target.value)}/>
        </div>

        {/* Toggles */}
        <div className="bg-white rounded-xl divide-y divide-gray-100">
          {[
            { k: 'delivery', label: '🚚 Есть доставка' },
            { k: 'halal', label: '☪ Халал' },
            { k: 'organic', label: '🌿 Домашний откорм' },
          ].map(({ k, label }) => (
            <div key={k} className="flex items-center justify-between px-4 py-3.5">
              <span className="text-[14px] text-gray-800">{label}</span>
              <button
                onClick={() => set(k, !(form as Record<string, unknown>)[k])}
                className={`w-11 h-6 rounded-full relative transition-colors ${(form as Record<string, unknown>)[k] ? 'bg-burgundy' : 'bg-gray-200'}`}>
                <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${(form as Record<string, unknown>)[k] ? 'translate-x-5' : 'translate-x-0.5'}`}/>
              </button>
            </div>
          ))}
        </div>

        {error && <div className="text-[13px] text-red-600 bg-red-50 rounded-xl px-4 py-3">{error}</div>}

        <button onClick={submit} disabled={loading} className="btn-burgundy text-[15px] disabled:opacity-60">
          {loading ? 'Публикуем...' : '✓ Опубликовать'}
        </button>
      </div>

      <BottomNav/>
    </div>
  )
}
