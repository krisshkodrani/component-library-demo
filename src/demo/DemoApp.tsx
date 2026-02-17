import { useMemo, useState } from 'react'
import { makeMockEvents } from '../shared'
import { Badge } from '../ui/primitives/Badge'
import { Button } from '../ui/primitives/Button'
import { Field } from '../ui/primitives/Field'
import { Input } from '../ui/primitives/Input'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../ui/radix/Dialog'
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui/radix/DropdownMenu'

export function DemoApp() {
  const [showAdvanced, setShowAdvanced] = useState(false)
  const gridEvents = useMemo(() => makeMockEvents(200), [])
  const timelineEvents = useMemo(() => makeMockEvents(60), [])

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-2xl flex-col gap-8 px-6 py-12">
      <header className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">
          Genetec Take-Home Demo
        </h1>
        <p className="text-slate-600">Scaffold ready.</p>
      </header>

      <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="space-y-5">
          <div className="flex items-center gap-3">
            <Button variant="primary">Primary Action</Button>
            <Button variant="secondary">Secondary Action</Button>
          </div>

          <Field label="Device name" htmlFor="device-name">
            <Input id="device-name" placeholder="Lobby camera" />
          </Field>

          <Field
            label="Webhook URL"
            htmlFor="webhook-url"
            error="Please enter a valid https:// URL."
          >
            <Input
              id="webhook-url"
              defaultValue="http://invalid-endpoint"
              aria-invalid="true"
            />
          </Field>

          <Badge variant="warning">Beta</Badge>

          <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
            <p>Grid events: {gridEvents.length}</p>
            <p>Timeline events: {timelineEvents.length}</p>
          </div>

          <div className="flex items-center gap-3">
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="primary">Open Dialog</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>New Event</DialogTitle>
                  <DialogDescription>
                    Enter a quick name to create the event.
                  </DialogDescription>
                </DialogHeader>

                <Field label="Event name" htmlFor="event-name">
                  <Input id="event-name" placeholder="Door forced open" />
                </Field>

                <div className="mt-6 flex justify-end">
                  <DialogClose asChild>
                    <Button variant="secondary">Close</Button>
                  </DialogClose>
                </div>
              </DialogContent>
            </Dialog>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost">Menu</Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                <DropdownMenuItem>Open details</DropdownMenuItem>
                <DropdownMenuCheckboxItem
                  checked={showAdvanced}
                  onCheckedChange={(checked) => setShowAdvanced(Boolean(checked))}
                >
                  Show advanced options
                </DropdownMenuCheckboxItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>Archive event</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </section>
    </main>
  )
}
