import clsx from 'clsx'
import { forwardRef, type ButtonHTMLAttributes } from 'react'

type ButtonVariant = 'primary' | 'secondary' | 'ghost'

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant
}

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    'bg-blue-600 text-white shadow-sm hover:bg-blue-500 disabled:bg-blue-300',
  secondary:
    'bg-slate-100 text-slate-900 border border-slate-300 hover:bg-slate-200 disabled:text-slate-400',
  ghost: 'bg-transparent text-slate-700 hover:bg-slate-100 disabled:text-slate-400',
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
