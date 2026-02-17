import { Badge } from '../ui/primitives/Badge'
import { Button } from '../ui/primitives/Button'
import { Field } from '../ui/primitives/Field'
import { Input } from '../ui/primitives/Input'

export function DemoApp() {
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
        </div>
      </section>
    </main>
  )
}
