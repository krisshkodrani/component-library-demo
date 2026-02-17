# Genetec React Technical Task

## Setup & Run
- Install dependencies: `npm install`
- Start dev server: `npm run dev`
- Build for production: `npm run build`
- Preview production build: `npm run preview`

## Project Structure
- `src/demo/`: integration shell (`DemoApp`) that composes UI modules and demo state.
- `src/ui/`: reusable UI building blocks (`DataGrid`, `Timeline`, `EventForm`, primitives, Radix wrappers).
- `src/shared/`: framework-agnostic helpers and shared types (mock data, date helpers, domain types).

This mirrors an Nx-like separation of concerns (domain/shared/ui/app layers) without introducing Nx tooling overhead.

## Data Flow
- `DemoApp` holds one canonical `events` list in state.
- `DataGrid` and `Timeline` are derived views of that same source.
- Creating a new event from the dialog prepends to `events`, so both views update immediately.
- Selection (`selectedEventId`) is app-level and shared by grid + timeline for sync behavior.

## DataGrid Behavior
- Processing pipeline is always: `filter -> sort -> paginate`.
- Global search applies across visible columns.
- Sorting is stable (ties preserve original order).
- Column visibility is controlled via DropdownMenu checkboxes.
- Last visible column cannot be hidden (guard against 0-column table).

## Timeline Accessibility
- Timeline items are keyboard focusable/selectable.
- Arrow navigation supported: `Left/Right/Up/Down` moves focus to adjacent item.
- Enter/Space selects the focused item.
- `aria-live` polite announcements include group label, title, position, and time.
  Example: `Feb 17, 2026 - Door Forced Open, 3 of 7, 08:30`.

## EventForm Accessibility
- Submit validation checks required title and valid date/time.
- On invalid submit, focus moves to first invalid field in deterministic order:
  title, then date/time.
- Inline field errors are shown and connected with `aria-invalid`.
- Successful submit updates a polite `role="status"` live region.

## Trade-offs / Not Implemented
- No data virtualization in `DataGrid` (acceptable for current demo scale).
- No persisted user preferences (column visibility, filters, sorting).
- No backend/API integration; data is in-memory demo state.
- No comprehensive automated test suite yet; behavior validated manually.
