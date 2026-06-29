const FALLBACK = '/images/products/ethiopia.svg'

export function productImage(url?: string | null): string {
  if (!url) return FALLBACK
  if (url.includes('unsplash.com') || url.startsWith('http')) return FALLBACK
  return url
}

export function formatPrice(value: string | number): string {
  const num = typeof value === 'string' ? parseFloat(value) : value
  return num.toLocaleString('ru-RU')
}

export function weightPrice(basePrice: string, grams: number): number {
  const base = parseFloat(basePrice)
  if (grams <= 250) return base
  return Math.round(base * 3.125)
}

export function weightLabel(grams: number): string {
  return grams >= 1000 ? '1 кг' : '250 г'
}

export const CATEGORY_TABS: { key: string; label: string; categories: string[] }[] = [
  { key: 'beans', label: 'Кофе в зёрнах', categories: ['Зерновой кофе'] },
  { key: 'ground', label: 'Молотый', categories: ['Молотый кофе'] },
  { key: 'drips', label: 'Дрипы', categories: ['Дрип-пакеты'] },
  { key: 'capsules', label: 'Капсулы', categories: ['Капсулы'] },
  { key: 'merch', label: 'Мерч', categories: ['Мерч', 'Аксессуары', 'Подарочные наборы'] },
]
