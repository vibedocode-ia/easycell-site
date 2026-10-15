import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { ClerkProvider } from '@clerk/react'
import { ptBR } from '@clerk/localizations'
import { dark } from '@clerk/themes'
import './index.css'
import App from './App.jsx'
import ErrorBoundary from './components/ErrorBoundary.jsx'

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY || import.meta.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY

const clerkAppearance = {
  baseTheme: dark,
  variables: {
    colorPrimary: '#06b6d4',
    colorBackground: '#050914',
    colorInputBackground: '#020617',
    colorInputText: '#f8fafc',
    colorText: '#f8fafc',
    colorTextSecondary: '#94a3b8',
    borderRadius: '0.75rem',
  },
  elements: {
    card: 'border border-cyan-500/30 shadow-2xl backdrop-blur-xl bg-[#050914]/95',
    formButtonPrimary: 'bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold',
    footerActionLink: 'text-cyan-400 hover:text-cyan-300',
  }
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ErrorBoundary>
      {PUBLISHABLE_KEY ? (
        <ClerkProvider 
          publishableKey={PUBLISHABLE_KEY} 
          localization={ptBR}
          appearance={clerkAppearance}
          afterSignOutUrl="/"
        >
          <App />
        </ClerkProvider>
      ) : (
        <App />
      )}
    </ErrorBoundary>
  </StrictMode>,
)

