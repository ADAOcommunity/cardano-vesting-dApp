import { Blockfrost, Lucid, Network, WalletApi } from 'lucid-cardano'

const initializeLucid = async (walletName: WalletApi | null) => {
    let lucid = await Lucid.new(
        new Blockfrost(process.env.NEXT_PUBLIC_BLOCKFROST_URL as string, process.env.NEXT_PUBLIC_BLOCKFROST_API_KEY as string),
        process.env.NEXT_PUBLIC_BLOCKFROST_NETWORK as Network
    )
    if(walletName) lucid = lucid.selectWallet(walletName)
    return lucid
}

export default initializeLucid