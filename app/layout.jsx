import { GeistSans } from 'geist/font/sans'
import { GeistMono } from 'geist/font/mono'
import './globals.css'
import Providers from './providers/ReduxProvider';
import HeaderNavbar from './landingpagecomponents/components/HeaderNavbar';
export const metadata = {
  title: 'KAAM CHAA',
  description: 'Created BY DIGITALPATHSALA',
  generator: 'DIGITAL PATHSALA',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${GeistSans.variable} ${GeistMono.variable}`}>
      <body>
        <nav>
          {/* <HeaderNavbar/> */}

        </nav>
        <Providers>

        {children}
        </Providers>
        </body>
    </html>
  )
}
