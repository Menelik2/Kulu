import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatETB(amount: number | string): string {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount
  if (isNaN(num)) return 'ETB 0'
  return new Intl.NumberFormat('en-ET', {
    style: 'currency',
    currency: 'ETB',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(num)
}

export function formatPhone(phone: string): string {
  const cleaned = phone.replace(/\D/g, '')
  if (cleaned.startsWith('251') && cleaned.length === 12) {
    return `+${cleaned.slice(0, 3)} ${cleaned.slice(3, 5)} ${cleaned.slice(5, 8)} ${cleaned.slice(8)}`
  }
  if (cleaned.startsWith('0') && cleaned.length === 10) {
    return `+251 ${cleaned.slice(1, 3)} ${cleaned.slice(3, 6)} ${cleaned.slice(6)}`
  }
  return phone
}

/**
 * URL slug that keeps Unicode letters (e.g. Amharic).
 * Previous ASCII-only version turned Amharic names into empty slugs and broke unique constraints.
 */
export function slugify(text: string): string {
  const base = text
    .normalize('NFC')
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    // Letters, marks (Ethiopic), numbers, hyphens
    .replace(/[^\p{L}\p{N}\p{M}-]+/gu, '')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80)

  if (base.length > 0) return base
  return `item-${Date.now().toString(36)}`
}

export function calculateDiscountPercent(price: number, discountPrice: number | null): number | null {
  if (!discountPrice || discountPrice >= price) return null
  return Math.round(((price - discountPrice) / price) * 100)
}

export function getEffectivePrice(price: number, discountPrice: number | null): number {
  if (discountPrice && discountPrice < price) return discountPrice
  return price
}
