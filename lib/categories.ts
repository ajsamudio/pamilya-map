import { Category } from '@/types'

export interface CategoryConfig {
  id: Category
  label: string
  emoji: string
  color: string
}

export const CATEGORIES: CategoryConfig[] = [
  { id: 'food',          label: 'Food / Restaurant',      emoji: '🍽️', color: '#E74C3C' },
  { id: 'tourist',       label: 'Tourist Spot / Activity', emoji: '🏖️', color: '#27AE60' },
  { id: 'accommodation', label: 'Accommodation',           emoji: '🏨', color: '#8E44AD' },
  { id: 'transport',     label: 'Transport / Transit',     emoji: '🚗', color: '#E67E22' },
  { id: 'shopping',      label: 'Shopping / Market',       emoji: '🛒', color: '#2980B9' },
  { id: 'airport',       label: 'Airport / Port',          emoji: '✈️', color: '#7F8C8D' },
]

export const CATEGORY_MAP: Record<Category, CategoryConfig> = Object.fromEntries(
  CATEGORIES.map((c) => [c.id, c])
) as Record<Category, CategoryConfig>
