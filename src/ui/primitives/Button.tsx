import clsx from 'clsx'
import { forwardRef, type ButtonHTMLAttributes } from 'react'

type ButtonVariant =
  | 'primary'
  | 'secondary'
  | 'ghost'
  | 'info'
  | 'warning'
  | 'danger'

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant
}

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    'bg-blue-600 text-white shadow-sm hover:bg-blue-500 disabled:bg-blue-300',
  secondary:
    'bg-slate-100 text-slate-900 border border-slate-300 hover:bg-slate-200 disabled:text-slate-400',
  ghost: 'bg-transparent text-slate-700 hover:bg-slate-100 disabled:text-slate-400',
  info:
    'border border-blue-300 bg-blue-50 text-blue-800 hover:bg-blue-100 disabled:text-blue-300',
  warning:
    'border border-amber-300 bg-amber-50 text-amber-900 hover:bg-amber-100 disabled:text-amber-300',
  danger:
    'border border-red-300 bg-red-50 text-red-800 hover:bg-red-100 disabled:text-red-300',
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  function Button({ variant = 'primary', className, type = 'button', ...props }, ref) {
    return (
      <button
        ref={ref}
        type={type}
        className={clsx(
          'inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 disabled:cursor-not-allowed',
          variantClasses[variant],
          className,
        )}
        {...props}
      />
    )
  },
)
