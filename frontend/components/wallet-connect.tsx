import { useState, useContext, useEffect } from "react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "./ui/dropdown-menu";
import { ToastProvider } from "./ui/toast";
import { Button } from "./ui/button";
import initializeLucid from "@/utils/lucid";
import { UserContext } from "@/pages/_app";

export default function WalletConnect() {
    const [open, setOpen] = useState<boolean>(false);
    const ALLOWED_WALLETS = [
        { name: 'NAMI', icon: '', url: 'https://namiwallet.io/', displayName: 'Nami' },
        { name: 'ETERNL', icon: '', url: '', displayName: 'Eternl' },
        { name: 'FLINT', icon: '', url: '', displayName: 'Flint' },
        { name: 'GEROWALLET', icon: '', url: '', displayName: 'Gero' },
        { name: 'TYPHONCIP30', icon: '', url: '', displayName: 'Typhon' },
        { name: 'NUFI', icon: '', url: '', displayName: 'NuFi' },
        { name: 'VESPR', icon: '', url: '', displayName: 'Vespr' },
        { name: 'BEGIN', icon: '', url: '', displayName: 'Begin' },
        { name: 'YOROI', icon: '', url: '', displayName: 'Yoroi' },
      ]
    const userContext = useContext(UserContext)


    const updateWalletInfo = async (availWallet: any) => {
        if (availWallet) {
            const walletApi = await window?.cardano[availWallet].enable()
            console.log({walletApi})
            const lucid = await initializeLucid(walletApi);
            const addr = await lucid.wallet.address()
            console.log({ addr })
            userContext.setUser({ walletName: availWallet as string, address: addr })
        }
    }

    useEffect(() => {
        console.log(userContext)
        if (userContext.user && userContext.user.address && userContext.user.walletName) {
          localStorage.setItem('walletName', userContext.user.walletName)
          localStorage.setItem('walletAddress', userContext.user.address)
          console.log("here")
        }
      }, [userContext.user.address, userContext.user.walletName])
    
      useEffect(() => {
        const walletName = localStorage.getItem('walletName')
        const walletAddress = localStorage.getItem('walletAddress')
        if (walletName && walletAddress) {
          console.log({ walletName, walletAddress })
          userContext.setUser({ walletName, address: walletAddress })
        }
      }, [])
    return (
        <>
            <DropdownMenu>
                <ToastProvider />
                <DropdownMenuTrigger asChild>
                    <Button size="lg" className="border-2 border-th-white" >
                        {userContext.user.address? "Connected": "Connect Wallet"}
                        <span className="sr-only">Toggle theme</span>
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" forceMount>
                    {
                        ALLOWED_WALLETS?.map((wallet) => {
                            return (
                                <DropdownMenuItem key={wallet.name} onClick={() => {updateWalletInfo(wallet.name.toLowerCase()) }}>
                                    <span>{wallet.name}</span>
                                </DropdownMenuItem>
                            )
                        })
                    }
                </DropdownMenuContent>
            </DropdownMenu>
        </>
    )
}