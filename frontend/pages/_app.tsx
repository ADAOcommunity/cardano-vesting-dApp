import { ThemeProvider } from '@/components/theme-provider'
import '@/styles/globals.css'
import initializeLucid from '@/utils/lucid'
import { Lucid } from 'lucid-cardano'
import type { AppProps } from 'next/app'
import { Dispatch, SetStateAction, createContext, useEffect, useState } from 'react'

const initialUser = {
  address: "",
  walletName: ""
}
type User = typeof initialUser

export const UserContext = createContext<{
  user: User;
  setUser: Dispatch<SetStateAction<User>>;
  lucid: Lucid | null
}>({
  user: initialUser,
  setUser: (user: User | SetStateAction<User>) => { }, // Fits the type now
  lucid: null
});

export default function App({ Component, pageProps }: AppProps) {

  const [user, setUser] = useState<User>(initialUser)
  const [lucid, setLucid] = useState<Lucid | null>(null)
  useEffect(() => {
    if (user && user.address && user.walletName) {
      localStorage.setItem('walletName', user.walletName)
      localStorage.setItem('walletAddress', user.address)
      window?.cardano[user.walletName].enable()
        .then((walletApi) => {
          console.log({ walletApi })
          initializeLucid(walletApi)
            .then((l) => {
              setLucid(l)
            })
        })
    }
  }, [user.address, user.walletName])

  useEffect(() => {
    const walletName = localStorage.getItem('walletName')
    const walletAddress = localStorage.getItem('walletAddress')

    if (walletName && walletAddress) {
      console.log({ walletName, walletAddress })
      setUser({ walletName, address: walletAddress })
    }
  }, [])


  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
      <UserContext.Provider value={{ user, setUser, lucid }}>
        <Component {...pageProps} />
      </UserContext.Provider>
    </ThemeProvider>
  )
}
