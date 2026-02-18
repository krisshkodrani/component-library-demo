import clsx from 'clsx'
import { forwardRef, type InputHTMLAttributes } from 'react'

export const inputStyles =
  'w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2'

type InputProps = InputHTMLAttributes<HTMLInputElement>

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { className, ...props },
  ref,
) {
  return (
    <input
      ref={ref}
      className={clsx(
        inputStyles,
        'box-border aria-[invalid=true]:border-red-500',
        className,
      )}
      {...props}
    />
  )
})
