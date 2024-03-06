"use client"

import { Web3AuthProvider } from "use-cardano-web3-auth";
import { Web3Login } from "./web3-login";

export function ClientOnlyWrapWeb3Login({
}: Readonly<{
}>) {

  const oAuthClients: { [key: string]: { name: string, clientId: string, verifier: string } } = {
    /* discord: {
      name: "discord",
      clientId: "1179814953654423603",
      verifier: "summon-discord"
    }, */
    google: {
      name: "google",
      clientId: "270914932394-dmpe4q3hfrbvt3loij6n50n22av9lmk0.apps.googleusercontent.com",
      verifier: "summon"
    },
    twitter: {
      name: "jwt",
      clientId: "wOO2G3FWdrDYH6p9D5fkBJtAPtPgT3K2",
      verifier: "summon-twitter"
    },
    github: {
      name: "jwt",
      clientId: "wOO2G3FWdrDYH6p9D5fkBJtAPtPgT3K2",
      verifier: "summon-github"
    }

  }
  return <Web3AuthProvider
    web3AuthClientId='YOUR_WEB3AUTH_CLIENT_ID'
    redirectUri={typeof window !== 'undefined' ? `${window.location.origin}` : 'http://localhost:5173'}
    redirectPathName={"web3auth/login"}
    oAuthClients={oAuthClients}
    blockfrostKey={process.env.BLOCKFROST_PROJECT_ID as string}
    blockfrostUrl={process.env.BLOCKFROST_URL as string}
    network={process.env.NETWORK as "Mainnet" | "Preprod"}
  >
    <Web3Login/>
  </Web3AuthProvider>
}