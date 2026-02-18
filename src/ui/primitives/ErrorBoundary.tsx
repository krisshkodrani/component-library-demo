import { Component, type ErrorInfo, type ReactNode } from 'react'

type ErrorBoundaryProps = {
  fallback?: ReactNode
  children: ReactNode
}

type ErrorBoundaryState = {
  error: Error | null
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { error: null }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('[ErrorBoundary]', error, info.componentStack)
  }

  render() {
    if (this.state.error) {
      return (
        this.props.fallback ?? (
          <div
            className="rounded-lg border border-red-200 bg-red-50 px-4 py-6 text-center text-sm text-red-700"
            role="alert"
          >
            <p>Something went wrong.</p>
            <button
              type="button"
              onClick={() => this.setState({ error: null })}
              className="mt-2 text-xs font-medium underline hover:text-red-900"
            >
              Try again
            </button>
          </div>
        )
      )
    }

    return this.props.children
  }
}
