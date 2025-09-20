'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Home,
  MapPin,
  Package,
  Briefcase,
  Wifi,
  Settings,
  Droplets
} from 'lucide-react'
import { cn } from '@/lib/utils/cn'

const navItems = [
  { href: '/', label: 'Dashboard', icon: Home },
  { href: '/map', label: 'Farm Map', icon: MapPin },
  { href: '/jobs', label: 'Spray Jobs', icon: Droplets },
  { href: '/inventory', label: 'Inventory', icon: Package },
  { href: '/sensors', label: 'Sensors', icon: Wifi },
  { href: '/settings', label: 'Settings', icon: Settings },
]

export function Navigation() {
  const pathname = usePathname()

  return (
    <nav className="bg-[var(--card)] border-r border-[var(--border)] h-screen w-64 p-4">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[var(--primary)]">
          SprayMate POC
        </h1>
        <p className="text-sm text-[var(--muted-foreground)] mt-1">
          Chemical Tracking System
        </p>
      </div>

      <div className="space-y-1">
        {navItems.map(item => {
          const Icon = item.icon
          const isActive = pathname === item.href

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2 rounded-lg transition-colors',
                'hover:bg-[var(--secondary)]',
                isActive && 'bg-[var(--primary)] text-[var(--primary-foreground)]'
              )}
            >
              <Icon className="w-5 h-5" />
              <span>{item.label}</span>
            </Link>
          )
        })}
      </div>

      <div className="absolute bottom-4 left-4 right-4">
        <div className="bg-[var(--secondary)] rounded-lg p-3">
          <p className="text-xs text-[var(--muted-foreground)]">Farm:</p>
          <p className="font-semibold">Riverside Holdings</p>
          <p className="text-xs text-[var(--muted-foreground)] mt-1">
            Sydney, Australia
          </p>
        </div>
      </div>
    </nav>
  )
}