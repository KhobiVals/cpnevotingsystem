import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: {
    default: 'CPN E-VOTE SYSTEM',
    template: '%s | CPN E-VOTE SYSTEM',
  },
  description: 'Official online voting platform for CPN Electoral Commission.',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="antialiased font-sans bg-slate-100 text-slate-900 selection:bg-blue-600 selection:text-white">
        {children}
      </body>
    </html>
  )
}
