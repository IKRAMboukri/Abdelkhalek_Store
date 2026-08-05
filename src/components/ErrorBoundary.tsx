import { Component, type ReactNode } from 'react'
import { AlertTriangle, RefreshCw } from 'lucide-react'
import { useLocale } from '@/hooks/useLocale'

interface ErrorBoundaryProps {
  children: ReactNode
}

interface ErrorBoundaryState {
  hasError: boolean
}

const messages: Record<string, { title: string; description: string; reload: string }> = {
  en: {
    title: 'Something went wrong',
    description: 'An unexpected error occurred. Please reload the page.',
    reload: 'Reload',
  },
  fr: {
    title: 'Une erreur est survenue',
    description: 'Une erreur inattendue s\u0027est produite. Veuillez recharger la page.',
    reload: 'Recharger',
  },
  ar: {
    title: '\u062d\u062f\u062b \u062e\u0637\u0623 \u0645\u0627',
    description: '\u062d\u062f\u062b \u062e\u0637\u0623 \u063a\u064a\u0631 \u0645\u062a\u0648\u0642\u0639. \u064a\u0631\u062c\u0649 \u0625\u0639\u0627\u062f\u0629 \u062a\u062d\u0645\u064a\u0644 \u0627\u0644\u0635\u0641\u062d\u0629.',
    reload: '\u0625\u0639\u0627\u062f\u0629 \u062a\u062d\u0645\u064a\u0644',
  },
}

function ErrorFallback() {
  const { locale } = useLocale()
  const msg = messages[locale] ?? messages.en
  return (
    <div className="min-h-screen flex items-center justify-center bg-surface p-6">
      <div className="max-w-md w-full bg-surface rounded-xl border border-border shadow-sm p-8 text-center">
        <div className="flex justify-center">
          <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center">
            <AlertTriangle size={28} className="text-red-600" />
          </div>
        </div>
        <h1 className="mt-4 text-xl font-bold text-text-primary">{msg.title}</h1>
        <p className="mt-2 text-sm text-text-muted">{msg.description}</p>
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-primary-600 text-white text-sm font-medium hover:bg-primary-700 transition-colors cursor-pointer"
        >
          <RefreshCw size={16} />
          {msg.reload}
        </button>
      </div>
    </div>
  )
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false }

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true }
  }

  render() {
    if (this.state.hasError) {
      return <ErrorFallback />
    }
    return this.props.children
  }
}
