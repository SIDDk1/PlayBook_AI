import type { Metadata } from 'next'
import '../styles/globals.css'
import GlobalNavigationDock from '@/components/GlobalNavigationDock'

export const metadata: Metadata = {
  title: 'Sentinel AI — Playbook Generator Platform',
  description: 'AI-Assisted Investment Playbook Generator for institutional wealth management',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased">
        {children}
        <GlobalNavigationDock />
      </body>
    </html>
  )
}