import '@/styles/globals.css'
import type { AppProps } from 'next/app'

export default function App({ Component, pageProps }: AppProps) {
  return (
    <div className={'w-40 h-96'}>
      <Component {...pageProps} />
    </div>
  )
}
