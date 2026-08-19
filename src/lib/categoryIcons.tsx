import type { LucideIcon } from 'lucide-react'
import {
  Cpu,
  Smartphone,
  Laptop,
  Headphones,
  Home,
  Shirt,
  Sparkles,
  Briefcase,
  Package,
  Watch,
  Camera,
  Gamepad2,
  Baby,
  Car,
  Dumbbell,
  BookOpen,
  UtensilsCrossed,
  Sofa,
  Gem,
  Tag,
} from 'lucide-react'

/** Map category slug or name (case-insensitive) → Lucide icon */
const ICON_BY_KEY: Record<string, LucideIcon> = {
  electronics: Cpu,
  phones: Smartphone,
  phone: Smartphone,
  smartphones: Smartphone,
  computers: Laptop,
  computer: Laptop,
  laptops: Laptop,
  accessories: Headphones,
  accessory: Headphones,
  'home-kitchen': Home,
  'home & kitchen': Home,
  home: Home,
  kitchen: UtensilsCrossed,
  fashion: Shirt,
  clothing: Shirt,
  beauty: Sparkles,
  office: Briefcase,
  other: Package,
  watches: Watch,
  camera: Camera,
  cameras: Camera,
  gaming: Gamepad2,
  kids: Baby,
  baby: Baby,
  automotive: Car,
  sports: Dumbbell,
  books: BookOpen,
  furniture: Sofa,
  jewelry: Gem,
}

export function getCategoryIcon(nameOrSlug: string): LucideIcon {
  const key = nameOrSlug.trim().toLowerCase()
  if (ICON_BY_KEY[key]) return ICON_BY_KEY[key]

  // Partial match (e.g. "Home & Kitchen" → home)
  for (const [k, icon] of Object.entries(ICON_BY_KEY)) {
    if (key.includes(k) || k.includes(key)) return icon
  }

  return Tag
}
