import * as DropdownMenuPrimitive from '@radix-ui/react-dropdown-menu'
import type { ComponentPropsWithoutRef } from 'react'

export const DropdownMenu = DropdownMenuPrimitive.Root
export const DropdownMenuTrigger = DropdownMenuPrimitive.Trigger

type DropdownMenuContentProps = ComponentPropsWithoutRef<
  typeof DropdownMenuPrimitive.Content
>

export function DropdownMenuContent({
  className = '',
  sideOffset = 6,
  ...props
}: DropdownMenuContentProps) {
  return (
    <DropdownMenuPrimitive.Portal>
      <DropdownMenuPrimitive.Content
        sideOffset={sideOffset}
        className={`z-50 min-w-44 rounded-md border border-slate-200 bg-white p-1 shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 ${className}`.trim()}
        {...props}
      />
    </DropdownMenuPrimitive.Portal>
  )
}

type DropdownMenuItemProps = ComponentPropsWithoutRef<
  typeof DropdownMenuPrimitive.Item
>

export function DropdownMenuItem({ className = '', ...props }: DropdownMenuItemProps) {
  return (
    <DropdownMenuPrimitive.Item
      className={`relative flex cursor-default select-none items-center rounded px-2 py-1.5 text-sm text-slate-800 outline-none data-[highlighted]:bg-slate-100 data-[disabled]:pointer-events-none data-[disabled]:opacity-50 ${className}`.trim()}
      {...props}
    />
  )
}

type DropdownMenuCheckboxItemProps = ComponentPropsWithoutRef<
  typeof DropdownMenuPrimitive.CheckboxItem
>

export function DropdownMenuCheckboxItem({
  className = '',
  children,
  ...props
}: DropdownMenuCheckboxItemProps) {
  return (
    <DropdownMenuPrimitive.CheckboxItem
      className={`relative flex cursor-default select-none items-center rounded py-1.5 pl-8 pr-2 text-sm text-slate-800 outline-none data-[highlighted]:bg-slate-100 data-[disabled]:pointer-events-none data-[disabled]:opacity-50 ${className}`.trim()}
      {...props}
    >
      <span className="absolute left-2 inline-flex h-4 w-4 items-center justify-center text-slate-700">
        <DropdownMenuPrimitive.ItemIndicator>x</DropdownMenuPrimitive.ItemIndicator>
      </span>
      {children}
    </DropdownMenuPrimitive.CheckboxItem>
  )
}

export function DropdownMenuSeparator({
  className = '',
  ...props
}: ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Separator>) {
  return (
    <DropdownMenuPrimitive.Separator
      className={`my-1 h-px bg-slate-200 ${className}`.trim()}
      {...props}
    />
  )
}
