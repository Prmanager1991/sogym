# Soǵym — MVP

Маркетплейс домашнего мяса напрямую от хозяина.

## Быстрый запуск

### 1. Supabase — выполните миграцию

Откройте **Supabase Dashboard → SQL Editor**, вставьте и выполните содержимое файла `supabase_migration.sql`.

### 2. Установите зависимости

```bash
npm install
```

### 3. Переменные окружения

Файл `.env.local` уже создан с вашими ключами:
```
NEXT_PUBLIC_SUPABASE_URL=https://plivdkebdqeiywhasomd.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_Vf1ND-K6koQVbkxVrzHMZw_PTRkaohL
```

### 4. Запустите локально

```bash
npm run dev
```

Откройте: http://localhost:3000

### 5. Деплой на Vercel

```bash
npx vercel
```

Или через GitHub: импортируйте репозиторий на vercel.com, добавьте переменные окружения из `.env.local`.

---

## Структура страниц

| Страница | URL |
|---|---|
| Главная | `/` |
| Лента объявлений | `/listings` |
| Карточка объявления | `/listing/[id]` |
| Профиль продавца | `/profile/[id]` |
| Мой профиль | `/profile` |
| Создать объявление | `/create` |

## Что работает

- Загрузка объявлений из Supabase
- Фильтры: категория, доставка, халал, поиск
- Загрузка фото в Supabase Storage
- Публикация объявления (имя + телефон + данные)
- WhatsApp с автоматическим сообщением
- Профиль продавца с отзывами
- Управление статусами (Активно / Продано / Архив)
