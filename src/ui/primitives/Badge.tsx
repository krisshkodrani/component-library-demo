import clsx from 'clsx'
import type { HTMLAttributes } from 'react'

type BadgeVariant = 'neutral' | 'success' | 'warning' | 'danger'

type BadgeProps = HTMLAttributes<HTMLSpanElement> & {
  variant?: BadgeVariant
}

const variantClasses: Record<BadgeVariant, string> = {
  neutral: 'bg-slate-100 text-slate-700',
  success: 'bg-emerald-100 text-emerald-800',
  warning: 'bg-amber-100 text-amber-800',
  danger: 'bg-red-100 text-red-700',
}

export function Badge({
  variant = 'neutral',
  className,
  ...props
}: BadgeProps) {
  return (
    <span
      className={clsx(
        'inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold',
        variantClasses[variant],
        className,
      )}
      {...props}
    />
  )
}
