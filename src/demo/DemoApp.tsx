import { makeMockEvents } from '../shared'
import { Button } from '../ui/primitives/Button'

export function DemoApp() {
  const gridEvents = makeMockEvents(200)
  const timelineEvents = makeMockEvents(60)

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-6xl flex-col gap-8 px-6 py-10">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">
          Genetec Take-Home Demo
        </h1>
        <Button variant="primary">New Event</Button>
      </header>

      <section className="grid gap-6 md:grid-cols-2">
        <article className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <header className="mb-4">
            <h2 className="text-lg font-semibold text-slate-900">DataGrid</h2>
            <p className="text-sm text-slate-600">Events: {gridEvents.length}</p>
          </header>
          <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 px-4 py-10 text-center text-sm text-slate-600">
            Component coming next.
          </div>
        </article>

        <article className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <header className="mb-4">
            <h2 className="text-lg font-semibold text-slate-900">Timeline</h2>
            <p className="text-sm text-slate-600">
              Events: {timelineEvents.length}
            </p>
          </header>
          <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 px-4 py-10 text-center text-sm text-slate-600">
            Component coming next.
          </div>
        </article>
      </section>
    </main>
  )
}
