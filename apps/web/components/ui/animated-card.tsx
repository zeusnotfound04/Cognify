'use client'

import { ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface AnimatedCardProps {
  children: ReactNode
  className?: string
  variant?: 'default' | 'glass' | 'gradient' | 'floating'
  delay?: number
}

export function AnimatedCard({ 
  children, 
  className, 
  variant = 'default',
  delay = 0 
}: AnimatedCardProps) {
  const baseClasses = "relative overflow-hidden transition-all duration-500 ease-out"
  
  const variants = {
    default: "bg-card border border-border rounded-lg p-6 card-hover",
    glass: "glass-card backdrop-blur-md",
    gradient: "bg-gradient-primary text-white rounded-lg p-6 shadow-lg hover:shadow-xl",
    floating: "bg-card border border-border rounded-lg p-6 floating"
  }

  return (
    <div 
      className={cn(baseClasses, variants[variant], className)}
      style={{ 
        animationDelay: `${delay}ms`,
        animation: `fade-in-up 0.6s ease-out ${delay}ms both`
      }}
    >
      <div className="shimmer absolute inset-0 rounded-lg opacity-20" />
      {children}
    </div>
  )
}

// Enhanced Button Component
interface AnimatedButtonProps {
  children: ReactNode
  className?: string
  variant?: 'default' | 'gradient' | 'ghost' | 'outline'
  onClick?: () => void
  disabled?: boolean
}

export function AnimatedButton({
  children,
  className,
  variant = 'default',
  onClick,
  disabled = false
}: AnimatedButtonProps) {
  const baseClasses = "relative px-6 py-3 rounded-lg font-medium text-sm interactive focus-ring disabled:opacity-50 disabled:cursor-not-allowed"
  
  const variants = {
    default: "bg-primary text-primary-foreground hover:bg-primary/90",
    gradient: "btn-gradient text-white shadow-lg",
    ghost: "bg-transparent hover:bg-secondary text-foreground",
    outline: "border border-border bg-transparent hover:bg-secondary text-foreground"
  }

  return (
    <button
      className={cn(baseClasses, variants[variant], className)}
      onClick={onClick}
      disabled={disabled}
    >
      <span className="relative z-10">{children}</span>
      {variant === 'gradient' && (
        <div className="absolute inset-0 bg-gradient-to-r from-primary-600 to-accent-purple-600 rounded-lg opacity-0 hover:opacity-100 transition-opacity duration-300" />
      )}
    </button>
  )
}

// Gradient Text Component
interface GradientTextProps {
  children: ReactNode
  className?: string
  variant?: 'primary' | 'secondary' | 'accent'
}

export function GradientText({ 
  children, 
  className, 
  variant = 'primary' 
}: GradientTextProps) {
  const variants = {
    primary: "gradient-text",
    secondary: "gradient-text-secondary", 
    accent: "bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent"
  }

  return (
    <span className={cn(variants[variant], className)}>
      {children}
    </span>
  )
}

// Loading Skeleton
export function LoadingSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("loading-pulse rounded-lg", className)} />
  )
}

// Floating Icon
interface FloatingIconProps {
  children: ReactNode
  className?: string
  delay?: number
}

export function FloatingIcon({ children, className, delay = 0 }: FloatingIconProps) {
  return (
    <div 
      className={cn("floating", className)}
      style={{ animationDelay: `${delay}s` }}
    >
      {children}
    </div>
  )
}