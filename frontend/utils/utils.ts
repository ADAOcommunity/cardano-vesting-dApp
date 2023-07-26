import { C, Constr, Data, Lucid, UTxO, WalletApi, fromHex } from "lucid-cardano";

export const getAssetsFromStakeAddress = async (lucid: Lucid) => {
    const stakeAddress = await lucid.wallet.rewardAddress()
    let allBalance: any = [];
    try {
        let paginating = true;
        let page = 1;
        while (paginating) {
            try {
                const res = await fetch(`${process.env.NEXT_PUBLIC_BLOCKFROST_URL}/accounts/${stakeAddress}/addresses/assets?page=${page}`,
                    {
                        headers: {
                            'project_id': process.env.NEXT_PUBLIC_BLOCKFROST_API_KEY as string
                        }
                    }
                )
                const resp: { unit: string, quantity: string }[] = await res.json()
                if (resp.length === 0) {
                    paginating = false;
                    break;
                }
                allBalance = [...allBalance, ...resp]
                page++;
            } catch (e) {
                paginating = false;
            }
        }
        const resp = allBalance
            .filter((v: any) => v.unit !== 'lovelace' && BigInt(v.quantity) > BigInt(1))
            .map((v: any) => {
                const policyId = v.unit.slice(0, 56);
                const assetName = v.unit.slice(56);
                return {
                    unit: v.unit,
                    policyId,
                    assetName: Buffer.from(assetName, 'hex').toString('utf-8'),
                    quantity: v.quantity,
                };
            });
            console.log({resp})
            return resp
    } catch (e) {
        console.log(e)
    }
    console.log({ allBalance })
    return allBalance
}

const getPaymentKeyHash = (address: any) => {
    try {
        const pkh = C.BaseAddress.from_address(
            C.Address.from_bytes(address.to_bytes())
        )
        if (!pkh) throw ""
        const pkh2 = pkh
            .payment_cred()
            .to_keyhash()
        if (!pkh2) throw ""
        return Buffer.from(
            pkh2
                .to_bytes()
        ).toString('hex');
    } catch (e) { }
    try {
        const pkh = C.EnterpriseAddress.from_address(
            C.Address.from_bytes(address.to_bytes())
        )
        if (!pkh) throw ""
        const pkh2 = pkh
            .payment_cred()
            .to_keyhash()
        if (!pkh2) throw ""
        return Buffer.from(
            pkh2
                .to_bytes()
        ).toString('hex');
    } catch (e) { }
    try {
        const pkh = C.PointerAddress.from_address(
            C.Address.from_bytes(address.to_bytes())
        )
        if (!pkh) throw ""
        const pkh2 = pkh
            .payment_cred()
            .to_keyhash()
        if (!pkh2) throw ""
        return Buffer.from(
            pkh2
                .to_bytes()
        ).toString('hex');
    } catch (e) { }
    throw Error('Not supported address type');
};

export const getUserAddressesAndPkhs = async (walletName: string) => {
    const walletApi = await window?.cardano[walletName]?.enable()
    const unused = await walletApi.getUnusedAddresses()
    const used = await walletApi.getUsedAddresses()
    const all = unused.concat(used)
    const addresses = all.map((addr: any) => {
        try {
            const address = C.Address.from_bytes(
                fromHex(addr),
            )

            return (
                {
                    address: address.to_bech32(undefined),
                    pkh: getPaymentKeyHash(address)
                }
            )
        } catch (e) {
            console.log(e)
            return null
        }

    })
    .filter((addr: any) => addr !== null)
    return addresses
}

export const getUtxosForAddresses = async ( lucid: Lucid, contractAddress: string, addresses: ({address:string, pkh: string} | null)[]) => {
    // TO DO: check multiple addresses
    const utxos = await lucid.utxosAt(contractAddress)
    const formattedUtxos = []
    const totals:{[key:string]:bigint}={}
    const claimable: {[key:string]:{
        amount: bigint,
        utxos: UTxO[]
    }}={}
    for(let utxo of utxos){
        const datum = await lucid.datumOf(utxo)
        const datumJSON = Data.toJson(datum)
        if(addresses.filter((addr) => addr?.pkh === datumJSON?.beneficiary).length === 0) continue
        formattedUtxos.push({...utxo, datum: datumJSON})
        totals[datumJSON?.token] = totals[datumJSON?.token] ? totals[datumJSON?.token] + BigInt(datumJSON?.amount) : BigInt(datumJSON?.amount)
        if(datumJSON?.date > Date.now()) continue
        claimable[datumJSON?.token] = claimable[datumJSON?.token] ? {amount: claimable[datumJSON?.token].amount + BigInt(datumJSON?.amount), utxos:[...claimable[datumJSON?.token].utxos, utxo]} : {amount:BigInt(datumJSON?.amount), utxos:[utxo]}
    }

    return {utxos:formattedUtxos, claimable, totals}
}