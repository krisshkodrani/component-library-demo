import { Children, cloneElement, isValidElement, type ReactElement, type ReactNode } from 'react'

type FieldProps = {
  label: string
  htmlFor?: string
  error?: string
  children: ReactNode
}

export function Field({ label, htmlFor, error, children }: FieldProps) {
  const errorId = htmlFor && error ? `${htmlFor}-error` : undefined

  const child = Children.only(children)
  const enhanced =
    errorId && isValidElement(child)
      ? cloneElement(child as ReactElement<Record<string, unknown>>, {
          'aria-describedby': errorId,
        })
      : child

  return (
    <div className="space-y-1.5">
      <label htmlFor={htmlFor} className="block text-sm font-medium text-slate-800">
        {label}
      </label>
      {enhanced}
      {error ? (
        <p id={errorId} className="text-sm text-red-600" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  )
}
