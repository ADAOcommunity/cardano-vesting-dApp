import { cn } from '@/lib/utils'
import { Html, Head, Main, NextScript } from 'next/document'
import { fontSans } from "@/lib/fonts"

export default function Document() {
  return (
    <Html lang="en">
      <Head >
        <title>Vesting</title>
      </Head>
      <body className={cn(
        "min-h-screen bg-background font-sans antialiased",
        fontSans.variable
      )} >
        <Main />
        <NextScript />
      </body>
    </Html>
  )
}
