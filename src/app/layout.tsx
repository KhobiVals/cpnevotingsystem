import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: {
    default: 'DESAG Election System',
    template: '%s | DESAG Election System',
  },
  description:
    'Official online voting platform for the Distance Education Students\' Association of Ghana (DESAG). Secure, transparent, and accessible elections.',
  keywords: ['DESAG', 'election', 'voting', 'students', 'Ghana', 'distance education'],
  authors: [{ name: 'DESAG' }],
  robots: 'noindex, nofollow', // restrict indexing for a voting system
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="h-full">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="min-h-full flex flex-col">
        {children}
      </body>
    </html>
  )
}
